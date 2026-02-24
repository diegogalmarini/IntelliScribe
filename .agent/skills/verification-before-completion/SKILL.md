---
name: verification-before-completion
description: Use as the final check before considering any task complete. Enforces a rigorous verification process.
---

# Verification Before Completion

## Overview
Never trust "I think it's done." Verify.

## The Checklist

1. **Self-Review:** Read your own changes. Do they make sense? Are they clean?
2. **Test Coverage:** Are all new/modified branches of code covered by tests?
3. **Run Tests:** Every single test in the affected subsystem MUST pass.
4. **Environment Check:** Does it work in the target environment (e.g., production-like settings)?
5. **Documentation:** Is the walkthrough updated? Are the plans marked complete?

## Red Flags
- Committing with failing tests.
- "It should work" without proof.
- Missing edge case tests.
