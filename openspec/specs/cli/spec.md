# cli Specification

## Purpose
TBD - created by archiving change add-cli-skeleton. Update Purpose after archive.
## Requirements
### Requirement: Command Routing

The CLI SHALL parse the first argument as a command name and dispatch to the appropriate handler.

#### Scenario: Valid command dispatched

- **WHEN** user runs `wts clone <url>`
- **THEN** the clone handler is invoked with remaining arguments

#### Scenario: Unknown command shows error

- **WHEN** user runs `wts unknown-cmd`
- **THEN** an error message is displayed
- **AND** available commands are listed
- **AND** exit code is 1

### Requirement: Help Display

The CLI SHALL display usage information when invoked without arguments or with `--help`.

#### Scenario: No arguments shows help

- **WHEN** user runs `wts`
- **THEN** usage information with all commands is displayed

#### Scenario: Help flag shows help

- **WHEN** user runs `wts --help`
- **THEN** usage information with all commands is displayed

### Requirement: Colored Output Helpers

The CLI SHALL provide helper functions for consistent colored terminal output.

#### Scenario: Log displays section header

- **WHEN** `log("message")` is called
- **THEN** output shows blue arrow with bold message

#### Scenario: Error exits with code 1

- **WHEN** `error("message")` is called
- **THEN** red error message is printed to stderr
- **AND** process exits with code 1

### Requirement: Path Utilities

The CLI SHALL provide utilities for path manipulation in worktree context.

#### Scenario: Branch name converted to directory name

- **WHEN** `branchToDir("feature/xyz")` is called
- **THEN** result is `"feature__xyz"`

#### Scenario: Worktree home detection

- **WHEN** `findWorktreeHome("/path/to/repo.worktree/main/subdir")` is called
- **THEN** result is `"/path/to/repo.worktree"` (parent containing `.git/` directory)

### Requirement: Git Utilities

The CLI SHALL provide utilities for common git operations.

#### Scenario: Default branch detection

- **WHEN** `getDefaultBranch("git@github.com:user/repo.git")` is called
- **THEN** result is the default branch name (e.g., `"main"` or `"master"`)

#### Scenario: Uncommitted changes detection

- **WHEN** `hasUncommittedChanges()` is called in a dirty worktree
- **THEN** result is `true`

