# Tasks: Handle existing remote branches

- [x] **Interaction Helpers**: Implement `isInteractive()` and `confirm(message)` in `src/wts.ts`.
- [x] **Refactor `cmdNew` Branch Detection**: Split branch validation into local and remote checks.
- [x] **Implement Tracking Logic**: If branch exists on remote, prompt to track it.
- [x] **Verify**: Ensure `git worktree add <path> <branch>` is used when tracking, and `git worktree add <path> -b <branch>` when creating new.
- [ ] **Validate**: Run E2E tests to ensure no regressions.
