import jsPDF from 'jspdf';
import 'jspdf-autotable';

// The module augmentation for 'jspdf' was causing a "module not found" error during compilation.
// To resolve the build error, it has been removed and we now use a type assertion `(doc as any)`
// when calling the `autoTable` method. This bypasses the TypeScript error while maintaining functionality.
/*
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
*/

/**
 * Parses the markdown content from the Integrator agent into structured data.
 * @param markdown The raw markdown string.
 * @returns An object containing parsed table headers, body, and text sections.
 */
const parseMarkdownForPdf = (markdown: string) => {
    const lines = markdown.split('\n');
    let tableHeader: string[] = [];
    const tableBody: string[][] = [];
    let justifications: string[] = [];
    let technicals: string[] = [];

    let currentSection: 'table' | 'justification' | 'technical' | 'none' = 'none';

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Detect section headers and switch context
        if (line.startsWith('## Justificativa Comercial')) {
            currentSection = 'justification';
            continue;
        }
        if (line.startsWith('## Ganchos Técnicos')) {
            currentSection = 'technical';
            continue;
        }
        if (line.startsWith('## ') || line.startsWith('# ')) { // Any other header stops parsing
             currentSection = 'none';
             continue;
        }
        
        // Table parsing
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
             const cells = trimmedLine.split('|').slice(1, -1).map(cell => cell.trim().replace(/\*\*/g, ''));
            if (trimmedLine.includes('---')) { // Separator line
                continue;
            } else if (tableHeader.length === 0) { // Header line
                tableHeader = cells;
                currentSection = 'table';
            } else if (cells.length > 0 && cells.length === tableHeader.length) { // Body row
                tableBody.push(cells);
            }
            continue;
        }

        // Content parsing based on current section
        if (trimmedLine && (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- '))) {
            const itemText = trimmedLine.substring(2).replace(/\*\*/g, '').trim();
            switch (currentSection) {
                case 'justification':
                    justifications.push(itemText);
                    break;
                case 'technical':
                    technicals.push(itemText);
                    break;
            }
        }
    }
    
    return { tableHeader, tableBody, justifications, technicals };
};

/**
 * Generates and triggers the download of a PDF from the Integrator agent's response.
 * @param markdownContent The markdown string to convert into a PDF.
 */
export const generateIntegratorPdf = (markdownContent: string) => {
    const { tableHeader, tableBody, justifications, technicals } = parseMarkdownForPdf(markdownContent);
    const doc = new jsPDF();
    let finalY = 20;

    // --- Document Header ---
    doc.setFontSize(18);
    doc.setTextColor(8, 63, 98); // Greatek Dark Blue
    doc.text('Proposta de Solução Integrada', 14, finalY);
    finalY += 8;
    doc.setFontSize(12);
    doc.setTextColor(74, 74, 74); // text-secondary
    doc.text('Preparado pelo Agente Greatek', 14, finalY);
    finalY += 15;

    // --- Products Table ---
    if (tableHeader.length > 0 && tableBody.length > 0) {
        // Using type assertion to any because the module augmentation was removed.
        (doc as any).autoTable({
            head: [tableHeader],
            body: tableBody,
            startY: finalY,
            theme: 'grid',
            headStyles: { fillColor: [8, 63, 98] }, // Greatek Dark Blue
        });
        finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- Text Sections ---
    const addSection = (title: string, items: string[]) => {
        if (items.length === 0) return;
        
        // Check if there's enough space for the title + at least one line
        if (finalY > doc.internal.pageSize.height - 30) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(8, 63, 98);
        doc.text(title, 14, finalY);
        finalY += 8;

        doc.setFontSize(10);
        doc.setTextColor(74, 74, 74);
        items.forEach(item => {
            // Check for page break before adding text
            const textLines = doc.splitTextToSize(`• ${item}`, 180);
            const textHeight = textLines.length * 5; // Approximate height
            if (finalY + textHeight > doc.internal.pageSize.height - 15) {
                doc.addPage();
                finalY = 20;
            }
            doc.text(`• ${item}`, 14, finalY, { maxWidth: 180 });
            finalY += textHeight + 2;
        });
        finalY += 10;
    };

    addSection('Justificativa Comercial', justifications);
    addSection('Ganchos Técnicos', technicals);

    doc.save('Proposta-Solucao-Greatek.pdf');
};