# Project Context

## Purpose

CLI for managing git worktrees — keeps all worktrees as siblings in one folder.

**wts** = Worktree **S**iblings + Type**S**cript

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun |
| Language | TypeScript |
| Shell | Bun shell (no external deps) |

## Project Conventions

### Code Style

- Single entry point: `src/wts.ts`
- Common functions at file start, reused by commands
- Direct `bun shell` calls for git operations

### Architecture Patterns

- **DRY**: Common functions (paths, colors, git) reused by commands
- **KISS**: Minimal abstractions, direct shell calls
- **YAGNI**: No configs or options that "might be useful"

### Git

- Feature-branch workflow
- Commits and PRs in English
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Atomic Commits: complete feature + docs = one commit

### OpenSpec Tasks

- **Granular marking**: Mark tasks as `- [x]` immediately when done. Don't wait until the end.
- This allows tracking progress and restoring context when work is interrupted.

### Testing Strategy

Not yet defined.

## Domain Context

- **Worktree home**: folder containing all worktrees for a repository
- **Sibling layout**: main worktree is a regular clone, feature worktrees are siblings
- Main worktree has `.git/` directory, feature worktrees have `.git` file

## Important Constraints

- Feature worktrees still have `.git` file (git limitation)
- Vercel CLI works only in main worktree (where `.git` is directory)
- Deploy expected only from main/master branch

## What NOT to do

- Add dependencies (keep zero deps)
- Create config files or options before they're needed
- Use git libraries (none support `git worktree`)

## External Dependencies

- Git (system installed)
- Bun (runtime)
