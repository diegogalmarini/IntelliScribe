# Root Cause Tracing

## Overview
Trace the chain of causality from the symptom back to the original trigger.

## The Tracing Process

### 1. Observe the Symptom
Identify exactly what is wrong (error message, incorrect value, etc.).

### 2. Find Immediate Cause
What code directly produces the symptom?

### 3. Ask: What Called This?
Trace up the call stack. What function called the immediate cause? What values were passed?

### 4. Keep Tracing Up
Continue up the stack until you find where the data was first initialized or corrupted.

### 5. Find Original Trigger
The root cause is the first point where the state diverged from expected behavior.

## Adding Stack Traces
If you can't trace manually, add instrumentation:

```typescript
// Before the problematic operation
async function problematicFunction(param: any) {
  const stack = new Error().stack;
  console.error('DEBUG TRACE:', {
    param,
    cwd: process.cwd(),
    stack,
  });
  // ... proceed
}
```

## Key Principle
**NEVER fix just where the error appears.** Trace back to find the original trigger.
