/**
 * Normalizes text for searching and comparison
 */
export const normalizeText = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, '')        // Remove non-alphanumeric
        .trim();
};
