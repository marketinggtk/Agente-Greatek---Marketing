import { useMemo, useState } from 'react';
import { KNOWLEDGE_BASE_PRODUCTS } from '../../../../services/knowledgeBase';
import { parseModules } from '../utils/moduleParser';
import { normalizeText } from '../utils/normalizeText';
import { TrainingModule } from '../types/trainingModule';
import { PRIORITY_PRODUCTS, PriorityProductDef } from '../constants/priorityProducts';

/**
 * Robust logic to check if a module matches a priority product by exact match or high confidence alias
 */
export function moduleMatchesPriority(module: TrainingModule, priority: PriorityProductDef): boolean {
    const moduleTitleNorm = normalizeText(module.displayTitle || module.title || '');
    const moduleOriginalNameNorm = normalizeText(module.originalProductName || '');

    // Exceptions to prevent false positives:
    if (priority.canonicalTitle === 'XC220 G3') {
        const containsG3v = moduleTitleNorm.includes('g3v') || moduleOriginalNameNorm.includes('g3v');
        if (containsG3v) return false;
    }

    if (priority.canonicalTitle === 'EX220') {
        const containsEX520 = moduleTitleNorm.includes('ex520') || moduleOriginalNameNorm.includes('ex520');
        if (containsEX520) return false;
    }

    if (priority.canonicalTitle === 'MR70x V3') {
        const containsMR80x = moduleTitleNorm.includes('mr80x') || moduleOriginalNameNorm.includes('mr80x');
        if (containsMR80x) return false;
    }

    if (priority.canonicalTitle === 'MR80x V4') {
        const containsMR70x = moduleTitleNorm.includes('mr70x') || moduleOriginalNameNorm.includes('mr70x');
        if (containsMR70x) return false;
    }

    const moduleCandidates = [
        module.title,
        module.displayTitle,
        module.originalProductName,
        module.description,
        ...(module.aliases ?? []),
        ...(module.models ?? []).flatMap(model => [
            model.title,
            ...(model.aliases ?? [])
        ])
    ]
    .filter(Boolean)
    .map(value => normalizeText(String(value)));

    const priorityAliases = priority.aliases.map(normalizeText);

    return priorityAliases.some(alias => {
        return moduleCandidates.some(candidate => {
            if (!alias || !candidate) return false;
            
            if (candidate === alias) return true;
            
            if (alias.length >= 5 && candidate.includes(alias)) return true;
            
            if (candidate.length >= 5 && alias.includes(candidate)) return true;
            
            return false;
        });
    });
}

/**
 * Hook to manage training modules, search, and categorization
 */
export const useTrainingModules = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Parse all modules once
    const allModules = useMemo(() => {
        const parsed = parseModules(KNOWLEDGE_BASE_PRODUCTS);
        return parsed.filter(m => 
            m.title && 
            m.displayTitle && 
            !m.needsNameReview
        );
    }, []);

    // Helper to determine priority
    const getPriorityRank = (m: TrainingModule): number => {
        return PRIORITY_PRODUCTS.findIndex(p => moduleMatchesPriority(m, p));
    };

    const isPriorityModule = (m: TrainingModule): boolean => {
        return PRIORITY_PRODUCTS.some(p => moduleMatchesPriority(m, p));
    };

    // Filter modules based on search term and global normalization rules
    const filteredModules = useMemo(() => {
        const normSearch = normalizeText(searchTerm);
        
        if (!searchTerm.trim()) return allModules;
        
        return allModules.filter(m => {
            const searchableContent = [
                m.title,
                m.displayTitle || '',
                m.brand,
                m.category,
                m.description,
                m.introduction,
                m.mainContent || '',
                m.technicalDossier || '',
                ...(m.aliases || []),
                ...(m.sharedHighlights || []),
                ...(m.models?.map(model => [
                    model.title,
                    ...(model.aliases || []),
                    model.technicalDossier || ''
                ]).flat() || [])
            ].join(' ');

            return normalizeText(searchableContent).includes(normSearch);
        });
    }, [allModules, searchTerm]);

    // Separate modules for initial view, looking through PRIORITY_PRODUCTS in exact order
    const priorityModules = useMemo(() => {
        return PRIORITY_PRODUCTS
            .map(priority => {
                const matchedModule = allModules.find(module =>
                    moduleMatchesPriority(module, priority)
                );

                if (!matchedModule) return null;

                return {
                    ...matchedModule,
                    title: priority.canonicalTitle,
                    displayTitle: priority.canonicalTitle,
                    isPriority: true,
                    priorityCanonicalTitle: priority.canonicalTitle
                } as TrainingModule;
            })
            .filter((m): m is TrainingModule => m !== null);
    }, [allModules]);

    // General modules excludes both matched priority modules (by id) and anything else that matches priority filters
    const generalModules = useMemo(() => {
        const prioritySourceIds = new Set(
            priorityModules.map(module => module.id)
        );

        return allModules.filter(module => {
            return !prioritySourceIds.has(module.id) &&
                   !PRIORITY_PRODUCTS.some(priority => moduleMatchesPriority(module, priority));
        });
    }, [allModules, priorityModules]);

    // Results when searching
    const filteredPriorityModules = useMemo(() => {
        const normSearch = normalizeText(searchTerm);
        if (!searchTerm.trim()) return priorityModules;
        
        return priorityModules.filter(m => {
            const searchableContent = [
                m.title,
                m.brand,
                m.description,
                ...(m.aliases || []),
                ...(m.models?.map(mod => mod.title) || [])
            ].join(' ');
            return normalizeText(searchableContent).includes(normSearch);
        });
    }, [priorityModules, searchTerm]);

    const filteredGeneralModules = useMemo(() => {
        const normSearch = normalizeText(searchTerm);
        if (!searchTerm.trim()) return generalModules;
        
        return generalModules.filter(m => {
            const searchableContent = [
                m.title,
                m.brand,
                m.description,
                ...(m.aliases || []),
                ...(m.models?.map(mod => mod.title) || [])
            ].join(' ');
            return normalizeText(searchableContent).includes(normSearch);
        });
    }, [generalModules, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        allModules,
        filteredModules,
        priorityModules,
        generalModules,
        filteredPriorityModules,
        filteredGeneralModules
    };
};
