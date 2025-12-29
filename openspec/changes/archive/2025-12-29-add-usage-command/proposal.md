# Change: Add Usage Command

## Why
AI agents often need quick, scenario-based reference for tool usage without the verbosity of full help docs. A dedicated `usage` command provides a concise "cheat sheet" optimized for LLM context.

## What Changes
- Implement `wts usage` command.
- Output concise scenario-based usage examples.
- Update `HELP` to list the new command.

## Impact
- Affected specs: `cli`
- Affected code: `src/wts.ts`
