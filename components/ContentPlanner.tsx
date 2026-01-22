

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import ContentCalendar from './ContentCalendar';
import { SubmitButton } from './ui/SubmitButton';

const ContentPlanner: React.FC = () => {
    const { activeConversationId, conversations, generateContentPlan, isLoading, error } = useAppStore();
    const conversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    
    const [month, setMonth] = useState('');
    const [focus, setFocus] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleGenerate = () => {
        if (!month || !focus) return;
        generateContentPlan(month, focus);
    };

    // Auto-grow logic for textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [focus]);

    if (conversation?.contentPlan) {
        return <ContentCalendar plan={conversation.contentPlan} />;
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-greatek-bg-light/50 animate-fade-in overflow-y-auto">
            <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg border border-greatek-border text-center my-auto">
                <div className="mb-6">
                     <div className="w-16 h-16 bg-greatek-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="bi bi-calendar-week-fill text-4xl text-greatek-blue"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-greatek-dark-blue">Planejador de Conteúdo SEO</h1>
                    <p className="text-text-secondary mt-2">
                        Defina sua estratégia e deixe a IA criar um calendário editorial completo, focado em produtos e palavras-chave.
                    </p>
                </div>

                <div className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-semibold text-greatek-dark-blue mb-1">Mês de Planejamento</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Outubro 2025"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full p-3 border border-greatek-border rounded-lg focus:ring-2 focus:ring-greatek-blue focus:border-transparent bg-[#e9e9e9] text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-greatek-dark-blue mb-1">Foco Estratégico e Produtos</label>
                        <textarea 
                            ref={textareaRef}
                            rows={4}
                            placeholder="Ex: Quero focar em provedores de internet (ISPs). Produtos-chave: OLTs e Roteadores Wi-Fi 6. O objetivo é educar sobre a migração para fibra óptica."
                            value={focus}
                            onChange={(e) => setFocus(e.target.value)}
                            className="w-full p-3 border border-greatek-border rounded-lg focus:ring-2 focus:ring-greatek-blue focus:border-transparent resize-none bg-[#e9e9e9] text-black overflow-hidden"
                        />
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                <div className="mt-8">
                    <SubmitButton 
                        onClick={handleGenerate} 
                        disabled={isLoading || !month || !focus}
                        className="w-full py-3 text-lg font-semibold rounded-xl"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Criando Estratégia...
                            </span>
                        ) : (
                            "Gerar Calendário Editorial"
                        )}
                    </SubmitButton>
                </div>
            </div>
        </div>
    );
};

export default ContentPlanner;
