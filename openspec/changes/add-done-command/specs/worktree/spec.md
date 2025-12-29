# Worktree Capability

## ADDED Requirements

### Requirement: Remove Feature Worktree

The `wts done` command SHALL safely remove a worktree and its associated branch.

#### Scenario: Remove worktree and branch

- **WHEN** user runs `wts done feature__xyz`
- **THEN** worktree is removed
- **AND** local branch `feature/xyz` is deleted
- **AND** remote-tracking branches are pruned

#### Scenario: Prevent main removal

- **WHEN** user runs `wts done main`
- **THEN** error message is displayed
- **AND** nothing is removed

### Requirement: Uncommitted Changes Check

The done command SHALL warn about uncommitted changes before removal.

#### Scenario: Clean worktree

- **WHEN** worktree has no uncommitted changes
- **THEN** removal proceeds without prompt

#### Scenario: Dirty worktree

- **WHEN** worktree has uncommitted changes
- **THEN** warning is displayed
- **AND** user is prompted for confirmation
- **AND** removal proceeds only if confirmed

### Requirement: Environment File Check

The done command SHALL compare `.env.local` with main before removal.

#### Scenario: Environment differs from main

- **WHEN** worktree `.env.local` differs from main
- **THEN** diff is displayed
- **AND** user is prompted for confirmation

### Requirement: Post-Removal Sync

The done command SHALL sync main branch after removal.

#### Scenario: Sync after removal

- **WHEN** worktree is successfully removed
- **THEN** `git fetch --prune` is executed
- **AND** `git pull --ff-only` updates main
- **AND** `bun install` syncs dependencies
