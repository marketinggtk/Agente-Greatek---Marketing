import React from 'react';
import { TrainingModule } from '../types/trainingModule';
import { ModuleCard } from './ModuleCard';

interface GeneralModulesSectionProps {
    modules: TrainingModule[];
    onSelectModule: (module: TrainingModule) => void;
}

export const GeneralModulesSection: React.FC<GeneralModulesSectionProps> = ({ modules, onSelectModule }) => {
    if (modules.length === 0) return null;

    return (
        <section className="mb-20">
            <div className="flex flex-col mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-1 w-12 bg-gray-300 rounded-full"></div>
                    <h2 className="text-4xl font-black uppercase tracking-tight text-gray-800">Geral</h2>
                </div>
                <p className="text-gray-500 font-medium text-lg ml-16 italic">Consulte todos os produtos da base Greatek.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {modules.map(module => (
                    <ModuleCard 
                        key={module.id} 
                        module={module} 
                        onClick={onSelectModule} 
                        variant="regular"
                    />
                ))}
            </div>
        </section>
    );
};
