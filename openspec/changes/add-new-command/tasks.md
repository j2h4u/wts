# Tasks: add-new-command

**Depends on:** `add-cli-skeleton` must be completed first.

## 1. Worktree Detection

- [ ] 1.1 Implement `findMainWorktree()` — find sibling with `.git/` directory
- [ ] 1.2 Validate running from within worktree home

## 2. Branch Validation

- [ ] 2.1 Check if branch exists locally (`git show-ref --verify`)
- [ ] 2.2 Check if branch exists on remote
- [ ] 2.3 Abort with clear error if branch exists

## 3. Worktree Creation

- [ ] 3.1 Calculate target directory using `branchToDir()`
- [ ] 3.2 Run `git worktree add <path> -b <branch>`
- [ ] 3.3 Copy `.env.local` from main if exists
- [ ] 3.4 Run `bun install --frozen-lockfile`

## 4. Integration

- [ ] 4.1 Wire new handler to CLI router
- [ ] 4.2 Show progress messages

## 5. Verification

- [ ] 5.1 Run `wts new feature/test` — creates `feature__test/` worktree
- [ ] 5.2 Verify `.env.local` copied from main
- [ ] 5.3 Verify `node_modules/` created
- [ ] 5.4 Run `wts new` without branch — shows usage error
- [ ] 5.5 Run `wts new existing-branch` — shows error
