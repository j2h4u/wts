# End-to-End Testing

To ensure reliability across different environments, `wts` uses a containerized E2E testing strategy.

## Architecture

Tests run inside a **Docker container** to provide:
1.  **Clean State**: Each run starts with a fresh file system.
2.  **Isolation**: No interaction with your local Git configuration or current worktrees.
3.  **Reproducibility**: Consistent environment (Bun, Git, OpenSSH) regardless of host OS.

## Components

### 1. Docker Environment (`test/Dockerfile`)
A lightweight image based on `oven/bun` that includes:
- **Bun**: Runtime for the test script and CLI.
- **Git**: Core dependency for `wts`.
- **OpenSSH Client**: For cloning repositories (supports SSH agent forwarding).

### 2. Test Runner (`test/run.sh`)
Helper script that:
- Builds the Docker image (`wts-test`).
- Mounts the SSH agent socket (if available) to allow cloning private repos.
- Mounts the local `wts` source code into the container.
- Executes the test suite.

### 3. Test Suite (`test/e2e.ts`)
A Bun script that acts as a user. It:
1.  Creates a temporary workspace (`/tmp/wts-e2e`).
2.  Executes real `wts` commands (`clone`, `new`, `list`, `done`).
3.  Verifies the file system state (folders created, `.git` files valid) after each step.

## Running Tests

Simply run:

```bash
bun test:e2e
```

**Note**: For private repositories, ensure your local SSH agent is running (`eval $(ssh-agent)` usually handles this) so the container can authenticate via SSH forwarding.
