
# Web Recorder: Your Capture Center

The **Web Recorder** is not just a button; it is a high-fidelity audio capture suite integrated directly into your browser. Designed to eliminate friction between having an idea and preserving it forever.

Access instantly from any device without installing additional software.

![Web Recorder - Initial State](/docs/screenshots/es/grabadora_web/01_initial.png)

---

## Specialized Capture Modes

Diktalo adapts its recording engine to the context of your conversation. Selecting the correct mode ensures maximum precision in transcription.

### 🎙️ In-Person Meeting (Microphone)
**The standard for direct human interactions.**
Uses echo cancellation algorithms to capture voices in a meeting room, a face-to-face interview, or your own voice notes.
*   **Ideal for:** Brainstorming, 1-on-1s, personal dictation.

### 🔊 Speaker (System)
**Capture what you hear.**
Channels your computer's internal audio directly to the AI engine. Perfect for digitizing content you are consuming.
*   **Ideal for:** Webinars, streaming conferences, YouTube videos.

### 📞 Multi-source (Hybrid)
**The bridge between physical and digital.**
Simultaneously records your microphone and system audio. It is the solution for VoIP calls (Skype, Slack Huddle) where you need to record both parties of the conversation without complex integrations.

### 🌐 Extension Bridge
A shortcut to our [Chrome Extension](./extension_chrome.md) for when you need native integration with Google Meet or Zoom.

---

## Professional Workflow

### 1. Input Configuration
Before recording, the system performs a **Latency and Gain Check**.
*   Select your input device (Supports USB microphones, Bluetooth, and integrated arrays).
*   Verify the **Waveform Visualization**: If the bars react to your voice, the system is ready.

![Active Recording](/docs/screenshots/es/grabadora_web/03_active.png)

### 2. Contextual Markers (Live Notes)
Don't wait until the end. During the recording, use the **"Quick Notes"** panel to mark key moments in real time.
*   *Example:* Write "Budget Agreement" at minute 14:20.
*   **Result:** The AI will link that note to the exact timestamp in the final transcript.

### 3. Session Control
*   **Smart Pause:** Stop recording without cutting the file. Ideal for breaks or off-the-record information.
*   **Safeguard:** If you accidentally close the tab, Diktalo will ensure to recover the temporary audio block on your next visit (depending on browser cache).

---

## Post-Capture Processing

Upon completion, your audio enters our neural processing pipeline:

1.  **Normalization:** We level the volume of voices.
2.  **Diarization:** We identify "who said what" (Speaker A, Speaker B).
3.  **Transcription:** We convert phonemes to text with contextual dictionaries.

> **Reference Times:** Processing is asynchronous. A 1-hour meeting is usually ready for analysis in less than 8 minutes.

---

## Best Practices

*   **Environment:** Although our AI filters noise, a controlled environment drastically improves the score.
*   **Microphone:** A basic headset always outperforms a laptop's integrated microphone due to proximity.
*   **Pauses:** Speak with natural cadence. It is not necessary to dictate punctuation marks; the AI infers commas and periods from intonation and context.
