# Centralize Color & Theme Management

## Context
Currently, the `wts` CLI uses hardcoded colors (e.g., `pc.cyan`, `pc.red`) provided by `picocolors` directly within logic, logging, and command definitions. This makes it difficult to change the visual code style, enforce consistency, or support different environments.

## Objective
Centralize all color and style definitions into a single logic configuration object (`Theme`). This will allow:
1.  **Semantic Styling**: Use names like `error`, `accent`, `command` instead of `red`, `cyan`, `italic`.
2.  **Consistency**: Ensure identical UI elements look the same across the app.
3.  **Flexibility**: Easily change the entire look and feel by modifying one object, including support for background colors if needed.

## Scope
- Refactor `src/wts.ts` to implement a `Theme` system.
- Replace all direct `pc.*` calls with `theme.*` semantic calls.
- Ensure no visual regression in the current output (unless intended improvements).
