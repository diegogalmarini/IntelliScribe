---
name: test-driven-development
description: Implements the RED-GREEN-REFACTOR cycle for writing code. Use when starting feature implementation, writing new code, or refactoring existing code.
---

# Test-Driven Development (TDD)

## Overview
Test-Driven Development (TDD) is a software development process where you write tests before writing the actual code. This ensures your code is testable, meets requirements, and has a minimal, clean implementation.

## The TDD Cycle: RED-GREEN-REFACTOR

### 1. RED: Write a failing test
Write a small, focused test for the next bit of functionality you want to implement.
**Watch it fail.** This is critical - it proves the test is actually testing something and isn't passing by accident.

### 2. GREEN: Make it pass
Write the **minimal** amount of code necessary to make the test pass.
Don't worry about code quality yet. Just get to green.

### 3. REFACTOR: Clean it up
Now that you're at green, refactor the code you just wrote.
Improve names, remove duplication, and ensure it follows project patterns.
Your tests must stay green throughout this phase.

## Testing Anti-Patterns
**REQUIRED BACKGROUND:** You MUST understand [testing-anti-patterns.md](file:///c:/Users/diego/Diktalo/.agent/skills/test-driven-development/testing-anti-patterns.md) before starting TDD.

## Core Principles
- **No production code without a failing test** (except for boilerplate or simple configuration).
- **Test behavior, not implementation.**
- **If it's hard to test, your design is probably wrong.**
- **Watch every test fail at least once.**

## Quick Reference
| Phase | Action | Goal |
|-------|--------|------|
| **RED** | Write test | Define expected behavior |
| **GREEN** | Minimal code | Satisfy the test |
| **REFACTOR**| Clean code | Maintainability |

## Common Mistakes
- **Writing too much code at once:** Makes it hard to know which change fixed the test.
- **Skipping the RED phase:** You don't know if your test is actually valid.
- **Not refactoring:** Technical debt accumulates quickly.
- **Testing mocks:** Only tests the mock, not the real behavior.
