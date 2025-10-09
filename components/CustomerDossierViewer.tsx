
import React, { useState, useMemo } from 'react';
import { CustomerDossier } from '../types';
import { DataTableView } from './ui/DataTableView';

interface CustomerDossierViewerProps {
  data: CustomerDossier;
}

// Internal component for each grid item to standardize styling
const BentoGridItem: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className = '' }) => (
    <div className={`bg-white border border-greatek-border rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-greatek-blue/30 ${className}`}>
        {children}
    </div>
);

// Specific card styles
const HighlightCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
        <h4 className="font-semibold text-yellow-800 flex items-center text-sm">
            <i className="bi bi-exclamation-triangle-fill mr-2"></i>
            {title}
        </h4>
        <p className="text-xs text-text-secondary mt-1">{children}</p>
    </div>
);


const CustomerDossierViewer: React.FC<CustomerDossierViewerProps> = ({ data }) => {
    const [copied, setCopied] = useState(false);

    const parsedData = useMemo(() => {
        const content = data.markdown_content.replace(/```markdown|```/g, '').trim();
        const sections = content.split(/\n## /);
        
        const sectionMap = new Map<string, string>();
        
        // Handle main title (#)
        const mainTitleMatch = sections[0].match(/# (.*)/);
        if (mainTitleMatch) {
            sectionMap.set('main_title', sections[0]);
        }
        
        // Handle other sections (##)
        for (let i = 1; i < sections.length; i++) {
            const sectionContent = sections[i];
            const firstNewLine = sectionContent.indexOf('\n');
            if (firstNewLine === -1) continue;
            
            const title = sectionContent.substring(0, firstNewLine).trim();
            const body = sectionContent.substring(firstNewLine).trim();
            sectionMap.set(title, body);
        }

        const getSectionContent = (title: string) => {
            const keys = Array.from(sectionMap.keys());
            const key = keys.find(k => k.toLowerCase().includes(title.toLowerCase()));
            return key ? sectionMap.get(key) || '' : '';
        }

        const parseTable = (tableContent: string) => {
            const lines = tableContent.split('\n').filter(line => line.trim().startsWith('|'));
            if (lines.length < 2) return { headers: [], rows: [] };
            const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
            const rows = lines.slice(2).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
            return { headers, rows };
        };

        const parseList = (listContent: string) => listContent.split('\n').map(item => item.replace(/^\*\s*/, '').trim()).filter(Boolean);

        const parseHighlightCards = (cardContent: string) => {
            const cardRegex = /\[CARD_START\]\n\*\*(.*?):\*\*([\s\S]*?)\n\[CARD_END\]/g;
            const cards = [];
            let match;
            while ((match = cardRegex.exec(cardContent)) !== null) {
                let title = match[1].trim();
                // If the AI follows the example format "Título da Dor X (Real Title)", extract just the "Real Title".
                const parenthesisMatch = title.match(/\(([^)]+)\)/);
                if (parenthesisMatch && parenthesisMatch[1] && title.toLowerCase().includes('título da dor')) {
                    title = parenthesisMatch[1];
                }
                cards.push({ title: title, description: match[2].trim() });
            }
            return cards;
        };
        
        const summary = getSectionContent('Resumo da Empresa');
        const keyPeopleTable = parseTable(getSectionContent('Pessoas-Chave'));
        const news = parseList(getSectionContent('Últimas Notícias e Posts'));
        const products = parseList(getSectionContent('Produtos e Serviços Principais'));
        const painPoints = parseHighlightCards(getSectionContent('Dores e Desafios'));
        const conversationStarters = parseList(getSectionContent('Ganchos para Conversa'));
        const solutionsTable = parseTable(getSectionContent('Soluções Greatek Recomendadas'));

        return { summary, keyPeopleTable, news, products, painPoints, conversationStarters, solutionsTable };

    }, [data.markdown_content]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(data.markdown_content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-4 animate-fade-in bg-greatek-bg-light p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3">
                <div>
                    <h2 className="text-xl font-bold text-greatek-dark-blue">Dossiê de Inteligência: {data.company_name}</h2>
                </div>
                <button
                    onClick={handleCopy}
                    className="mt-2 sm:mt-0 flex-shrink-0 flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
                >
                    {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
                    <span className="ml-1.5">{copied ? 'Copiado!' : 'Copiar Dossiê'}</span>
                </button>
            </div>

            <div className="grid grid-cols-10 auto-rows-auto gap-4">
                {/* Summary */}
                <BentoGridItem className="col-span-10 lg:col-span-6 row-span-2 flex flex-col">
                    <h3 className="text-base font-bold text-greatek-dark-blue flex items-center mb-2">
                        <i className="bi bi-building mr-2 text-lg"></i>Resumo da Empresa
                    </h3>
                    <p className="text-sm text-text-secondary flex-grow">{parsedData.summary}</p>
                </BentoGridItem>

                {/* Pain Points */}
                <BentoGridItem className="col-span-10 lg:col-span-4 row-span-2 flex flex-col">
                     <h3 className="text-base font-bold text-greatek-dark-blue flex items-center mb-2">
                        <i className="bi bi-exclamation-triangle-fill text-yellow-600 mr-2"></i>Dores e Desafios (Inferidos)
                    </h3>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 -mr-2 flex-grow">
                        {parsedData.painPoints.length > 0 ? parsedData.painPoints.map((item, idx) => (
                            <HighlightCard key={idx} title={item.title}>{item.description}</HighlightCard>
                        )) : <p className="text-sm text-text-secondary/80 italic mt-2">Nenhum ponto de dor inferido.</p>}
                    </div>
                </BentoGridItem>

                {/* Products & Services */}
                <BentoGridItem className="col-span-10 md:col-span-5 lg:col-span-3 row-span-2 flex flex-col">
                    <h3 className="text-base font-bold text-greatek-dark-blue flex items-center mb-2">
                        <i className="bi bi-box-seam mr-2 text-lg"></i>Produtos e Serviços
                    </h3>
                    <ul className="text-sm text-text-secondary space-y-2 overflow-y-auto custom-scrollbar flex-grow pr-1">
                        {parsedData.products.map((item, idx) => {
                            const parts = item.split(/:\s*(.*)/s);
                            const title = parts[0]?.replace(/\*\*/g, '');
                            const description = parts[1] || '';
                            return (
                                <li key={idx} className="flex items-start">
                                    <i className="bi bi-check-circle-fill text-greatek-blue/50 mr-2 mt-1 flex-shrink-0"></i>
                                    <div><strong>{title}:</strong> {description}</div>
                                </li>
                            );
                        })}
                    </ul>
                </BentoGridItem>

                {/* Key People */}
                <BentoGridItem className="col-span-10 md:col-span-5 lg:col-span-3 row-span-2 flex flex-col">
                    <h3 className="text-base font-bold text-greatek-dark-blue flex items-center mb-2">
                        <i className="bi bi-people-fill mr-2 text-lg"></i>Pessoas-Chave
                    </h3>
                    <div className="flex-grow overflow-hidden">
                        <div className="h-full overflow-y-auto custom-scrollbar">
                           <DataTableView headers={parsedData.keyPeopleTable.headers} rows={parsedData.keyPeopleTable.rows} />
                        </div>
                    </div>
                </BentoGridItem>

                {/* Conversation Starters */}
                <BentoGridItem className="col-span-10 lg:col-span-4 row-span-2 flex flex-col">
                     <h3 className="text-base font-bold text-greatek-dark-blue flex items-center mb-2">
                        <i className="bi bi-chat-quote-fill text-green-600 mr-2"></i>Ganchos para Conversa
                    </h3>
                     <div className="space-y-2 flex-grow">
                        {parsedData.conversationStarters.length > 0 ? parsedData.conversationStarters.map((item, idx) => (
                            <div key={idx} className="p-2 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                                <p className="flex items-start text-sm text-green-900 leading-relaxed">
                                    <i className="bi bi-quote text-lg text-green-600 mr-2 -mt-0.5 flex-shrink-0"></i>
                                    <span>{item.replace(/"/g, '')}</span>
                                </p>
                            </div>
                        )) : <p className="text-sm text-text-secondary/80 italic mt-2">Nenhum gancho sugerido.</p>}
                    </div>
                </BentoGridItem>
            </div>
            
            {/* Greatek Solutions - Standalone Table */}
            <div className="mt-4">
                <div className="bg-white border border-greatek-border rounded-xl p-4 shadow-sm">
                    <h3 className="text-base font-bold text-greatek-dark-blue flex items-center mb-2">
                        <i className="bi bi-lightbulb-fill text-greatek-blue mr-2 text-lg"></i>Soluções Greatek Recomendadas
                    </h3>
                    {parsedData.solutionsTable.rows.length > 0 ? (
                        <DataTableView headers={parsedData.solutionsTable.headers} rows={parsedData.solutionsTable.rows} />
                    ) : (
                        <p className="text-sm text-text-secondary/80 italic mt-2 p-3 bg-gray-50 rounded-md">
                            Nenhuma solução Greatek foi recomendada com base nas informações encontradas.
                        </p>
                    )}
                </div>
            </div>

            {data.sources && data.sources.length > 0 && (
                <div className="pt-4 mt-4 border-t border-greatek-border">
                    <details>
                        <summary className="cursor-pointer text-sm font-semibold text-text-primary">
                            Fontes de Dados ({data.sources.length})
                        </summary>
                         <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                            {data.sources.map((source, idx) => (
                                <li key={idx} className="text-text-secondary leading-relaxed truncate">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline" title={source.uri}>
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </details>
                </div>
            )}
        </div>
    );
};

export default CustomerDossierViewer;
