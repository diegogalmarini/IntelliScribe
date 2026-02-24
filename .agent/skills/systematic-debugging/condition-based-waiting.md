# Condition-Based Waiting

## Overview
Wait for the actual condition you care about, not a guess about how long it takes. Avoid arbitrary `setTimeout` or `sleep` in tests.

## Basic Pattern
```typescript
// ❌ BAD: Guessing
await sleep(50);
expect(result).toBeDefined();

// ✅ GOOD: Waiting for condition
await waitFor(() => result !== undefined);
expect(result).toBeDefined();
```

## Implementation Tip
Always include a timeout to prevent infinite loops if the condition is never met.
