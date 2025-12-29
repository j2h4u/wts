# wts — Worktree Siblings

> **Worktree** management CLI that keeps all worktrees as siblings in one folder.

| | |
|---|---|
| **Status** | Discovery |
| **Created** | 2025-12-29 |
| **Name** | **wts** = Worktree **S**iblings + Type**S**cript |
| **Repository** | `github.com/j2h4u/wts` (planned) |

## Problem Statement

Current repository structure uses **bare clone + worktrees**, causing compatibility issues with tools expecting a standard `.git/` directory.

### Symptoms

- **Vercel CLI** fails with error `ENOTDIR: not a directory, lstat '.git/config'`
- IDE plugins and CI tools may incorrectly detect Git repository
- Tools don't understand `.git` pointer file

### Root Cause

In a worktree, `.git` is a **text file** with a reference to bare repository:
```
gitdir: /path/to/.bare/worktrees/<name>
```

Tools expect `.git/` **directory** with `config`, `HEAD`, `objects/`, etc.

---

## Business Context

This infrastructure is needed to **simplify AI agent work with feature branches**:

1. **Creating feature branches** — agent runs `wts new feature/xyz` and gets isolated working directory
2. **Parallel work** — multiple agents (or human + agent) can work on different features simultaneously
3. **Pull Request workflow** — from feature worktree do `git push` and create PR
4. **Cleanup after merge** — `wts done` removes worktree and local branch

### Benefits for Agents

- **Isolation** — each feature in its own folder, no conflicts with `node_modules` / `.env`
- **Simplicity** — single CLI (`wts`) with obvious commands
- **Standardization** — all repositories have the same structure

---

## Existing Solutions

Multiple CLI tools exist for git worktree management:

