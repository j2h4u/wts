# Change: Allow tracking existing remote branches

## Why
Currently `wts new <branch>` fails if `<branch>` exists on the remote. This is suboptimal for developers who want to work on a feature that someone else has already pushed. The CLI should allow tracking these branches instead of just throwing an error.

## What Changes
- Modify `wts new` to detect if a branch exists only on the remote.
- If interactive, prompt the user to track the remote branch.
- If the user confirms (or if we decide to auto-track in some cases), create the worktree tracking the remote branch (omitting the `-b` flag in `git worktree add`).

## Impact
- Affected specs: `worktree`
- Affected code: `src/wts.ts`
