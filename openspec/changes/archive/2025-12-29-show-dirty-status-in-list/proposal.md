# Change: Enhanced Worktree Listing

## Why
The previous `wts list` output was slightly confusing (unclear column names, technical labels like `main`), and lacked visibility into the state of each worktree (dirty/clean). Developers need to know where they are and if they have unsaved work before switching worktrees.

## What Changes
- Refactor `wts list` table: swap PATH and BRANCH columns (BRANCH first).
- Move active worktree indicator (`*`) to the far left.
- Rename STATUS column to TYPE and use `primary` for the main worktree.
- Add `dirty` status indicator for worktrees with uncommitted changes.

## Impact
- Affected specs: `worktree`
- Affected code: `src/wts.ts`
