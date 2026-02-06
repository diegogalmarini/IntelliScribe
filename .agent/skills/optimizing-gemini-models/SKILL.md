---
name: optimizing-gemini-models
description: The authoritative guide for selecting Gemini models in Diktalo. Enforces Gemini 2.5 as the standard and deprecates older versions.
---

# Optimizing Gemini Models (The Bible)

> [!IMPORTANT]
> **CURRENT STANDARD: GEMINI 2.5**
> **LEGACY (DO NOT USE):** Gemini 1.0, 1.5, 2.0 (Flash/Pro)

This skill serves as the single source of truth for AI model selection in the SaaS. All AI features MUST adhere to the standards defined here.

## Model Selection Standards

| Use Case | Recommended Model | Reason |
| :--- | :--- | :--- |
| **Transcription** | `gemini-2.5-flash` | Optimized for speed, cost, and extreme context windows. |
| **Chat & Reasoning** | `gemini-2.5-pro` | Best-in-class reasoning for complex instruction following and speaker ID. |
| **Summarization** | `gemini-2.5-flash` | Balanced performance for processing large transcripts. |
| **Support Bot** | `gemini-2.5-flash` | Low latency for real-time user interaction. |
| **Embeddings** | `gemini-embedding-001` | **MANDATORY**. `text-embedding-004` is DEPRECATED and returns 404. |

## Deprecation Policy

When a new model generation stabilizes (e.g., Gemini 3.0 becomes "Stable"), you must:
1.  **Update this SKILL first**.
2.  **Audit `api/ai.ts`** and replace all instances of the old version.
3.  **Delete** any fallback logic that relies on dead models (e.g., if `text-embedding-004` is fully turned off, remove it from fallbacks).

## Implementation Checklist

When implementing or updating AI features:
-   [ ] **Check this SKILL**: Confirm you are using the `Recommended Model`.
-   [ ] **Verify `latest` Alias**: If available, `gemini-2.5-flash-latest` is preferred over `-001` hardcoding unless stability is an issue.
-   [ ] **Test for 404/500**: Immediately test the new model endpoint. If it fails, check `https://ai.google.dev/gemini-api/docs/models` and update this document.

## Error Handling Reference

-   **404 Not Found**: You are using a Legacy model (e.g., 1.5-pro, text-embedding-004). **UPGRADE IMMEDIATELY**.
-   **500 Internal Error**: Often caused by using a `Preview` model in production without proper error handling. Stick to `Stable` versions.
