# Worktree Capability

## ADDED Requirements

### Requirement: Create Feature Worktree

The `wts new` command SHALL create a new branch and worktree as sibling of main.

#### Scenario: Create worktree with new branch

- **WHEN** user runs `wts new feature/xyz` from worktree home
- **THEN** directory `feature__xyz/` is created as sibling of main
- **AND** new branch `feature/xyz` is created
- **AND** worktree is checked out to that branch

#### Scenario: Custom directory name

- **WHEN** user runs `wts new feature/xyz my-feature`
- **THEN** directory `my-feature/` is created
- **AND** branch name remains `feature/xyz`

### Requirement: Environment Setup

The new command SHALL set up the development environment in the new worktree.

#### Scenario: Copy environment file

- **WHEN** main worktree has `.env.local`
- **THEN** it is copied to new worktree

#### Scenario: Install dependencies

- **WHEN** worktree is created
- **THEN** `bun install --frozen-lockfile` is executed

### Requirement: Branch Validation

The new command SHALL prevent creating duplicate branches.

#### Scenario: Local branch exists

- **WHEN** branch already exists locally
- **THEN** error message is displayed
- **AND** no worktree is created

#### Scenario: Remote branch exists

- **WHEN** branch exists on remote
- **THEN** error message is displayed
- **AND** no worktree is created
