# Change: Add `wts new` command

**Depends on:** `add-cli-skeleton`

## Why

After cloning a repository with `wts clone`, developers need to create feature branches as sibling worktrees. The `new` command creates a new branch and worktree in one step, copying environment files and installing dependencies.

## What Changes

- Implement `wts new <branch> [dir]` command
- Create worktree as sibling of main worktree
- Convert branch name to safe directory name (`feature/xyz` → `feature__xyz`)
- Copy `.env.local` from main worktree if exists
- Run `bun install` in new worktree
- Check for existing branch (local and remote)

## Impact

- Affected specs: `worktree` (new capability, shared with `done` and `list`)
- Affected code: `src/wts.ts` (add new handler)
