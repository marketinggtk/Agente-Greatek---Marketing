import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PresentationSlide, PresentationTheme } from '../types';
import { useAppStore } from '../store/useAppStore';
import { generateImageAd } from '../services/geminiService';

interface EditableSlideProps {
    slide: PresentationSlide;
    theme: PresentationTheme;
    onUpdate: (slideId: string, field: keyof PresentationSlide, value: any) => void;
    onDelete: (slideId: string) => void;
    onExport: (slideId: string) => void;
    onUserImageUpdate: (slideId: string, imageBase64: string | null) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// FIX: Refactored AutoGrowTextarea to use React.forwardRef to correctly accept a ref from its parent component.
const AutoGrowTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const resolvedRef = ref || internalRef;

    useEffect(() => {
        const element = (resolvedRef as React.RefObject<HTMLTextAreaElement>)?.current;
        if (element) {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        }
    }, [props.value, resolvedRef]);

    return <textarea ref={resolvedRef} {...props} />;
});
AutoGrowTextarea.displayName = 'AutoGrowTextarea';


const EditableField: React.FC<{ value: string; onChange: (newValue: string) => void; multiline?: boolean; className?: string; placeholder?: string }> = ({ value, onChange, multiline = false, className = '', placeholder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onChange(currentValue);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            setIsEditing(false);
            setCurrentValue(value);
        }
    };
    
    if (isEditing) {
        if (multiline) {
            return <AutoGrowTextarea
                ref={inputRef as React.Ref<HTMLTextAreaElement>}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`w-full bg-white border-2 border-greatek-blue rounded-md focus:outline-none resize-none overflow-hidden ${className}`}
                placeholder={placeholder}
            />
        }
        return <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-white border-2 border-greatek-blue rounded-md focus:outline-none ${className}`}
            placeholder={placeholder}
        />
    }

    const renderMarkdown = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    return (
        <div onClick={() => setIsEditing(true)} className={`w-full cursor-text p-1 border-2 border-transparent hover:border-greatek-border/50 rounded-md transition-colors ${className}`}>
             {renderMarkdown(value || '')}
        </div>
    );
};

const EditableSlide: React.FC<EditableSlideProps> = ({ slide, theme, onUpdate, onDelete, onExport, onUserImageUpdate }) => {
    const { updateSlideImage, showToast } = useAppStore();
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateImage = async () => {
        if (!slide.image_prompt_suggestion) return;
        setIsGeneratingImage(true);
        try {
            const result = await generateImageAd(slide.image_prompt_suggestion, undefined, undefined);
            updateSlideImage(slide.id, result.imageUrl);
            showToast('Imagem gerada com sucesso!', 'success');
        } catch (error) {
            console.error("Image generation failed:", error);
            showToast('Falha ao gerar a imagem.', 'error');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        if (file.size > 4 * 1024 * 1024) { // 4MB limit
            showToast('A imagem é muito grande. O limite é 4MB.', 'error');
            return;
        }
        
        setIsUploading(true);
        try {
            const base64 = await fileToBase64(file);
            onUserImageUpdate(slide.id, base64);
        } catch (err) {
            showToast('Falha ao processar a imagem.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const renderContent = () => {
        switch (slide.slide_type) {
            case 'key_metrics':
                const metrics = slide.content.metrics || [];
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {metrics.map((metric: any, index: number) => (
                            <div key={index} className="p-4 bg-greatek-blue/10 rounded-lg text-center">
                                <EditableField
                                    value={metric.value}
                                    onChange={(val) => {
                                        const newMetrics = [...metrics];
                                        newMetrics[index].value = val;
                                        onUpdate(slide.id, 'content', { ...slide.content, metrics: newMetrics });
                                    }}
                                    className="text-3xl font-bold text-greatek-dark-blue text-center"
                                />
                                 <EditableField
                                    value={metric.label}
                                    onChange={(val) => {
                                        const newMetrics = [...metrics];
                                        newMetrics[index].label = val;
                                        onUpdate(slide.id, 'content', { ...slide.content, metrics: newMetrics });
                                    }}
                                    className="text-sm text-text-secondary text-center"
                                />
                            </div>
                        ))}
                    </div>
                );
            case 'three_column_cards':
                 const cards = slide.content.cards || [];
                 return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {cards.map((card: any, index: number) => (
                             <div key={index} className="p-4 bg-white rounded-lg border border-greatek-border flex flex-col">
                                <EditableField
                                    value={card.title}
                                    onChange={(val) => {
                                        const newCards = [...cards];
                                        newCards[index].title = val;
                                        onUpdate(slide.id, 'content', { ...slide.content, cards: newCards });
                                    }}
                                    className="font-bold text-greatek-dark-blue"
                                />
                                <EditableField
                                    value={card.description}
                                    onChange={(val) => {
                                        const newCards = [...cards];
                                        newCards[index].description = val;
                                        onUpdate(slide.id, 'content', { ...slide.content, cards: newCards });
                                    }}
                                    multiline
                                    className="text-sm text-text-secondary mt-1"
                                />
                            </div>
                        ))}
                    </div>
                 );
            default: // Caters to title, section, agenda, bullets, closing
                const contentArray = Array.isArray(slide.content) ? slide.content : [String(slide.content)];
                return (
                    <div className="space-y-2">
                        {contentArray.map((item, index) => (
                            <div key={index} className="flex items-start">
                               <span className="text-greatek-blue mr-2 mt-1.5 flex-shrink-0">•</span>
                                <EditableField
                                    value={item}
                                    onChange={(val) => {
                                        const newContent = [...contentArray];
                                        newContent[index] = val;
                                        onUpdate(slide.id, 'content', newContent);
                                    }}
                                    multiline
                                    className="w-full text-base text-text-secondary leading-relaxed"
                                />
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            
            {/* Slide Preview / Editor */}
            <div className={`p-6 bg-white border border-greatek-border rounded-lg shadow-sm min-h-[300px]`}>
                 <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                         <EditableField
                            value={slide.title}
                            onChange={(val) => onUpdate(slide.id, 'title', val)}
                            className="text-2xl font-bold text-greatek-dark-blue"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => onExport(slide.id)} title="Exportar este slide para PDF" className="text-gray-400 hover:text-greatek-blue p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <i className="bi bi-download"></i>
                        </button>
                        <button onClick={() => onDelete(slide.id)} title="Excluir slide" className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
                            <i className="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </div>
                 <div className="mt-6">
                    {renderContent()}
                 </div>
                 {slide.summary && (
                     <div className="mt-6 pt-4 border-t border-greatek-border">
                          <EditableField
                            value={slide.summary}
                            onChange={(val) => onUpdate(slide.id, 'summary', val)}
                            className="text-sm text-text-secondary italic"
                         />
                     </div>
                 )}
            </div>

             {/* Speaker Notes & Image Prompt */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-greatek-border rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold uppercase text-text-secondary/80 tracking-wider flex items-center mb-2">
                        <i className="bi bi-mic-fill mr-2 text-greatek-blue"></i>
                        Roteiro
                    </h3>
                    <EditableField
                        value={slide.speaker_notes}
                        onChange={(val) => onUpdate(slide.id, 'speaker_notes', val)}
                        multiline
                        className="w-full text-sm text-text-secondary"
                        placeholder="Adicione as notas do apresentador aqui..."
                    />
                </div>
                <div className="p-4 bg-white border border-greatek-border rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold uppercase text-text-secondary/80 tracking-wider flex items-center mb-2">
                        <i className="bi bi-card-image mr-2 text-greatek-blue"></i>
                        Imagem do Slide
                    </h3>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/png, image/jpeg, image/webp" />
                    {slide.userImage ? (
                        <div className="mt-2 relative group">
                            <img src={slide.userImage} alt="Imagem do slide" className="rounded-md max-h-40 w-full object-contain bg-gray-100" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                                <button onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-black bg-white/80 px-3 py-1.5 rounded-md hover:bg-white">
                                    Alterar
                                </button>
                                <button onClick={() => onUserImageUpdate(slide.id, null)} className="text-xs font-semibold text-white bg-red-600/80 px-3 py-1.5 rounded-md hover:bg-red-600">
                                    Remover
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="mt-2">
                            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-greatek-dark-blue bg-greatek-bg-light px-3 py-2 rounded-md hover:bg-greatek-border transition-colors disabled:bg-gray-200">
                                <i className="bi bi-upload"></i>
                                {isUploading ? 'Enviando...' : 'Adicionar Imagem'}
                            </button>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

export default EditableSlide;