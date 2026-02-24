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

### Gemini 3 Series
*   **Gemini 3.1 Pro** (`gemini-3.1-pro-preview` / `gemini-3-pro`): Advanced intelligence, complex problem-solving skills, and powerful agentic capabilities.
*   **Gemini 3 Flash** (`gemini-3-flash-preview` / `gemini-3-flash`): Frontier-class performance rivaling larger models at a fraction of the cost.
*   **Nano Banana Pro** (`gemini-3-pro-image-preview`): State-of-the-art image generation and editing models for highly contextual native image creation.

### Gemini 2.5 Series
*   **Gemini 2.5 Pro** (`gemini-2.5-pro`): Most advanced stable model for complex tasks, featuring deep reasoning and coding capabilities.
*   **Gemini 2.5 Flash** (`gemini-2.5-flash`): Best price-performance model for low-latency, high-volume tasks that require reasoning.
*   **Gemini 2.5 Flash-Lite** (`gemini-2.5-flash-lite`): Ultra-fast and cost-effective model for simpler tasks.
*   **Nano Banana** (`gemini-2.5-flash-image`): State-of-the-art native image generation and editing.

### Specialized Task Models
*   **Embeddings**: `gemini-embedding-001` (High-dimensional vector representations for advanced semantic search).

## Model Selection Standards mapping

| Use Case | Recommended Model | Reason |
| :--- | :--- | :--- |
| **Transcription** | `gemini-2.5-flash` OR `gemini-3-flash` | Optimized for speed, cost, and extreme context windows. |
| **Chat & Reasoning** | `gemini-2.5-pro` OR `gemini-3-pro` | Best-in-class reasoning for complex instruction following and agentic workflows. |
| **Summarization** | `gemini-2.5-flash` | Balanced performance for processing large transcripts. |
| **Support Bot** | `gemini-2.5-flash` | Low latency for real-time user interaction. |
| **Embeddings** | `gemini-embedding-001` | **MANDATORY**. `text-embedding-004` is fully deprecated. |
| **Image Generation** | `gemini-2.5-flash-image` | Nano Banana is the standard for fast, creative native workflows. |

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
