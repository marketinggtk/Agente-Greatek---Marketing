export const INVALID_TITLE_KEYWORDS = [
    'link',
    'http',
    'https',
    'descricao',
    'visao geral',
    'introducao',
    'principais caracteristicas',
    'homologado',
    'este produto',
    'caracteristicas',
    'clique aqui',
    'www.',
    'ficha tecnica',
    'view product',
    'family link',
    'beneficios',
    'aplicacoes',
    'observacoes',
    'vazio',
    'null',
    'undefined'
];

/**
 * Sanitizes a candidate string for a product title.
 * Removes Markdown symbols, bullets, and excessive spaces.
 */
export function sanitizeTitleCandidate(value: string): string {
    if (!value) return '';
    
    return value
        .replace(/^[\-\*•]\s+/, '')      // Remove list bullets
        .replace(/^#+\s+/, '')           // Remove Markdown headers
        .replace(/\*\*/g, '')            // Remove bold markdown
        .replace(/:\s*$/, '')            // Remove trailing colons
        .replace(/\[.*\]\(.*\)/g, '')    // Remove Markdown links
        .trim();
}

/**
 * Checks if a title candidate is invalid (e.g., it's a URL, too long, or contains forbidden keywords).
 */
export function isInvalidTitleCandidate(value: string): boolean {
    if (!value) return true;
    const sanitized = sanitizeTitleCandidate(value);
    
    // Check for Markdown separators and short repetitive chars
    if (/^[\-\*\._\s]{2,}$/.test(sanitized)) return true;
    if (sanitized === '---' || sanitized === '***' || sanitized === '...') return true;

    const lower = sanitized.toLowerCase();
    
    if (sanitized.length > 80) return true;
    if (sanitized.length < 2) return true;
    
    // Check if it's purely a URL or contains "Link"
    if (lower.includes('http') || lower.includes('www.') || lower.startsWith('link')) return true;
    
    // Check if it's a bracketed link like [www.greatek...]
    if (lower.includes('[www.') || lower.includes('.com.')) return true;
    
    // Check for other forbidden keywords
    return INVALID_TITLE_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Interface for extraction result
 */
interface ExtractionResult {
    displayName: string;
    needsNameReview: boolean;
}

/**
 * Extracts a reliable display name from a block of text if the first line is invalid.
 */
export function extractProductDisplayName(productName: string, productDetails: string): ExtractionResult {
    const sanitizedName = sanitizeTitleCandidate(productName);
    
    if (!isInvalidTitleCandidate(sanitizedName)) {
        return { displayName: sanitizedName, needsNameReview: false };
    }
    
    // If original name is invalid, search for headers in content
    const lines = productDetails.split('\n');
    for (const line of lines) {
        const candidate = sanitizeTitleCandidate(line);
        if (candidate && !isInvalidTitleCandidate(candidate)) {
            return { displayName: candidate, needsNameReview: false };
        }
    }
    
    return { 
        displayName: '', 
        needsNameReview: true 
    };
}
