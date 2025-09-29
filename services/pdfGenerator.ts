import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QuizQuestion } from '../types';

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

export const generateQuizResultPdf = (
    productName: string,
    quiz: QuizQuestion[],
    userAnswers: (string | null)[],
    score: number
) => {
    const doc = new jsPDF();
    const margin = 15;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let finalY = 20;

    const colors = {
        greatekDarkBlue: [8, 63, 98],
        greatekBlue: [0, 129, 204],
        textPrimary: [11, 11, 11],
        textSecondary: [74, 74, 74],
        border: [233, 233, 233],
        correctGreen: [34, 139, 34],
        correctGreenBg: [230, 245, 230],
        incorrectRed: [220, 20, 60],
        incorrectRedBg: [255, 235, 238],
        correctAnswerBg: [240, 240, 240],
    };

    const checkPageBreak = (neededHeight: number) => {
        if (finalY + neededHeight > pageH - margin) {
            doc.addPage();
            finalY = 20;
        }
    };

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(colors.greatekDarkBlue[0], colors.greatekDarkBlue[1], colors.greatekDarkBlue[2]);
    doc.text('Resultado do Quiz de Conhecimento', margin, finalY);
    finalY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.text(`Produto: ${productName}`, margin, finalY);
    finalY += 15;

    // --- Bento Grid Summary ---
    checkPageBreak(50);
    const correctCount = quiz.filter((q, i) => q.correct_answer === userAnswers[i]).length;
    const boxWidth = (pageW - margin * 2 - 10) / 2;
    
    // Score Box
    doc.setFillColor(colors.greatekBlue[0], colors.greatekBlue[1], colors.greatekBlue[2]);
    doc.roundedRect(margin, finalY, boxWidth, 40, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PONTUAÇÃO FINAL', margin + 10, finalY + 15);
    doc.setFontSize(18);
    doc.text(`${score}%`, margin + 10, finalY + 30);

    // Correct Answers Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.roundedRect(margin + boxWidth + 10, finalY, boxWidth, 40, 3, 3, 'FD');
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ACERTOS', margin + boxWidth + 20, finalY + 15);
    doc.setFontSize(18);
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
    doc.text(`${correctCount} / ${quiz.length}`, margin + boxWidth + 20, finalY + 30);
    
    finalY += 55;

    // --- Question Cards ---
    doc.setFont('helvetica', 'normal');

    quiz.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = q.correct_answer === userAnswer;

        // FIX: Declare correctAnswerLines here to make it available in the whole scope.
        let correctAnswerLines: string[] = [];

        // Calculate card height before drawing
        let cardHeight = 10; // top padding
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const questionLines = doc.splitTextToSize(`${index + 1}. ${q.question}`, pageW - margin * 2 - 20);
        cardHeight += questionLines.length * 5;

        cardHeight += 10; // space before answer

        // User answer box height
        doc.setFontSize(10);
        const userAnswerText = `Sua resposta: ${userAnswer || 'Não respondida'}`;
        const userAnswerLines = doc.splitTextToSize(userAnswerText, pageW - margin * 2 - 40);
        cardHeight += (userAnswerLines.length * 5) + 8; // text + padding

        // Correct answer box height (if incorrect)
        if (!isCorrect) {
            const correctAnswerText = `Resposta correta: ${q.correct_answer}`;
            correctAnswerLines = doc.splitTextToSize(correctAnswerText, pageW - margin * 2 - 40);
            cardHeight += (correctAnswerLines.length * 5) + 8 + 4; // text + padding + margin
        }
        
        cardHeight += 10; // space before explanation

        // Explanation height
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const explanationText = `Justificativa: ${q.explanation}`;
        const explanationLines = doc.splitTextToSize(explanationText, pageW - margin * 2 - 20);
        cardHeight += (explanationLines.length * 4) + 8;
        cardHeight += 5; // bottom padding
        doc.setFont('helvetica', 'normal');

        checkPageBreak(cardHeight);
        let cardY = finalY;

        // Draw Card border
        doc.setLineWidth(1);
        doc.setDrawColor(isCorrect ? colors.correctGreen[0] : colors.incorrectRed[0], isCorrect ? colors.correctGreen[1] : colors.incorrectRed[1], isCorrect ? colors.correctGreen[2] : colors.incorrectRed[2]);
        doc.roundedRect(margin, cardY, pageW - margin * 2, cardHeight, 3, 3, 'S');
        cardY += 10;

        // Question
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
        doc.text(questionLines, margin + 10, cardY);
        cardY += (questionLines.length * 5) + 10;

        // User Answer Box
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setFillColor(isCorrect ? colors.correctGreenBg[0] : colors.incorrectRedBg[0], isCorrect ? colors.correctGreenBg[1] : colors.incorrectRedBg[2], isCorrect ? colors.correctGreenBg[2] : colors.incorrectRedBg[2]);
        doc.roundedRect(margin + 10, cardY - 4, pageW - margin * 2 - 20, (userAnswerLines.length * 5) + 8, 2, 2, 'F');
        doc.setTextColor(isCorrect ? colors.correctGreen[0] : colors.incorrectRed[0], isCorrect ? colors.correctGreen[1] : colors.incorrectRed[1], isCorrect ? colors.correctGreen[2] : colors.incorrectRed[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(isCorrect ? '✓' : '✗', margin + 15, cardY + 2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
        doc.text(userAnswerLines, margin + 25, cardY + 2);
        cardY += (userAnswerLines.length * 5) + 8;
        
        // Correct Answer Box (if incorrect)
        if (!isCorrect) {
            cardY += 4;
            doc.setFillColor(colors.correctAnswerBg[0], colors.correctAnswerBg[1], colors.correctAnswerBg[2]);
            doc.roundedRect(margin + 10, cardY - 4, pageW - margin * 2 - 20, (correctAnswerLines.length * 5) + 8, 2, 2, 'F');
            doc.setTextColor(colors.correctGreen[0], colors.correctGreen[1], colors.correctGreen[2]);
            doc.setFont('helvetica', 'bold');
            doc.text('✓', margin + 15, cardY + 2);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
            doc.text(correctAnswerLines, margin + 25, cardY + 2);
            cardY += (correctAnswerLines.length * 5) + 8;
        }

        // Explanation
        cardY += 10;
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        doc.line(margin + 10, cardY - 5, pageW - margin - 10, cardY - 5);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
        doc.text(explanationLines, margin + 10, cardY);
        
        finalY += cardHeight + 10;
    });

    const sanitizedTitle = `Resultado_Quiz_${productName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    doc.save(`${sanitizedTitle}.pdf`);
};