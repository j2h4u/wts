# wts — Worktree Siblings

> Opinionated CLI for managing git worktrees — keeps all worktrees as siblings in one folder.

## Problem

Standard `git worktree` creates worktrees scattered across the filesystem.  
Tools like Vercel CLI fail with `ENOTDIR` error on bare repository worktrees.

## Solution

**Sibling layout** — all worktrees in one folder, side by side:

```
my-repo.worktree/        ← Worktree home
├── main/                ← Main branch (regular clone with .git/ directory)
│   └── .git/
└── feature-xyz/         ← Feature worktree (sibling)
    └── .git (file)
```

## Installation

```bash
git clone git@github.com:j2h4u/wts.git ~/.local/share/wts
cd ~/.local/share/wts
bun install
bun link
```

## Usage

```bash
wts clone <url> [dir]   # Clone repo with worktrees as siblings
wts new <branch> [dir]  # Create feature worktree
wts done <dir>          # Remove worktree and branch
wts list                # Show all worktrees
```

## Documentation

- [Specification](docs/SPEC.md) — Full design and architectural details.
- [Testing Guide](test/README.md) — Information on E2E testing with Docker.
- [Changelog](docs/CHANGELOG.md) — History of changes.
- [AI Instructions](AGENTS.md) — Guidelines for AI assistants working on this repo.
- [OpenSpec Reference](openspec/AGENTS.md) — Detailed OpenSpec workflow and CLI guide.
- [Legacy Prototypes](legacy/README.md) — Original bash scripts (deprecated).

## Naming

**wts** = Worktree **S**iblings + Type**S**cript

## License

MIT
