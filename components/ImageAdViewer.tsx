
import React, { useState, useRef } from 'react';
import { ImageAdPackage, isAdCopy } from '../types';
import Modal from './ui/Modal';
import { useAppStore } from '../store/useAppStore';
import { GREATEK_LOGO_URL } from '../services/knowledgeBase';

interface ImageAdViewerProps {
  data: ImageAdPackage;
  onUpscale?: () => void;
  onRegenerate?: () => void;
}

const LoadingOverlay: React.FC<{ text: string }> = ({ text }) => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg animate-fade-in z-20">
        <div className="w-8 h-8 border-4 border-greatek-blue/20 border-t-greatek-blue rounded-full animate-spin"></div>
        <p className="mt-3 font-semibold text-greatek-dark-blue text-sm px-4 text-center">{text}</p>
    </div>
);

/**
 * Utilitário para converter URL em DataURL (Base64)
 * Essencial para evitar "Canvas Tainting" e permitir download de imagens externas
 */
const toDataURL = async (url: string): Promise<string | null> => {
    // Helper to read blob to base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    try {
        // Tentativa 1: Fetch direto (funciona se o servidor suportar CORS)
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const blob = await response.blob();
        return await blobToBase64(blob);
    } catch (e) {
        console.warn(`Fetch direto falhou para ${url}, tentando proxy...`);
        try {
            // Tentativa 2: Usar um Proxy CORS
            // Nota: Em produção, o ideal é ter um proxy próprio no backend.
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Proxy Status ${response.status}`);
            const blob = await response.blob();
            return await blobToBase64(blob);
        } catch (proxyError) {
            console.error(`Falha crítica ao converter imagem: ${url}`, proxyError);
            return null; // Retorna null para indicar falha
        }
    }
};

const AdComposer = React.forwardRef<HTMLDivElement, { data: ImageAdPackage }>(({ data }, ref) => {
    const getAspectRatioClass = (ratio?: string) => {
        switch (ratio) {
            case '9:16': return 'aspect-[9/16]';
            case '16:9': return 'aspect-[16/9]';
            case '4:3': return 'aspect-[4/3]';
            case '3:4': return 'aspect-[3/4]';
            case '1:1': return 'aspect-square';
            default: return 'aspect-[9/16]';
        }
    };

    return (
        <div ref={ref} className={`relative w-full ${getAspectRatioClass(data.aspectRatio)} bg-gray-200 rounded-lg overflow-hidden shadow-lg border border-greatek-border`}>
            {/* Background Image */}
            <img src={data.imageUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
            
            {/* Content Container */}
            <div className="absolute inset-0 p-6 flex flex-col text-white">
                <header className="flex justify-between items-start">
                    <img src={GREATEK_LOGO_URL} alt="Greatek" className="h-8 sm:h-10 w-auto object-contain drop-shadow-md" crossOrigin="anonymous" />
                    {data.partnerLogoUrl && (
                        <img src={data.partnerLogoUrl} alt="Partner" className="h-6 sm:h-8 w-auto object-contain bg-white/10 rounded px-1 drop-shadow-md" crossOrigin="anonymous" />
                    )}
                </header>
                
                <div className="flex-grow"></div>

                <main className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight uppercase" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>
                        {data.adCopy?.headline}
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg font-medium text-white/90 line-clamp-3" style={{ textShadow: '1px 1px 5px rgba(0,0,0,0.8)' }}>
                        {data.adCopy?.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                        {data.adCopy?.highlights.slice(0, 3).map((highlight, index) => (
                            <span key={index} className="bg-lime-400 text-black text-[10px] sm:text-xs font-black px-2 py-1 rounded shadow-sm">
                                {highlight.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </main>

                <footer className="mt-6">
                    <div className="bg-white text-greatek-blue font-black text-center text-base sm:text-lg w-full py-3 rounded-lg shadow-xl">
                        {data.adCopy?.cta.toUpperCase() || 'SAIBA MAIS'}
                    </div>
                    <p className="text-[10px] text-white/50 mt-3 text-center uppercase tracking-widest">
                        Greatek © 2025 • Imagem gerada por IA
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

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(data.generatedPrompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleDownload = async () => {
        const elementToRender = adPreviewRef.current;
        if (!elementToRender) return;

        setIsDownloading(true);
        showToast('Preparando anúncio de alta qualidade...', 'info');

        let clonedNode: HTMLElement | null = null;
        try {
            // 1. Clonar e preparar o nó para serialização XML
            clonedNode = elementToRender.cloneNode(true) as HTMLElement;
            clonedNode.style.width = `${elementToRender.offsetWidth}px`;
            clonedNode.style.height = `${elementToRender.offsetHeight}px`;
            clonedNode.style.position = 'relative';
            clonedNode.style.top = '0';
            clonedNode.style.left = '0';
            
            // Importante: Adicionar namespace XHTML para foreignObject
            clonedNode.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

            // 2. Converter TODAS as imagens do clone para Base64 (CORS)
            const images = Array.from(clonedNode.querySelectorAll('img'));
            await Promise.all(images.map(async (img) => {
                const src = img.getAttribute('src');
                // Apenas tenta converter se for uma URL externa (http/https)
                if (src && src.startsWith('http')) {
                    const dataUrl = await toDataURL(src);
                    if (dataUrl) {
                        img.setAttribute('src', dataUrl);
                        // Remover crossorigin para evitar conflitos com base64
                        img.removeAttribute('crossorigin'); 
                    } else {
                        // Se falhar a conversão, removemos a imagem para evitar "Tainted Canvas"
                        console.warn(`Removendo imagem insegura do download: ${src}`);
                        img.remove();
                    }
                }
            }));

            // 3. Capturar estilos e inlays de CSS
            const styleSheets = Array.from(document.styleSheets);
            let cssText = '';
            for (const sheet of styleSheets) {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    cssText += rules.map(rule => rule.cssText).join('\n');
                } catch (e) {
                    // Ignora erros de cross-domain styles
                }
            }
            
            // Adiciona estilos customizados do tailwind/inline
            const customStyles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
            const fullCss = `<style>${cssText}\n${customStyles}</style>`;

            // 4. Montar o SVG
            const width = elementToRender.offsetWidth;
            const height = elementToRender.offsetHeight;
            const serializedHtml = new XMLSerializer().serializeToString(clonedNode);
            
            // Encapsula em um SVG com o namespace correto
            const svgData = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                    <foreignObject width="100%" height="100%">
                        ${fullCss}
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
                            ${serializedHtml}
                        </div>
                    </foreignObject>
                </svg>
            `;

            // 5. Renderizar o SVG no Canvas para gerar o JPEG
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const scale = 2; // Qualidade 2x
                    canvas.width = width * scale;
                    canvas.height = height * scale;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error("Falha ao criar contexto canvas");

                    ctx.scale(scale, scale);
                    ctx.drawImage(img, 0, 0, width, height);

                    const link = document.createElement('a');
                    link.download = `greatek_ad_${Date.now()}.jpg`;
                    link.href = canvas.toDataURL('image/jpeg', 0.9);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showToast('Download concluído com sucesso!', 'success');
                } catch (err) {
                    console.error("Erro na exportação final:", err);
                    showToast('Erro de segurança ao exportar imagem. Tente baixar apenas a imagem de fundo.', 'error');
                } finally {
                    URL.revokeObjectURL(url);
                    setIsDownloading(false);
                }
            };

            img.onerror = () => {
                showToast('Falha crítica na renderização do anúncio.', 'error');
                setIsDownloading(false);
            };

            img.src = url;

        } catch (error) {
            console.error("Erro no processo de download:", error);
            showToast('Ocorreu um erro ao preparar o arquivo.', 'error');
            setIsDownloading(false);
        }
    };

    const isLoading = data.isUpscaling || data.isRegenerating;

    return (
        <>
            <div className="max-w-sm w-full animate-fade-in flex flex-col items-center">
                 <div className="relative w-full cursor-pointer" onClick={() => !isLoading && setIsLightboxOpen(true)}>
                    <div ref={adPreviewRef}>
                        {isAdCopy(data.adCopy) ? (
                            <AdComposer data={data} />
                        ) : (
                            <img 
                                src={data.imageUrl} 
                                alt="Preview"
                                className="rounded-lg shadow-lg w-full aspect-square object-cover border border-greatek-border" 
                            />
                        )}
                    </div>
                    {isLoading && (
                        <div className="absolute inset-0">
                           {data.isUpscaling && <LoadingOverlay text="Melhorando qualidade (2x)..." />}
                           {data.isRegenerating && <LoadingOverlay text="Gerando nova versão..." />}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <button 
                        onClick={() => setIsLightboxOpen(true)} 
                        disabled={isLoading} 
                        className="flex items-center gap-2 bg-white text-text-secondary text-xs font-bold py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        <i className="bi bi-arrows-fullscreen"></i> Ver Detalhes
                    </button>
                    {onRegenerate && (
                        <button 
                            onClick={onRegenerate} 
                            disabled={isLoading} 
                            className="flex items-center gap-2 bg-white text-text-secondary text-xs font-bold py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            <i className="bi bi-arrow-repeat"></i> Outra Versão
                        </button>
                    )}
                </div>

                <details className="w-full bg-greatek-bg-light/80 rounded-lg border border-greatek-border overflow-hidden mt-3">
                    <summary className="p-3 cursor-pointer text-xs font-bold text-greatek-dark-blue flex justify-between items-center">
                        Prompt Detalhado da IA
                        <i className="bi bi-chevron-down"></i>
                    </summary>
                    <div className="p-3 border-t border-greatek-border bg-white">
                        <p className="text-[10px] text-text-secondary italic mb-2 break-words">
                            {data.generatedPrompt}
                        </p>
                        <button
                            onClick={handleCopyPrompt}
                            className="flex items-center space-x-1.5 text-[10px] bg-white hover:bg-greatek-bg-light text-text-secondary font-bold py-1 px-2 rounded border border-gray-300 transition-colors"
                        >
                            {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
                            <span>{copied ? 'Copiado!' : 'Copiar Prompt'}</span>
                        </button>
                    </div>
                </details>
            </div>

            <Modal
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                title="Editor de Anúncio Gerado"
            >
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-1/2 relative">
                        {isAdCopy(data.adCopy) ? <AdComposer data={data} /> : (
                            <img src={data.imageUrl} className="w-full rounded-lg shadow-2xl border border-gray-200" alt="Full view" />
                        )}
                        {isDownloading && <LoadingOverlay text="Renderizando anúncio em alta resolução..." />}
                    </div>

                    <div className="w-full lg:w-1/2 space-y-6">
                        <div className="bg-greatek-bg-light p-4 rounded-xl border border-greatek-border">
                            <h3 className="font-bold text-greatek-dark-blue flex items-center gap-2 mb-3">
                                <i className="bi bi-download text-greatek-blue"></i>Opções de Download
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={isLoading || isDownloading}
                                    className="flex items-center justify-center gap-3 bg-greatek-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-greatek-dark-blue transition-all shadow-md disabled:opacity-50"
                                >
                                    <i className="bi bi-image-fill"></i>
                                    {isDownloading ? 'Processando...' : 'Baixar Anúncio Completo (JPG)'}
                                </button>
                                
                                <a 
                                    href={data.imageUrl} 
                                    download="greatek_base_image.jpg"
                                    className="flex items-center justify-center gap-3 bg-white text-text-secondary font-bold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                                >
                                    <i className="bi bi-file-earmark-image"></i> Baixar apenas Imagem Base
                                </a>
                            </div>
                        </div>

                        {!data.isUpscaled && onUpscale && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-sm font-bold text-blue-800 mb-2">A imagem parece em baixa resolução?</h4>
                                <button
                                    onClick={onUpscale}
                                    disabled={isLoading || isDownloading}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all text-sm"
                                >
                                    <i className="bi bi-stars"></i> Aumentar Resolução (IA Upscale 2x)
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-bold text-greatek-dark-blue border-b pb-2">Cópia do Anúncio</h3>
                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Headline</p>
                                    <p className="text-sm font-bold text-gray-800">{data.adCopy?.headline}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Descrição</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{data.adCopy?.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ImageAdViewer;
