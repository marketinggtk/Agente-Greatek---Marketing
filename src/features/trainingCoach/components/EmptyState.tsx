import React from 'react';

export const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                <i className="bi bi-search text-3xl"></i>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Nenhum produto encontrado</h3>
            <p className="text-gray-500 font-medium">Não encontramos resultados para "{searchTerm}".<br/>Tente outros termos como "OLT", "Wi-Fi 6" ou "Fusão".</p>
        </div>
    );
};
