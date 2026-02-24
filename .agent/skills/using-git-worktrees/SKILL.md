---
name: using-git-worktrees
description: Use when starting a new task, feature, or bugfix that requires a clean, isolated development environment.
---

# Using Git Worktrees

## Overview
Git worktrees allow you to have multiple branches checked out at the same time in separate directories. This is essential for maintaining a clean, isolated development environment and preventing context contamination.

## Directory Selection Process

### 1. Check Existing Directories
Look for existing worktree directories in the project root:
- `.worktrees/`
- `worktrees/`

### 2. Check CLAUDE.md
Check for explicit instructions on where to store worktrees.

### 3. Ask User
If no clear location exists, ask the user: "Where should I store git worktrees for this project? (Common locations: `.worktrees/`, `worktrees/`, or `../<project-name>-worktrees/`)"

## Safety Verification

### For Project-Local Directories (`.worktrees/` or `worktrees/`)
**REQUIRED:** Verify the directory is ignored by git.
```bash
git check-ignore <directory-path>
```
If NOT ignored, add it to `.git/info/exclude` or `.gitignore` before proceeding.

### For Global Directory (`~/.config/superpowers/worktrees`)
Ensure the directory exists and is writable.

## Creation Steps

### 1. Detect Project Name
Use the current directory name or project configuration.

### 2. Create Worktree
```bash
git worktree add -b <branch-name> <path-to-worktree> main
```

### 3. Run Project Setup
Navigate to the new worktree and run necessary setup commands (e.g., `npm install`).

### 4. Verify Clean Baseline
Run tests to ensure a clean starting point.
```bash
npm test
```

### 5. Report Location
Announce the new worktree location to the user.

## Quick Reference
| Command | Purpose |
|---------|---------|
| `git worktree list` | List all active worktrees |
| `git worktree add <path> <branch>` | Create a new worktree |
| `git worktree remove <path>` | Remove a worktree |
| `git worktree prune` | Clean up stale worktree information |

## Common Mistakes
- **Skipping ignore verification:** Risk committing worktree files.
- **Assuming directory location:** Always check or ask.
- **Proceeding with failing tests:** Starting from a broken baseline leads to confusion.
- **Hardcoding setup commands:** Use project-appropriate commands.

## Red Flags
- Working directly on `main` or `master`.
- Mixing unrelated changes in the same branch.
- Not running tests after setup.

## Integration
This skill is typically the first step in any new development task, setting the stage for `writing-plans` and `executing-plans`.
