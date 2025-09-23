
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// The module augmentation for 'jspdf' was causing a "module not found" error during compilation.
// To resolve the build error, it has been removed and we now use a type assertion `(doc as any)`
// when calling the `autoTable` method. This bypasses the TypeScript error while maintaining functionality.

// Element types for our structured representation of the markdown
type PdfElement = 
  | { type: 'h1'; content: string }
  | { type: 'h2'; content: string }
  | { type: 'h3'; content: string }
  | { type: 'p'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; header: string[]; body: string[][] };

/**
 * A more robust markdown parser that converts markdown text into a structured array of elements.
 * @param markdown The raw markdown string from the agent.
 * @returns An array of PdfElement objects representing the document structure.
 */
const parseMarkdownToElements = (markdown: string): PdfElement[] => {
    const lines = markdown.split('\n');
    const elements: PdfElement[] = [];
    let i = 0;

    const cleanText = (text: string) => {
      // Remove markdown bold characters and any HTML tags
      return text.replace(/\*\*/g, '').replace(/<[^>]*>/g, '').trim();
    };

    while (i < lines.length) {
        const line = lines[i].trim();

        if (line.startsWith('# ')) {
            elements.push({ type: 'h1', content: cleanText(line.substring(2)) });
            i++;
        } else if (line.startsWith('## ')) {
            elements.push({ type: 'h2', content: cleanText(line.substring(3)) });
            i++;
        } else if (line.startsWith('### ')) {
            elements.push({ type: 'h3', content: cleanText(line.substring(4)) });
            i++;
        } else if (line.match(/^(\*|-)\s/)) {
            const listItems: string[] = [];
            while (i < lines.length && lines[i].trim().match(/^(\*|-)\s/)) {
                listItems.push(cleanText(lines[i].trim().substring(2)));
                i++;
            }
            elements.push({ type: 'list', items: listItems });
        } else if (line.startsWith('|') && line.endsWith('|')) {
            const headerLine = line;
            if (i + 1 < lines.length && lines[i + 1].trim().includes('---')) {
                const header = headerLine.split('|').slice(1, -1).map(cell => cleanText(cell));
                const body: string[][] = [];
                i += 2; // Move past header and separator
                while (i < lines.length && lines[i].trim().startsWith('|')) {
                    const rowCells = lines[i].trim().split('|').slice(1, -1).map(cell => cleanText(cell));
                    if (rowCells.length === header.length) {
                        body.push(rowCells);
                    }
                    i++;
                }
                elements.push({ type: 'table', header, body });
            } else {
                 // It's a single line that looks like a table row but isn't part of a full table, treat as paragraph
                 elements.push({ type: 'p', content: cleanText(line) });
                 i++;
            }
        } else if (line) {
            elements.push({ type: 'p', content: cleanText(line) });
            i++;
        } else {
            i++; // Skip empty lines
        }
    }
    return elements;
};


/**
 * Generates and triggers the download of a PDF from markdown content.
 * This version uses a robust parser to handle various markdown structures.
 * @param markdownContent The markdown string to convert into a PDF.
 * @param title The desired title for the PDF file (without extension).
 */
export const generateIntegratorPdf = (markdownContent: string, title: string = 'Proposta-Solucao-Greatek') => {
    const elements = parseMarkdownToElements(markdownContent);
    if (elements.length === 0) {
        console.error("No content parsed from markdown to generate PDF.");
        alert("Não foi possível gerar o PDF pois o conteúdo da resposta estava vazio ou em um formato irreconhecível.");
        return;
    }
    
    const doc = new jsPDF();
    const margin = 14;
    const pageHeight = doc.internal.pageSize.height;
    let finalY = 20;

    const checkPageBreak = (neededHeight: number) => {
        if (finalY + neededHeight > pageHeight - margin) {
            doc.addPage();
            finalY = 20;
        }
    };

    // --- Document Header ---
    doc.setFontSize(18);
    doc.setTextColor(8, 63, 98); // Greatek Dark Blue
    doc.text('Proposta de Solução Integrada', margin, finalY);
    finalY += 8;
    doc.setFontSize(12);
    doc.setTextColor(74, 74, 74); // text-secondary
    doc.text('Preparado pelo Agente Greatek', margin, finalY);
    finalY += 15;

    // --- Render Elements ---
    elements.forEach(element => {
        switch (element.type) {
            case 'h1':
            case 'h2':
            case 'h3':
                checkPageBreak(12);
                doc.setFontSize(element.type === 'h1' ? 16 : element.type === 'h2' ? 14 : 12);
                doc.setTextColor(8, 63, 98);
                doc.text(element.content, margin, finalY);
                finalY += (element.type === 'h1' ? 8 : 7);
                break;
            
            case 'p':
                checkPageBreak(10);
                doc.setFontSize(10);
                doc.setTextColor(74, 74, 74);
                const pLines = doc.splitTextToSize(element.content, 180);
                checkPageBreak(pLines.length * 5);
                doc.text(pLines, margin, finalY);
                finalY += pLines.length * 5 + 3;
                break;

            case 'list':
                checkPageBreak(10);
                doc.setFontSize(10);
                doc.setTextColor(74, 74, 74);
                element.items.forEach(item => {
                    const listLines = doc.splitTextToSize(`• ${item}`, 180);
                    checkPageBreak(listLines.length * 5 + 2);
                    doc.text(listLines, margin, finalY);
                    finalY += listLines.length * 5 + 2;
                });
                finalY += 5;
                break;
            
            case 'table':
                if (element.header.length > 0 && element.body.length > 0) {
                    // `autoTable` handles its own page breaks.
                    checkPageBreak(30); // Check if there's enough space for at least the header
                    (doc as any).autoTable({
                        head: [element.header],
                        body: element.body,
                        startY: finalY,
                        theme: 'grid',
                        headStyles: { fillColor: [8, 63, 98] }, // Greatek Dark Blue
                    });
                    finalY = (doc as any).lastAutoTable.finalY + 10;
                }
                break;
        }
    });

    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').replace(/__+/g, '_');
    doc.save(`${sanitizedTitle || 'Proposta-Solucao-Greatek'}.pdf`);
};
