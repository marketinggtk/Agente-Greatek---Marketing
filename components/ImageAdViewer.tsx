import React, { useState, useRef } from 'react';
import { ImageAdPackage, isAdCopy } from '../types';
import Modal from './ui/Modal';
import { SubmitButton } from './ui/SubmitButton';
import { useAppStore } from '../store/useAppStore';

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

/**
 * Fetches an external resource (like an image or font) and converts it to a base64 data URL.
 * This is crucial for embedding external resources into an SVG to avoid canvas tainting.
 * @param url The URL of the resource to fetch.
 * @returns A promise that resolves with the data URL.
 */
const toDataURL = (url: string): Promise<string> =>
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${url}`);
            }
            return response.blob();
        })
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));

// AdComposer will render the final ad with overlays
const AdComposer = React.forwardRef<HTMLDivElement, { data: ImageAdPackage }>(({ data }, ref) => {
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
        <div ref={ref} className={`relative w-full ${getAspectRatioClass(data.aspectRatio)} bg-gray-200 rounded-lg overflow-hidden shadow-lg border border-greatek-border`}>
            <img src={data.imageUrl} alt={`Anúncio para: ${data.originalPrompt}`} className="absolute inset-0 w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="absolute inset-0 p-5 sm:p-6 flex flex-col text-white">
                {/* Logos were removed from here as per user request */}
                
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
});


const ImageAdViewer: React.FC<ImageAdViewerProps> = ({ data, onUpscale, onRegenerate }) => {
    const [copied, setCopied] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { showToast } = useAppStore();
    const adPreviewRef = useRef<HTMLDivElement>(null);

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
    
    const handleDownload = async () => {
        const hasAdCopy = isAdCopy(data.adCopy);
        const elementToRender = adPreviewRef.current;
    
        if (!elementToRender) {
            showToast('Erro ao encontrar o conteúdo para baixar.', 'error');
            return;
        }
    
        // Case 1: Simple image download (if there's no ad copy)
        if (!hasAdCopy) {
            const imgElement = elementToRender.querySelector('img');
            if (!imgElement) {
                showToast('Imagem não encontrada para download.', 'error');
                return;
            }
            const link = document.createElement('a');
            link.href = imgElement.src;
            const fileName = data.originalPrompt.replace(/[^a-z0-9]/gi, '_').slice(0, 30);
            link.download = `greatek_ad_${fileName || 'generated_image'}${data.isUpscaled ? '_upscaled' : ''}.jpeg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
    
        // Case 2: Composed ad download (image + HTML overlays)
        setIsDownloading(true);
        showToast('Preparando seu anúncio para download...', 'info');
        
        let clonedNode: HTMLElement | null = null;
        try {
            // 1. Clone the DOM node to modify it without affecting the display
            clonedNode = elementToRender.cloneNode(true) as HTMLElement;
            clonedNode.style.position = 'absolute';
            clonedNode.style.left = '-9999px'; // Render off-screen
            document.body.appendChild(clonedNode);
    
            // 2. Find all images and convert their external sources to data URLs
            const images = Array.from(clonedNode.querySelectorAll('img'));
            await Promise.all(
                images.map(async (img) => {
                    const src = img.getAttribute('src');
                    if (src && src.startsWith('http')) {
                        try {
                            const dataUrl = await toDataURL(src);
                            img.setAttribute('src', dataUrl);
                        } catch (e) {
                            console.warn(`Could not convert image to data URL: ${src}`, e);
                        }
                    }
                })
            );
    
            // 3. Get all necessary CSS
            const styleSheets = Array.from(document.styleSheets);
            let cssText = '';
            for (const sheet of styleSheets) {
                try {
                    if (sheet.cssRules) {
                         cssText += Array.from(sheet.cssRules).map(rule => rule.cssText).join(' ');
                    }
                } catch (e) {
                    console.warn('Cannot access stylesheet rules:', e);
                }
            }
             const customCss = document.querySelector('style')?.textContent || '';
             const allCss = `<style>${cssText} ${customCss}</style>`;
    
            // 4. Create the SVG with inlined content
            const width = elementToRender.offsetWidth;
            const height = elementToRender.offsetHeight;
            const serializedHtml = new XMLSerializer().serializeToString(clonedNode);
    
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                    ${allCss}
                    <foreignObject x="0" y="0" width="100%" height="100%">
                        ${serializedHtml}
                    </foreignObject>
                </svg>`;
    
            const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
    
            // 5. Render SVG to Canvas and trigger download
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = 2; // Render at 2x resolution for better quality
                canvas.width = width * scale;
                canvas.height = height * scale;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Não foi possível criar o contexto do canvas.');
                }
    
                ctx.scale(scale, scale);
                ctx.drawImage(image, 0, 0, width, height);
    
                const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
    
                const link = document.createElement('a');
                const fileName = data.originalPrompt.replace(/[^a-z0-9]/gi, '_').slice(0, 30);
                link.download = `greatek_ad_${fileName || 'gerado'}.jpeg`;
                link.href = jpegUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
    
                URL.revokeObjectURL(svgUrl);
            };
            image.onerror = () => {
                URL.revokeObjectURL(svgUrl);
                throw new Error('Erro ao carregar o SVG para a imagem.');
            };
            image.src = svgUrl;
    
        } catch (error) {
            console.error("Error creating ad image for download:", error);
            showToast('Ocorreu um erro ao preparar o download. Tente novamente.', 'error', 6000);
        } finally {
            setIsDownloading(false);
            if (clonedNode) {
                document.body.removeChild(clonedNode); // Clean up the cloned node
            }
        }
    };
    
    const isLoading = data.isUpscaling || data.isRegenerating;

    const openLightbox = () => {
      if (isLoading) return;
      setIsLightboxOpen(true);
    };

    const actionButtonClasses = "flex items-center gap-2 bg-white text-text-secondary text-sm font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed";

    const hasAdCopy = isAdCopy(data.adCopy);

    const modalTitle = `Visualização: ${
        data.originalPrompt.length > 60
        ? data.originalPrompt.substring(0, 60) + '...'
        : data.originalPrompt
    }`;

    return (
        <>
            <div className="max-w-sm w-full animate-fade-in flex flex-col items-center">
                 <div className="relative w-full cursor-pointer" onClick={openLightbox}>
                    <div ref={adPreviewRef}>
                        {hasAdCopy ? (
                            <AdComposer data={data} />
                        ) : (
                            <img 
                                src={data.imageUrl} 
                                alt={`Anúncio gerado para: ${data.originalPrompt}`}
                                className={`rounded-lg shadow-lg w-full ${getAspectRatioClass(data.aspectRatio, false)} object-cover border border-greatek-border`} 
                            />
                        )}
                    </div>
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
                title={modalTitle}
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
                         {isDownloading && (
                            <LoadingOverlay text="Renderizando anúncio..." />
                         )}
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                        <button
                            onClick={handleDownload}
                            disabled={isLoading || isDownloading}
                            className="flex items-center gap-2 bg-greatek-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-greatek-dark-blue transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:opacity-50"
                        >
                            <i className="bi bi-download"></i>
                            {isDownloading ? 'Preparando...' : (hasAdCopy ? 'Baixar Anúncio Completo' : 'Baixar Imagem')}
                        </button>
                        
                        {!data.isUpscaled && onUpscale && (
                            <button
                                onClick={onUpscale}
                                disabled={isLoading || isDownloading}
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