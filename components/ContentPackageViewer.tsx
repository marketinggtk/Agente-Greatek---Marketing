import React, { useState } from 'react';
import { ContentPackage } from '../types';
import { useAppStore } from '../store/useAppStore';

// Reusable CopyButton component for consistency
const CopyButton: React.FC<{ text: string, label?: string, className?: string }> = ({ text, label = 'Copiar', className = '' }) => {
    const [copied, setCopied] = useState(false);
    const { showToast } = useAppStore();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            showToast('Copiado para a área de transferência!', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1 px-2 rounded-md transition-colors border border-gray-300 disabled:opacity-50 ${className}`}
        >
            {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
            <span className='ml-1.5'>{copied ? 'Copiado!' : label}</span>
        </button>
    );
};

// Main component
const ContentPackageViewer: React.FC<{ data: ContentPackage }> = ({ data }) => {
    const { createImageAdFromPrompt } = useAppStore();

    // Defensively access properties to handle different JSON structures from the agent
    const contentType = data.content_type || (data as any).tipo_conteudo || (data as any).tipo_de_conteudo || "Pacote de Conteúdo";
    
    let titleSuggestions: string[] = [];
    if (data.title_suggestions && Array.isArray(data.title_suggestions) && data.title_suggestions.length > 0) {
        titleSuggestions = data.title_suggestions;
    } else if ((data as any).titulo) { // From screenshot 2
        titleSuggestions = [(data as any).titulo];
    } else if ((data as any).titulo_principal) { // From screenshot 3
        titleSuggestions = [(data as any).titulo_principal];
    }
    
    const bodyContent = data.body || (data as any).legenda || (data as any).texto_sugerido || '';
    const hashtags = data.hashtags || (data as any).hashtags_sugeridas || [];
    const cta = data.cta_suggestion || '';

    // Handle various forms of image/visual suggestions
    let imagePrompt = data.image_prompt_suggestion || '';
    if (!imagePrompt && (data as any).imagens_sugeridas) {
        if (Array.isArray((data as any).imagens_sugeridas)) {
             // Handle array of strings or array of objects with 'descricao'
             imagePrompt = (data as any).imagens_sugeridas
                .map((item: any) => typeof item === 'string' ? item : item.descricao || '')
                .filter(Boolean)
                .join('\n');
        } else {
             imagePrompt = String((data as any).imagens_sugeridas);
        }
    }

    const visualElements = (data as any).elementos_visuais_sugeridos || (data as any).imagens_sugeridas || [];
    const isCarousel = Array.isArray(visualElements) && visualElements.length > 0 && typeof visualElements[0] === 'object';


    return (
        <div className="bg-greatek-bg-light/50 border border-greatek-border/50 rounded-lg shadow-sm animate-fade-in p-4 lg:p-6 space-y-4">
            <header className="pb-3 border-b border-greatek-border/50">
                <h2 className="text-sm font-semibold uppercase text-greatek-dark-blue tracking-wider">{contentType}</h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Title Suggestions */}
                    {titleSuggestions.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border border-greatek-border">
                            <h3 className="text-base font-semibold text-text-primary flex items-center mb-3">
                                <i className="bi bi-card-heading mr-3 text-lg text-greatek-blue"></i>
                                {titleSuggestions.length > 1 ? 'Sugestões de Título' : 'Título Sugerido'}
                            </h3>
                            <div className="space-y-2">
                                {titleSuggestions.map((title, index) => (
                                    <div key={index} className="flex items-center justify-between p-2.5 bg-greatek-bg-light rounded-md hover:bg-greatek-border/50 transition-colors group">
                                        <span className="text-sm text-text-secondary italic">"{title}"</span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CopyButton text={title} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Body Content */}
                    {bodyContent && (
                        <div className="bg-white p-4 rounded-lg border border-greatek-border">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-base font-semibold text-text-primary flex items-center">
                                    <i className="bi bi-body-text mr-3 text-lg text-greatek-blue"></i>
                                    Corpo do Conteúdo / Legenda
                                </h3>
                                <CopyButton text={bodyContent.replace(/\\n/g, '\n')} label="Copiar Texto" />
                            </div>
                            <div className="prose prose-sm max-w-none max-h-80 overflow-y-auto custom-scrollbar p-3 border border-greatek-border rounded-md bg-greatek-bg-light/50">
                                {bodyContent.split(/\\n|\n/).map((paragraph, index) => (
                                    paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Visual Storyboard */}
                    {isCarousel && (
                        <div className="bg-white p-4 rounded-lg border border-greatek-border">
                             <h3 className="text-base font-semibold text-text-primary flex items-center mb-3">
                                <i className="bi bi-images mr-3 text-lg text-greatek-blue"></i>
                                Storyboard Visual (Carrossel)
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                {visualElements.map((el: any, index: number) => (
                                    <div key={index} className="flex items-start gap-3 p-3 border-l-4 border-greatek-blue/30 bg-greatek-bg-light rounded-r-md">
                                        <span className="font-bold text-greatek-blue bg-greatek-blue/10 px-2 py-1 rounded-md text-sm">{el.slide || index + 1}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-greatek-dark-blue">{el.tipo}</p>
                                            <p className="text-xs text-text-secondary mt-1">{el.descricao || el.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-4">
                    {/* Image Prompt - Most important */}
                    {imagePrompt && (
                        <div className="bg-gradient-to-br from-greatek-blue to-greatek-dark-blue text-white p-4 rounded-lg shadow-lg sticky top-4">
                             <h3 className="text-base font-semibold flex items-center mb-2">
                                <i className="bi bi-image-fill mr-3 text-lg"></i>
                                Sugestão de Imagem
                            </h3>
                            <p className="text-sm italic text-white/80 mb-4 line-clamp-3">"{imagePrompt.replace(/\\n|\n/g, ' ')}"</p>
                            <button 
                                onClick={() => createImageAdFromPrompt(imagePrompt.split(/\\n|\n/)[0])}
                                className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-greatek-dark-blue bg-white rounded-lg hover:bg-greatek-bg-light transition-colors transform hover:scale-105">
                                <i className="bi bi-magic mr-2"></i>
                                Gerar Anúncio com Imagem
                            </button>
                        </div>
                    )}
                    
                    {/* CTA */}
                    {cta && (
                        <div className="bg-white p-4 rounded-lg border border-greatek-border">
                            <h4 className="text-sm font-semibold text-text-primary flex items-center mb-2">
                                <i className="bi bi-megaphone-fill mr-2 text-greatek-blue"></i>
                                Call to Action (CTA)
                            </h4>
                            <div className="flex items-start justify-between p-2 bg-greatek-bg-light rounded-md">
                                <p className="text-sm italic text-text-secondary pr-2">"{cta}"</p>
                                <CopyButton text={cta} />
                            </div>
                        </div>
                    )}

                    {/* Hashtags */}
                    {hashtags.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border border-greatek-border">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-text-primary flex items-center">
                                    <i className="bi bi-hash mr-2 text-greatek-blue"></i>
                                    Hashtags
                                </h4>
                                <CopyButton text={hashtags.join(' ')} label="Copiar Todos"/>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {hashtags.map((tag: string, index: number) => (
                                    <span key={index} className="text-xs bg-greatek-blue/10 text-greatek-blue font-medium px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentPackageViewer;
