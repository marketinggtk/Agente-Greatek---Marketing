import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PresentationPackage, PresentationSlide, PresentationTheme } from '../types';

interface ThemeColors {
    bg: [number, number, number];
    primaryText: [number, number, number];
    secondaryText: [number, number, number];
    accent: [number, number, number];
    cardBg: [number, number, number];
    header: [number, number, number];
    subtleBorder: [number, number, number];
}

const themes: Record<PresentationTheme, ThemeColors> = {
    light: {
        bg: [255, 255, 255],
        primaryText: [11, 11, 11],
        secondaryText: [74, 74, 74],
        accent: [0, 129, 204],
        cardBg: [249, 249, 249],
        header: [8, 63, 98],
        subtleBorder: [233, 233, 233],
    },
    dark: {
        bg: [8, 53, 97],
        primaryText: [255, 255, 255],
        secondaryText: [200, 215, 230],
        accent: [100, 181, 246],
        cardBg: [12, 69, 124],
        header: [255, 255, 255],
        subtleBorder: [20, 80, 140],
    },
    classic: {
        bg: [245, 245, 245],
        primaryText: [40, 40, 40],
        secondaryText: [80, 80, 80],
        accent: [0, 90, 150],
        cardBg: [255, 255, 255],
        header: [8, 63, 98],
        subtleBorder: [220, 220, 220],
    }
};

const renderRichText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, options: {
    fontSize: number;
    color: [number, number, number];
    lineSpacing?: number;
    draw?: boolean;
}): number => {
    const { fontSize, color, lineSpacing = 1.2, draw = true } = options;
    const lineHeight = fontSize * lineSpacing;

    if (draw) {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
    }
    
    if (!text) {
        return y;
    }

    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
    const spaceWidth = doc.getStringUnitWidth(' ') * fontSize / doc.internal.scaleFactor;
    
    const lines: { words: { text: string; style: 'normal' | 'bold' | 'italic'; width: number }[] }[] = [{ words: [] }];
    let currentLineIndex = 0;
    let cursorX = x;

    parts.forEach(part => {
        let style: 'normal' | 'bold' | 'italic' = 'normal';
        let content = part;

        if (part.startsWith('**') && part.endsWith('**')) {
            style = 'bold';
            content = part.slice(2, -2);
        } else if (part.startsWith('*') && part.endsWith('*')) {
            style = 'italic';
            content = part.slice(1, -1);
        }
        
        doc.setFont('helvetica', style);
        const words = content.split(/\s+/).filter(Boolean);
        
        words.forEach((word) => {
            const wordWidth = doc.getStringUnitWidth(word) * fontSize / doc.internal.scaleFactor;
            if (cursorX > x && cursorX + wordWidth > x + maxWidth) {
                cursorX = x;
                currentLineIndex++;
                lines[currentLineIndex] = { words: [] };
            }
            if (!lines[currentLineIndex]) lines[currentLineIndex] = { words: [] };
            lines[currentLineIndex].words.push({ text: word, style, width: wordWidth });
            cursorX += wordWidth + spaceWidth;
        });
    });

    if (draw) {
        lines.forEach((line, index) => {
            let lineX = x;
            const lineY = y + index * lineHeight;
            line.words.forEach(word => {
                doc.setFont('helvetica', word.style);
                doc.text(word.text, lineX, lineY);
                lineX += word.width + spaceWidth;
            });
        });
    }
    
    return y + (lines.length * lineHeight) - (lineHeight - fontSize); // Return the Y position below the drawn text
};

