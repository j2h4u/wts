# Change: Add Dependency Found Message

## Why
When `wts` detects a manifest file (like `package.json`) and triggers dependency installation, it's helpful to explicitly state that the manifest was found. This provides better feedback to the user about why the installation is happening.

## What Changes
- Add `logger.info("Dependencies found (package.json)")` before running the dependency installation spinner in both `wts new` and `wts done`.

## Impact
- Affected specs: `worktree`
- Affected code: `src/wts.ts`
