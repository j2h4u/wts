FROM oven/bun:latest

# Install git and openssh-client (required for cloning)
RUN apt-get update && apt-get install -y git openssh-client && rm -rf /var/lib/apt/lists/*

# Configure git to use ssh by default and verify github host
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

# Set working directory
WORKDIR /app

# Copy built binary (or source, if running via bun)
# We will mount the source code instead of copying to allow testing current changes

ENTRYPOINT ["bun", "test/e2e.ts"]
