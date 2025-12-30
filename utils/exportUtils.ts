import { Recording } from '../types';

const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[<>:"/\\|?*]+/g, '_').trim();
};

export const exportAsPDF = async (recording: Recording, onStart?: () => void, onComplete?: () => void) => {
    if (onStart) onStart();
    try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Config
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (margin * 2);
        let y = 20;

        // Title
        doc.setFontSize(20);
        doc.text(recording.title || 'Grabación Sin Título', margin, y);
        y += 10;

        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date(recording.date).toLocaleDateString()}`, margin, y);
        y += 5;
        doc.text(`Duración: ${recording.duration || 'N/A'}`, margin, y);
        y += 15;

        // Summary
        if (recording.summary) {
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Resumen IA", margin, y);
            y += 8;

            doc.setFontSize(11);
            doc.setTextColor(50);

            // Clean markdown for basic text
            const summaryText = recording.summary.replace(/\*\*/g, '').replace(/###/g, '').replace(/-/g, '•');
            const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
            doc.text(splitSummary, margin, y);
            y += (splitSummary.length * 6) + 10;
        }

        // Transcript
        if (recording.segments && recording.segments.length > 0) {
            // Check page break before starting transcript if summary was long
            if (y > 250) {
                doc.addPage();
                y = 20;
            } else {
                y += 10; // Extra spacing if on same page
            }

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Transcripción Completa", margin, y);
            y += 10;

            doc.setFontSize(10);
            doc.setTextColor(50);

            recording.segments.forEach(seg => {
                // Check page break
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.text(`${seg.speaker} [${seg.timestamp}]`, margin, y);
                y += 5;

                doc.setFont("helvetica", "normal");
                const splitText = doc.splitTextToSize(seg.text, contentWidth);
                doc.text(splitText, margin, y);
                y += (splitText.length * 5) + 8;
            });
        }

        // Use doc.save but with the sanitized filename to avoid browser/OS errors
        const safeTitle = sanitizeFilename(recording.title || 'document');
        doc.save(`${safeTitle}.pdf`);
    } catch (error) {
        console.error("PDF Export failed", error);
        alert("Error exporting PDF");
    } finally {
        if (onComplete) onComplete();
    }
};

export const exportAsDoc = (recording: Recording, onStart?: () => void, onComplete?: () => void) => {
    if (onStart) onStart();
    try {
        // Create an HTML content that Word can read
        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${recording.title}</title></head>
            <body>
            <h1>${recording.title || 'Grabación'}</h1>
            <p><strong>Fecha:</strong> ${new Date(recording.date).toLocaleDateString()}<br/>
            <strong>Duración:</strong> ${recording.duration || 'N/A'}</p>
            <hr/>
        `;

        if (recording.summary) {
            // Basic markdown to HTML conversion
            let summaryHtml = recording.summary
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)\n/g, '<h3>$1</h3>')
                .replace(/- (.*?)\n/g, '<li>$1</li>');

            htmlContent += `<h2>Resumen IA</h2>${summaryHtml}<br/><hr/>`;
        }

        if (recording.segments) {
            htmlContent += `<h2>Transcripción</h2>`;
            recording.segments.forEach(seg => {
                htmlContent += `<p><strong>${seg.speaker} (${seg.timestamp}):</strong> ${seg.text}</p>`;
            });
        }

        htmlContent += `</body></html>`;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);

        const safeTitle = sanitizeFilename(recording.title || 'document');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safeTitle}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Doc Export failed", error);
        alert("Error exporting Word Doc");
    } finally {
        if (onComplete) onComplete();
    }
};
