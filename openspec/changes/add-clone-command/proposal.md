# Change: Add `wts clone` command

**Depends on:** `add-cli-skeleton`

## Why

The clone command is the entry point for new repositories. It creates the worktree home structure with a regular clone (not bare) so that tools like Vercel CLI work correctly.

## What Changes

- Implement `wts clone <url> [dir]` command
- Create worktree home directory (`<repo>.worktree/`)
- Clone repository as regular clone into `<branch>/` subdirectory
- Auto-detect default branch name via `git ls-remote`
- Support SSH and HTTPS URLs

## Impact

- Affected specs: `clone` (new capability)
- Affected code: `src/wts.ts` (add clone handler)
