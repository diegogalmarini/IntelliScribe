import { Recording } from '../types';

const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[<>:"/\\|?*]+/g, '_').trim();
};

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Failed to load logo", e);
        return null;
    }
};

export interface ExportOptions {
    includeSummary?: boolean;
    includeTranscript?: boolean;
}

export const exportAsPDF = async (recording: Recording, options: ExportOptions = { includeSummary: true, includeTranscript: true }, onStart?: () => void, onComplete?: () => void) => {
    if (onStart) onStart();
    try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Load Logo
        const logoBase64 = await getBase64ImageFromUrl('/logo-diktalo.png'); // Assuming public path

        // Fonts
        const titleFontSize = 14;
        const headerFontSize = 9;
        const bodyFontSize = 9;
        const footerFontSize = 8;
        const lineHeight = 5;

        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (margin * 2);

        let y = 20;

        // --- HEADER (Logo + Title) ---
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', margin, y - 5, 25, 8);
        } else {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Diktalo", margin, y);
        }

        y += 15;

        // Title
        doc.setFontSize(titleFontSize);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(recording.title || 'Grabación Sin Título', contentWidth);
        doc.text(titleLines, margin, y);
        y += (titleLines.length * 6) + 5;

        // Duration line - Only show if valid
        if (recording.duration && recording.duration !== '00:00:00' && recording.duration !== '0') {
            doc.setFontSize(headerFontSize);
            doc.setTextColor(80);
            doc.setFont("helvetica", "normal");
            doc.text(`Duración: ${recording.duration}`, margin, y);
            y += 8;
        }

        // Divider
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        const renderFooter = (pageNumber: number, totalPages: number) => {
            const str = `Página ${pageNumber} de ${totalPages}`;
            doc.setFontSize(footerFontSize);
            doc.setTextColor(150);
            doc.text(str, pageWidth - margin - doc.getTextWidth(str), pageHeight - 10);

            doc.text("Generado por Diktalo", margin, pageHeight - 10);
        };

        const printTextWithPagination = (lines: string[]) => {
            doc.setFontSize(bodyFontSize);
            lines.forEach(line => {
                if (y > pageHeight - margin - 10) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += lineHeight;
            });
        };

        // --- SUMMARY SECTION ---
        if (options.includeSummary && recording.summary) {
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text("Resumen IA", margin, y);
            y += 8;

            doc.setFontSize(bodyFontSize);
            doc.setTextColor(50);
            doc.setFont("helvetica", "normal");

            // Clean markdown and formatting using regex replacement for bullets
            let summaryText = recording.summary
                .replace(/\*\*/g, '') // remove bold markers
                .replace(/###/g, '') // remove header markers
                .replace(/^\s*-\s/gm, '• ') // replace "- " with bullet at start of line
                .replace(/^\s*\*\s/gm, '• ') // replace "* " with bullet at start of line
                .replace(/\n\n/g, '\n'); // Remove excessive gaps

            // Split into paragraphs to handle indentation per logical block
            const paragraphs = summaryText.split('\n');

            paragraphs.forEach(para => {
                let currentIndent = margin;
                let currentWidth = contentWidth;

                // Logic for indentation
                if (/^\d+\./.test(para)) {
                    // Numbered list (e.g. "1.")
                    currentIndent += 5;
                    currentWidth -= 5;
                } else if (para.trim().startsWith('•')) {
                    // Bullet point
                    currentIndent += 10;
                    currentWidth -= 10;
                }

                const lines = doc.splitTextToSize(para, currentWidth);

                doc.setFontSize(bodyFontSize);
                lines.forEach((line: string) => {
                    if (y > pageHeight - margin - 10) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, currentIndent, y);
                    y += lineHeight;
                });

                // Extra space after logical segments? Maybe just standard line height is fine.
                // y += 1; 
            });

            y += 10;
        }

        // --- TRANSCRIPT SECTION ---
        if (options.includeTranscript && recording.segments && recording.segments.length > 0) {

            // Check vertical space for the header "Transcripción"
            if (y > pageHeight - 40) {
                doc.addPage();
                y = margin;
            } else if (options.includeSummary) {
                // Formatting spacer
                doc.setDrawColor(230);
                doc.line(margin, y - 5, pageWidth - margin, y - 5);
                y += 5;
            }

            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text("Transcripción", margin, y);
            y += 10;

            doc.setFontSize(bodyFontSize);

            recording.segments.forEach(seg => {
                const speakerLine = `${seg.speaker} [${seg.timestamp}]`;
                const textLines = doc.splitTextToSize(seg.text, contentWidth);

                // Calculate space needed for this block (speaker + text)
                // Actually, let's just paginate naturally.
                // Ensure at least space for speaker name
                if (y > pageHeight - margin - 10) {
                    doc.addPage();
                    y = margin;
                }

                doc.setFont("helvetica", "bold");
                doc.setTextColor(0);
                doc.text(speakerLine, margin, y);
                y += lineHeight;

                doc.setFont("helvetica", "normal");
                doc.setTextColor(60);

                printTextWithPagination(textLines);
                y += 3; // Small gap between segments
            });
        }

        // Add Footers (Total Pages calculation)
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            renderFooter(i, totalPages);
        }

        // Determine filename suffix based on content
        let suffix = '';
        if (options.includeSummary && !options.includeTranscript) {
            suffix = '_Resumen';
        } else if (!options.includeSummary && options.includeTranscript) {
            suffix = '_Transcripcion';
        }

        const safeTitle = sanitizeFilename(`${recording.title || 'document'}${suffix}`);
        doc.save(`${safeTitle}.pdf`);
    } catch (error) {
        console.error("PDF Export failed", error);
        alert("Error exporting PDF");
    } finally {
        if (onComplete) onComplete();
    }
};

