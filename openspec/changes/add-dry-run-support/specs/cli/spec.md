# CLI Capability

## MODIFIED Requirements

### Requirement: Global Options

The CLI SHALL support global options that affect all commands.

#### Scenario: Dry Run

- **WHEN** user passes `--dry-run` or `-n`
- **THEN** no side-effects (file system changes, git commands) occur
- **AND** intended actions are logged to stdout with `[DRY-RUN]` prefix
