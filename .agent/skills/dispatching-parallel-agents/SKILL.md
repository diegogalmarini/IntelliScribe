---
name: dispatching-parallel-agents
description: Use when you have multiple independent problems or tasks that can be handled simultaneously.
---

# Dispatching Parallel Agents

## Overview
When you have multiple unrelated failures or tasks, investigating them sequentially is inefficient. Each domain is independent and can happen in parallel.

**Core principle:** Dispatch one agent per independent problem domain.

## The Process

### 1. Identify Independent Domains
Group tasks by what's broken. Ensure fixing one won't affect the others.

### 2. Prepare Focused Prompts
For each agent:
- Define one clear problem domain.
- Provide all necessary context.
- Specify exact expected output.

### 3. Dispatch in Parallel
Launch multiple tasks concurrently.

### 4. Review and Integrate
Collect results from all agents and integrate them into the project.

## When to Use
- Failures in different subsystems (e.g., UI vs. API).
- Large-scale refactors across unrelated files.
- Independent research tasks.
