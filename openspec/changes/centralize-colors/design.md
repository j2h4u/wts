# Design: Centralized Theme System

## Current State
The codebase imports `picocolors` as `pc` and calls functions like `pc.cyan()`, `pc.red()`, `pc.bold()` inline. Symbols like `✓` and `==>` are also hardcoded.

```typescript
logger.info(`Target: ${pc.cyan(relPath)}`);
console.log(`${pc.green("✓")} ${message}`);
```

## Proposed Architecture

### 1. The `Theme` Object
We will define a configuration object closer to the top of `src/wts.ts`.
It will separate **Symbols** from **Styles**.

```typescript
const theme = {
    // 1. Semantic Styles (Formatters)
    style: {
        error: (s: string) => pc.red(s),
        warn: (s: string) => pc.yellow(s),
        success: (s: string) => pc.green(s), // Matches docker tick color
        info: (s: string) => pc.blue(s),
        debug: (s: string) => pc.dim(s),
        
        accent: (s: string) => pc.cyan(s),      // Directories, branches
        command: (s: string) => pc.italic(s),       // Shell commands
        header: (s: string) => pc.bold(s),          // UI Headers
    },

    // 2. Symbols (Iconography)
    icon: {
        // We configure the symbol AND its default style here if needed?
        // Or just the raw char. 
        // Better: Pre-styled symbols for simple usage.
        success: pc.green("✓"),  // or pc.blue("✔") for Docker style
        error: pc.red("ERROR:"),
        warn: pc.yellow("WARNING:"),
        info: pc.blue("==>"),
        bullet: pc.dim("-"),
    }
}
```

### 2. Discussion on Symbols
You asked if symbols should be in the theme.
**Recommendation: YES.**
Why:
1.  **Consistency**: You use `==>` in some places, `[DEBUG]` in others, `✓` in others. Getting them all in one place ensures visual harmony.
2.  **Compatibility**: Some terminals (e.g., pure ASCII envs, Windows legacy) might choke on emoji/unicode like `✔` or `✨`. Having them centralized allows us to easily swap them for `[OK]` or `*` if we ever detect a "dumb" terminal (though `wts` targets modern envs).
3.  **Refactoring**: Changing the "Docker style" blue tick `✔` back to a standard green check `✓` becomes a one-line change.

### 3. Implementation Details

- **Type Safety**: TypeScript interface for the Theme object.
- **Composition**: Styles are functions `(s) => s`. Symbols are strings (pre-colored or raw).

### 4. Migration Strategy
1.  Define the `theme` object.
2.  Update the `logger` methods to use `theme.icon.*` + `theme.style.*`.
3.  Update spinners to use `theme.icon.success`.
4.  Refactor inline usage.

## Alternatives Considered
- **Strictly Separating Data (Symbol) from View (Color)**: e.g. `icon: "✓"`. This requires the call-site to always wrap it: `pc.green(theme.icon.success)`. This is verbose.
- **Pre-colored Symbols**: e.g. `icon: pc.green("✓")`. This is pragmatic for a CLI where the icon's color is usually part of its semantic meaning (a red checkmark is confusing). **Decision: Use pre-colored symbols.**
