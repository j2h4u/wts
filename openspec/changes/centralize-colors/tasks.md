# Tasks: Centralize Colors

1.  **Define Theme Object**: Add the `theme` configuration near `CONFIG` in `src/wts.ts` with semantic keys (`error`, `warn`, `accent`, `command`, etc.).
2.  **Refactor Logger**: Update the `logger` object to use `theme` values instead of hardcoded `pc.*` calls.
3.  **Refactor Spinners**: Update `runWithSpinner` to use `theme` for icons and text styling.
4.  **Refactor Commands**: Go through `cmdClone`, `cmdNew`, `cmdDone`, `cmdList` and replace all `pc.*` calls with appropriate `theme.*` usage.
5.  **Validate**: Run manual checks or E2E tests to ensure output aesthetics are preserved (or improved).
