export interface TrainingProductModel {
    id: string;
    title: string;
    aliases?: string[];
    technicalDossier?: string;
}

export interface TrainingModule {
    id: string;
    title: string;
    displayTitle?: string;
    originalProductName?: string;
    brand: string;
    icon: string;
    description: string;
    introduction: string;
    mainContent: string;
    category: string;
    isPriority: boolean;
    technicalDossier: string;
    faqs: { question: string; answer: string }[];
    aliases?: string[];
    models?: TrainingProductModel[];
    selectedModelTitle?: string;
    sharedHighlights?: string[];
    needsNameReview?: boolean;
    priorityCanonicalTitle?: string;
}
