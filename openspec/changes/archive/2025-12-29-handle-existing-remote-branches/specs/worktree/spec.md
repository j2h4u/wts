## MODIFIED Requirements

### Requirement: Branch Validation
The new command SHALL validate branch existence and offer to track remote branches.

#### Scenario: Local branch exists
- **WHEN** branch already exists locally
- **THEN** error message is displayed
- **AND** no worktree is created

#### Scenario: Remote branch exists (Interactive)
- **GIVEN** terminal is interactive
- **WHEN** branch exists on remote but not locally
- **THEN** user is prompted to track the remote branch
- **AND** if confirmed, worktree is created tracking the remote branch

#### Scenario: Remote branch exists (Non-interactive)
- **GIVEN** terminal is NOT interactive
- **WHEN** branch exists on remote but not locally
- **THEN** error message is displayed
- **AND** no worktree is created