export const exportAsDoc = (recording: Recording, options: ExportOptions = { includeSummary: true, includeTranscript: true }, onStart?: () => void, onComplete?: () => void) => {
    if (onStart) onStart();
    try {
        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${recording.title}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.5; color: #333; }
                    h1 { font-size: 16pt; color: #000; margin-bottom: 5px; }
                    h2 { font-size: 12pt; color: #000; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .footer { font-size: 8pt; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }
                    .metadata { font-size: 9pt; color: #666; margin-bottom: 20px; }
                    .speaker { font-weight: bold; color: #222; margin-top: 10px; }
                    .timestamp { color: #888; font-size: 8pt; margin-left: 5px; }
                    ul { list-style-type: disc; margin-left: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <span>Diktalo</span>
                </div>
                
                <h1>${recording.title || 'Grabación'}</h1>
        `;

        // Metadata section - conditional duration
        htmlContent += `<div class="metadata"><p>Fecha: ${new Date(recording.date).toLocaleDateString()}<br/>`;

        if (recording.duration && recording.duration !== '00:00:00' && recording.duration !== '0') {
            htmlContent += `Duración: ${recording.duration}</p></div>`;
        } else {
            htmlContent += `</p></div>`;
        }

        if (options.includeSummary && recording.summary) {
            // Clean markdown for Word
            // Replace bullets first to avoid conflict with italic/bold
            let summaryHtml = recording.summary
                .replace(/^\s*-\s(.*)$/gm, '<li>$1</li>')
                .replace(/^\s*\*\s(.*)$/gm, '<li>$1</li>')
            // Wrap generic lists if needed, but simple li replacement works well enough for Word import usually
            // Or better, wrap consecutive LIs in UL

            // Simple approach: standard markdown replacement
            summaryHtml = summaryHtml
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)\n/g, '<h3>$1</h3>')

            // Fix list wrapping logic is complex in regex, let's just make them bullets style spans if not full UL
            // Actually, let's keep it simple: replace - with • for safety if HTML list fails
            // But let's try standard HTML lists first.

            // To ensure <ul> wrap, we can use a library or just simple regex block for simple lists
            // Let's rely on simple <p>• content</p> which Word handles perfectly as a bullet visual

            summaryHtml = recording.summary
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)/g, '<h3>$1</h3>')
                .replace(/^\s*[-*]\s(.*)$/gm, '<p style="margin-left: 20px;">• $1</p>'); // Bullet emulation

            htmlContent += `<h2>Resumen IA</h2>${summaryHtml}`;
        }

        if (options.includeTranscript && recording.segments) {
            htmlContent += `<h2>Transcripción Completa</h2>`;
            recording.segments.forEach(seg => {
                htmlContent += `
                    <p>
                        <span class="speaker">${seg.speaker}</span>
                        <span class="timestamp">[${seg.timestamp}]</span><br/>
                        ${seg.text}
                    </p>
                `;
            });
        }

        htmlContent += `
            <div class="footer">
                Generado por Diktalo
            </div>
            </body></html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);

        // Determine filename suffix based on content
        let suffix = '';
        if (options.includeSummary && !options.includeTranscript) {
            suffix = '_Resumen';
        } else if (!options.includeSummary && options.includeTranscript) {
            suffix = '_Transcripcion';
        }

        const safeTitle = sanitizeFilename(`${recording.title || 'document'}${suffix}`);
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
