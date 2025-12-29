# Dev workflow: git worktree + Bun + gh

> **LEGACY:** This document describes the old bare+worktree approach.  
> See `docs/SPEC.md` for the new wts approach with regular clone.

## Layout

Not "one repo folder + worktrees scattered", but a worktree home with **bare** repo and worktree sibling folders:

```
github_repo_name.worktree/
├── .bare/           ← bare repository (Git internals; don't work here)
├── main/            ← worktree for main branch
├── feature-xyz/     ← worktree for feature branch
└── bugfix-123/      ← worktree for bugfix branch
```

Work (edits, commits, push) happens **only** inside `main/` or specific `feature-*`/`bugfix-*` folder.

---

## Setup (First time)

To deploy project "from scratch" (e.g., on new machine) in correct worktree structure, use the script:

```sh
# If script is available locally:
./scripts/wt-clone.sh git@github.com:j2h4u/orchids-telegram-mini-app-development.git

# Or copy its contents for bootstrapping
```

This creates folder `orchids-telegram-mini-app-development.worktree/` with `.bare` + `main` structure (branch name auto-detected).

---

## Main workflow

### 1. Create new branch

```sh
./scripts/wt-new.sh feature/my-feature
```

Script automatically:
- Updates main (`git pull`)
- Creates worktree folder next to main
- Installs dependencies (`bun install --frozen-lockfile`)
- Copies `.env.local` from main

For debugging: `./scripts/wt-new.sh --dry-run feature/test`

### 2. Development

```sh
cd ../feature__my-feature
bun run dev
# ... make changes ...
git add -A && git commit -m "feat: ..."
git push -u origin HEAD
```

### 3. Prepare for PR

Before creating Pull Request:
1. Review change history:
   ```sh
   git log main..HEAD --oneline | cat
   ```
   Use it to write quality PR description.
2. If changes are significant for release — propose **Version Bump** (update version in `package.json`).

### 4. Create PR

```sh
gh pr create --base main --fill
```

### 5. Merge PR

```sh
gh pr merge --merge --delete-branch
```

### 6. Remove worktree

```sh
cd ../main
./scripts/wt-done.sh feature__my-feature
```

Script checks `.env.local` for changes before deletion.

For debugging: `./scripts/wt-done.sh --dry-run feature__my-feature`

---

## Important

- **Dependencies** installed in each worktree separately (own `node_modules`)
- **`.env.local`** needed in each worktree (Next.js reads from project root)
- When removing worktree, changes in `.env.local` will be lost — script will warn
- After removing worktree, **`wt-done.sh` automatically runs `bun install`** — important because merged feature branch may have added new dependencies

---

## Links

- [scripts/wt-new.sh](../../scripts/wt-new.sh) — create worktree
- [scripts/wt-done.sh](../../scripts/wt-done.sh) — remove worktree
- [scripts/README.md](../../scripts/README.md) — all project scripts