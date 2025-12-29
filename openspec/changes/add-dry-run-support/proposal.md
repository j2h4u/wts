# Change: Add Dry Run Support

**Depends on:** `add-cli-skeleton` (completed)

## Why

Users want to preview what actions `wts` will perform without actually executing them, especially for destructive operations like `done` or complex ones like `clone`. This was a feature in the legacy bash scripts.

## What Changes

- Add `--dry-run` (and `-n`) global CLI flag
- Implement `run()` helper wrapper for shell commands
- Update file system operations (`mkdir`, `rm`, `copyFile`) to respect dry-run
- Update all commands (`clone`, `new`, `done`) to use these helpers

## Impact

- Affected specs: `cli` (new capability), `clone`, `worktree`
- Affected code: `src/wts.ts` (extensive updates to logic flow)
