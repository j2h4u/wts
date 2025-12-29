# Worktree Capability

## ADDED Requirements

### Requirement: List Worktrees

The `wts list` command SHALL display all worktrees in the current worktree home.

#### Scenario: List all worktrees

- **WHEN** user runs `wts list` from within worktree home
- **THEN** all worktrees are displayed
- **AND** each entry shows relative path and branch name

#### Scenario: Main worktree indicated

- **WHEN** listing worktrees
- **THEN** main worktree is marked with indicator (e.g., `*` or `[main]`)

### Requirement: Context Validation

The list command SHALL validate it is run from within a worktree home.

#### Scenario: Outside worktree home

- **WHEN** user runs `wts list` outside worktree home
- **THEN** error message is displayed
- **AND** hint suggests running from correct location
