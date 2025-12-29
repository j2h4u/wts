# Change: Add `wts list` command

**Depends on:** `add-cli-skeleton`

## Why

Developers need to see all worktrees in the current repository. The `list` command provides a clean overview of existing worktrees with their branches.

## What Changes

- Implement `wts list` command
- Display all worktrees in current worktree home
- Show branch name and relative path for each
- Indicate which worktree is main (has `.git/` directory)

## Impact

- Affected specs: `worktree` (add to existing capability)
- Affected code: `src/wts.ts` (add list handler)
