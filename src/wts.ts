#!/usr/bin/env bun
/**
 * wts — Worktree Siblings
 *
 * CLI for managing git worktrees with sibling layout.
 * See docs/SPEC.md for full specification.
 */

import { $ } from "bun";
import ora, { type Ora } from "ora";
import pc from "picocolors";

// ============================================================================
// Output Helpers
// ============================================================================

const DEBUG = process.env.DEBUG === "true" || process.env.DEBUG === "1";

const logger = {
    info(message: string) {
        console.log(`${pc.blue("==>")} ${pc.bold(message)}`);
    },
    success(message: string) {
        console.log(`${pc.green("✓")} ${message}`);
    },
    error(message: string): never {
        console.error(`${pc.red("ERROR:")} ${message}`);
        process.exit(1);
    },
    warn(message: string) {
        console.error(`${pc.yellow("WARNING:")} ${message}`);
    },
    debug(message: string) {
        if (DEBUG) {
            console.error(`${pc.dim("[DEBUG]")} ${pc.dim(message)}`);
        }
    },
    dim(message: string) {
        console.log(pc.gray(message));
    }
};

/**
 * Execute a long-running task with a spinner.
 * @param message Initial message for the spinner
 * @param task Async function to execute
 */
async function runWithSpinner<T>(message: string, task: (spinner: Ora) => Promise<T>): Promise<T> {
    const spinner = ora({ text: message, stream: process.stderr }).start();
    try {
        const result = await task(spinner);
        if (spinner.isSpinning) {
            // Docker style: Blue text on completion
            spinner.stopAndPersist({ symbol: pc.blue("✔"), text: pc.blue(spinner.text) });
        }
        return result;
    } catch (e) {
        spinner.fail(pc.red("Operation failed"));
        throw e;
    }
}

/**
 * Run a shell command and capture output.
 * If successful, returns output.
 * If failed, logs output to console (dimmed) and throws error.
 */
async function runSilent(cmd: any): Promise<string> {
    try {
        // quiet() on ShellPromise suppresses piping to parent stdout/stderr 
        // but still captures it in the result object
        const result = await cmd.quiet();
        return result.text();
    } catch (e: any) {
        // 'e' from bun $ shell usually contains stdout/stderr
        if (e.stdout || e.stderr) {
            console.error(pc.dim("--- Command Output ---"));
            if (e.stdout) console.error(pc.dim(e.stdout.toString().trim()));
            if (e.stderr) console.error(pc.dim(e.stderr.toString().trim()));
            console.error(pc.dim("----------------------"));
        }
        throw e;
    }
}

// ============================================================================
// Path Utilities
// ============================================================================

/** Convert branch name to safe directory name: feature/xyz → feature__xyz */
function branchToDir(branch: string): string {
    return branch.replace(/[/:]/g, "__");
}

/** Find worktree home by searching for parent with .git/ directory */
async function findWorktreeHome(startPath: string): Promise<string | null> {
    const { stat, readFile } = await import("node:fs/promises");

    let current = startPath;
    logger.debug(`Searching for worktree home starting from: ${current}`);

    while (current !== "/" && current !== "") {
        const gitPath = `${current}/.git`;
        logger.debug(`Checking ${gitPath}`);

        try {
            const stats = await stat(gitPath);

            if (stats.isDirectory()) {
                // It's a directory = main worktree
                logger.debug(`Found .git directory at ${gitPath} (main worktree)`);
                const parentDir = current.split("/").slice(0, -1).join("/");
                return parentDir || "/";
            } else if (stats.isFile()) {
                // It's a file = feature worktree
                // Verify we can read it (sanity check)
                await readFile(gitPath, "utf-8");
                logger.debug(`Found .git file at ${gitPath} (feature worktree)`);
                const parentDir = current.split("/").slice(0, -1).join("/");
                return parentDir || "/";
            }
        } catch {
            // Not found or not accessible
        }

        current = current.split("/").slice(0, -1).join("/") || "/";
    }

    return null;
}

/** Check if file exists */
async function fileExists(path: string): Promise<boolean> {
    const { stat } = await import("node:fs/promises");
    try {
        const s = await stat(path);
        return s.isFile();
    } catch {
        return false;
    }
}

// ============================================================================
// Git Utilities
// ============================================================================

