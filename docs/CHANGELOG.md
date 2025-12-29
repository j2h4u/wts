# Changelog

## [0.7.0] - 2025-12-29

### Added
- **Dependency Discovery Info**: `wts` now explicitly notifies when a manifest file (e.g., `package.json`) is found before starting dependency installation.

## [0.6.0] - 2025-12-29

### Added
- **Dirty Status in List**: `wts list` now shows a `dirty` indicator for worktrees with uncommitted changes.
- **Improved List UI**: Refactored the worktree table with swapped columns (Branch first), clearer headers, and conventional `*` indicators for the active worktree.

## [0.5.0] - 2025-12-29

### Added
- **Remote Branch Tracking**: `wts new` now detects branches that exist on the remote and offers to track them automatically in interactive sessions.

## [0.4.0] - 2025-12-29

### Added
- **Usage Command**: Added `wts usage` command for AI agents, providing a concise scenario-based overview of available commands.

## [0.3.0] - 2025-12-29

### Added
- **Theme System**: Centralized color and style management for consistent CLI output and easier customization.
- **Enhanced Documentation**: The root `README.md` now contains links to all project documents, including a new "Testing Guide".

### Changed
- **Doc Restructuring**: Moved `docs/TESTING.md` to `test/README.md` to keep it closer to the test source code.
- **CLI Consistency**: Replaced all hardcoded colors with semantic theme calls (e.g., `theme.style.accent`).

## [0.2.0] - 2025-12-29

### Added
- **Premium TUI**: Implemented spinners and color-coded output for a better user experience.
- **Legacy Docs**: Added documentation for original prototype scripts.

### Changed
- **UX Improvements**: Cleaner output with graceful degradation for CI and better handling of non-JS repositories.
- **Refactoring**: Moved `Dockerfile` to `test/` directory.

## [0.1.0] - 2025-12-29

### Added
- **Initial Release**: TypeScript/Bun implementation of `wts` CLI.
- **Commands**: Supported `clone`, `new`, `list`, and `done`.
- **Testing**: Added Docker-based E2E test infrastructure.