| Tool | Description | Link |
|------|-------------|------|
| **wtm** | Bun + TypeScript, for bare repos, zero deps | [github.com/your-tools/wtm](https://github.com/your-tools/wtm) |
| **wtp** | Auto-copy `.env`, post-create hooks | [github.com/satococoa/wtp](https://github.com/satococoa/wtp) |
| **worktree-cli** | AI assistant focus, isolated contexts | [github.com/fnebenfuehr/worktree-cli](https://github.com/fnebenfuehr/worktree-cli) |
| **worktree-cli** | GitHub Issues + Claude Code integration | [npmjs.com/@jlawman/worktree-cli](https://www.npmjs.com/package/@jlawman/worktree-cli) |
| **Treekanga** | YAML config, zoxide/tmux/VSCode integration | [github.com/treekanga/treekanga](https://github.com/treekanga/treekanga) |
| **newt** | Minimal CLI for quick operations | [github.com/cdzombak/newt](https://github.com/cdzombak/newt) |
| **git-worktree-toolbox** | MCP server + CLI (gwtree) | [github.com/ben-rogerson/git-worktree-toolbox](https://github.com/ben-rogerson/git-worktree-toolbox) |
| **git-worktree-wrapper** | API for checkout/branch commands | [github.com/lu0/git-worktree-wrapper](https://github.com/lu0/git-worktree-wrapper) |

### Why They Don't Fit

**None of the tools solve our main problem:**

1. **Sibling layout** — all worktrees in one folder, side by side
2. **Regular clone for main** — not bare, so Vercel CLI works
3. **Global installation** — single CLI for all repositories

Most tools work on top of standard `git worktree` without changing clone structure.

---

## Discovery

### Current Structure (Bare + Worktree)

```
github_repo_name.worktree/           ← Worktree home
├── .bare/                           ← Bare repository (core git data)
│   ├── config
│   ├── objects/
│   ├── refs/
│   └── worktrees/
│       └── master/                  ← Worktree metadata
│           ├── HEAD
│           └── gitdir → ...master/.git
├── master/                          ← Worktree for master branch
│   └── .git (file!)                 ← Points to ../.bare/worktrees/master
└── feature-xyz/                     ← Other worktrees
    └── .git (file!)
```

**Problem:** All worktrees have `.git` file, including main branch.

### Dependencies on Current Structure

| File | Dependency |
|------|------------|
| `scripts/wt-helpers/wt-common-lib.sh` | `findWorktreeHome()` searches for `.bare/` directory |
| `scripts/wt-helpers/wt-clone.sh` | `git clone --bare` + hardcoded `.bare` path |
| `scripts/wt-helpers/wt-new.sh` | Requires running from `main/` worktree |
| `scripts/wt-helpers/wt-done.sh` | Depends on `detect_layout()` from common-lib |
| `scripts/wt-helpers/CONTRIBUTING.md` | Documentation describes bare layout |

---

## Proposed Solution

### New Structure (Regular Clone + Sibling Worktrees)

```
github_repo_name.worktree/           ← Worktree home (preserved!)
├── master/                          ← Main branch = REGULAR CLONE
│   └── .git/                        ← DIRECTORY (full git repo)
│       ├── config
│       ├── objects/
│       ├── refs/
│       └── worktrees/
│           └── feature-xyz/         ← Sibling worktree metadata
└── feature-xyz/                     ← Worktree (sibling of main branch)
    └── .git (file)                  ← Points to master/.git/worktrees/...
```

### Key Changes

| Aspect | Before | After |
|--------|--------|-------|
| Main branch | worktree from bare | regular `git clone` |
| `.git` in main | file | **directory** |
| `.git` in feature | file | file (unchanged) |
| Object storage | `.bare/objects/` | `master/.git/objects/` |
| Worktree home detection | search for `.bare/` | search for `.git/` directory |

### Benefits

1. **Vercel CLI works** — main worktree has real `.git/` directory
2. **Standard git workflow** — main worktree indistinguishable from regular clone
3. **Folder structure preserved** — visual hierarchy remains
4. **Feature worktrees work as before** — created as siblings

### Limitations

- Feature worktrees still have `.git` file (git worktree limitation)
- Vercel CLI from feature worktree still won't work
- Deploy expected only from main/master

---

## Implementation Plan

### Approach

Building a **global CLI** in TypeScript. Separate repository, installed via `bun link` or npm.

### Principles

| Principle | Application |
|-----------|-------------|
| **DRY** | Common functions (paths, colors, git) at file start, reused by commands |
| **KISS** | Minimal abstractions, direct `bun shell` calls |
| **YAGNI** | No configs or options that "might be useful" |

### Repository Structure

```
wts/
├── src/
│   └── wts.ts         # CLI entry point + all logic
├── package.json       # bin: { "wts": "src/wts.ts" }
└── README.md
```

### CLI Interface

| Command | Description |
|---------|-------------|
| `wts clone <url> [dir]` | Clone repo with all worktrees as siblings |
| `wts new <branch> [dir]` | Create feature worktree |
| `wts done <dir>` | Remove worktree and branch |
| `wts list` | Show all worktrees |

### Installation

```bash
# Clone and install globally
git clone git@github.com:j2h4u/wts.git ~/.local/share/wts
cd ~/.local/share/wts
bun link

# Usage (from anywhere)
wts clone git@github.com:user/repo.git
wts new feature/xyz
wts done feature__xyz
```

### Phase 1: Implement `src/wts.ts`

**Modules:**

1. **CLI Router** — command parsing, handler dispatch
2. **Clone Handler** — `git clone` + worktree home structure creation
3. **New Handler** — `git worktree add` + setup (deps, env)
4. **Done Handler** — checks + `git worktree remove` + cleanup
5. **List Handler** — wrapper over `git worktree list`
6. **Helpers** — colors, paths, git utils

**Key Functions:**

| Function | Responsibility |
|----------|----------------|
| `findWorktreeHome()` | Find worktree home by `.git/` directory |
| `findMainWorktree()` | Find main worktree (where `.git` is directory) |
| `getDefaultBranch()` | Auto-detect from `git ls-remote` |
| `branchToDir()` | Convert `feature/xyz` → `feature__xyz` |
| `hasUncommittedChanges()` | Check `git status --porcelain` |

### Phase 2: Testing

- [ ] `wts clone` creates correct structure (main = regular clone)
- [ ] `wts new` creates sibling worktrees
- [ ] `wts done` correctly removes worktrees and branches
- [ ] Vercel CLI works in main worktree
- [ ] `git push/pull/fetch` work from all worktrees

### Phase 3: Publishing

1. Publish to GitHub: `github.com/j2h4u/wts`
2. Add README with examples
3. (optional) Publish to npm: `npm install -g wts`

---

## Decisions

1. **Main branch name**: ✅ Auto-detection
   - Use `git ls-remote --symref origin HEAD` to determine default branch

2. **Backward compatibility**: ✅ Not required
   - Old bare layout not supported
   - Existing repos simply re-clone in new format

3. **Behavior on uncommitted changes**: ✅ Abort
   - Scripts should check `git status --porcelain` and abort if changes exist

4. **Package manager**: ✅ Configurable
   - Create `.wt-config` or use environment variables
   - Default: `bun`

5. **CLI format**: ✅ Global CLI
   - Commands: `wts clone`, `wts new`, `wts done`, `wts list`
   - Installation: `bun link` or npm global
   - Separate repository: `github.com/j2h4u/wts`

6. **Git libraries**: ✅ Not used
   - None support `git worktree`
   - Using `bun shell` — no dependencies, easy debugging

---

## Migration Strategy

> **In-place migration not required.**

Since local repositories are synced with remote, simply:
1. Create and install `wts`
2. Use `wts clone` to deploy repositories in new location
3. Delete old bare worktree homes after verification

---

## Appendix: Git Worktree Internals

### Standard git worktree layout (scattered)

```
~/projects/
├── my-repo/                 ← Main clone
│   └── .git/                ← Full directory
├── my-repo-feature-xyz/     ← Worktree (somewhere nearby)
│   └── .git (file)
└── other-place/             ← Worktree can be anywhere
    └── .git (file)
```

**Problem:** Worktrees scattered, no single location.

### wts sibling layout

```
~/projects/
└── my-repo.worktree/        ← WORKTREE HOME
    ├── main/                ← Main clone
    │   └── .git/            ← Directory
    └── feature-xyz/         ← Sibling worktree
        └── .git (file)
```

**Benefit:** All worktrees in one place, convenient hierarchy.

### How sibling worktrees are created

```bash
# From master/ (main worktree)
git worktree add ../feature-xyz feature/xyz
```

Git creates:
- `../feature-xyz/` — working directory with `.git` file
- `.git/worktrees/feature-xyz/` — worktree metadata (HEAD, index, etc.)

### Structure of `.git` file in worktree

```
gitdir: /absolute/path/to/master/.git/worktrees/feature-xyz
```

### Link between worktree ↔ main repo

```
master/.git/worktrees/feature-xyz/gitdir → ../../../feature-xyz/.git
feature-xyz/.git → master/.git/worktrees/feature-xyz
```
