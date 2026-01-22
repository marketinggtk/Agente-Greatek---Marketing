

import React, { useMemo, useState } from 'react';
import { PortfolioSearchResultItem } from '../types';
import { useAppStore } from '../store/useAppStore';
import Modal from './ui/Modal';

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
    const [copied, setCopied] = useState(false);
    const { showToast } = useAppStore();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            showToast(`${label} copiado!`, 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs text-text-secondary font-medium hover:text-greatek-blue transition-colors"
            title={`Copiar ${label}`}
        >
            {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
            <span>{copied ? 'Copiado' : `Copiar ${label}`}</span>
        </button>
    );
};

const DetailsParser: React.FC<{ details: string }> = ({ details }) => {
    const parsedElements = useMemo(() => {
        const elements: React.ReactNode[] = [];
        const lines = details.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('### ')) {
                elements.push(<h4 key={elements.length} className="text-sm font-bold text-greatek-dark-blue mt-4 mb-2">{trimmedLine.substring(4)}</h4>);
            } else if (trimmedLine.startsWith('- **')) {
                 const match = trimmedLine.match(/- \*\*(.*?):\*\* (.*)/);
                 if (match) {
                     elements.push(
                         <div key={elements.length} className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-gray-100">
                             <strong className="col-span-1 text-gray-600">{match[1]}:</strong>
                             <span className="col-span-2 text-gray-800">{match[2]}</span>
                         </div>
                     );
                 }
            } else if (trimmedLine.startsWith('- ')) {
                elements.push(
                    <li key={elements.length} className="flex items-start text-sm text-text-secondary">
                        <i className="bi bi-check-circle-fill text-green-600 mr-2 mt-1 flex-shrink-0"></i>
                        <span>{trimmedLine.substring(2)}</span>
                    </li>
                );
            } else if (trimmedLine === '---') {
                elements.push(<hr key={elements.length} className="my-3" />)
            } else {
                 elements.push(<p key={elements.length} className="text-sm text-text-secondary">{trimmedLine}</p>);
            }
        }
        return elements;
    }, [details]);

    return <ul className="list-none p-0 space-y-1.5">{parsedElements}</ul>;
};

const parseHighlights = (details: string): string[] => {
    if (!details) return [];
    return details.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => line.substring(2).replace(/\*\*/g, ''))
        .slice(0, 4); // Get first 4 highlights
};

const InfoBlock: React.FC<{ icon: string; title: string; children: React.ReactNode; colorClass?: string; }> = ({ icon, title, children, colorClass = 'text-greatek-blue' }) => (
    <div>
        <h3 className={`font-semibold text-greatek-dark-blue text-base flex items-center mb-2`}>
            <i className={`bi ${icon} mr-2 text-lg ${colorClass}`}></i>
            {title}
        </h3>
        {children}
    </div>
);

const ProductDetailsModalContent: React.FC<{ product: PortfolioSearchResultItem }> = ({ product }) => (
    <div className="space-y-6">
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <h3 className="font-semibold text-yellow-800 flex items-center text-base">
                <i className="bi bi-lightbulb-fill mr-2"></i>
                Por que recomendamos este produto?
            </h3>
            <p className="text-sm text-text-secondary mt-1">{product.justification}</p>
        </div>
        
        {product.use_cases && product.use_cases.length > 0 && (
            <InfoBlock icon="bi-check2-circle" title="Casos de Uso Comuns" colorClass="text-green-600">
                <ul className="list-none p-0 space-y-1 mt-1">
                    {product.use_cases.map((uc, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start">
                            <i className="bi bi-caret-right-fill text-gray-400 mr-2 mt-1 text-xs"></i>
                            <span>{uc}</span>
                        </li>
                    ))}
                </ul>
            </InfoBlock>
        )}
        {product.recommendations && (
            <InfoBlock icon="bi-person-check-fill" title="Recomendado Para" colorClass="text-purple-600">
                <p className="text-sm text-text-secondary">{product.recommendations}</p>
            </InfoBlock>
        )}
        {product.demand_profile && (
            <InfoBlock icon="bi-graph-up-arrow" title="Perfil de Demanda" colorClass="text-orange-600">
                    <p className="text-sm text-text-secondary">{product.demand_profile}</p>
            </InfoBlock>
        )}
        
        <div>
            <h3 className="font-semibold text-greatek-dark-blue text-base">Detalhes Técnicos</h3>
            <div className="mt-2 p-3 border-t border-gray-200">
                <DetailsParser details={product.details} />
            </div>
        </div>
    </div>
);