/** Detect default branch via git ls-remote --symref */
async function getDefaultBranch(repoUrl: string): Promise<string> {
    try {
        const result = await $`git ls-remote --symref ${repoUrl} HEAD`.text();
        const match = result.match(/refs\/heads\/([^\s]+)/);
        if (match) {
            return match[1];
        }
    } catch {
        // Fallback: try common names
    }

    // Fallback to 'main'
    return "main";
}

/** Check if current directory has uncommitted changes */
async function hasUncommittedChanges(cwd?: string): Promise<boolean> {
    try {
        const opts = cwd ? { cwd } : {};
        const result = await $`git status --porcelain`.quiet().cwd(cwd ?? ".").text();
        return result.trim().length > 0;
    } catch {
        return false;
    }
}

// ============================================================================
// CLI Router
// ============================================================================

import packageJson from "../package.json";
const VERSION = packageJson.version;

const HELP = `${pc.bold("wts")} — Worktree Siblings (v${VERSION})

${pc.bold("USAGE:")}
  wts <command> [options]

${pc.bold("COMMANDS:")}
  clone <url> [dir]   Clone repo with worktrees as siblings
  new <branch> [dir]  Create feature worktree
  done <dir>          Remove worktree and branch
  list                Show all worktrees

${pc.bold("OPTIONS:")}
  --force, -f         Force operation (e.g. delete with uncommitted changes)
  --help, -h          Show this help message
  --version, -v       Show version

${pc.bold("EXAMPLES:")}
  wts clone git@github.com:user/repo.git
  wts new feature/xyz
  wts done feature__xyz --force
  wts list
`;

function showHelp(): void {
    console.log(HELP);
}

function showVersion(): void {
    console.log(`wts v${VERSION}`);
}

async function cmdClone(args: string[]): Promise<void> {
    const url = args[0];
    const customDir = args[1];

    if (!url) {
        logger.error("Usage: wts clone <url> [dir]\n\nExample: wts clone git@github.com:user/repo.git");
    }

    // 1. Parse URL to get repo name
    let repoName = "";
    // Match: .../repo.git or .../repo
    const match = url.match(/\/([^/]+?)(\.git)?$/);
    if (match) {
        repoName = match[1];
    } else {
        // Fallback: use the filename part of the URL
        repoName = url.split("/").pop()?.replace(/\.git$/, "") || "repo";
    }

    // 2. Determine target directories
    // If customDir is provided, use it as is. Otherwise use repoName.worktree
    const worktreeHomeName = customDir || `${repoName}.worktree`;
    const cwd = process.cwd();
    const worktreeHomePath = `${cwd}/${worktreeHomeName}`;

    logger.info(`Cloning ${pc.cyan(url)}`);
    logger.info(`Target:  ${pc.cyan(worktreeHomeName)}`);

    // Check if directory exists
    const { access, mkdir, rm } = await import("node:fs/promises");
    try {
        await access(worktreeHomePath);
        logger.error(`Directory '${worktreeHomeName}' already exists.`);
    } catch {
        // Directory doesn't exist - good
    }

    // 3. Create worktree home
    await mkdir(worktreeHomePath, { recursive: true });

    try {
        // 4. Detect default branch
        const defaultBranch = await runWithSpinner("Detecting default branch...", async (spinner) => {
            const branch = await getDefaultBranch(url);
            spinner.succeed(`Default branch: ${pc.cyan(branch)}`);
            return branch;
        });

        // 5. Clone into subdirectory
        const clonePath = `${worktreeHomePath}/${defaultBranch}`;
        await runWithSpinner(`Cloning into ${pc.cyan(defaultBranch)}`, async (spinner) => {
            await $`git clone ${url} ${clonePath}`.quiet();
            spinner.succeed();
        });

        logger.success(`Repository cloned: ${pc.cyan(worktreeHomeName)}`);
        console.error("");
        logger.dim("Next steps:");
        logger.dim(`  cd ${worktreeHomeName}/${defaultBranch}`);

        // Suggest install if package.json exists
        if (await fileExists(`${clonePath}/package.json`)) {
            logger.dim("  bun install");
        }
    } catch (e) {
        // Cleanup on failure
        logger.warn("Clone failed. Cleaning up...");
        await rm(worktreeHomePath, { recursive: true, force: true });
        logger.error(`Failed to clone: ${e}`);
    }
}

