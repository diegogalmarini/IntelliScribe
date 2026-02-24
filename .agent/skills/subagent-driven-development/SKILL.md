---
name: subagent-driven-development
description: Use when you want to delegate specific tasks to fresh subagents to maintain focus and isolation.
---

# Subagent-Driven Development

## Overview
Break down complex tasks into independent sub-tasks and delegate them to fresh subagents. This maintains clean context and prevents the main agent from getting bogged down in implementation details.

## The Process

### 1. Identify Delegate-able Tasks
Tasks that are:
- Independent.
- Well-defined.
- Have clear success criteria.

### 2. Create Focused Branch (Optional but Recommended)
Use `using-git-worktrees` if the subagent needs an isolated workspace.

### 3. Dispatch Subagent
Provide the subagent with:
- Clear objective.
- Required context (files, docs).
- Coding standards (e.g., TDD).
- Verification requirements.

### 4. Review and Merge
Review the subagent's changes. Ensure they meet the quality standards. Merge back into the main branch.

## Integration
- **superpowers:using-git-worktrees** - For isolated subagent workspaces.
- **superpowers:writing-plans** - Often used to create the tasks for subagents.
