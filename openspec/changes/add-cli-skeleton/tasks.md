# Tasks: add-cli-skeleton

## 1. Output Helpers

- [ ] 1.1 Add ANSI color constants (RED, GREEN, YELLOW, BLUE, CYAN, BOLD, NC)
- [ ] 1.2 Implement `log()` — section header with blue arrow
- [ ] 1.3 Implement `success()` — green checkmark + message
- [ ] 1.4 Implement `error()` — red message + exit(1)
- [ ] 1.5 Implement `warn()` — yellow warning to stderr

## 2. Path Utilities

- [ ] 2.1 Implement `branchToDir()` — convert `feature/xyz` → `feature__xyz`
- [ ] 2.2 Implement `findWorktreeHome()` — find parent with `.git/` directory

## 3. Git Utilities

- [ ] 3.1 Implement `getDefaultBranch()` — detect via `git ls-remote --symref`
- [ ] 3.2 Implement `hasUncommittedChanges()` — check `git status --porcelain`

## 4. CLI Router

- [ ] 4.1 Parse `process.argv` to extract command and args
- [ ] 4.2 Implement command dispatch (switch/case for clone, new, done, list)
- [ ] 4.3 Add stub handlers that print "not implemented"
- [ ] 4.4 Show help message when no command or `--help`

## 5. Verification

- [ ] 5.1 Run `wts` — shows help
- [ ] 5.2 Run `wts --help` — shows help
- [ ] 5.3 Run `wts clone` — shows "not implemented" stub
- [ ] 5.4 Run `wts unknown` — shows error for unknown command
