
import React, { useState } from 'react';
import { ImageAdPackage, isAdCopy } from '../types';
import Modal from './ui/Modal';
import { SubmitButton } from './ui/SubmitButton';
import { GREATEK_LOGO_URL } from '../services/knowledgeBase';

interface ImageAdViewerProps {
  data: ImageAdPackage;
  onUpscale?: () => void;
  onRegenerate?: () => void;
}

const LoadingOverlay: React.FC<{ text: string }> = ({ text }) => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg animate-fade-in z-20">
        <div className="w-8 h-8 border-4 border-greatek-blue/20 border-t-greatek-blue rounded-full animate-spin"></div>
        <p className="mt-3 font-semibold text-greatek-dark-blue">{text}</p>
    </div>
);

// AdComposer will render the final ad with overlays
const AdComposer: React.FC<{ data: ImageAdPackage }> = ({ data }) => {
    if (!data.adCopy) return null;

    const getAspectRatioClass = (ratio?: string) => {
        switch (ratio) {
            case '9:16': return 'aspect-[9/16]';
            case '16:9': return 'aspect-[16/9]';
            case '4:3': return 'aspect-[4/3]';
            case '3:4': return 'aspect-[3/4]';
            case '1:1': return 'aspect-square';
            default: return 'aspect-[9/16]'; // Default to stories
        }
    };

    return (
        <div className={`relative w-full ${getAspectRatioClass(data.aspectRatio)} bg-gray-200 rounded-lg overflow-hidden shadow-lg border border-greatek-border`}>
            <img src={data.imageUrl} alt={`Anúncio para: ${data.originalPrompt}`} className="absolute inset-0 w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="absolute inset-0 p-5 sm:p-6 flex flex-col text-white">
                <header className="flex justify-between items-start">
                    <img src={GREATEK_LOGO_URL} alt="Greatek Logo" className="h-5 sm:h-6" />
                    {data.partnerLogoUrl && <img src={data.partnerLogoUrl} alt="Partner Logo" className="h-7 sm:h-8 max-w-[80px] object-contain" />}
                </header>
                
                <div className="flex-grow"></div>

                <main className="space-y-2 text-shadow">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>{data.adCopy.headline}</h1>
                    <p className="text-base lg:text-lg font-medium" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>{data.adCopy.description}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                        {data.adCopy.highlights.slice(0, 3).map((highlight, index) => (
                            <span key={index} className="bg-lime-400 text-black text-xs sm:text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                {highlight}
                            </span>
                        ))}
                    </div>
                </main>

                <footer className="mt-5">
                    <button className="bg-white text-greatek-blue font-bold text-lg w-full py-3 rounded-lg hover:bg-gray-200 transition-colors">
                        {data.adCopy.cta.toUpperCase()}
                    </button>
                    <p className="text-xs text-white/60 mt-2 text-center">
                        Imagem meramente ilustrativa. Promoção válida enquanto durarem os estoques.
                    </p>
                </footer>
            </div>
        </div>
    );
};


const ImageAdViewer: React.FC<ImageAdViewerProps> = ({ data, onUpscale, onRegenerate }) => {
    const [copied, setCopied] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const getAspectRatioClass = (ratio?: string, forAd: boolean = false) => {
        switch (ratio) {
            case '9:16': return 'aspect-[9/16]';
            case '16:9': return 'aspect-[16/9]';
            case '4:3': return 'aspect-[4/3]';
            case '3:4': return 'aspect-[3/4]';
            case '1:1': return 'aspect-square';
            default: return forAd ? 'aspect-[9/16]' : 'aspect-square'; // Different defaults
        }
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(data.generatedPrompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = data.imageUrl;
        const fileName = data.originalPrompt.replace(/[^a-z0-9]/gi, '_').slice(0, 30);
        link.download = `greatek_ad_${fileName || 'generated_image'}${data.isUpscaled ? '_upscaled' : ''}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const openLightbox = () => {
      setIsLightboxOpen(true);
    };

    const isLoading = data.isUpscaling || data.isRegenerating;
    const actionButtonClasses = "flex items-center gap-2 bg-white text-text-secondary text-sm font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed";

    const hasAdCopy = isAdCopy(data.adCopy);

    return (
        <>
            <div className="max-w-sm w-full animate-fade-in flex flex-col items-center">
                 <div className="relative w-full">
                    {hasAdCopy ? (
                        <AdComposer data={data} />
                    ) : (
                        <img 
                            src={data.imageUrl} 
                            alt={`Anúncio gerado para: ${data.originalPrompt}`}
                            className={`rounded-lg shadow-lg w-full ${getAspectRatioClass(data.aspectRatio, false)} object-cover border border-greatek-border`} 
                        />
                    )}
                    {isLoading && (
                        <div className="absolute inset-0">
                           {data.isUpscaling && <LoadingOverlay text="Melhorando a imagem..." />}
                           {data.isRegenerating && <LoadingOverlay text="Gerando novamente..." />}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <button onClick={openLightbox} disabled={isLoading} className={actionButtonClasses}><i className="bi bi-arrows-fullscreen mr-1"></i>Ver Imagem</button>
                    {onRegenerate && <button onClick={onRegenerate} disabled={isLoading} className={actionButtonClasses}><i className="bi bi-arrow-repeat mr-1"></i>Gerar Novamente</button>}
                </div>

                <details className="w-full bg-greatek-bg-light/80 rounded-lg border border-greatek-border overflow-hidden mt-3">
                    <summary className="p-3 cursor-pointer text-sm font-semibold text-greatek-dark-blue flex justify-between items-center">
                        Ver prompt de imagem detalhado
                        <i className="bi bi-chevron-down transition-transform duration-200 ui-open:rotate-180"></i>
                    </summary>
                    <div className="p-3 border-t border-greatek-border bg-white">
                        <p className="text-xs text-text-secondary italic mb-2 break-words">
                            {data.generatedPrompt}
                        </p>
                        <button
                            onClick={handleCopyPrompt}
                            className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1 px-2 rounded-md transition-colors border border-gray-300"
                        >
                            {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
                            <span className='ml-1.5'>{copied ? 'Copiado!' : 'Copiar Prompt'}</span>
                        </button>
                    </div>
                </details>
            </div>

            <Modal
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                title={`Visualização: ${data.originalPrompt}`}
            >
                <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl">
                         <img
                            src={data.imageUrl}
                            alt={`Imagem de fundo para: ${data.originalPrompt}`}
                            className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg mx-auto"
                        />
                        {isLoading && (
                             <div className="absolute inset-0">
                                {data.isUpscaling && <LoadingOverlay text="Melhorando a imagem..." />}
                                {data.isRegenerating && <LoadingOverlay text="Gerando novamente..." />}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                        <button
                            onClick={handleDownload}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-greatek-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-greatek-dark-blue transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:opacity-50"
                        >
                            <i className="bi bi-download"></i>
                            {data.isUpscaled ? 'Baixar Imagem Melhorada' : 'Baixar Imagem'}
                        </button>
                        
                        {!data.isUpscaled && onUpscale && (
                            <button
                                onClick={onUpscale}
                                disabled={isLoading}
                                className={actionButtonClasses}
                            >
                                <i className="bi bi-stars mr-1"></i>
                                Melhorar Qualidade (2x)
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ImageAdViewer;