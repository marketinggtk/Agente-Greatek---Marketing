import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleList } from './components/ModuleList';
import { ModuleView } from './components/ModuleView';
import { EmptyState } from './components/EmptyState';
import { useTrainingModules } from './hooks/useTrainingModules';
import { TrainingModule } from './types/trainingModule';
import { useAppStore } from '../../../store/useAppStore';
import { AppMode } from '../../../types';

const TrainingCoachPage: React.FC = () => {
    const { 
        conversations, 
        activeConversationId, 
        updateConversationTitle, 
        setSelectedModuleForConversation 
    } = useAppStore();

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const selectedModule = activeConversation?.mode === AppMode.TRAINING_COACH 
        ? (activeConversation.selectedModule || null) 
        : null;

    const { 
        searchTerm, 
        setSearchTerm, 
        filteredModules, 
        priorityModules,
        generalModules,
        filteredPriorityModules,
        filteredGeneralModules
    } = useTrainingModules();

    const handleSelectModule = (module: TrainingModule) => {
        if (activeConversationId) {
            setSelectedModuleForConversation(activeConversationId, module);
            updateConversationTitle(activeConversationId, module.displayTitle || module.title);
        }
    };

    const handleBack = () => {
        if (activeConversationId) {
            setSelectedModuleForConversation(activeConversationId, null);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden font-sans">
            <AnimatePresence mode="wait">
                {!selectedModule ? (
                    <motion.div 
                        key="list-view" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="flex-grow p-6 md:p-10 overflow-y-auto"
                    >
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-12">
                                <h1 className="text-4xl font-black text-greatek-dark-blue mb-4 uppercase tracking-tighter">Consultor de Produtos Sênior</h1>
                                <p className="text-gray-500 font-medium tracking-tight">Tire dúvidas técnicas, receba dicas de venda e domine o portfólio completo.</p>
                            </div>

                            <div className="mb-12 relative max-w-2xl">
                                <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                                <input 
                                    type="text" 
                                    placeholder="Qual produto você quer consultar agora?" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="w-full pl-14 pr-6 py-6 rounded-3xl border-2 border-gray-100 shadow-sm focus:ring-8 focus:ring-greatek-blue/5 bg-white font-medium text-lg transition-all outline-none" 
                                />
                            </div>

                            {filteredModules.length > 0 ? (
                                <ModuleList 
                                    priorityModules={priorityModules}
                                    generalModules={generalModules}
                                    filteredPriorityModules={filteredPriorityModules}
                                    filteredGeneralModules={filteredGeneralModules}
                                    searchTerm={searchTerm}
                                    onSelectModule={handleSelectModule}
                                />
                            ) : (
                                <EmptyState searchTerm={searchTerm} />
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <ModuleView 
                        key="product-view"
                        module={selectedModule} 
                        onBack={handleBack} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainingCoachPage;
