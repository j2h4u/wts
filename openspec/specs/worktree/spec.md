# worktree Specification

## Purpose
TBD - created by archiving change add-new-command. Update Purpose after archive.
## Requirements
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

### Requirement: Context Validation

The list command SHALL validate it is run from within a worktree home.

#### Scenario: Outside worktree home

- **WHEN** user runs `wts list` outside worktree home
- **THEN** error message is displayed
- **AND** hint suggests running from correct location