async function cmdNew(args: string[]): Promise<void> {
    const noPublish = args.includes("--no-publish");
    const positionalArgs = args.filter((a) => a !== "--no-publish");

    const branch = positionalArgs[0];
    const customDir = positionalArgs[1];

    if (!branch) {
        logger.error("Usage: wts new <branch> [dir]\n\nExample: wts new feature/my-feature");
    }

    // Find worktree home from current directory
    const cwd = process.cwd();
    const worktreeHome = await findWorktreeHome(cwd);

    if (!worktreeHome) {
        logger.error("Not inside a worktree home. Run from a wts-managed repository.");
    }

    // Find the main worktree
    const mainWorktree = await findMainWorktreePath(worktreeHome!);
    if (!mainWorktree) {
        logger.error("Could not find main worktree with .git directory.");
    }

    logger.info(`Creating worktree for branch: ${pc.cyan(branch)}`);

    // Check if branch already exists locally
    try {
        await $`git show-ref --verify refs/heads/${branch}`.cwd(mainWorktree!).quiet();
        logger.error(`Branch '${branch}' already exists locally.`);
    } catch {
        // Branch doesn't exist locally - good
    }

    // Check if branch exists on remote
    try {
        await $`git show-ref --verify refs/remotes/origin/${branch}`.cwd(mainWorktree!).quiet();
        logger.error(`Branch '${branch}' already exists on remote.`);
    } catch {
        // Branch doesn't exist on remote - good
    }

    // Calculate target directory
    const targetDirName = customDir || branchToDir(branch);
    const targetPath = `${worktreeHome}/${targetDirName}`;

    // Check if directory already exists
    const { access } = await import("node:fs/promises");
    try {
        await access(targetPath);
        logger.error(`Directory '${targetDirName}' already exists.`);
    } catch {
        // Directory doesn't exist - good
    }

    // Update main branch first
    await runWithSpinner("Updating main branch...", async (spinner) => {
        try {
            await runSilent($`git pull --ff-only`.cwd(mainWorktree!));
            spinner.succeed();
        } catch (e) {
            spinner.warn("Could not update main branch. Continuing anyway.");
        }
    });

    // Create worktree with new branch
    await runWithSpinner(`Creating worktree at ${pc.cyan(targetDirName)}`, async (spinner) => {
        try {
            await runSilent($`git worktree add ${targetPath} -b ${branch}`.cwd(mainWorktree!));
            spinner.text = `Worktree created at ${pc.cyan(targetDirName)}`;
        } catch (e) {
            spinner.fail("Failed to create worktree");
            // The runSilent helper already printed detailed output
            logger.error(`Failed to create worktree: ${e}`);
        }
    });

    // Publish branch to remote
    if (!noPublish) {
        await runWithSpinner("Publishing branch to remote", async (spinner) => {
            try {
                await runSilent($`git push --set-upstream origin ${branch}`.cwd(targetPath));
                spinner.succeed();
            } catch (e) {
                spinner.warn("Could not publish branch (check remote permissions).");
            }
        });
    }

    // Copy .env.local if it exists
    const mainEnv = `${mainWorktree}/.env.local`;
    const targetEnv = `${targetPath}/.env.local`;
    const { copyFile } = await import("node:fs/promises");

    try {
        await access(mainEnv);
        await runWithSpinner("Copying .env.local from main...", async (spinner) => {
            await copyFile(mainEnv, targetEnv);
            spinner.text = "Copied .env.local";
        });
    } catch {
        // No .env.local in main - that's okay
    }

    // Install dependencies
    const hasPackageJson = await fileExists(`${targetPath}/package.json`);

    if (hasPackageJson) {
        await runWithSpinner("Installing dependencies... (this may take a while)", async (spinner) => {
            try {
                // We use .text() to capture output but not show it unless error, 
                // but for long install it might be nice to show it? 
                // For now, keep it hidden as requested ("distinguish" by hiding).
                await $`bun install --frozen-lockfile`.cwd(targetPath).quiet();
                spinner.text = "Dependencies installed";
            } catch (e) {
                spinner.warn("Failed to install dependencies.");
                logger.warn("Run 'bun install' manually.");
            }
        });
    } else {
        logger.dim("No package.json found. Skipping dependency installation.");
    }

    logger.success(`Worktree ready: ${targetDirName}`);
    console.error(""); // blank line
    logger.dim("Next steps:");
    logger.dim(`  cd ../${targetDirName}`);
    if (hasPackageJson) {
        logger.dim("  bun run dev");
    } else {
        logger.dim("  <run your project>");
    }
}

