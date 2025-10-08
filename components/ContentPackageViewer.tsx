
import React, { useState } from 'react';
import { ContentPackage } from '../types';
import { useAppStore } from '../store/useAppStore';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const { showToast } = useAppStore();

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            showToast('Copiado para a área de transferência!', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1 px-2 rounded-md transition-colors border border-gray-300 disabled:opacity-50"
        >
            {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
            <span className='ml-1.5'>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
    );
};


const ContentPackageViewer: React.FC<{ data: ContentPackage }> = ({ data }) => {
    const { createImageAdFromPrompt } = useAppStore();

    return (
        <div className="bg-white border border-greatek-border rounded-lg shadow-sm overflow-hidden animate-fade-in">
            <header className="p-4 bg-greatek-bg-light/80 border-b border-greatek-border">
                <h2 className="text-sm font-semibold uppercase text-greatek-dark-blue tracking-wider">{data.content_type}</h2>
            </header>

            <div className="p-4 space-y-6">
                
                {/* Títulos */}
                <div>
                    <h3 className="text-base font-semibold text-text-primary flex items-center mb-2">
                        <i className="bi bi-card-heading mr-3 text-lg text-greatek-blue"></i>
                        Sugestões de Título
                    </h3>
                    <div className="space-y-2">
                        {data.title_suggestions.map((title, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-greatek-bg-light rounded-md">
                                <span className="text-sm text-text-secondary italic">"{title}"</span>
                                <CopyButton text={title} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Corpo do Conteúdo e Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-base font-semibold text-text-primary flex items-center">
                                <i className="bi bi-body-text mr-3 text-lg text-greatek-blue"></i>
                                Corpo do Conteúdo
                            </h3>
                            <CopyButton text={data.body} />
                        </div>
                        <div className="prose prose-sm max-w-none p-4 border border-greatek-border rounded-md bg-greatek-bg-light/50 h-64 overflow-y-auto custom-scrollbar">
                            {data.body.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Hashtags */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-text-primary flex items-center">
                                    <i className="bi bi-hash mr-2 text-greatek-blue"></i>
                                    Hashtags
                                </h4>
                                <CopyButton text={data.hashtags.join(' ')} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {data.hashtags.map((tag, index) => (
                                    <span key={index} className="text-xs bg-greatek-blue/10 text-greatek-blue font-medium px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* CTA */}
                        <div>
                            <h4 className="text-sm font-semibold text-text-primary flex items-center mb-2">
                                <i className="bi bi-megaphone-fill mr-2 text-greatek-blue"></i>
                                Call to Action (CTA)
                            </h4>
                            <p className="text-xs italic text-text-secondary bg-greatek-bg-light p-2 rounded-md">"{data.cta_suggestion}"</p>
                        </div>
                    </div>
                </div>

                {/* Sugestão de Imagem */}
                <div className="p-4 bg-greatek-dark-blue/5 rounded-lg border border-greatek-blue/20">
                    <h3 className="text-base font-semibold text-text-primary flex items-center mb-2">
                        <i className="bi bi-image-fill mr-3 text-lg text-greatek-blue"></i>
                        Sugestão de Imagem
                    </h3>
                    <p className="text-sm text-text-secondary italic mb-3">"{data.image_prompt_suggestion}"</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <button 
                            onClick={() => createImageAdFromPrompt(data.image_prompt_suggestion)}
                            className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-greatek-blue rounded-lg hover:bg-greatek-dark-blue transition-colors">
                            <i className="bi bi-magic mr-2"></i>
                            Gerar Imagem
                        </button>
                         <p className="text-xs text-text-secondary/80">
                            Isso criará uma nova conversa com o Agente Gerador de Imagens.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContentPackageViewer;