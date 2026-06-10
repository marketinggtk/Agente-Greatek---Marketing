export type TabId = 'info' | 'faq' | 'chat';

export interface Tab {
    id: TabId;
    label: string;
}

export const TABS: Tab[] = [
    { id: 'info', label: 'Ficha Técnica' },
    { id: 'faq', label: 'Principais Dúvidas' },
    { id: 'chat', label: 'Chat com Consultor' }
];
