import React from 'react';
import { TrainingModule } from '../types/trainingModule';
import { buildFaqExplainPrompt } from '../utils/promptBuilder';

interface FaqTabProps {
    faqs: TrainingModule['faqs'];
    onAskInChat: (question: string) => void;
    module: TrainingModule;
    isLoading?: boolean;
}

export const FaqTab: React.FC<FaqTabProps> = ({ faqs, onAskInChat, module, isLoading }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {faqs.map((faq, i) => (
                    <div key={`faq-${i}`} className="bg-white p-10 rounded-[3rem] shadow-lg border border-gray-50 hover:border-greatek-blue/20 transition-all flex flex-col">
                        <h3 className="text-lg font-black text-greatek-dark-blue mb-6 uppercase tracking-tighter flex items-center gap-3">
                            <span className="w-10 h-10 bg-yellow-400 text-black flex items-center justify-center rounded-xl text-sm leading-none shrink-0">?</span>
                            {faq.question}
                        </h3>
                        <p className="text-gray-600 font-medium leading-relaxed mb-6 flex-grow">{faq.answer}</p>
                        <button 
                            disabled={isLoading}
                            onClick={() => {
                                if (isLoading) return;
                                const prompt = buildFaqExplainPrompt(module, faq);
                                onAskInChat(prompt);
                            }}
                            className="self-start text-[10px] font-black uppercase tracking-widest text-greatek-blue hover:text-greatek-dark-blue transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i className="bi bi-chat-dots-fill"></i> {isLoading ? 'Consultando...' : 'Explique melhor'}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="bg-blue-50 p-10 rounded-[3.5rem] border border-blue-100 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-lg">
                    <i className="bi bi-chat-right-text-fill text-3xl"></i>
                </div>
                <div className="text-center md:text-left flex-grow">
                    <h3 className="text-xl font-black uppercase text-blue-900 tracking-tighter mb-2">Ainda tem dúvidas?</h3>
                    <p className="text-blue-800/70 font-medium leading-relaxed">Use a aba de Chat para falar direto com o Consultor Sênior IA da Greatek e receber uma explicação personalizada.</p>
                </div>
                <button 
                    onClick={() => onAskInChat("")} 
                    className="shrink-0 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                    Abrir Chat
                </button>
            </div>
        </div>
    );
};
