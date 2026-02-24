---
name: systematic-debugging
description: Use when you encounter a bug, test failure, or unexpected behavior. Enforces a deep, root-cause tracing process.
---

# Systematic Debugging

## Overview
Don't guess. Don't fix symptoms. Trace back to the root cause and add defense-in-depth.

**Core principle:** Trace the data flow up the call stack until you find the original trigger.

## The Process

### 1. Reproduce the Issue
Create a minimal test case that reproduces the failure. **WATCH IT FAIL.**

### 2. Observe and Trace
Use [root-cause-tracing.md](file:///c:/Users/diego/Diktalo/.agent/skills/systematic-debugging/root-cause-tracing.md) to find where the bad value originates.

### 3. Add Instrumentation
If the cause isn't obvious, add temporary logging or stack trace captures.
**Tip:** Use `console.error()` in tests.

### 4. Fix at Source
Fix the original trigger, not where the error manifests.

### 5. Defense-in-Depth
**REQUIRED:** Apply [defense-in-depth.md](file:///c:/Users/diego/Diktalo/.agent/skills/systematic-debugging/defense-in-depth.md) to make the bug structurally impossible in the future.

### 6. Clean Up
Remove temporary logging and ensure tests pass.

## Integration
- **superpowers:test-driven-development** - The debugging process often starts with a failing test.
- **superpowers:condition-based-waiting.md** - Use for fixing flaky async tests.
