#!/usr/bin/env bun

import { $ } from "bun";
import { file, write } from "bun";

const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const NC = "\x1b[0m";

// Enable debug mode for wts
process.env.DEBUG = "1";


function log(msg: string) {
    console.log(`\n${GREEN}[TEST]${NC} ${msg}`);
}

async function run() {
    try {
        // Link wts globally for convenience (or use absolute path)
        const wtsPath = "/app/src/wts.ts";

        // Setup workspace
        log("Setting up workspace...");
        const workspaceDir = "/tmp/wts-e2e";
        await $`rm -rf ${workspaceDir}`;
        await $`mkdir -p ${workspaceDir}`;
        process.chdir(workspaceDir);

        // 1. Test CLONE
        log("Testing 'wts clone'...");
        // Let's use a public repo (Hello-World) to ensure tests pass without SSH keys
        const repoUrl = "https://github.com/octocat/Hello-World.git";
        const defaultBranch = "master"; // Hello-World uses master

        await $`bun ${wtsPath} clone ${repoUrl}`;

        // Verify structure
        const worktreeHome = "Hello-World.worktree";
        const fs = await import("node:fs/promises");

        try {
            await fs.stat(`${worktreeHome}/${defaultBranch}/.git`);
        } catch {
            throw new Error(`${defaultBranch}/.git directory missing`);
        }

        // Verify .git is directory
        const stat = await fs.stat(`${worktreeHome}/${defaultBranch}/.git`);
        if (!stat.isDirectory()) {
            throw new Error(`${defaultBranch}/.git is not a directory!`);
        }

        // Enter worktree home -> main worktree
        process.chdir(`${worktreeHome}/${defaultBranch}`);

        // 2. Test NEW
        log("Testing 'wts new'...");
        await $`bun ${wtsPath} new feature/e2e-test`;

        try {
            await fs.stat(`../feature__e2e-test/.git`);
        } catch {
            throw new Error("feature worktree missing");
        }

        // 3. Test LIST
        log("Testing 'wts list'...");
        const listOutput = await $`bun ${wtsPath} list`.text();
        console.log(listOutput);

        if (!listOutput.includes("feature/e2e-test") || !listOutput.includes(defaultBranch)) {
            throw new Error("List output incorrect");
        }

        // 4. Test DONE
        log("Testing 'wts done'...");
        await $`bun ${wtsPath} done feature__e2e-test`;

        try {
            await fs.stat(`../feature__e2e-test`);
            throw new Error("Feature directory still exists");
        } catch {
            // Good - directory does not exist
        }

        log("ALL TESTS PASSED ✨");

    } catch (e) {
        console.error(`\n${RED}[FAIL]${NC} ${e}`);
        process.exit(1);
    }
}

run();
