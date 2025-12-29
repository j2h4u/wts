# clone Specification

## Purpose
TBD - created by archiving change add-clone-command. Update Purpose after archive.
## Requirements
### Requirement: Clone with Sibling Layout

The `wts clone` command SHALL create a worktree home directory containing a regular git clone.

#### Scenario: Clone creates worktree home

- **WHEN** user runs `wts clone git@github.com:user/repo.git`
- **THEN** directory `repo.worktree/` is created
- **AND** repository is cloned into `repo.worktree/<default-branch>/`
- **AND** `.git/` inside cloned directory is a directory (not a file)

#### Scenario: Custom directory name

- **WHEN** user runs `wts clone git@github.com:user/repo.git my-project`
- **THEN** directory `my-project/` is created (without `.worktree` suffix)
- **AND** repository is cloned into `my-project/<default-branch>/`

### Requirement: Default Branch Detection

The clone command SHALL auto-detect the repository's default branch.

#### Scenario: Default branch from remote

- **WHEN** cloning a repository with default branch `main`
- **THEN** clone is placed in `<worktree-home>/main/`

#### Scenario: Fallback for old repositories

- **WHEN** repository uses `master` as default branch
- **THEN** clone is placed in `<worktree-home>/master/`

### Requirement: URL Parsing

The clone command SHALL support common git URL formats.

#### Scenario: SSH URL parsing

- **WHEN** URL is `git@github.com:user/repo.git`
- **THEN** repository name is extracted as `repo`

#### Scenario: HTTPS URL parsing

- **WHEN** URL is `https://github.com/user/repo.git`
- **THEN** repository name is extracted as `repo`

### Requirement: Error Handling

The clone command SHALL handle errors gracefully.

#### Scenario: Missing URL argument

- **WHEN** user runs `wts clone` without URL
- **THEN** usage error is displayed
- **AND** exit code is 1

#### Scenario: Directory already exists

- **WHEN** target directory already exists
- **THEN** error message is displayed
- **AND** no files are modified

