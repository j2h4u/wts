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

/** Yellow warning to stderr */
function warn(message: string): void {
    console.error(`${YELLOW}WARNING:${NC} ${message}`);
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
    let current = startPath;

    while (current !== "/") {
        const gitPath = `${current}/.git`;
        const stat = await Bun.file(gitPath).exists();

        if (stat) {
            // Check if .git is a directory (main worktree) not a file (feature worktree)
            const file = Bun.file(gitPath);
            try {
                // If we can read it as text, it's a file (worktree pointer)
                await file.text();
                // It's a file, keep searching up
            } catch {
                // Can't read as text = it's a directory = we found main worktree
                // Return parent of this directory (worktree home)
                const parentDir = current.split("/").slice(0, -1).join("/");
                return parentDir || "/";
            }
        }

        current = current.split("/").slice(0, -1).join("/") || "/";
    }

    return null;
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
    log("Clone command");
    warn("Not implemented yet. See proposal: add-clone-command");
    console.log(`Args: ${args.join(", ") || "(none)"}`);
}

async function cmdNew(args: string[]): Promise<void> {
    log("New command");
    warn("Not implemented yet. See proposal: add-new-command");
    console.log(`Args: ${args.join(", ") || "(none)"}`);
}

async function cmdDone(args: string[]): Promise<void> {
    log("Done command");
    warn("Not implemented yet. See proposal: add-done-command");
    console.log(`Args: ${args.join(", ") || "(none)"}`);
}

async function cmdList(args: string[]): Promise<void> {
    log("List command");
    warn("Not implemented yet. See proposal: add-list-command");
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
