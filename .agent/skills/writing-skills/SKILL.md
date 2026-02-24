---
name: writing-skills
description: Generates high-quality, predictable, and efficient skill directories based on user requirements. Use when the user asks to "create a skill", "build a new capability", or "add a new agent ability".
---

# Writing Skills

## Overview
Skills are the core units of capability in the Superpowers framework. A high-quality skill is concise, testable, and optimized for discovery.

## The Process

### 1. Identify Requirement
What new capability or standard are we trying to enforce?

### 2. TDD for Skills
**REQUIRED:** Follow [testing-skills-with-subagents.md](file:///c:/Users/diego/Diktalo/.agent/skills/writing-skills/testing-skills-with-subagents.md).
Watch an agent fail without the skill before writing it.

### 3. Apply Persuasion Principles
**REQUIRED:** Use [persuasion-principles.md](file:///c:/Users/diego/Diktalo/.agent/skills/writing-skills/persuasion-principles.md) to ensure the skill is followed.
Use Authority and Commitment for discipline-enforcing skills.

### 4. Optimize for Discovery
Follow [anthropic-best-practices.md](file:///c:/Users/diego/Diktalo/.agent/skills/writing-skills/anthropic-best-practices.md):
- Start description with "Use when..."
- Keep it concise.
- Use gerund naming (e.g., `writing-skills`).

### 5. Document and Cross-Reference
- Use clear headers.
- Cross-reference other skills using `REQUIRED SUB-SKILL: Use superpowers:<skill-name>`.

## Directory Structure
- `SKILL.md`: Main instruction file.
- Supporting docs (e.g., `anti-patterns.md`, `templates.md`).
- `examples/`: Reference implementations.

## Integration
- **superpowers:test-driven-development** - Foundation for TDD for skills.
- **superpowers:verification-before-completion** - Final check for new skills.
