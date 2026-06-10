
import React, { useState, useRef, useEffect } from 'react';
import { PresentationSlide, PresentationTheme } from '../types';

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
                className={`w-full bg-[#e9e9e9] text-black border-2 border-greatek-blue rounded-md focus:outline-none resize-none overflow-hidden ${className}`}
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
            className={`w-full bg-[#e9e9e9] text-black border-2 border-greatek-blue rounded-md focus:outline-none ${className}`}
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

interface EditableSlideProps {
    slide: PresentationSlide;
    theme: PresentationTheme;
    onUpdate: (slideId: string, field: keyof PresentationSlide, value: any) => void;
    onDelete: (slideId: string) => void;
    onExport: (slideId: string) => void;
    // FIX: Add missing onUserImageUpdate prop to match the usage in PresentationBuilder.tsx.
    onUserImageUpdate: (slideId: string, base64: string | null) => void;
}

const EditableSlide: React.FC<EditableSlideProps> = ({ 
    slide, 
    theme, 
    onUpdate, 
    onDelete, 
    onExport,
    onUserImageUpdate
}) => {
    
    const renderContent = () => {
        switch (slide.slide_type) {
            case 'key_metrics':
                const metrics = slide.content?.metrics || [];
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
                 const cards = slide.content?.cards || [];
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
            case 'numbered_list':
                const listItems = slide.content?.items || [];
                return (
                    <div className="space-y-4">
                        {listItems.map((item: any, index: number) => (
                            <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-greatek-blue text-white font-bold flex items-center justify-center mr-4 mt-1">{index + 1}</div>
                                <div className="flex-grow">
                                    <EditableField
                                        value={item.title}
                                        onChange={(val) => {
                                            const newItems = [...listItems];
                                            newItems[index] = { ...newItems[index], title: val };
                                            onUpdate(slide.id, 'content', { ...slide.content, items: newItems });
                                        }}
                                        className="font-bold text-greatek-dark-blue text-base"
                                    />
                                    <EditableField
                                        value={item.description}
                                        onChange={(val) => {
                                            const newItems = [...listItems];
                                            newItems[index] = { ...newItems[index], description: val };
                                            onUpdate(slide.id, 'content', { ...slide.content, items: newItems });
                                        }}
                                        multiline
                                        className="text-sm text-text-secondary mt-1"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'bento_grid':
                const gridItems = slide.content?.items || [];
                const sizeMap: Record<string, string> = { 'small': 'lg:col-span-1', 'large': 'lg:col-span-2' };
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {gridItems.map((item: any, index: number) => (
                            <div key={index} className={`p-4 bg-white rounded-lg border border-greatek-border flex flex-col ${sizeMap[item.size] || 'lg:col-span-1'}`}>
                                 <EditableField
                                    value={item.title}
                                    onChange={(val) => {
                                        const newItems = [...gridItems];
                                        newItems[index] = { ...newItems[index], title: val };
                                        onUpdate(slide.id, 'content', { ...slide.content, items: newItems });
                                    }}
                                    className="font-bold text-greatek-dark-blue text-base"
                                />
                                <EditableField
                                    value={item.description}
                                    onChange={(val) => {
                                        const newItems = [...gridItems];
                                        newItems[index] = { ...newItems[index], description: val };
                                        onUpdate(slide.id, 'content', { ...slide.content, items: newItems });
                                    }}
                                    multiline
                                    className="text-sm text-text-secondary mt-1"
                                />
                            </div>
                        ))}
                    </div>
                );
            case 'two_column_text':
                const left_column = Array.isArray(slide.content?.left_column) ? slide.content.left_column : [];
                const right_column = Array.isArray(slide.content?.right_column) ? slide.content.right_column : [];

                const handleColumnUpdate = (columnIndex: 'left_column' | 'right_column', itemIndex: number, value: string) => {
                    const newContent = { ...slide.content };
                    newContent[columnIndex][itemIndex] = value;
                    onUpdate(slide.id, 'content', newContent);
                };

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            {left_column.map((item: string, index: number) => (
                                <div key={`left-${index}`} className="flex items-start">
                                    <span className="text-greatek-blue mr-2 mt-1.5 flex-shrink-0">•</span>
                                    <EditableField
                                        value={item}
                                        onChange={(val) => handleColumnUpdate('left_column', index, val)}
                                        multiline
                                        className="w-full text-base text-text-secondary leading-relaxed"
                                    />
                                </div>
                            ))}
                        </div>
                         <div>
                            {right_column.map((item: string, index: number) => (
                                <div key={`right-${index}`} className="flex items-start">
                                    <span className="text-greatek-blue mr-2 mt-1.5 flex-shrink-0">•</span>
                                    <EditableField
                                        value={item}
                                        onChange={(val) => handleColumnUpdate('right_column', index, val)}
                                        multiline
                                        className="w-full text-base text-text-secondary leading-relaxed"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: // Caters to title, section, agenda, bullets, closing
                const contentArray = Array.isArray(slide.content) ? slide.content : [String(slide.content || '')];
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
                         {/* Image Upload Trigger */}
                         <div className="flex items-center gap-2 mb-3">
                            <label className="cursor-pointer text-[10px] uppercase tracking-wider font-bold text-greatek-blue hover:text-greatek-dark-blue flex items-center gap-1 bg-greatek-blue/5 px-2 py-0.5 rounded transition-colors">
                                <i className="bi bi-image"></i>
                                {slide.userImageBase64 ? 'Alterar Imagem' : 'Adicionar Imagem'}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                onUserImageUpdate(slide.id, reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                            {slide.userImageBase64 && (
                                <button 
                                    onClick={() => onUserImageUpdate(slide.id, null)}
                                    className="text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-red-700"
                                >
                                    Remover
                                </button>
                            )}
                        </div>

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

                 {slide.userImageBase64 && (
                    <div className="mt-4 relative group rounded-lg overflow-hidden border border-greatek-border h-40">
                        <img src={slide.userImageBase64} alt="Slide decoration" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none"></div>
                    </div>
                 )}

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

             {/* Speaker Notes */}
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
        </div>
    );
};

export default EditableSlide;
