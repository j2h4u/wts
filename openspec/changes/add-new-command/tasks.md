# Tasks: add-new-command

**Depends on:** `add-cli-skeleton` must be completed first.

## 1. Worktree Detection

- [x] 1.1 Implement `findMainWorktree()` — find sibling with `.git/` directory
- [x] 1.2 Validate running from within worktree home

## 2. Branch Validation

- [x] 2.1 Check if branch exists locally (`git show-ref --verify`)
- [x] 2.2 Check if branch exists on remote
- [x] 2.3 Abort with clear error if branch exists

## 3. Worktree Creation

- [x] 3.1 Calculate target directory using `branchToDir()`
- [x] 3.2 Run `git worktree add <path> -b <branch>`
- [x] 3.3 Copy `.env.local` from main if exists
- [x] 3.4 Run `bun install --frozen-lockfile`

## 4. Integration

- [x] 4.1 Wire new handler to CLI router
- [x] 4.2 Show progress messages

## 5. Verification

- [x] 5.1 Run `wts new feature/test` — creates `feature__test/` worktree
- [x] 5.2 Verify `.env.local` copied from main
- [x] 5.3 Verify `node_modules/` created
- [x] 5.4 Run `wts new` without branch — shows usage error
- [x] 5.5 Run `wts new existing-branch` — shows error