async function cmdDone(args: string[]): Promise<void> {
    const force = args.includes("--force") || args.includes("-f");
    const positionalArgs = args.filter((a) => a !== "--force" && a !== "-f");

    const targetDir = positionalArgs[0];

    // Find worktree home
    const cwd = process.cwd();
    const worktreeHome = await findWorktreeHome(cwd);

    if (!worktreeHome) {
        logger.error("Not inside a worktree home. Run from a wts-managed repository.");
    }

    // Determine target path
    // If explicit arg provided, use it. Otherwise use CWD.
    let targetPath: string = "";

    if (targetDir) {
        targetPath = targetDir.startsWith("/")
            ? targetDir
            : `${worktreeHome}/${targetDir}`;
    } else {
        // Infer from CWD
        // We need to ensure CWD is actually a worktree root or inside one
        // simple approach: use CWD. isMainWorktree check later will prevent deleting main.
        // We might need to find the root of the current worktree if we are in a subdir.
        try {
            // This git command finds the root of the current repository/worktree
            targetPath = await $`git rev-parse --show-toplevel`.cwd(cwd).text();
            targetPath = targetPath.trim();
        } catch {
            logger.error("Usage: wts done [dir] [--force]\n\nExample: wts done feature__my-feature");
        }
    }

    // Find the main worktree (has .git directory)
    const mainWorktree = await findMainWorktreePath(worktreeHome!);
    if (!mainWorktree) {
        logger.error("Could not find main worktree with .git directory.");
    }

    const { stat, readFile, access } = await import("node:fs/promises");

    const relPath = targetPath.startsWith(worktreeHome!)
        ? targetPath.slice(worktreeHome!.length + 1)
        : targetPath;

    // Safety: If we are currently INSIDE the target path, we must move out (to main) before deleting it
    if (cwd.startsWith(targetPath)) {
        logger.debug(`Currently inside target worktree. Moving to main worktree: ${mainWorktree}`);
        process.chdir(mainWorktree!);
    }

    // 1. Safety Checks
    try {
        await stat(targetPath);
    } catch {
        logger.error(`Worktree '${relPath}' not found.`);
    }

    // Prevent removing main worktree
    if (await isMainWorktree(targetPath)) {
        logger.error("Cannot remove 'main' worktree!");
    }

    logger.info(`Target: ${pc.cyan(relPath)}`);

    // Check for uncommitted changes
    if (await hasUncommittedChanges(targetPath)) {
        logger.warn("Uncommitted changes detected!");
        await $`git status --short`.cwd(targetPath);
        console.error("");

        if (force) {
            logger.warn("Force deleting despite uncommitted changes.");
        } else {
            logger.error("Worktree has uncommitted changes. Commit, stash, or use --force.");
        }
    }

    // Check .env.local diff
    const mainEnv = `${mainWorktree}/.env.local`;
    const targetEnv = `${targetPath}/.env.local`;

    try {
        await stat(targetEnv);
        await stat(mainEnv);

        // Compare files
        const mainContent = await readFile(mainEnv);
        const targetContent = await readFile(targetEnv);

        if (!mainContent.equals(targetContent)) {
            logger.warn(".env.local differs from main!");
        }
    } catch {
        // Ignore missing env files
    }

    // 2. Get branch name
    let branchName = "";
    try {
        const output = await $`git worktree list`.cwd(mainWorktree!).text();
        const lines = output.trim().split("\n");
        for (const line of lines) {
            if (line.includes(targetPath)) {
                const match = line.match(/\[(.+)\]$/);
                if (match) {
                    branchName = match[1];
                }
                break;
            }
        }
    } catch {
        logger.warn("Could not determine branch name from git worktree list.");
    }

    // 3. Remove worktree
    await runWithSpinner("Removing worktree", async (spinner) => {
        try {
            await runSilent($`git worktree remove ${targetPath}`.cwd(mainWorktree!));
            spinner.succeed();
        } catch (e) {
            spinner.fail("Failed to remove worktree");
            logger.error(`${e}`);
        }
    });

    // 4. Delete local branch
    if (branchName) {
        await runWithSpinner(`Deleting local branch: ${pc.cyan(branchName)}`, async (spinner) => {
            try {
                await runSilent($`git branch -D ${branchName}`.cwd(mainWorktree!));
                spinner.text = `Deleted branch ${pc.cyan(branchName)}`;
            } catch (e) {
                // Warning only, as worktree is already gone
                spinner.warn(`Failed to delete branch ${branchName}`);
            }
        });
    }

    logger.success("Worktree and branch removed");

    // 5. Cleanup & Sync
    await runWithSpinner("Syncing with remote", async (spinner) => {
        try {
            await runSilent($`git fetch --prune`.cwd(mainWorktree!));
            await runSilent($`git pull --ff-only`.cwd(mainWorktree!));
            spinner.succeed();
        } catch (e) {
            spinner.warn("Failed to sync main branch.");
            logger.error(`${e}`); // Show error details
        }
    });

    const hasPackageJson = await fileExists(`${mainWorktree!}/package.json`);
    if (hasPackageJson) {
        await runWithSpinner("Syncing dependencies", async (spinner) => {
            try {
                await runSilent($`bun install --frozen-lockfile`.cwd(mainWorktree!));
                spinner.succeed();
            } catch (e) {
                spinner.warn("Failed to install dependencies.");
                logger.error(`${e}`);
            }
        });
    }
}

