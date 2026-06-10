import React from 'react';
import { TrainingModule } from '../types/trainingModule';
import { ModuleCard } from './ModuleCard';

interface PriorityModulesSectionProps {
    modules: TrainingModule[];
    onSelectModule: (module: TrainingModule) => void;
}

export const PriorityModulesSection: React.FC<PriorityModulesSectionProps> = ({ modules, onSelectModule }) => {
    if (modules.length === 0) return null;

    return (
        <section className="mb-20">
            <div className="flex items-center gap-4 mb-10">
                <h2 className="text-2xl font-black text-greatek-dark-blue uppercase tracking-tighter">Produtos Prioritários (Curva A)</h2>
                <div className="h-1 flex-grow bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map((module) => (
                    <ModuleCard 
                        key={module.id} 
                        module={module} 
                        onClick={onSelectModule} 
                        variant="priority" 
                    />
                ))}
            </div>
        </section>
    );
};