const drawSlide = (doc: jsPDF, slide: PresentationSlide, presentation: PresentationPackage, slideNumber: number) => {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 30;
    const colors = themes[presentation.theme] || themes.light;

    // Slide Background
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(0, 0, pageW, pageH, 'F');

    let textStartX = margin;
    let textMaxWidth = pageW - margin * 2;
    let contentStartY = margin + 20;

    // Image Layout
    if (slide.userImage) {
        const imageWidth = pageW * 0.35;
        const imageHeight = pageH - margin * 2;
        const imageX = pageW - margin - imageWidth;
        const imageY = margin;
        
        textMaxWidth = pageW - margin * 2 - imageWidth - 20;

        try {
            const format = slide.userImage.split(';')[0].split('/')[1].toUpperCase();
            doc.save();
            doc.roundedRect(imageX, imageY, imageWidth, imageHeight, 10, 10);
            doc.clip();
            doc.addImage(slide.userImage, format, imageX, imageY, imageWidth, imageHeight);
            // FIX: Replaced non-existent `restore` method with `restoreGraphicsState`.
            doc.restoreGraphicsState();
        } catch (e) {
            console.error("PDF image error:", e);
            doc.setDrawColor(colors.subtleBorder[0], colors.subtleBorder[1], colors.subtleBorder[2]);
            // FIX: Corrected arguments for `roundedRect` to use proper width and height variables.
            doc.roundedRect(imageX, imageY, imageWidth, imageHeight, 10, 10, 'S');
            doc.text("[Falha ao carregar imagem]", imageX + imageWidth / 2, imageY + imageHeight / 2, { align: 'center' });
        }
    }

    // Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.header[0], colors.header[1], colors.header[2]);
    const titleLines = doc.splitTextToSize(slide.title, textMaxWidth);
    doc.text(titleLines, textStartX, contentStartY);
    contentStartY += (titleLines.length * 28 * 0.8) + 10;

    // Decorative line
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(1.5);
    doc.line(textStartX, contentStartY, textStartX + 80, contentStartY);
    contentStartY += 20;

    // Content
    switch (slide.slide_type) {
        case 'key_metrics': {
            const metrics = slide.content.metrics || [];
            const cardCount = metrics.length;
            if (cardCount === 0) break;
            const cardGap = 15;
            const cardWidth = (textMaxWidth - (cardCount - 1) * cardGap) / cardCount;
            let cardX = textStartX;

            metrics.forEach((metric: any) => {
                doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
                doc.setDrawColor(colors.subtleBorder[0], colors.subtleBorder[1], colors.subtleBorder[2]);
                doc.roundedRect(cardX, contentStartY, cardWidth, 60, 5, 5, 'FD');
                
                doc.setFontSize(26);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
                doc.text(metric.value, cardX + cardWidth / 2, contentStartY + 30, { align: 'center' });
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(colors.secondaryText[0], colors.secondaryText[1], colors.secondaryText[2]);
                doc.text(metric.label, cardX + cardWidth / 2, contentStartY + 45, { align: 'center' });
                
                cardX += cardWidth + cardGap;
            });
            contentStartY += 60 + 10;
            break;
        }
        case 'three_column_cards': {
            const cards = slide.content.cards || [];
            if (cards.length === 0) break;
            const cardCount = cards.length;
            const cardGap = 15;
            const cardWidth = (textMaxWidth - (cardCount - 1) * cardGap) / cardCount;
            let cardX = textStartX;
            
            // 1. Calculate heights first to determine max height for alignment
            const cardHeights = cards.map((card: any) => {
                const titleBaseline = 11; // Fontsize
                const titleFinalY = renderRichText(doc, card.title, 0, titleBaseline, cardWidth - 20, { fontSize: 11, color: colors.header, draw: false });
                const descFinalY = renderRichText(doc, card.description, 0, titleFinalY + 5, cardWidth - 20, { fontSize: 10, color: colors.secondaryText, draw: false });
                return descFinalY + 24; // Add top/bottom padding
            });

            const maxCardHeight = Math.max(...cardHeights, 60);

            // 2. Draw cards with uniform height
            cards.forEach((card: any) => {
                doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
                doc.setDrawColor(colors.subtleBorder[0], colors.subtleBorder[1], colors.subtleBorder[2]);
                doc.roundedRect(cardX, contentStartY, cardWidth, maxCardHeight, 5, 5, 'FD');
                
                const titleY = contentStartY + 12 + 11 * 0.85;
                const titleFinalY = renderRichText(doc, card.title, cardX + 10, titleY, cardWidth - 20, { fontSize: 11, color: colors.header, draw: true });
                
                const descY = titleFinalY + 5;
                renderRichText(doc, card.description, cardX + 10, descY, cardWidth - 20, { fontSize: 10, color: colors.secondaryText, draw: true });
                
                cardX += cardWidth + cardGap;
            });
            contentStartY += maxCardHeight + 10;
            break;
        }
        case 'table_slide': {
            const { headers = [], rows = [] } = slide.content;
            if (headers.length > 0 && rows.length > 0) {
                 (doc as any).autoTable({
                    head: [headers],
                    body: rows,
                    startY: contentStartY,
                    theme: 'grid',
                    headStyles: { fillColor: colors.accent, textColor: [255,255,255] },
                    alternateRowStyles: { fillColor: colors.cardBg },
                    styles: {
                        cellPadding: 4,
                        fontSize: 9,
                        font: 'helvetica',
                        textColor: colors.primaryText,
                        lineColor: colors.subtleBorder,
                        lineWidth: 0.5,
                    },
                });
                contentStartY = (doc as any).lastAutoTable.finalY;
            }
            break;
        }
        default: { // Handles bullets, agenda, etc.
            const contentArray = Array.isArray(slide.content) ? slide.content : [String(slide.content)];
            let listY = contentStartY + 11 * 0.85; // Start at first baseline
            contentArray.forEach(item => {
                doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
                doc.circle(textStartX + 4, listY - 3, 2, 'F');
                const nextY = renderRichText(doc, item, textStartX + 15, listY, textMaxWidth - 15, { fontSize: 11, color: colors.secondaryText });
                listY = nextY + 5; // spacing between list items
            });
            contentStartY = listY;
            break;
        }
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(colors.secondaryText[0], colors.secondaryText[1], colors.secondaryText[2]);
    doc.text(presentation.presentation_title, margin, pageH - 15);
    doc.text(`Slide ${slideNumber} / ${presentation.slides.length}`, pageW - margin, pageH - 15, { align: 'right' });
};

export const generateSingleSlidePdf = (slide: PresentationSlide, presentation: PresentationPackage) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const slideIndex = presentation.slides.findIndex(s => s.id === slide.id);
    const slideNumber = slideIndex !== -1 ? slideIndex + 1 : 1;
    
    drawSlide(doc, slide, presentation, slideNumber);

    const sanitizedTitle = slide.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    doc.save(`${sanitizedTitle || 'Slide'}.pdf`);
}

export const generatePresentationPdf = (presentation: PresentationPackage) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    
    presentation.slides.forEach((slide, index) => {
        drawSlide(doc, slide, presentation, index + 1);
        if (index < presentation.slides.length - 1) {
            doc.addPage();
        }
    });

    const sanitizedTitle = presentation.presentation_title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    doc.save(`${sanitizedTitle || 'Apresentacao_Greatek'}.pdf`);
};
