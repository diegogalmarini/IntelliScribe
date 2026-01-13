
# Data Portability & Export

Your information is not trapped in Diktalo. We designed our platform with the philosophy of **Total Interoperability**: your data is yours and must flow freely to the rest of your productivity ecosystem (CRM, ERP, Document Management).

The export engine converts raw intelligence (transcripts) and synthesized intelligence (summaries) into industry-standard formats.

![Export Modal](/docs/screenshots/es/export/01_export_modal.png)

---

## Output Formats

Select the right vehicle for your information depending on the recipient.

### 📄 PDF Document (Official Reports)
**The executive presentation par excellence.**
Generates a report with editorial design, ready to be sent to a client or archived in project folders.
*   **Content:** Cover, Executive Summary, Highlighted Notes, and Full Transcript.
*   **Use Case:** Meeting minutes for investors, monthly reports.

### 📘 Microsoft Word / DOCX (Editable Drafts)
**The starting point for your work.**
Need to convert a transcript into a blog post or business proposal? Export to Word to have an advanced draft that you can polish and format.
*   **Use Case:** Content creation, legal contract drafting.

### 📝 Plain Text / TXT (Maximum Compatibility)
**Pure data, no noise.**
Ideal for copy-pasting into tools that don't support rich formatting, like notes fields in Salesforce, HubSpot, or Notion.
*   **Use Case:** Feeding other LLMs, archiving in legacy systems.

### 🔧 JSON (Technical Integration)
**For developers and automation.**
Exports the full data structure, including metadata, word-level timestamps, and speaker identification.
*   **Use Case:** Training own models, ingestion into SQL/NoSQL databases.

---

## Export Configuration

Before downloading, you can customize which layers of information to include:

1.  **Timestamps:**
    *   *On:* `[14:02] John: I agree.` (Ideal for legal references).
    *   *Off:* `John: I agree.` (Better for fluid reading).

2.  **Speaker Identification:**
    *   If the AI didn't correctly tag someone, edit the names in the editor before exporting so the final document is perfect.

3.  **Intelligence Layers:**
    *   You can decide to exclude the literal transcript and download **only the summary** if you're looking for a 1-page executive document.

---

## Recommended Workflows

### Sales Cycle (CRM)
1.  Record the client call.
2.  Generate a summary with the "Sales" template.
3.  Export to **Plain Text**.
4.  Paste the result into the opportunity card of your CRM (Salesforce/Pipedrive).

### Legal Cycle (Compliance)
1.  Record the deposition or negotiation.
2.  Export to **PDF with Timestamps**.
3.  Digitally sign the PDF and archive it as immutable proof.

### Creative Cycle (Marketing)
1.  Record your walking brainstorming session.
2.  Export to **Word**.
3.  Edit the flow of ideas to create the script for your next video or podcast.
