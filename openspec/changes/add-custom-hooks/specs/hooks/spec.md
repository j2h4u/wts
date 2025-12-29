# Hooks Capability

## ADDED Requirements

### Requirement: Custom Script Execution

The CLI SHALL execute user-defined scripts at specific lifecycle events if they exist.

#### Scenario: Post-New Hook

- **WHEN** `wts new` successfully creates a worktree
- **AND** file `.wts/hooks/post-new` exists and is executable in worktree home
- **THEN** the script is executed
- **AND** environment variables `WTS_WORKTREE_PATH` and `WTS_BRANCH` are provided

#### Scenario: Hook Failure

- **WHEN** a hook script returns non-zero exit code
- **THEN** a warning is displayed
- **BUT** the main command execution is considered successful (hooks are advisory/supplemental)
