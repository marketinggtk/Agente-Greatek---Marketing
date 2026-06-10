import { TrainingModule } from '../types/trainingModule';
import { PRIORITY_PRODUCTS } from '../constants/priorityProducts';
import { PRODUCT_FAMILIES } from '../constants/productFamilies';
import { getIconAndCategory, detectBrand } from './moduleClassifier';
import { normalizeText } from './normalizeText';
import { extractProductDisplayName } from './productNameExtractor';
import { generateProductFaqs } from './faqGenerator';

/**
 * Parses the knowledge base products into training modules
 */
export const parseModules = (products: any[]): TrainingModule[] => {
    const modules: TrainingModule[] = [];

    products.forEach((product, pIndex) => {
        const brand = detectBrand(product.name, product.details);
        
        // Define title properly
        const rawTitle = product.name || '';
        const { displayName: sTitle, needsNameReview } = extractProductDisplayName(rawTitle, product.details);

        if (needsNameReview || !sTitle) return;

        const { icon, category } = getIconAndCategory(sTitle);

        // Check if this product belongs to a predefined family
        const familyMatch = PRODUCT_FAMILIES.find(f => 
            normalizeText(sTitle).includes(normalizeText(f.familyTitle)) ||
            f.aliases.some(alias => normalizeText(sTitle).includes(normalizeText(alias))) ||
            f.aliases.some(alias => normalizeText(product.details).includes(normalizeText(alias)))
        );
        
        // Priority logic
        const isPriority = PRIORITY_PRODUCTS.some(p => 
            normalizeText(sTitle).includes(normalizeText(p.canonicalTitle)) ||
            p.aliases.some(alias => normalizeText(sTitle).includes(normalizeText(alias)))
        );
        
        if (familyMatch) {
            // Logic for a family (like Conectores)
            const id = `family-${pIndex}`;
            if (!modules.find(m => m.id === id)) {
                modules.push({
                    id,
                    title: familyMatch.familyTitle,
                    displayTitle: familyMatch.familyTitle,
                    originalProductName: rawTitle,
                    brand: familyMatch.brand,
                    icon: 'bi-box-seam-fill',
                    category: familyMatch.category,
                    isPriority: isPriority || familyMatch.familyTitle === 'Conectores de Campo', // Keep legacy behavior if needed or use priority list
                    description: `Família de ${familyMatch.familyTitle} Greatek.`,
                    introduction: `Tire dúvidas sobre os diversos modelos de **${familyMatch.familyTitle}**.`,
                    mainContent: product.details,
                    technicalDossier: product.details,
                    faqs: generateProductFaqs(familyMatch.familyTitle, familyMatch.category, product.details),
                    models: familyMatch.models,
                    aliases: familyMatch.aliases,
                    sharedHighlights: familyMatch.sharedHighlights,
                    needsNameReview: needsNameReview
                });
            }
            return;
        }

        const isGrouped = product.details.includes('###');

        if (isGrouped) {
            const segments = product.details.split('\n### ');
            segments.forEach((segment, sIndex) => {
                const sLines = segment.split('\n');
                let rawSTitle = sLines[0].replace(/^### /, '').trim();
                
                // Skip overview/intro segments
                if (sIndex === 0 && (normalizeText(rawSTitle).includes('visao geral') || normalizeText(rawSTitle).includes('introducao'))) return;
                
                const { displayName: segmentTitle, needsNameReview: sNeedsReview } = extractProductDisplayName(rawSTitle || sTitle, segment);
                
                if (sNeedsReview || !segmentTitle) return;

                const { icon: sIcon, category: sCategory } = getIconAndCategory(segmentTitle);
                
                const segmentPriority = PRIORITY_PRODUCTS.some(p => 
                    normalizeText(segmentTitle).includes(normalizeText(p.canonicalTitle)) ||
                    p.aliases.some(alias => normalizeText(segmentTitle).includes(normalizeText(alias)))
                );

                modules.push({
                    id: `mod-${pIndex}-${sIndex}`,
                    title: segmentTitle,
                    displayTitle: segmentTitle,
                    originalProductName: rawSTitle || rawTitle,
                    brand: brand,
                    icon: sIcon,
                    category: sCategory,
                    isPriority: segmentPriority,
                    description: segmentTitle,
                    introduction: `Consulte as especificações e tire dúvidas sobre o **${segmentTitle}**.`,
                    mainContent: segment.startsWith('###') ? segment : '### ' + segment,
                    technicalDossier: `### Ficha Técnica\n${segment}`,
                    faqs: generateProductFaqs(segmentTitle, sCategory, segment),
                    needsNameReview: sNeedsReview
                });
            });
        } else {
            modules.push({
                id: `mod-direct-${pIndex}`,
                title: sTitle,
                displayTitle: sTitle,
                originalProductName: rawTitle,
                brand: brand,
                icon: icon,
                category: category,
                isPriority: isPriority,
                description: sTitle,
                introduction: `Guia de suporte técnico e vendas: **${sTitle}**.`,
                mainContent: product.details,
                technicalDossier: `### Ficha Técnica\n${product.details}`,
                faqs: generateProductFaqs(sTitle, category, product.details),
                needsNameReview: needsNameReview
            });
        }
    });

    return modules;
};
