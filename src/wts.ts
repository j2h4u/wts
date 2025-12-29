#!/usr/bin/env bun
/**
 * wts — Worktree Siblings
 *
 * CLI for managing git worktrees with sibling layout.
 * See docs/SPEC.md for full specification.
 */

import { $ } from "bun";

// ============================================================================
// Output Helpers
// ============================================================================

const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const BLUE = "\x1b[0;34m";
const CYAN = "\x1b[0;36m";
const BOLD = "\x1b[1m";
const GRAY = "\x1b[90m";
const NC = "\x1b[0m"; // No Color

/** Section header with blue arrow */
function log(message: string): void {
    console.log(`${BLUE}==>${NC} ${BOLD}${message}${NC}`);
}

/** Green checkmark + message */
function success(message: string): void {
    console.log(`${GREEN}✓${NC} ${message}`);
}

/** Red error message to stderr, then exit(1) */
function error(message: string): never {
    console.error(`${RED}ERROR:${NC} ${message}`);
    process.exit(1);
}

const DEBUG = process.env.DEBUG === "true" || process.env.DEBUG === "1";

/** Yellow warning to stderr */
function warn(message: string): void {
    console.error(`${YELLOW}WARNING:${NC} ${message}`);
}

function debug(message: string): void {
    if (DEBUG) {
        console.error(`${GRAY}[DEBUG]${NC} ${GRAY}${message}${NC}`);
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
    debug(`Searching for worktree home starting from: ${current}`);

    while (current !== "/" && current !== "") {
        const gitPath = `${current}/.git`;
        debug(`Checking ${gitPath}`);

        try {
            const stats = await stat(gitPath);

            if (stats.isDirectory()) {
                // It's a directory = main worktree
                debug(`Found .git directory at ${gitPath} (main worktree)`);
                const parentDir = current.split("/").slice(0, -1).join("/");
                return parentDir || "/";
            } else if (stats.isFile()) {
                // It's a file = feature worktree
                // Verify we can read it (sanity check)
                await readFile(gitPath, "utf-8");
                debug(`Found .git file at ${gitPath} (feature worktree), continuing up`);
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

const VERSION = "0.1.0";

const HELP = `${BOLD}wts${NC} — Worktree Siblings (v${VERSION})

${BOLD}USAGE:${NC}
  wts <command> [options]

${BOLD}COMMANDS:${NC}
  clone <url> [dir]   Clone repo with worktrees as siblings
  new <branch> [dir]  Create feature worktree
  done <dir>          Remove worktree and branch
  list                Show all worktrees

${BOLD}OPTIONS:${NC}
  --help, -h          Show this help message
  --version, -v       Show version

${BOLD}EXAMPLES:${NC}
  wts clone git@github.com:user/repo.git
  wts new feature/xyz
  wts done feature__xyz
  wts list
`;

function showHelp(): void {
    console.log(HELP);
}

function showVersion(): void {
    console.log(`wts v${VERSION}`);
}

// Command stubs (to be implemented in separate proposals)
async function cmdClone(args: string[]): Promise<void> {
    const url = args[0];
    const customDir = args[1];

    if (!url) {
        error("Usage: wts clone <url> [dir]\n\nExample: wts clone git@github.com:user/repo.git");
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

    log(`Cloning ${CYAN}${url}${NC}`);
    log(`Target:  ${CYAN}${worktreeHomeName}${NC}`);

    // Check if directory exists
    const { access, mkdir, rm } = await import("node:fs/promises");
    try {
        await access(worktreeHomePath);
        error(`Directory '${worktreeHomeName}' already exists.`);
    } catch {
        // Directory doesn't exist - good
    }

    // 3. Create worktree home
    await mkdir(worktreeHomePath, { recursive: true });

    try {
        // 4. Detect default branch
        const defaultBranch = await getDefaultBranch(url);
        log(`Default branch: ${CYAN}${defaultBranch}${NC}`);

        // 5. Clone into subdirectory
        const clonePath = `${worktreeHomePath}/${defaultBranch}`;
        log(`Cloning into ${CYAN}${defaultBranch}${NC}...`);

        await $`git clone ${url} ${clonePath}`.quiet();

        success(`Repository cloned: ${worktreeHomeName}`);
        console.log("");
        console.log(`${GRAY}Next steps:${NC}`);
        console.log(`${GRAY}  cd ${worktreeHomeName}/${defaultBranch}${NC}`);
        console.log(`${GRAY}  wts new feature/my-feature${NC}`);
    } catch (e) {
        // Cleanup on failure
        warn("Clone failed. Cleaning up...");
        await rm(worktreeHomePath, { recursive: true, force: true });
        error(`Failed to clone: ${e}`);
    }
}

async function cmdNew(args: string[]): Promise<void> {
    const branch = args[0];
    const customDir = args[1];

    if (!branch) {
        error("Usage: wts new <branch> [dir]\n\nExample: wts new feature/my-feature");
    }

    // Find worktree home from current directory
    const cwd = process.cwd();
    const worktreeHome = await findWorktreeHome(cwd);

    if (!worktreeHome) {
        error("Not inside a worktree home. Run from a wts-managed repository.");
    }

    // Find the main worktree
    const mainWorktree = await findMainWorktreePath(worktreeHome);
    if (!mainWorktree) {
        error("Could not find main worktree with .git directory.");
    }

    log(`Creating worktree for branch: ${CYAN}${branch}${NC}`);

    // Check if branch already exists locally
    try {
        await $`git show-ref --verify refs/heads/${branch}`.cwd(mainWorktree).quiet();
        error(`Branch '${branch}' already exists locally.`);
    } catch {
        // Branch doesn't exist locally - good
    }

    // Check if branch exists on remote
    try {
        await $`git show-ref --verify refs/remotes/origin/${branch}`.cwd(mainWorktree).quiet();
        error(`Branch '${branch}' already exists on remote.`);
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
        error(`Directory '${targetDirName}' already exists.`);
    } catch {
        // Directory doesn't exist - good
    }

    // Update main branch first
    log("Updating main branch...");
    try {
        await $`git pull --ff-only`.cwd(mainWorktree);
    } catch (e) {
        warn("Could not update main branch. Continuing anyway.");
    }

    // Create worktree with new branch
    log(`Creating worktree at ${CYAN}${targetDirName}${NC}...`);
    try {
        await $`git worktree add ${targetPath} -b ${branch}`.cwd(mainWorktree);
    } catch (e) {
        error(`Failed to create worktree: ${e}`);
    }

    // Copy .env.local if it exists
    const mainEnv = `${mainWorktree}/.env.local`;
    const targetEnv = `${targetPath}/.env.local`;
    const { copyFile } = await import("node:fs/promises");

    try {
        await access(mainEnv);
        log("Copying .env.local from main...");
        await copyFile(mainEnv, targetEnv);
    } catch {
        // No .env.local in main - that's okay
    }

    // Install dependencies
    const hasPackageJson = await fileExists(`${targetPath}/package.json`);

    if (hasPackageJson) {
        log("Installing dependencies...");
        try {
            await $`bun install --frozen-lockfile`.cwd(targetPath);
        } catch (e) {
            warn("Failed to install dependencies. Run 'bun install' manually.");
        }
    } else {
        console.log(`${GRAY}No package.json found. Skipping dependency installation.${NC}`);
    }

    success(`Worktree created: ${targetDirName}`);
    console.log("");
    console.log(`${GRAY}Next steps:${NC}`);
    console.log(`${GRAY}  cd ../${targetDirName}${NC}`);
    if (hasPackageJson) {
        console.log(`${GRAY}  bun run dev${NC}`);
    } else {
        console.log(`${GRAY}  <run your project>${NC}`);
    }
}

async function cmdDone(args: string[]): Promise<void> {
    const targetDir = args[0];

    if (!targetDir) {
        error("Usage: wts done <dir>\n\nExample: wts done feature__my-feature");
    }

    // Find worktree home
    const cwd = process.cwd();
    const worktreeHome = await findWorktreeHome(cwd);

    if (!worktreeHome) {
        error("Not inside a worktree home. Run from a wts-managed repository.");
    }

    const { stat, readFile } = await import("node:fs/promises");
    const { exists } = await import("node:fs");

    // Resolve target path (handle absolute or relative)
    const targetPath = targetDir.startsWith("/")
        ? targetDir
        : `${worktreeHome}/${targetDir}`;

    const relPath = targetPath.startsWith(worktreeHome!)
        ? targetPath.slice(worktreeHome!.length + 1)
        : targetDir;

    // 1. Safety Checks
    try {
        await stat(targetPath);
    } catch {
        error(`Worktree '${relPath}' not found.`);
    }

    // Prevent removing main worktree
    if (await isMainWorktree(targetPath)) {
        error("Cannot remove 'main' worktree!");
    }

    log(`Target: ${CYAN}${relPath}${NC}`);

    // Check for uncommitted changes
    if (await hasUncommittedChanges(targetPath)) {
        warn("Uncommitted changes detected!");
        await $`git status --short`.cwd(targetPath);
        console.log("");

        // In interactive mode we would ask confirmation. 
        // For now, adhere to "abort on dirty" or force flag (simplification)
        error("Worktree has uncommitted changes. Commit or stash them first.");
    }

    // Check .env.local diff
    const mainWorktree = await findMainWorktreePath(worktreeHome!);
    if (mainWorktree) {
        const mainEnv = `${mainWorktree}/.env.local`;
        const targetEnv = `${targetPath}/.env.local`;

        try {
            await stat(targetEnv);
            await stat(mainEnv);

            // Compare files
            const mainContent = await readFile(mainEnv);
            const targetContent = await readFile(targetEnv);

            if (!mainContent.equals(targetContent)) {
                warn(".env.local differs from main!");
                // Simple implementation: warn but proceed (or error out)
            }
        } catch {
            // Ignore missing env files
        }
    }

    // 2. Get branch name
    let branchName = "";
    try {
        const output = await $`git worktree list`.cwd(mainWorktree!).text();
        const lines = output.trim().split("\n");
        for (const line of lines) {
            // Match path and extract branch
            // The path in output might be absolute. targetPath is absolute.
            // Git output: /abs/path  hash [branch]
            if (line.includes(targetPath)) {
                const match = line.match(/\[(.+)\]$/);
                if (match) {
                    branchName = match[1];
                }
                break;
            }
        }
    } catch {
        warn("Could not determine branch name from git worktree list.");
    }

    // 3. Remove worktree
    log("Removing worktree...");
    await $`git worktree remove ${targetPath}`.cwd(mainWorktree!);

    // 4. Delete local branch
    if (branchName) {
        log(`Deleting local branch: ${CYAN}${branchName}${NC}`);
        try {
            await $`git branch -D ${branchName}`.cwd(mainWorktree!);
        } catch (e) {
            warn(`Failed to delete branch ${branchName}: ${e}`);
        }
    }

    success("Worktree and branch removed");

    // 5. Cleanup & Sync
    log("Syncing with remote...");
    try {
        await $`git fetch --prune`.cwd(mainWorktree!);
        await $`git pull --ff-only`.cwd(mainWorktree!);
    } catch {
        warn("Failed to sync main branch.");
    }

    const hasPackageJson = await fileExists(`${mainWorktree!}/package.json`);
    if (hasPackageJson) {
        log("Syncing dependencies...");
        try {
            await $`bun install --frozen-lockfile`.cwd(mainWorktree!);
        } catch {
            warn("Failed to install dependencies.");
        }
    }
}

async function cmdList(_args: string[]): Promise<void> {
    // Find worktree home from current directory
    const cwd = process.cwd();
    const worktreeHome = await findWorktreeHome(cwd);

    if (!worktreeHome) {
        error("Not inside a worktree home. Run from a wts-managed repository.");
    }

    // Get worktree list from git
    let output: string;
    try {
        // Find the main worktree (has .git directory)
        const mainWorktree = await findMainWorktreePath(worktreeHome);
        if (!mainWorktree) {
            error("Could not find main worktree with .git directory.");
        }
        output = await $`git worktree list`.cwd(mainWorktree).text();
    } catch (e) {
        error("Failed to list worktrees. Is this a git repository?");
    }

    // Parse output: /path/to/worktree  abc1234 [branch-name]
    const lines = output.trim().split("\n").filter(Boolean);
    const worktrees: { path: string; hash: string; branch: string; isMain: boolean }[] = [];

    for (const line of lines) {
        const match = line.match(/^(\S+)\s+(\w+)\s+\[(.+)\]$/);
        if (match) {
            const [, absPath, hash, branch] = match;
            const isMain = await isMainWorktree(absPath);
            const relPath = absPath.startsWith(worktreeHome)
                ? absPath.slice(worktreeHome.length + 1) || "."
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
        `${BOLD}${"PATH".padEnd(maxPath)}  ${"BRANCH".padEnd(maxBranch)}  STATUS${NC}`
    );

    // Print worktrees
    for (const wt of worktrees) {
        const status = wt.isMain ? `${GREEN}*${NC} main` : "";
        console.log(
            `${wt.path.padEnd(maxPath)}  ${CYAN}${wt.branch.padEnd(maxBranch)}${NC}  ${status}`
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
            console.error(`${RED}ERROR:${NC} Unknown command: ${command}`);
            console.error("");
            console.error("Available commands: clone, new, done, list");
            console.error("Run 'wts --help' for usage information.");
            process.exit(1);
    }
}

// Export utilities for use by command implementations
export {
    // Output helpers
    log,
    success,
    error,
    warn,
    // Path utilities
    branchToDir,
    findWorktreeHome,
    // Git utilities
    getDefaultBranch,
    hasUncommittedChanges,
    // Colors
    RED,
    GREEN,
    YELLOW,
    BLUE,
    CYAN,
    BOLD,
    NC,
};

main().catch((err) => {
    error(err.message);
});
