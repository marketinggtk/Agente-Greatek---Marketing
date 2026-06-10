import React from 'react';
import { TrainingModule } from '../types/trainingModule';
import { ModuleCard } from './ModuleCard';

interface CategorySectionProps {
    category: string;
    modules: TrainingModule[];
    onSelectModule: (module: TrainingModule) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ category, modules, onSelectModule }) => {
    if (modules.length === 0) return null;

    return (
        <div className="scroll-mt-6">
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{category}</h2>
                <div className="h-px flex-grow bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {modules.map(module => (
                    <ModuleCard 
                        key={module.id} 
                        module={module} 
                        onClick={onSelectModule} 
                    />
                ))}
            </div>
        </div>
    );
};
