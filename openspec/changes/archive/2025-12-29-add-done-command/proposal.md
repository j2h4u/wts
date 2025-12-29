# Change: Add `wts done` command

**Depends on:** `add-cli-skeleton`

## Why

After a PR is merged, developers need to clean up the feature worktree and its local branch. The `done` command safely removes the worktree, checks for uncommitted changes, and syncs the main branch.

## What Changes

- Implement `wts done <dir>` command
- Check for uncommitted changes before removal
- Compare `.env.local` with main (warn on differences)
- Remove worktree via `git worktree remove`
- Delete local branch
- Prune remote-tracking branches and pull main

## Impact

- Affected specs: `worktree` (add to existing capability)
- Affected code: `src/wts.ts` (add done handler)
