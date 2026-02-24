# Testing Anti-Patterns

## Overview
Tests must verify real behavior, not mock behavior. Mocks are a means to isolate, not the thing being tested.

**Core principle:** Test what the code does, not what the mocks do.

**Following strict TDD prevents these anti-patterns.**

## The Iron Laws
```
1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding dependencies
```

## Anti-Pattern 1: Testing Mock Behavior
**The violation:**
```typescript
// ❌ BAD: Testing that the mock exists
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**Why this is wrong:**
- You're verifying the mock works, not that the component works
- Test passes when mock is present, fails when it's not
- Tells you nothing about real behavior

**The fix:**
```typescript
// ✅ GOOD: Test real component or don't mock it
test('renders sidebar', () => {
  render(<Page />);  // Don't mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

## Anti-Pattern 2: Test-Only Methods in Production
**The violation:**
```typescript
class Project {
  // ❌ BAD: Only used in tests
  setInternalStateForTesting(state: any) {
    this.state = state;
  }
}
```

**The fix:**
- Use public APIs to set up state.
- If impossible, your class has too much hidden state - refactor.

## Anti-Pattern 3: Mocking Without Understanding
**The violation:**
- Mocking a library or internal service without knowing how it actually responds.

**The fix:**
- Read the docs or source of the dependency first.
- Use integration tests for complex dependencies.

## Anti-Pattern 4: Incomplete Mocks
**The violation:**
- Mocks that only implement the methods you need, but in a way that doesn't reflect the real API's side effects or return types.

## Anti-Pattern 5: Integration Tests as Afterthought
**The violation:**
```
✅ Implementation complete
❌ No tests written
"Ready for testing"
```

**The fix:**
```
TDD cycle:
1. Write failing test
2. Implement to pass
3. Refactor
4. THEN claim complete
```

## Red Flags
- Assertion checks for `*-mock` test IDs
- Methods only called in test files
- Mock setup is >50% of test
- Test fails when you remove mock
- Can't explain why mock is needed
