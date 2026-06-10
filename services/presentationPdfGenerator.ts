
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

const PDF_LAYOUT = {
    marginX: 40,
    marginTop: 35,
    marginBottom: 30,
    footerHeight: 25,
    titleFontSize: 24,
    titleLineHeight: 20,
    subtitleFontSize: 12,
    bodyFontSize: 10,
    smallFontSize: 9,
    cardRadius: 6,
    gap: 15,
};

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

function getSlideBounds(doc: jsPDF, contentStartY: number) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    return {
        pageW,
        pageH,
        x: PDF_LAYOUT.marginX,
        y: contentStartY,
        width: pageW - PDF_LAYOUT.marginX * 2,
        height: pageH - contentStartY - PDF_LAYOUT.footerHeight - PDF_LAYOUT.marginBottom,
        bottom: pageH - PDF_LAYOUT.footerHeight - PDF_LAYOUT.marginBottom
    };
}

function cleanBulletText(text: any): string {
    return String(text || '')
        .replace(/^[•\-\*]\s*/, '')
        .replace(/^\d+[\.\)]\s*/, '')
        .trim();
}

/**
 * Renders a text box with a maximum height limit.
 * If the text exceeds the height, it truncates with ellipses.
 */
function renderTextBox(doc: jsPDF, text: any, x: number, y: number, width: number, maxHeight: number, options: {
    fontSize: number;
    color: [number, number, number];
    style?: 'normal' | 'bold' | 'italic';
    lineSpacing?: number;
    align?: 'left' | 'center' | 'right';
}): number {
    const { fontSize, color, style = 'normal', lineSpacing = 1.15, align = 'left' } = options;
    doc.setFont('helvetica', style);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const safeText = String(text || '');
    if (!safeText) return y;

    const lines = doc.splitTextToSize(safeText, width);
    const lineHeight = fontSize * lineSpacing;
    const maxVisibleLines = Math.floor(maxHeight / lineHeight);
    
    let visibleLines = lines;
    let truncated = false;
    
    if (lines.length > maxVisibleLines) {
        visibleLines = lines.slice(0, Math.max(1, maxVisibleLines));
        const lastLine = visibleLines[visibleLines.length - 1];
        if (lastLine.length > 3) {
            visibleLines[visibleLines.length - 1] = lastLine.substring(0, lastLine.length - 3) + '...';
        }
        truncated = true;
    }

    visibleLines.forEach((line: string, index: number) => {
        let drawX = x;
        if (align === 'center') {
            const lineWidth = doc.getStringUnitWidth(line) * fontSize / doc.internal.scaleFactor;
            drawX = x + (width - lineWidth) / 2;
        } else if (align === 'right') {
            const lineWidth = doc.getStringUnitWidth(line) * fontSize / doc.internal.scaleFactor;
            drawX = x + width - lineWidth;
        }
        doc.text(line, drawX, y + (index + 1) * fontSize * lineSpacing - (fontSize * 0.2));
    });

    return y + (visibleLines.length * lineHeight);
}

