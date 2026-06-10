import React from 'react';
import { TrainingProductModel } from '../types/trainingModule';

interface ProductModelSelectorProps {
    models: TrainingProductModel[];
    selectedModelTitle?: string;
    onSelectModel: (title: string) => void;
}

export const ProductModelSelector: React.FC<ProductModelSelectorProps> = ({ models, selectedModelTitle, onSelectModel }) => {
    return (
        <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 mb-8">
            <p className="text-[10px] font-black uppercase text-greatek-blue tracking-widest mb-6">
                Escolha o modelo que deseja consultar
            </p>
            
            <div className="flex flex-wrap gap-4">
                {models.map((model) => {
                    const isSelected = selectedModelTitle === model.title;
                    
                    return (
                        <button
                            key={model.id}
                            onClick={() => onSelectModel(model.title)}
                            className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                                isSelected 
                                    ? 'bg-greatek-blue text-white border-greatek-blue shadow-lg shadow-blue-200' 
                                    : 'bg-white text-gray-500 border-transparent hover:border-blue-200 hover:text-greatek-blue'
                            }`}
                        >
                            {model.title}
                        </button>
                    );
                })}
                
                {/* Option to clear selection */}
                {selectedModelTitle && (
                    <button
                        onClick={() => onSelectModel('')}
                        className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider text-gray-400 hover:text-red-500 transition-all border-2 border-transparent hover:border-red-100"
                    >
                        Limpar Seleção
                    </button>
                )}
            </div>
        </div>
    );
};
