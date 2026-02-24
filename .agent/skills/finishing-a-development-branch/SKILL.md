---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup.
---

# Finishing a Development Branch

## Overview
Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 1: Verify Tests
**Before presenting options, verify tests pass:**
```bash
# Run project's test suite
npm test
```
If tests fail, fix them before proceeding.

### Step 2: Determine Base Branch
Common base branches: `main` or `master`.

### Step 3: Present Options
Present exactly these 4 options:
1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

### Step 4: Execute Choice
Follow standard git procedures for the chosen option.

### Step 5: Cleanup Worktree
Remove the worktree if it was used and the work is integrated or discarded.

## Integration
- **using-git-worktrees** - Cleans up worktree created by that skill
- **executing-plans** - Called after all batches complete
