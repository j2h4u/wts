#!/usr/bin/env bash
set -e

# Build image
echo "Building Docker image..."
docker build -t wts-test -f test/Dockerfile .

# Run tests with SSH agent mounted
echo "Running tests..."

# Check if SSH_AUTH_SOCK is set
SSH_ARGS=""
if [[ -n "$SSH_AUTH_SOCK" ]]; then
    echo "Mounting SSH agent..."
    SSH_ARGS="-v $SSH_AUTH_SOCK:/ssh-agent -e SSH_AUTH_SOCK=/ssh-agent"
else
    echo "SSH agent not found. Running without SSH keys (HTTPS only)."
fi

docker run --rm \
    -v "$(pwd):/app" \
    $SSH_ARGS \
    wts-test
