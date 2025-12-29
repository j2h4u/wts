# Tasks: add-list-command

**Depends on:** `add-cli-skeleton` must be completed first.

## 1. List Logic

- [ ] 1.1 Parse output of `git worktree list`
- [ ] 1.2 Extract path, commit hash, and branch for each worktree
- [ ] 1.3 Convert absolute paths to relative (from worktree home)
- [ ] 1.4 Mark main worktree (where `.git/` is directory)

## 2. Output Format

- [ ] 2.1 Display as aligned table with columns: path, branch, status
- [ ] 2.2 Highlight main worktree with indicator

## 3. Integration

- [ ] 3.1 Wire list handler to CLI router

## 4. Verification

- [ ] 4.1 Run `wts list` in worktree home — shows all worktrees
- [ ] 4.2 Verify main worktree is marked
- [ ] 4.3 Run `wts list` outside worktree home — shows error
