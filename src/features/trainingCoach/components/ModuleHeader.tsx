import React from 'react';
import { TrainingModule } from '../types/trainingModule';
import { TabId, TABS } from '../constants/tabs';
import { isInvalidTitleCandidate } from '../utils/productNameExtractor';

interface ModuleHeaderProps {
    module: TrainingModule;
    activeTab: TabId;
    onBack: () => void;
    onTabChange: (tabId: TabId) => void;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({ module, activeTab, onBack, onTabChange }) => {
    const displayTitle = module.displayTitle || module.title;

    return (
        <div className="bg-greatek-dark-blue text-white p-6 flex flex-col md:flex-row items-center justify-between shadow-2xl relative z-10 gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <button 
                    onClick={onBack} 
                    className="w-14 h-14 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all text-white shrink-0"
                    title="Voltar para lista"
                >
                    <i className="bi bi-arrow-left text-3xl"></i>
                </button>
                <div className="min-w-0 max-w-full md:max-w-sm lg:max-w-md xl:max-w-xl">
                    <h2 className="font-black text-xl md:text-2xl uppercase tracking-tighter leading-none truncate" title={displayTitle}>
                        {displayTitle}
                    </h2>
                    <span className="text-[10px] text-white/50 uppercase tracking-[0.4em] font-black block mt-1 truncate">
                        CONSULTOR TÉCNICO SÊNIOR
                    </span>
                </div>
            </div>
            
            <div className="bg-white/10 p-1.5 rounded-[1.5rem] flex gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)} 
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-greatek-dark-blue shadow-xl' : 'text-white hover:bg-white/5'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
