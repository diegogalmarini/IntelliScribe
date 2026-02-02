---
name: optimizing-gemini-models
description: Monitors and updates the codebase to use the most optimal Gemini model versions for SaaS performance. Use when mentions "check latest models", "update gemini version", or "optimize ai performance".
---

# Optimizing Gemini Models

Ensures the SaaS uses the most efficient, cost-effective, and powerful Gemini models based on the latest available versions and specific use cases.

## When to Use This Skill

- When a new Gemini model is announced or released.
- When existing AI features require optimization (latency, cost, accuracy).
- When resolving production errors related to AI model availability (500 errors).

## Prerequisites

- Read access to the official Gemini model documentation: `https://ai.google.dev/gemini-api/docs/models`.
- Write access to `api/ai.ts` and associated configuration files.

## Workflow

### Step 1: Research Latest Model Capabilities
Identify the available models and their specifically optimized use cases.
- **Reference URL**: [Gemini Models](https://ai.google.dev/gemini-api/docs/models)
- **Selection Criteria**:
    - `Flash` models: Best for high-volume, low-latency tasks like transcription and simple chat.
    - `Pro` models: Best for complex reasoning, multi-step analysis, and high-precision chat.
    - `Stable` tags: Always prefer model names with specific version suffixes (e.g., `-001`, `-002`) or the `-latest` alias if stability is confirmed.

### Step 2: Analyze SaaS Requirements
Map the models to specific `Diktalo` actions in `api/ai.ts`:
- `transcription`: Accuracy vs. Speed (usually `flash`).
- `summary`: Context window size vs. Output quality.
- `chat`: Reasoning capabilities vs. Cost.

### Step 3: Implement Configuration Update
Update the `GEMINI_CONFIG` object in `api/ai.ts`.
- Ensure `modelPriorities` are sorted correctly.
- Update `preferredModel` for each action.

### Step 4: Verification & Smoke Test
- **Build**: Run `npm run build` to ensure no syntax errors.
- **Test Request**: Trigger a small AI request (Summary or Chat) and monitor the terminal logs for the used model name.

## Validation

- The `api/ai.ts` file reflects the chosen model versions.
- The application successfully processes AI requests without 500 naming errors.
- Logs confirm the use of the intended model.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| 404 (Model not found) | Using a non-existent or deprecated model name. | Cross-check with official docs and use the latest stable name. |
| 429 (Rate Limit) | The chosen model has lower quota on the current tier. | Downgrade to a different model or implement retry logic. |
| 500 (Internal Error) | Temporary API instability or payload mismatch. | Check `runWithFallback` logic and ensure payload follows model specs. |

## Resources

- `examples/model-config-template.ts` - Reference for a robust configuration setup.
- `ADVANCED.md` - Deep dive into model comparison for SaaS workflows.
