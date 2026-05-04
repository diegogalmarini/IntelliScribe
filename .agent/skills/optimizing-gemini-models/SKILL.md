---
name: optimizing-gemini-models
description: The authoritative expert guide for selecting Gemini models in Diktalo. Enforces Gemini 2.5 and Gemini 3 standards and deprecates older versions.
---

# Optimizing Gemini Models (The Bible)

> [!IMPORTANT]
> **CURRENT STANDARDS: GEMINI 3 and GEMINI 2.5**
> **LEGACY (DO NOT USE):** Gemini 1.0, 1.5, 2.0 (Flash/Pro/Lite)

This skill serves as the single source of truth for AI model selection in the SaaS. All AI features MUST adhere to the standards defined here, pulling directly from the official Google documentation.

## Current Supported Models

Google AI offers two main active generations for production and previews:

### Gemini 3.1 Series (Frontier)
*   **Gemini 3.1 Pro** (`gemini-3.1-pro-preview`): Advanced intelligence, deep reasoning, and complex agentic workflows.
*   **Gemini 3.1 Flash** (`gemini-3.1-flash-preview`): Frontier-class performance with high efficiency.
*   **Gemini 3.1 Flash-Lite** (`gemini-3.1-flash-lite-preview`): Ultra-fast, cost-effective model for high-frequency, lower-complexity tasks.

### Specialized Task Models
*   **Embeddings**: `gemini-embedding-001` (Mandatory).
*   **Images**: `gemini-3.1-flash-image-preview` (Nano Banana Pro).

## Model Selection Standards mapping

| Use Case | Recommended Model | Reason |
| :--- | :--- | :--- |
| **Transcription** | `gemini-3.1-flash-preview` | Optimized for extreme context and speed. |
| **Chat & Reasoning** | `gemini-3.1-pro-preview` | Best reasoning and instruction following. |
| **Summarization** | `gemini-3.1-flash-lite-preview` | Fast processing of large transcripts at minimal cost. |
| **Support Bot** | `gemini-3.1-flash-lite-preview` | Ultra-low latency for real-time chat. |
| **Embeddings** | `gemini-embedding-001` | **MANDATORY**. |
| **Image Generation** | `gemini-3.1-flash-image-preview` | Nano Banana Pro for state-of-the-art vision. |

## Deprecation Policy & Known Deprecations

As an expert, be aware that models enter deprecation schedules frequently. 
**DO NOT USE**:
*   Any `gemini-1.0-*` or `gemini-1.5-*` models.
*   Any `gemini-2.0-*` models (e.g. `gemini-2.0-flash`, `gemini-2.0-flash-lite`).
*   `text-embedding-004` (Replace immediately with `gemini-embedding-001`).

When a new model generation stabilizes:
1.  **Update this SKILL first**. Keep checking `https://ai.google.dev/gemini-api/docs/models` and `https://ai.google.dev/gemini-api/docs/deprecations`.
2.  **Audit `api/ai.ts`** and replace all instances of the old version.
3.  **Delete** any fallback logic that relies on dead models.

## Implementation Checklist

When implementing or updating AI features:
-   [ ] **Check this SKILL**: Confirm you are using the `Recommended Model`.
-   [ ] **Verify `latest` Alias**: If available, using the `-latest` suffix (like `gemini-2.5-flash-latest`) is preferred over static dating unless stability is an issue.
-   [ ] **Test for 404/500**: Immediately test the new model endpoint. If it fails, check `https://ai.google.dev/gemini-api/docs/models` and update this document.

## Error Handling Reference

-   **404 Not Found**: You are using a Legacy/Deprecated model (e.g., 1.5-pro, 2.0-flash, text-embedding-004). **UPGRADE IMMEDIATELY**.
-   **500 Internal Error**: Often caused by using a `Preview` model in production without proper error handling. Test cautiously.
