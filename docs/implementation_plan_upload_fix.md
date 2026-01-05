# Implementation Plan - Single File Upload Fix

## Problem
The `IntelligenceDashboard.tsx` currently has a placeholder comment `// TODO: Implement proper file upload to backend` in the `handleFileUpload` function. This prevents users from uploading single audio files directly from the dashboard.

## Solution
Implement the single file upload logic using the existing `uploadAudio` service and `databaseService.createRecording`. This should mirror the logic used in `MultiAudioUploader` but for a single file, ensuring:
1.  Upload to Supabase Storage.
2.  Creation of a DB entry in `recordings` table.
3.  Generation of a transcription task (optional but recommended for consistency).
4.  UI update to show the new recording.

## Proposed Changes

### `pages/intelligence/IntelligenceDashboard.tsx`

#### [MODIFY] `handleFileUpload` function

-   **Current**:
    ```typescript
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // TODO: Implement proper file upload to backend
            console.log('File selected:', file.name);
            // For now, navigate to recording page
            onNavigate(AppRoute.RECORDING);
        }
    };
    ```

-   **New Implementation Steps**:
    1.  Set loading state (need to add `isUploading` state locally or reuse existing).
    2.  Call `uploadAudio(file, user.id)` to upload to storage.
    3.  Create recording object with metadata (duration, title, etc).
        -   *Note*: To get duration correctly, we might need a helper or just let the backend/transcription handle it, but for immediate DB entry, we might default to 0 and update later, or read metadata client-side. The `MultiAudioUploader` does client-side duration check. I will use a simple client-side duration check if possible, or 0.
    4.  Call `databaseService.createRecording(recording)`.
    5.  Update local state/list.
    6.  Trigger transcription (using `transcribeAudio` similar to `handleProcessMultiAudio` or let the user do it manually from details view). *Decision: For better UX, trigger transcription automatically.*

## Verification Plan

### Manual Verification
1.  Go to Intelligence Dashboard.
2.  Click "Upload Audio" (single file button).
3.  Select an MP3/WAV file.
4.  **Verify**:
    -   Loading indicator appears? (If UI implemented).
    -   File uploads to Supabase (check Storage bucket).
    -   Recording appears in the list.
    -   Transcription starts (if implemented).
