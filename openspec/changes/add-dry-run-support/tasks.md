# Tasks: add-dry-run-support

## 1. Core Logic

- [ ] 1.1 Parse `--dry-run` / `-n` flag in `main()`
- [ ] 1.2 Implement `IS_DRY_RUN` constant/getter
- [ ] 1.3 Create helper `run(description: string, action: () => Promise<void>)`

## 2. Implement Command Wrappers

- [ ] 2.1 Refactor `cmdClone` to use `run()` wrapper for git and fs ops
- [ ] 2.2 Refactor `cmdNew` to use `run()` wrapper
- [ ] 2.3 Refactor `cmdDone` to use `run()` wrapper

## 3. Verification

- [ ] 3.1 Run `wts done <dir> --dry-run` -> should log actions but NOT delete
- [ ] 3.2 Run `wts new <branch> --dry-run` -> should log but NOT create
