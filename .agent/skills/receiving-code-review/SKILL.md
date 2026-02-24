---
name: receiving-code-review
description: Use when you have requested a code review and need to process the feedback.
---

# Receiving Code Review

## Overview
Process feedback professionally, address issues, and move toward approval.

## The Process

### 1. Review Feedback
Read the entire review carefully. Group issues by severity (Critical, Important, Minor).

### 2. Address Issues
- **Critical:** Must fix immediately. Use `systematic-debugging` if bugs were found.
- **Important:** Address before merging.
- **Minor:** Address now or create tasks for later.

### 3. Respond and Re-Review
Explain your changes. If you disagree with feedback, explain why and suggest a compromise.
Request a re-review if significant changes were made.

### 4. Move to Completion
Once all critical/important issues are addressed and the reviewer approves, invoke `finishing-a-development-branch`.

## Integration
- **systematic-debugging** - For fixing bugs found in review.
- **requesting-code-review** - The source of the feedback.
- **finishing-a-development-branch** - The next step after approval.
