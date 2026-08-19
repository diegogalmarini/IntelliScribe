# Implementation Plan - Privacy Policy Page

## Goal
Implement the `Privacy.tsx` page under `pages/legal/` providing the full Privacy Policy text provided by the user, formatted professionally.

## Content
The content has been provided by the user in the prompt. It covers:
-   Information Collection
-   Usage (including AI processing)
-   Sharing (Sub-processors like Supabase, Gemini, AssemblyAI)
-   Security (Encryption, RLS)
-   Data Retention
-   User Rights (GDPR/CCPA)

## Steps
1.  **Check Directory**: Ensure `pages/legal` exists. If not, create it.
2.  **Create File**: Create `pages/legal/Privacy.tsx`.
3.  **Implementation**:
    -   Use a professional layout (e.g., specific legal layout or generic page layout with centered content).
    -   Use Tailwind typography for readability (`prose`, `prose-slate`).
    -   Add a "Last Updated" badge.
    -   Ensure responsiveness.
4.  **Routing**: Verify `App.tsx` has the route defined (checked types.ts previously, but need to check App.tsx router).
5.  **Footer Link**: Ensure the Footer component links to this page.

## Verification
-   Navigate to `/legal/privacy` (or whatever the route is defined as).
-   Verify text rendering and formatting.
-   Check links (e.g., email links).
