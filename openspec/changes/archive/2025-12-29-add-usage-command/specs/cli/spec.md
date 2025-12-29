## ADDED Requirements

### Requirement: Agent-Optimized Usage Command
The CLI SHALL provide a `usage` command that outputs concise, scenario-based examples optimized for AI agents.

#### Scenario: Running wts usage
GIVEN I am an AI agent
WHEN I run `wts usage`
THEN I should see a list of common scenarios and corresponding commands
AND the output should be more concise than `wts --help`
