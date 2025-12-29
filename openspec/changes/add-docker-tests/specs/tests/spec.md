# Testing Capability

## ADDED Requirements

### Requirement: E2E Testing in Docker

The system SHALL provide a Docker-based environment for end-to-end testing of CLI commands.

#### Scenario: Full lifecycle test

- **WHEN** user runs the Docker test suite
- **THEN** a clean container is started
- **AND** `wts` is installed globally
- **AND** a real repository is cloned
- **AND** worktrees are created and removed
- **AND** the test passes only if all operations succeed without error
