
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import ProductResultCardV2 from './ProductResultCard';

const SkeletonCard: React.FC<{ isPrimary?: boolean }> = ({ isPrimary = false }) => (
    <div className={`w-full p-4 border border-gray-200 rounded-xl shadow-sm animate-pulse ${isPrimary ? 'min-h-[350px]' : 'min-h-[150px]'}`}>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="p-3 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
             {isPrimary && <div className="h-4 bg-gray-200 rounded w-5/6 mt-1"></div>}
        </div>
        {isPrimary && (
            <div className="mt-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3 mt-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
        )}
    </div>
);


const PortfolioSearch: React.FC = () => {
    const { conversations, activeConversationId, submitQuery, isLoading, error } = useAppStore();
    const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    const [prompt, setPrompt] = useState('');
    
    const searchResults = activeConversation?.portfolioSearchResults;

    useEffect(() => {
        // If there's a previous query in the state, populate the input
        if (activeConversation?.portfolioSearchQuery) {
            setPrompt(activeConversation.portfolioSearchQuery);
        } else {
            setPrompt('');
        }
    }, [activeConversationId, activeConversation?.portfolioSearchQuery]);

    const handleSearch = () => {
        if (!prompt.trim() || isLoading) return;
        submitQuery(prompt);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="h-full flex flex-col bg-greatek-bg-light/50 animate-fade-in">
            <header className="p-4 border-b border-greatek-border bg-white">
                <h1 className="text-xl font-bold text-greatek-dark-blue">Pesquisa Inteligente de Portfólio</h1>
                <p className="text-sm text-text-secondary mt-1">
                    Descreva uma necessidade e a IA encontrará o produto ideal para você.
                </p>
            </header>
            
            <div className="p-4 bg-white border-b border-greatek-border sticky top-0 z-10">
                <div className="relative">
                    <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: fonte nobreak para rack com gerenciamento SNMP"
                        className="w-full p-3 pl-10 rounded-lg border-2 bg-[#e9e9e9] border-greatek-border focus:ring-2 focus:ring-greatek-blue text-base text-black placeholder:text-gray-500 transition-colors"
                        disabled={isLoading}
                    />
                    <SubmitButton
                        onClick={handleSearch}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-1.5 top-1.5 h-10 px-5 rounded-md text-sm font-semibold"
                    >
                       {isLoading ? 'Buscando...' : 'Buscar'}
                    </SubmitButton>
                </div>
                {error && <p className="text-red-600 text-xs mt-2 text-center">{error}</p>}
            </div>

            <main className="flex-grow overflow-y-auto custom-scrollbar p-4">
                {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                        {/* Primary Skeleton */}
                        <SkeletonCard isPrimary />
                        {/* Secondary Skeletons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    </div>
                ) : searchResults && searchResults.length > 0 ? (
                     <div className="space-y-6 animate-fade-in-up">
                        {/* Primary Result */}
                        {searchResults.length > 0 && (
                            <div>
                                <ProductResultCardV2 product={searchResults[0]} variant="primary" />
                            </div>
                        )}
                        {/* Secondary Results */}
                        {searchResults.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.slice(1).map((result, index) => (
                                    <ProductResultCardV2 key={index} product={result} variant="secondary" />
                                ))}
                            </div>
                        )}
                    </div>
                ) : searchResults && searchResults.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-text-secondary">
                        <i className="bi bi-box2 text-5xl text-gray-300"></i>
                        <h3 className="mt-4 font-semibold text-lg text-greatek-dark-blue">Nenhum produto encontrado</h3>
                        <p className="max-w-xs mt-1 text-sm">Tente refinar sua busca com outros termos ou seja mais específico sobre sua necessidade.</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center text-text-secondary">
                        <i className="bi bi-lightbulb-fill text-5xl text-gray-300"></i>
                        <h3 className="mt-4 font-semibold text-lg text-greatek-dark-blue">Encontre a Solução Perfeita</h3>
                        <p className="max-w-xs mt-1 text-sm">Use a busca para encontrar produtos por necessidade, característica ou cenário de uso.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PortfolioSearch;
