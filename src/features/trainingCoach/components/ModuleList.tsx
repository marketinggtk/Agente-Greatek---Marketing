import React from 'react';
import { TrainingModule } from '../types/trainingModule';
import { PriorityModulesSection } from './PriorityModulesSection';
import { GeneralModulesSection } from './GeneralModulesSection';

interface ModuleListProps {
    priorityModules: TrainingModule[];
    generalModules: TrainingModule[];
    filteredPriorityModules: TrainingModule[];
    filteredGeneralModules: TrainingModule[];
    searchTerm: string;
    onSelectModule: (module: TrainingModule) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ 
    priorityModules, 
    generalModules,
    filteredPriorityModules,
    filteredGeneralModules,
    searchTerm, 
    onSelectModule 
}) => {
    const isSearching = searchTerm.trim() !== '';
    
    const displayPriority = isSearching ? filteredPriorityModules : priorityModules;
    const displayGeneral = isSearching ? filteredGeneralModules : generalModules;

    if (displayPriority.length === 0 && displayGeneral.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <i className="bi bi-search text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Nenhum resultado encontrado</h3>
                <p className="text-gray-500 mt-2">Tente buscar por outro termo ou modelo.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {displayPriority.length > 0 && (
                <PriorityModulesSection 
                    modules={displayPriority} 
                    onSelectModule={onSelectModule} 
                />
            )}

            {displayGeneral.length > 0 && (
                <GeneralModulesSection 
                    modules={displayGeneral} 
                    onSelectModule={onSelectModule} 
                />
            )}
        </div>
    );
};
