const SECTION_TITLES = [
    'Resumo direto',
    'O que mais importa',
    'Argumento comercial',
    'Atenção técnica',
    'Como falar com o cliente',
    'Próximo passo recomendado'
];

/**
 * Normalizes the AI consultant's markdown to ensure standardized section headers.
 * Converts plain text titles or other header levels to Markdown level 2 headers.
 * Does not force conversions if the content already has standard H2 headings.
 */
export function normalizeConsultantMarkdown(content: string): string {
    if (!content) return '';
    
    const trimmed = content.trim();

    // If the content already has Markdown level 2 headings, preserve it as list of new dynamic blocks
    const hasH2 = /(^|\n)##\s+.+/.test(trimmed);
    if (hasH2) {
        return trimmed;
    }

    // Otherwise, check if it contains any of the classic section titles (plain or non-H2 markdown)
    let normalized = trimmed;
    let hasAnyOldTitle = false;

    SECTION_TITLES.forEach((title) => {
        const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const checkRegex = new RegExp(`(^|\\n)(?:#*\\s*)?${escapedTitle}\\s*:?\\s*(?=\\n|$)`, 'i');
        if (checkRegex.test(normalized)) {
            hasAnyOldTitle = true;
        }
    });

    if (hasAnyOldTitle) {
        SECTION_TITLES.forEach((title) => {
            const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Matches the title at start of line, potentially with # prefixes, and standardizes to ## Header
            const regex = new RegExp(`(^|\\n)(?:#*\\s*)?${escapedTitle}\\s*:?\\s*(?=\\n|$)`, 'gi');
            normalized = normalized.replace(regex, `$1## ${title}`);
        });
        return normalized.trim();
    }

    return trimmed;
}
