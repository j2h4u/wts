# Change: Add Custom Hooks Support

**Depends on:** `add-cli-skeleton` (completed)

## Why

The current implementation assumes a specific stack (Bun + Next.js) by automatically copying `.env.local` and running `bun install`. Users working with other stacks (Node.js, Rust, Go) or requiring custom setup steps need a way to extend `wts` behavior without modifying the core code.

## What Changes

- Support for optional hook scripts in `.wts/hooks/` directory (inside worktree home)
- `post-clone`: Executed after `wts clone` finishes
- `post-new`: Executed after `wts new` finishes (replacing hardcoded `bun install` if present? or running in addition?) -> *Decision: Run in addition, but maybe allow disabling built-in logic via config? For now: Run AFTER.*
- `pre-done` / `post-done`: For cleanup logic.
- Pass context (worktree path, branch name) to hooks via Environment Variables.

## Impact

- Affected specs: `hooks` (new capability)
- Affected code: `src/wts.ts` (add hook execution logic)