const ProductResultCardV2: React.FC<{ product: PortfolioSearchResultItem; variant: 'primary' | 'secondary' }> = ({ product, variant }) => {
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const highlights = useMemo(() => parseHighlights(product.details), [product.details]);

    if (variant === 'secondary') {
        return (
             <>
                <div 
                    className="w-full bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-greatek-blue/50 transition-all duration-300 flex flex-col h-full"
                >
                    <header>
                        <h3 className="text-lg font-bold text-greatek-dark-blue line-clamp-2">{product.name}</h3>
                        {product.code && <p className="text-xs font-mono text-text-secondary/80 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">Cód: {product.code}</p>}
                    </header>
                    
                    <div className="my-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-md">
                        <p className="text-sm text-text-secondary line-clamp-3">{product.justification}</p>
                    </div>
                    
                    <div className="flex-grow"></div>

                    <footer className="mt-3 pt-3 border-t border-dashed border-gray-200">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-center text-sm font-semibold text-greatek-blue hover:underline"
                        >
                            Ver todos os detalhes e casos de uso <i className="bi bi-arrow-right-short"></i>
                        </button>
                    </footer>
                </div>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={product.name}>
                    <ProductDetailsModalContent product={product} />
                </Modal>
            </>
        )
    }

    // --- Primary Variant ---
    return (
        <div className="w-full bg-white p-5 border-2 border-greatek-blue rounded-xl shadow-lg transition-shadow duration-300 relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-greatek-blue text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                <i className="bi bi-star-fill mr-1.5"></i>Melhor Correspondência
            </span>
            <header className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-greatek-dark-blue pr-28">{product.name}</h2>
                    {product.code && <p className="text-sm font-mono text-text-secondary/80 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">Cód: {product.code}</p>}
                </div>
            </header>
            
            <div className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <h3 className="font-semibold text-yellow-800 flex items-center text-base">
                    <i className="bi bi-lightbulb-fill mr-2"></i>
                    Por que recomendamos este produto?
                </h3>
                <p className="text-sm text-text-secondary mt-1">{product.justification}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 my-4">
                {product.use_cases && product.use_cases.length > 0 && (
                    <InfoBlock icon="bi-check2-circle" title="Casos de Uso Comuns" colorClass="text-green-600">
                        <ul className="list-none p-0 space-y-1 mt-1">
                            {product.use_cases.map((uc, i) => (
                                <li key={i} className="text-sm text-text-secondary flex items-start">
                                    <i className="bi bi-caret-right-fill text-gray-400 mr-2 mt-1 text-xs"></i>
                                    <span>{uc}</span>
                                </li>
                            ))}
                        </ul>
                    </InfoBlock>
                )}

                {product.recommendations && (
                    <InfoBlock icon="bi-person-check-fill" title="Recomendado Para" colorClass="text-purple-600">
                        <p className="text-sm text-text-secondary">{product.recommendations}</p>
                    </InfoBlock>
                )}

                {product.demand_profile && (
                    <InfoBlock icon="bi-graph-up-arrow" title="Perfil de Demanda" colorClass="text-orange-600">
                        <p className="text-sm text-text-secondary">{product.demand_profile}</p>
                    </InfoBlock>
                )}
            </div>
            
            {highlights.length > 0 && !isDetailsExpanded && (
                <div className="mb-4">
                    <h3 className="font-semibold text-greatek-dark-blue text-base mb-2">Destaques Técnicos</h3>
                    <ul className="space-y-1.5 list-none p-0">
                        {highlights.map((highlight, index) => (
                             <li key={index} className="flex items-start text-sm text-text-secondary">
                                <i className="bi bi-check-circle-fill text-green-600 mr-2 mt-1 flex-shrink-0"></i>
                                <span>{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isDetailsExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="mt-4 pt-4 border-t border-gray-200">
                     <h3 className="font-semibold text-greatek-dark-blue text-base">Todos os Detalhes</h3>
                    <div className="mt-2">
                        <DetailsParser details={product.details} />
                    </div>
                </div>
            </div>

             <footer className="mt-4 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                <button
                    onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                    className="text-sm font-semibold text-greatek-blue hover:underline"
                >
                    {isDetailsExpanded ? 'Ocultar detalhes' : 'Ver todos os detalhes'}
                    <i className={`bi bi-chevron-down ml-1 transition-transform ${isDetailsExpanded ? 'rotate-180' : ''}`}></i>
                </button>
                 <div className="flex items-center gap-4">
                     <CopyButton text={product.name} label="Nome" />
                     <CopyButton text={product.details} label="Detalhes" />
                </div>
            </footer>
        </div>
    );
};

export default ProductResultCardV2;