async function cmdList(_args: string[]): Promise<void> {
    // Find worktree home from current directory
    const cwd = process.cwd();
    const worktreeHome = await findWorktreeHome(cwd);

    if (!worktreeHome) {
        logger.error("Not inside a worktree home. Run from a wts-managed repository.");
    }

    // Get worktree list from git
    let output: string;
    try {
        // Find the main worktree (has .git directory)
        const mainWorktree = await findMainWorktreePath(worktreeHome!);
        if (!mainWorktree) {
            logger.error("Could not find main worktree with .git directory.");
        }
        output = await $`git worktree list`.cwd(mainWorktree!).text();
    } catch (e) {
        logger.error("Failed to list worktrees. Is this a git repository?");
    }

    // Parse output: /path/to/worktree  abc1234 [branch-name]
    const lines = output!.trim().split("\n").filter(Boolean);
    const worktrees: { path: string; hash: string; branch: string; isMain: boolean }[] = [];

    for (const line of lines) {
        const match = line.match(/^(\S+)\s+(\w+)\s+\[(.+)\]$/);
        if (match) {
            const [, absPath, hash, branch] = match;
            const isMain = await isMainWorktree(absPath);
            const relPath = absPath.startsWith(worktreeHome!)
                ? absPath.slice(worktreeHome!.length + 1) || "."
                : absPath;
            worktrees.push({ path: relPath, hash, branch, isMain });
        }
    }

    if (worktrees.length === 0) {
        console.log("No worktrees found.");
        return;
    }

    // Calculate column widths for alignment
    const maxPath = Math.max(...worktrees.map((w) => w.path.length));
    const maxBranch = Math.max(...worktrees.map((w) => w.branch.length));

    // Print header
    console.log(
        `${pc.bold("PATH".padEnd(maxPath))}  ${"BRANCH".padEnd(maxBranch)}  STATUS`
    );

    // Print worktrees
    for (const wt of worktrees) {
        const status = wt.isMain ? `${pc.green("*")} main` : "";
        console.log(
            `${wt.path.padEnd(maxPath)}  ${pc.cyan(wt.branch.padEnd(maxBranch))}  ${status}`
        );
    }
}

/** Find the main worktree path (directory containing .git as directory, not file) */
async function findMainWorktreePath(worktreeHome: string): Promise<string | null> {
    // List immediate subdirectories
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(worktreeHome, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const dirPath = `${worktreeHome}/${entry.name}`;
            if (await isMainWorktree(dirPath)) {
                return dirPath;
            }
        }
    }

    return null;
}

/** Check if a directory is the main worktree (has .git as directory, not file) */
async function isMainWorktree(dirPath: string): Promise<boolean> {
    const gitPath = `${dirPath}/.git`;
    const { stat } = await import("node:fs/promises");

    try {
        const stats = await stat(gitPath);
        return stats.isDirectory();
    } catch {
        return false;
    }
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);

    // Always print version header
    console.error(pc.dim(`wts v${VERSION}`));

    // Handle flags
    if (!command || command === "--help" || command === "-h") {
        showHelp();
        return;
    }

    if (command === "--version" || command === "-v") {
        showVersion();
        return;
    }

    // Dispatch to command handlers
    switch (command) {
        case "clone":
            await cmdClone(commandArgs);
            break;
        case "new":
            await cmdNew(commandArgs);
            break;
        case "done":
            await cmdDone(commandArgs);
            break;
        case "list":
            await cmdList(commandArgs);
            break;
        default:
            logger.error(`Unknown command: ${command}\n\nRunning 'wts --help' for usage information.`);
    }
}

// Export utilities for testing if needed
export {
    logger,
    branchToDir,
    findWorktreeHome
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
