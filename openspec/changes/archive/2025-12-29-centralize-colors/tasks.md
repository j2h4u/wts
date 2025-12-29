# Tasks: Centralize Colors

- [x] **Define Theme Object**: Add the `theme` configuration near `CONFIG` in `src/wts.ts` with semantic keys (`error`, `warn`, `accent`, `command`, etc.).
- [x] **Refactor Logger**: Update the `logger` object to use `theme` values instead of hardcoded `pc.*` calls.
- [x] **Refactor Spinners**: Update `runWithSpinner` to use `theme` for icons and text styling.
- [x] **Refactor Commands**: Go through `cmdClone`, `cmdNew`, `cmdDone`, `cmdList` and replace all `pc.*` calls with appropriate `theme.*` usage.
- [x] **Validate**: Run manual checks or E2E tests to ensure output aesthetics are preserved (or improved).
