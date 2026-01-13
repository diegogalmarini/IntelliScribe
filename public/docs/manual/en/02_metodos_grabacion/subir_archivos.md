
# File Ingestion & Multi-Audio

The **Upload** functionality acts as a universal entry port for your historical data. Diktalo can process recordings made with other devices (handheld recorders, mobiles, legacy VoIP systems) and inject modern intelligence into them.

![Dashboard with upload options](/docs/screenshots/es/upload/01_initial.png)

---

## Ingestion Capabilities

### Supported Formats (Universal Codec Support)
Our transcoding engine accepts most industry standards. You don't need to convert your files before uploading.

*   **Compressed Audio:** MP3, M4A, OGG (Ideal for fast uploads).
*   **High Fidelity:** WAV, FLAC (Ideal for maximum transcription accuracy).
*   **Web:** WEBM (Common in browser recordings).

**Technical Limits:**
*   Up to **2 GB** per individual file.
*   Unlimited duration (subject to your plan minutes).

---

## Multi-Audio Engine (Conversation Stitching)

The true power of Diktalo lies in its ability to understand that **a conversation can be fragmented into multiple files**.

The **Multi-Audio** mode doesn't just upload files in batch; it **merges them chronologically and semantically** to treat them as a single knowledge entity.

![Multi-Audio Interface](/docs/screenshots/es/upload/02_multiaudio.png)

### Advanced Use Cases

#### A. Interview Reconstruction
If you recorded a long interview and the recorder generated automatic cuts every 30 minutes (`REC_001.mp3`, `REC_002.mp3`...), upload them together.
*   **Result:** Diktalo will deliver a single continuous 2-hour transcript, without abrupt cuts in the text.

#### B. Separate Audio Tracks (Podcasting)
For professional recordings where each speaker has their own microphone and file (`track_juan.wav`, `track_ana.wav`).
*   **Result:** The system mixes the sources and uses the channels for perfect speaker identification (diarization).

#### C. Fragmented Sessions
A negotiation that was interrupted by lunch and continued in the afternoon.
*   **Result:** Ask the AI *"What changed in the client's stance between the morning and afternoon sessions?"* and get a unified answer.

---

## Operation Guide

### 1. File Upload
Drag your digital assets to the upload area ("Drop Zone"). The progress bar will indicate the speed of encryption and upload to our secure cloud.

### 2. Logical Ordering (Multi-Audio Only)
Before processing, you will see a preliminary list. It is **critical** that the order is correct for the transcript to make chronological sense.
*   The system attempts to sort by *Timestamp* or *Name*.
*   Drag rows manually if you need to correct the sequence.

### 3. Asynchronous Processing
Once the upload is confirmed, you can close the tab. Our servers will work in the background. You will receive a notification (if enabled) or see the "Ready" status in your Dashboard when the AI has finished.

> **Pro Tip:** If you have old files with generic names (`Audio 1`, `Audio 2`), rename them to something descriptive **before** uploading (`Q1_Planning_2024.mp3`). That name will become the title of your session in Diktalo, facilitating future search.
