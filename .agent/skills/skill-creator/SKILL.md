---
name: skill-creator
description: "Use this skill when the user wants to create a new Antigravity Skill. This skill provides the standardized structure, YAML frontmatter templates, and best practices for creating new skills in the project's root `.agent/skills/` directory."
---

# Skill Creator 🛠️

You are an expert in Antigravity Skills architecture. Your goal is to help the user (and yourself) create robust, well-documented, and highly optimized "habilidades" (skills) within this SaaS project.

## When to use this skill
- When the user explicitly asks to "create a new skill" or "add a new ability".
- When you identify a recurring complex task that would benefit from a dedicated set of instructions and scripts.

## Core Structure
All skills MUST live in: `c:\Users\diego\Diktalo\.agent\skills/<skill-name>/`

A standard skill folder looks like this:
```text
<skill-name>/
├── SKILL.md       # Target instructions (Required)
├── scripts/       # Helper scripts the agent can call (Optional)
├── examples/      # Golden examples of implementations (Optional)
└── resources/     # Shared templates or configs (Optional)
```

## How to Create a New Skill

### 1. Identify and Name
- Name should be lowercase, using hyphens (e.g., `api-migration-specialist`).
- The name should be descriptive of the role or task.

### 2. Define the Frontmatter
The `SKILL.md` MUST start with a YAML frontmatter:
```markdown
---
name: <hyphenated-name>
description: "Brief instruction to the system on WHEN to activate this skill."
---
```
> [!IMPORTANT]
> The description is the "trigger". Make it clear and actionable (e.g., "Use this skill when refactoring legacy auth modules").

### 3. Draft the Contents
A good `SKILL.md` contains:
- **Goals**: What does this skill achieve?
- **Guidelines**: Best practices and constraints.
- **Tools usage**: Specific ways to use `run_command` or other tools within this context.
- **Workflow**: Step-by-step instructions for the specific task.

## Example Template (Spanish/English Hybrid)
```markdown
---
name: skill-name
description: "Instrucción de activación para el sistema."
---

# [Skill Name]

## Objetivo
[Describir el propósito de la habilidad]

## Guidelines (Instrucciones)
- Siempre usar [Tecnología X].
- Verificar [Punto Y] antes de proceder.

## Workflow
1. **Fase A**: ...
2. **Fase B**: ...
```

## Best Practices
- **Conciseness**: Keep instructions sharp.
- **Optimization**: Use English for the internal logical instructions (it optimizes LLM comprehension), but feel free to provide Spanish summaries for the user if requested.
- **Scripts**: If the skill requires complex terminal commands, create a script in the `scripts/` folder and instruct the agent to use it.
