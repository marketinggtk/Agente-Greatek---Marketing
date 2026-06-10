import React from 'react';
import { motion } from 'motion/react';
import { TrainingModule } from '../types/trainingModule';
import { isInvalidTitleCandidate } from '../utils/productNameExtractor';

interface ModuleCardProps {
    module: TrainingModule;
    onClick: (module: TrainingModule) => void;
    variant?: 'priority' | 'regular';
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick, variant = 'regular' }) => {
    const displayTitle = module.displayTitle || module.title;

    if (variant === 'priority') {
        return (
            <motion.button 
                onClick={() => onClick(module)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-8 rounded-[4rem] transition-all text-left relative overflow-hidden group shadow-xl hover:shadow-2xl bg-[#0081cc] text-white border-4 border-transparent hover:border-white/20 h-full flex flex-col"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <i className={`bi ${module.icon} text-[12rem]`}></i>
                </div>
                <div className="relative z-10 flex flex-col h-full min-h-[180px] w-full">
                    <div className="flex items-center justify-between mb-12">
                        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shadow-inner">
                            <i className={`bi ${module.icon} text-4xl`}></i>
                        </div>
                        <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg tracking-widest leading-none">Destaque</span>
                    </div>
                    <h3 className="text-2xl font-black mb-1 leading-tight uppercase tracking-tighter line-clamp-2">
                        {displayTitle}
                    </h3>
                    <div className="mt-auto pt-6 border-t border-white/20 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em]">
                        <span>CONSULTAR</span>
                        <i className="bi bi-chevron-right text-xl"></i>
                    </div>
                </div>
            </motion.button>
        );
    }

    return (
        <motion.button 
            onClick={() => onClick(module)} 
            whileHover={{ y: -4 }}
            className="p-6 rounded-[2rem] border-2 border-transparent bg-white hover:border-greatek-blue/40 shadow-sm hover:shadow-xl transition-all text-left group h-full flex flex-col"
        >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-greatek-blue group-hover:bg-greatek-blue group-hover:text-white transition-all transform group-hover:rotate-6">
                <i className={`bi ${module.icon} text-2xl`}></i>
            </div>
            <h3 className="font-black text-lg text-gray-900 leading-tight mb-1 group-hover:text-greatek-blue transition-colors line-clamp-2 min-h-[3rem]">
                {displayTitle}
            </h3>
        </motion.button>
    );
};
