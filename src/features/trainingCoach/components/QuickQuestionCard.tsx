import React from 'react';
import { motion } from 'motion/react';
import { ChatSuggestion } from '../constants/chatSuggestions';

interface QuickQuestionCardProps {
    suggestion: ChatSuggestion;
    onClick: (prompt: string) => void;
}

export const QuickQuestionCard: React.FC<QuickQuestionCardProps> = ({ suggestion, onClick }) => {
    return (
        <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(suggestion.prompt)}
            className="p-4 text-left bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 rounded-xl transition-all group flex items-start gap-3 h-full"
        >
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 group-hover:text-greatek-blue group-hover:border-greatek-blue/30 transition-colors">
                <i className="bi bi-chat-right-text text-xs"></i>
            </div>
            <p className="text-xs font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                {suggestion.label}
            </p>
        </motion.button>
    );
};

