import React from 'react';
import { motion } from 'motion/react';
import { TrainingModule } from '../types/trainingModule';
import { QUICK_QUESTIONS, ACTION_CHIPS } from '../constants/chatSuggestions';
import { QuickQuestionCard } from './QuickQuestionCard';
import { QuickActionChip } from './QuickActionChip';
import { getCategoryConsultantTip } from '../utils/getCategoryConsultantTip';

interface ChatStartPanelProps {
    module: TrainingModule;
    onSelectSuggestion: (prompt: string) => void;
}

export const ChatStartPanel: React.FC<ChatStartPanelProps> = ({ module, onSelectSuggestion }) => {
    const tip = getCategoryConsultantTip(module.category);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 py-2"
        >
            {/* Header Content & Side Note (Layout Aberto) */}
            <div className="flex flex-col md:flex-row gap-8 items-start border-b border-gray-100 pb-8">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        {module.icon && (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-greatek-dark-blue flex items-center justify-center shadow-sm">
                                <i className={`bi ${module.icon} text-lg`}></i>
                            </div>
                        )}
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-greatek-blue">
                            Consultor de Treinamento
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-greatek-dark-blue uppercase tracking-tighter">
                        Vamos analisar o **{module.title}** juntos?
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xl">
                        Tire dúvidas técnicas detalhadas ou peça dicas de venda de forma consultiva para fechar contratos de valor.
                    </p>
                </div>

                {/* Side note tip (discreta) */}
                <div className="w-full md:w-80 bg-amber-50/50 border border-amber-200/50 rounded-2xl p-5 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="bi bi-lightbulb-fill text-amber-500 text-sm"></i>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
                            Dica do Consultor
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        "{tip}"
                    </p>
                </div>
            </div>

            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Perguntas Rápidas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {QUICK_QUESTIONS.map(q => (
                        <QuickQuestionCard key={q.id} suggestion={q} onClick={onSelectSuggestion} />
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Comandos Rápidos</h4>
                <div className="flex flex-wrap gap-2.5">
                    {ACTION_CHIPS.map(c => (
                        <QuickActionChip key={c.id} suggestion={c} onClick={onSelectSuggestion} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

