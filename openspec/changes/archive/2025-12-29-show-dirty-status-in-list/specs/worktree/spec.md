## MODIFIED Requirements

### Requirement: List Worktrees
The `wts list` command SHALL display all worktrees with their branch, path, and state.

#### Scenario: List worktrees with metadata
- **WHEN** user runs `wts list`
- **THEN** output shows columns: BRANCH, PATH, TYPE
- **AND** the current worktree is marked with `*` on the left
- **AND** the main worktree is labeled as `primary`
- **AND** worktrees with uncommitted changes are labeled as `dirty`

#### Scenario: Main worktree indicator
- **GIVEN** I am in the main worktree
- **WHEN** I run `wts list`
- **THEN** the main worktree entry shows `*` and `primary`
