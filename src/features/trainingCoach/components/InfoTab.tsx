import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TrainingModule } from '../types/trainingModule';

interface InfoTabProps {
    module: TrainingModule;
    onGoToChat: (initialMessage?: string) => void;
}

export const InfoTab: React.FC<InfoTabProps> = ({ module, onGoToChat }) => {
    const titleToUse = module.displayTitle || module.title;

    return (
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
            {/* Contextual Header */}
            <header className="mb-10">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-greatek-blue">
                    Produto em estudo
                </p>
                <h1 className="mt-3 text-3xl md:text-5xl font-black text-greatek-dark-blue tracking-tight uppercase leading-tight">
                    {module.displayTitle || module.title}
                </h1>
                {module.selectedModelTitle && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-greatek-blue/5 rounded-lg border border-greatek-blue/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-greatek-blue opacity-50"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-greatek-blue">Modelo: {module.selectedModelTitle}</span>
                    </div>
                )}
            </header>

            {/* Technical Dossier Section */}
            <section className="mb-16">
                <h2 className="text-xl md:text-2xl font-black text-greatek-dark-blue uppercase tracking-tight mb-8">
                    Ficha Técnica
                </h2>
                
                <div className="prose prose-slate prose-lg max-w-none 
                    prose-headings:text-greatek-dark-blue prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                    prose-p:text-slate-600 prose-p:leading-8
                    prose-strong:text-greatek-dark-blue prose-strong:font-bold
                    prose-hr:border-gray-100
                ">
                    <ReactMarkdown
                        components={{
                            ul: ({ children }) => (
                                <div className="space-y-1 my-4">{children}</div>
                            ),
                            li: ({ children }) => {
                                const childrenArray = React.Children.toArray(children);
                                
                                let hasBoldLabel = false;
                                let labelText = '';
                                let valueText = '';
                                
                                if (childrenArray.length >= 1) {
                                    const firstChild = childrenArray[0];
                                    if (React.isValidElement(firstChild) && (firstChild.type === 'strong' || firstChild.type === 'b')) {
                                        hasBoldLabel = true;
                                        labelText = React.Children.toArray((firstChild.props as any).children).join('');
                                        
                                        valueText = childrenArray.slice(1).map(c => {
                                            if (typeof c === 'string') return c;
                                            if (React.isValidElement(c)) {
                                                return React.Children.toArray((c as any).props.children).join('');
                                            }
                                            return '';
                                        }).join('');
                                    }
                                }
                                
                                if (hasBoldLabel) {
                                    labelText = labelText.replace(/:$/, '').trim();
                                    valueText = valueText.replace(/^[:\s\-]+/, '').trim();
                                    
                                    return (
                                        <div className="border-b border-gray-100 py-3 text-base flex flex-wrap items-baseline gap-2">
                                            <span className="font-bold text-greatek-dark-blue">{labelText}:</span>
                                            <span className="text-slate-700">{valueText}</span>
                                        </div>
                                    );
                                }
                                
                                // Fallback string contains colon
                                const simpleText = childrenArray.map(c => {
                                    if (typeof c === 'string') return c;
                                    return '';
                                }).join('');
                                
                                if (simpleText && simpleText.includes(':')) {
                                    const index = simpleText.indexOf(':');
                                    const key = simpleText.substring(0, index).trim();
                                    const val = simpleText.substring(index + 1).trim();
                                    return (
                                        <div className="border-b border-gray-100 py-3 text-base flex flex-wrap items-baseline gap-2">
                                            <span className="font-bold text-greatek-dark-blue">{key}:</span>
                                            <span className="text-slate-700">{val}</span>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div className="py-2 text-slate-600 border-b border-gray-100/40 text-base">
                                        {children}
                                    </div>
                                );
                            }
                        }}
                    >
                        {module.technicalDossier || module.mainContent || ''}
                    </ReactMarkdown>
                </div>
            </section>

            {/* Scannable Insights Block */}
            <section className="mt-16 grid gap-8 md:grid-cols-2 border-t border-gray-100 pt-10">
                <div className="border-l-4 border-greatek-blue pl-6 py-2">
                    <h3 className="font-black text-greatek-dark-blue uppercase text-sm tracking-widest flex items-center gap-3">
                        <i className="bi bi-lightbulb-fill text-yellow-400"></i>
                        Insight técnico
                    </h3>
                    <p className="text-slate-600 leading-7 mt-3 text-sm">
                        O hardware foi projetado para operações críticas de alta demanda. Foque na estabilidade para reduzir o churn da operação.
                    </p>
                    <button 
                        onClick={() => onGoToChat(`Como posso usar o insight de estabilidade para vender o ${titleToUse}?`)}
                        className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-greatek-blue hover:underline"
                    >
                        Tirar dúvida técnica →
                    </button>
                </div>

                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                    <h3 className="font-black text-greatek-dark-blue uppercase text-sm tracking-widest flex items-center gap-3">
                        <i className="bi bi-check-circle-fill text-emerald-500"></i>
                        Ponto comercial
                    </h3>
                    <p className="text-slate-600 leading-7 mt-3 text-sm">
                        Produto integrante da Curva A. Garantia nacional direta e suporte especializado para ISP. Argumento forte de pós-venda.
                    </p>
                    <button 
                        onClick={() => onGoToChat(`Fale mais sobre a garantia e suporte técnico da Greatek para o ${titleToUse}.`)}
                        className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:underline"
                    >
                        Ver detalhes de suporte →
                    </button>
                </div>
            </section>
        </div>
    );
};
