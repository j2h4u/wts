# Dev workflow: wts + Bun + gh

> **CONTEXT:** This document describes development workflow using the `wts` tool.
> Use this as the primary reference for managing feature branches and worktrees.

## Layout

We use the **Worktree Siblings** structure managed by `wts`.
Instead of a single folder with branch switching, we have a "home" folder containing sibling directories for each active branch:

```
repo-name.worktree/      ← Worktree Home
├── main/                ← Primary worktree (regular clone, has .git/)
├── feature__ui-fix/     ← Sibling worktree (feature/ui-fix)
└── feature__api-v2/     ← Sibling worktree (feature/api-v2)
```

**Key concept:** work logic is isolated. Each folder has its own `node_modules`, `.env.local`, and build artifacts.

---

## Setup (First time)

To set up the repository from scratch:

```sh
# Install wts globally (if not already installed)
# (Assuming wts is available in path, or use bun link if developing wts)

# Clone using wts
wts clone git@github.com:j2h4u/wts.git
```

This creates `wts.worktree/` containing the `main` directory.

---

## Main workflow

### 1. Create new branch

Start a new task by creating a feature worktree:

```sh
# Usage: wts new <branch-name>
wts new feature/my-cool-feature
```

**Automated steps performed by `wts`:**
- Updates `main` branch (`git pull`)
- Checks for branch existence (local/remote)
- Creates sibling directory (e.g., `feature__my-cool-feature`)
- Copies `.env.local` from `main` (if it exists)
- Installs dependencies (`bun install`)

### 2. Development

Switch to the new directory and work:

```sh
# Note: slashes in branch names are replaced by double underscores
cd ../feature__my-cool-feature

# Run dev server or tests
bun test
```

Work normally:
```sh
git add .
git commit -m "feat: implement cool feature"
git push -u origin HEAD
```

### 3. Prepare for PR

Before creating a Pull Request, review your changes:

```sh
git log main..HEAD --oneline | cat
```

### 4. Create PR

Use GitHub CLI to create the PR:

```sh
gh pr create --base main --fill
```

### 5. Merge PR

Merge via GitHub CLI (or UI):

```sh
gh pr merge --merge --delete-branch
```

### 6. Cleanup

Once the task is done and merged, remove the worktree:

```sh
# Go back to main or any other sibling
cd ../main

# Remove the worktree
# Usage: wts done <directory-name-or-branch>
wts done feature__my-cool-feature
```

**Automated steps performed by `wts`:**
- Checks for uncommitted changes (safety)
- Removes the worktree directory
- Deletes the local branch
- Updates `main` (`git pull`)
- Re-syncs dependencies in `main`

---

## Important Notes for Agents

- **Always use `wts`** for creating and removing branches. Do not manually use `git worktree`.
- **Directory Naming:** `wts` normalizes branch names: `feature/xyz` → `feature__xyz`.
- **Isolation:** Remember that `node_modules` are separate. If you add a dependency in a feature branch, it won't be in `main` until you merge and run `wts done` (or `bun install` manually).
- **Environment:** `.env.local` is copied only at creation time. If you change env vars, you may need to update them manually in other worktrees.
