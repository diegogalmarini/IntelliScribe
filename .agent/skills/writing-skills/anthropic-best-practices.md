# Anthropic Best Practices for Skills

## Core Principles

### 1. Concise is Key
Only add context Claude doesn't already have. Challenge every paragraph.

### 2. Set Appropriate Degrees of Freedom
- **High Freedom:** Multiple approaches valid (e.g., code review).
- **Low Freedom:** Fragile/exact sequences (e.g., database migrations).

### 3. Write in Third Person
Internalize: "Processes files" NOT "I process files".

### 4. Optimize the Description
Claude uses the `description` field for selection.
Format: `Use when [specific triggering conditions and symptoms]`.

## Naming Conventions
Use **gerund form** (verb + -ing).
Examples: `processing-pdfs`, `analyzing-spreadsheets`, `writing-skills`.

## progressive Disclosure
Keep `SKILL.md` under 500 lines. Move heavy reference content or scripts to separate files or the `resources/` directory.
