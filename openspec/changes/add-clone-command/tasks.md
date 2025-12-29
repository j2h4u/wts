# Tasks: add-clone-command

**Depends on:** `add-cli-skeleton` must be completed first.

## 1. URL Parsing

- [x] 1.1 Extract repo name from SSH URL (`git@github.com:user/repo.git`)
- [x] 1.2 Extract repo name from HTTPS URL (`https://github.com/user/repo.git`)
- [x] 1.3 Generate worktree home name (`<repo>.worktree`)

## 2. Clone Logic

- [x] 2.1 Create worktree home directory
- [x] 2.2 Detect default branch via `git ls-remote --symref origin HEAD`
- [x] 2.3 Clone repository into `<worktree-home>/<branch>/`
- [x] 2.4 Handle clone failures gracefully (cleanup partial directories)

## 3. Integration

- [x] 3.1 Wire clone handler to CLI router
- [x] 3.2 Show progress messages using `log()` helper

## 4. Verification

- [x] 4.1 Run `wts clone git@github.com:user/repo.git` — creates `repo.worktree/main/`
- [x] 4.2 Verify `.git/` is a directory (not file) in cloned worktree
- [x] 4.3 Run `wts clone` without URL — shows usage error
- [x] 4.4 Run `wts clone <url> custom-name` — uses custom directory name
