# Change: Add CLI skeleton with router and helpers

## Why

The CLI entry point (`src/wts.ts`) currently only prints a placeholder message. Before implementing individual commands (`clone`, `new`, `done`, `list`), we need a foundation: command routing, colored output helpers, and common git utilities that all commands will share.

## What Changes

- Implement CLI argument router (dispatch to command handlers)
- Add colored output helpers (`log`, `success`, `error`, `warn`)
- Add path utilities (`branchToDir`, `findWorktreeHome`)
- Add git utilities (`getDefaultBranch`, `hasUncommittedChanges`)
- Display help message when no command or `--help`

## Impact

- Affected specs: `cli` (new capability)
- Affected code: `src/wts.ts`
