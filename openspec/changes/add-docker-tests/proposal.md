# Change: Add Docker-based E2E Tests

**Depends on:** All CLI commands implemented.

## Why

We need to verify that `wts` correctly manages git worktrees without cluttering the developer's local machine or risking data loss. Docker provides an isolated, clean environment for end-to-end testing.

## What Changes

- Create `Dockerfile` based on `oven/bun`
- Add `git` to the image
- Create `test/e2e.sh` script that:
  - Links local `wts` binary
  - Clones the current repository (`github.com/j2h4u/wts`) using `wts clone`
  - Creates a feature worktree using `wts new`
  - Lists worktrees using `wts list`
  - Removes worktree using `wts done`
- Verify exit codes and file structure after each step

## Impact

- Affected specs: `tests` (new capability)
- Affected code: New files `Dockerfile`, `test/e2e.sh`
