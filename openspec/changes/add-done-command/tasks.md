# Tasks: add-done-command

**Depends on:** `add-cli-skeleton` must be completed first.

## 1. Safety Checks

- [ ] 1.1 Validate worktree directory exists
- [ ] 1.2 Prevent removal of main worktree
- [ ] 1.3 Check for uncommitted changes (`git status --porcelain`)
- [ ] 1.4 Compare `.env.local` with main worktree
- [ ] 1.5 Prompt for confirmation if changes detected

## 2. Worktree Removal

- [ ] 2.1 Get branch name from `git worktree list`
- [ ] 2.2 Run `git worktree remove <path>`
- [ ] 2.3 Delete local branch (`git branch -D`)

## 3. Cleanup

- [ ] 3.1 Run `git fetch --prune` to clean stale remotes
- [ ] 3.2 Run `git pull --ff-only` to update main
- [ ] 3.3 Run `bun install` to sync dependencies

## 4. Integration

- [ ] 4.1 Wire done handler to CLI router

## 5. Verification

- [ ] 5.1 Run `wts done feature__test` — removes worktree and branch
- [ ] 5.2 Run `wts done main` — shows error (cannot remove main)
- [ ] 5.3 Run `wts done nonexistent` — shows error (not found)
- [ ] 5.4 Run with uncommitted changes — prompts for confirmation