const drawSlide = (doc: jsPDF, slide: PresentationSlide, presentation: PresentationPackage, slideNumber: number) => {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const colors = themes[presentation.theme] || themes.light;

    // Slide Background
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Title Section
    let cursorY = PDF_LAYOUT.marginTop;
    doc.setFontSize(PDF_LAYOUT.titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.header[0], colors.header[1], colors.header[2]);
    
    const titleWidth = pageW - PDF_LAYOUT.marginX * 2;
    const titleLines = doc.splitTextToSize(slide.title, titleWidth);
    
    // Draw Title
    doc.text(titleLines, PDF_LAYOUT.marginX, cursorY + (PDF_LAYOUT.titleFontSize * 0.8));
    cursorY += (titleLines.length * PDF_LAYOUT.titleFontSize * 1.1) + 8;

    // Decorative Line
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(2);
    doc.line(PDF_LAYOUT.marginX, cursorY, PDF_LAYOUT.marginX + 60, cursorY);
    cursorY += 25;

    const bounds = getSlideBounds(doc, cursorY);

    // Content Switcher
    switch (slide.slide_type) {
        case 'title_slide': {
            const centerX = pageW / 2;
            const contentY = bounds.y + bounds.height * 0.2;
            
            // Large Title
            doc.setFontSize(36);
            doc.setFont('helvetica', 'bold');
            doc.text(slide.title, centerX, contentY, { align: 'center' });
            
            // Subtitle
            const content = Array.isArray(slide.content) ? slide.content[0] : String(slide.content);
            if (content) {
                doc.setFontSize(18);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(colors.secondaryText[0], colors.secondaryText[1], colors.secondaryText[2]);
                doc.text(content, centerX, contentY + 45, { align: 'center' });
            }
            break;
        }

        case 'key_metrics': {
            const metrics = slide.content?.metrics || [];
            const count = Math.min(metrics.length, 4);
            if (count === 0) break;
            
            const cols = count > 2 ? 2 : count;
            const rows = Math.ceil(count / cols);
            const cardGap = PDF_LAYOUT.gap;
            const cardWidth = (bounds.width - (cols - 1) * cardGap) / cols;
            const cardHeight = (bounds.height - (rows - 1) * cardGap) / rows;

            metrics.slice(0, 4).forEach((metric: any, i: number) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = bounds.x + col * (cardWidth + cardGap);
                const y = bounds.y + row * (cardHeight + cardGap);

                doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
                doc.setDrawColor(colors.subtleBorder[0], colors.subtleBorder[1], colors.subtleBorder[2]);
                doc.roundedRect(x, y, cardWidth, cardHeight, PDF_LAYOUT.cardRadius, PDF_LAYOUT.cardRadius, 'FD');
                
                const boxCenterY = y + cardHeight / 2;
                doc.setFontSize(28);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
                doc.text(String(metric.value ?? ''), x + cardWidth / 2, boxCenterY, { align: 'center' });
                
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(colors.secondaryText[0], colors.secondaryText[1], colors.secondaryText[2]);
                doc.text(String(metric.label ?? ''), x + cardWidth / 2, boxCenterY + 20, { align: 'center' });
            });
            break;
        }

        case 'three_column_cards': {
            const cards = slide.content?.cards || [];
            const count = Math.min(cards.length, 3);
            if (count === 0) break;

            const cardGap = PDF_LAYOUT.gap;
            const cardWidth = (bounds.width - (count - 1) * cardGap) / count;
            const cardHeight = bounds.height;

            cards.slice(0, 3).forEach((card: any, i: number) => {
                const x = bounds.x + i * (cardWidth + cardGap);
                const y = bounds.y;

                doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
                doc.setDrawColor(colors.subtleBorder[0], colors.subtleBorder[1], colors.subtleBorder[2]);
                doc.roundedRect(x, y, cardWidth, cardHeight, PDF_LAYOUT.cardRadius, PDF_LAYOUT.cardRadius, 'FD');
                
                renderTextBox(doc, card.title, x + 15, y + 15, cardWidth - 30, 40, {
                    fontSize: 12,
                    color: colors.header,
                    style: 'bold'
                });

                renderTextBox(doc, card.description, x + 15, y + 60, cardWidth - 30, cardHeight - 75, {
                    fontSize: 10,
                    color: colors.secondaryText
                });
            });
            break;
        }

        case 'bento_grid': {
            const items = (slide.content?.items || []).slice(0, 4);
            if (items.length === 0) break;

            const gap = PDF_LAYOUT.gap;
            const halfW = (bounds.width - gap) / 2;
            const halfH = (bounds.height - gap) / 2;

            items.forEach((item: any, i: number) => {
                let x = bounds.x, y = bounds.y, w = halfW, h = halfH;
                
                if (i === 0 && item.size === 'large') {
                    w = bounds.width;
                } else if (i === 1 && items[0].size === 'large') {
                    y += (halfH + gap);
                } else if (i === 2 && items[0].size === 'large') {
                    x += (halfW + gap);
                    y += (halfH + gap);
                } else {
                    x = bounds.x + (i % 2) * (halfW + gap);
                    y = bounds.y + Math.floor(i / 2) * (halfH + gap);
                }

                doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
                doc.setDrawColor(colors.subtleBorder[0], colors.subtleBorder[1], colors.subtleBorder[2]);
                doc.roundedRect(x, y, w, h, PDF_LAYOUT.cardRadius, PDF_LAYOUT.cardRadius, 'FD');

                renderTextBox(doc, item.title, x + 12, y + 12, w - 24, 25, { fontSize: 11, color: colors.header, style: 'bold' });
                renderTextBox(doc, item.description, x + 12, y + 38, w - 24, h - 50, { fontSize: 9, color: colors.secondaryText });
            });
            break;
        }

        case 'two_column_text': {
            const left = Array.isArray(slide.content?.left_column) ? slide.content.left_column : [];
            const right = Array.isArray(slide.content?.right_column) ? slide.content.right_column : [];
            const colW = (bounds.width - 40) / 2;

            [
                { items: left, x: bounds.x },
                { items: right, x: bounds.x + colW + 40 }
            ].forEach(col => {
                let colY = bounds.y;
                col.items.forEach((item: string) => {
                    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
                    doc.circle(col.x + 5, colY + 6, 2, 'F');
                    colY = renderTextBox(doc, cleanBulletText(item), col.x + 15, colY, colW - 15, 60, {
                        fontSize: 10,
                        color: colors.secondaryText
                    }) + 8;
                });
            });
            break;
        }

        case 'table_slide': {
            const { headers = [], rows = [] } = slide.content || {};
            if (headers.length > 0 && rows.length > 0) {
                (doc as any).autoTable({
                    head: [headers],
                    body: rows.slice(0, 10), // Limit rows for single page
                    startY: bounds.y,
                    margin: { left: bounds.x, right: pageW - (bounds.x + bounds.width) },
                    tableWidth: bounds.width,
                    theme: 'grid',
                    headStyles: { fillColor: colors.accent, textColor: [255, 255, 255], fontSize: 10 },
                    styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak', textColor: colors.primaryText, lineColor: colors.subtleBorder },
                    alternateRowStyles: { fillColor: colors.cardBg }
                });
            }
            break;
        }

        case 'numbered_list': {
            const items = (slide.content?.items || []).slice(0, 5);
            const itemH = bounds.height / Math.max(1, items.length);
            
            items.forEach((item: any, i: number) => {
                const itemY = bounds.y + i * itemH;
                
                // Number Circle
                doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
                doc.circle(bounds.x + 10, itemY + 12, 10, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(String(i + 1), bounds.x + 10, itemY + 15.5, { align: 'center' });

                renderTextBox(doc, cleanBulletText(item.title), bounds.x + 30, itemY, bounds.width - 35, 20, {
                    fontSize: 11,
                    color: colors.header,
                    style: 'bold'
                });
                renderTextBox(doc, cleanBulletText(item.description), bounds.x + 30, itemY + 22, bounds.width - 35, itemH - 25, {
                    fontSize: 10,
                    color: colors.secondaryText
                });
            });
            break;
        }

        default: {
            const contentArray = Array.isArray(slide.content) ? slide.content : [String(slide.content || '')];
            let bulletY = bounds.y;
            contentArray.forEach(item => {
                doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
                doc.circle(bounds.x + 5, bulletY + 6, 2, 'F');
                bulletY = renderTextBox(doc, cleanBulletText(item), bounds.x + 15, bulletY, bounds.width - 15, 80, {
                    fontSize: 11,
                    color: colors.secondaryText
                }) + 10;
            });
            break;
        }
    }

    // Fixed Footer
    doc.setFontSize(PDF_LAYOUT.smallFontSize);
    doc.setTextColor(colors.secondaryText[0], colors.secondaryText[1], colors.secondaryText[2]);
    doc.setFont('helvetica', 'normal');
    
    // Left: Presentation Title
    doc.text(presentation.presentation_title, PDF_LAYOUT.marginX, pageH - 20);
    
    // Right: Slide Numbering
    const pageString = `Slide ${slideNumber} / ${presentation.slides.length}`;
    const pageStringWidth = doc.getStringUnitWidth(pageString) * PDF_LAYOUT.smallFontSize / doc.internal.scaleFactor;
    doc.text(pageString, pageW - PDF_LAYOUT.marginX - pageStringWidth, pageH - 20);
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
