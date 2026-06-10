import React from 'react';
import { motion } from 'motion/react';
import { ChatSuggestion } from '../constants/chatSuggestions';

interface QuickActionChipProps {
    suggestion: ChatSuggestion;
    onClick: (prompt: string) => void;
}

export const QuickActionChip: React.FC<QuickActionChipProps> = ({ suggestion, onClick }) => {
    return (
        <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onClick(suggestion.prompt)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-greatek-blue/10 border border-slate-200/40 hover:border-greatek-blue/20 text-slate-600 hover:text-greatek-blue rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap"
        >
            {suggestion.label}
        </motion.button>
    );
};

