# Theme System Requirements

## ADDED Requirements

#### Scenario: Defining a centralized theme
  GIVEN I am a developer modifying `wts` source
  WHEN I look at the `CONFIG` or `theme` definition
  THEN I should see all color and style definitions in one place
  AND I should not see direct `picocolors` usage in the business logic

#### Scenario: Using semantic styles
  GIVEN I am adding a new command output
  WHEN I want to highlight a file path
  THEN I should use `theme.accent(path)` instead of `pc.cyan(path)`

#### Scenario: Changing the theme
  GIVEN I want to change the "error" color from red to magenta
  WHEN I edit the `theme.error` definition
  THEN all error messages across the application should reflect this change

#### Scenario: Styling commands in output
  GIVEN the CLI prints a suggested shell command
  THEN it should use the `theme.command` style (e.g., italics)
  AND it should not hardcode `pc.italic()`

#### Scenario: Using background colors
  GIVEN I define a style with a background color (e.g., `bgRed`)
  WHEN I use that style key
  THEN the output should render with the specified background
