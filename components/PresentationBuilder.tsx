
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PresentationPackage, PresentationSlide, PresentationTheme } from '../types';
import EditableSlide from './EditableSlide';
import { generatePresentationPdf, generateSingleSlidePdf } from '../services/presentationPdfGenerator';

const slideTypeMap: Record<string, { icon: string; label: string; }> = {
    title_slide: { icon: 'bi-file-earmark-text-fill', label: 'Título' },
    agenda: { icon: 'bi-list-stars', label: 'Agenda' },
    section_header: { icon: 'bi-signpost-2-fill', label: 'Seção' },
    content_bullet_points: { icon: 'bi-card-text', label: 'Conteúdo' },
    key_metrics: { icon: 'bi-graph-up', label: 'Métricas' },
    three_column_cards: { icon: 'bi-columns-gap', label: 'Cards' },
    numbered_list: { icon: 'bi-list-ol', label: 'Lista Numerada' },
    bento_grid: { icon: 'bi-grid-1x2-fill', label: 'Grid' },
    table_slide: { icon: 'bi-table', label: 'Tabela' },
    closing_slide: { icon: 'bi-flag-fill', label: 'Final' },
};

const GenerationProgress: React.FC<{ prompt: string; slideCount: number }> = ({ prompt, slideCount }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = useMemo(() => [
        "Analisando o tema principal",
        "Definindo o público-alvo e o tom",
        "Estruturando a narrativa da apresentação",
        "Esboçando o slide de Título",
        "Definindo a Agenda",
        ...Array.from({ length: slideCount - 4 > 0 ? slideCount - 4 : 1 }, (_, i) => `Gerando conteúdo para o slide ${i + 3}`),
        "Criando o slide de Conclusão",
        "Revisando a coerência e o fluxo",
        "Finalizando e montando o roteiro",
    ], [slideCount]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 1800); // Adjust timing as needed

        return () => clearInterval(interval);
    }, [steps.length]);

    const getStatusIcon = (index: number) => {
        if (index < currentStep) {
            return <i className="bi bi-check-circle-fill text-green-500"></i>;
        }
        if (index === currentStep) {
            return <div className="w-4 h-4 border-2 border-greatek-blue/50 border-t-greatek-blue rounded-full animate-spin"></div>;
        }
        return <i className="bi bi-circle-dotted text-gray-400"></i>;
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in h-full">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl border border-greatek-border">
                <h2 className="text-xl font-bold text-greatek-dark-blue">Construindo sua apresentação...</h2>
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                    Com base em: <span className="italic">"{prompt}"</span>
                </p>
                <div className="mt-6 space-y-3 text-left">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-3 text-sm transition-all duration-300 ${index <= currentStep ? 'opacity-100' : 'opacity-40'}`}
                        >
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {getStatusIcon(index)}
                            </div>
                            <span className={`font-medium ${index <= currentStep ? 'text-text-primary' : 'text-text-secondary'}`}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const PresentationBuilder: React.FC = () => {
    const { 
        conversations,
        activeConversationId,
        isGeneratingPresentation, 
        error,
        generatePresentation,
        updatePresentationDraft,
        resetPresentation,
        updatePresentation,
        updateSlideUserImage
    } = useAppStore();

    const activeConversation = useMemo(() =>
        conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]
    );
    const presentationState = activeConversation?.presentationPackage;
    
    const [prompt, setPrompt] = useState(activeConversation?.presentationDraft?.prompt || '');
    const [slideCount, setSlideCount] = useState(activeConversation?.presentationDraft?.slideCount || 8);
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

    // Sync local state when changing conversations
    useEffect(() => {
        if (activeConversation?.presentationDraft) {
            setPrompt(activeConversation.presentationDraft.prompt || '');
            setSlideCount(activeConversation.presentationDraft.slideCount || 8);
        } else {
            setPrompt('');
            setSlideCount(8);
        }
    }, [activeConversationId]);

    const handlePromptChange = (val: string) => {
        setPrompt(val);
        if (activeConversationId) {
            updatePresentationDraft(activeConversationId, { prompt: val });
        }
    };

    const handleSlideCountChange = (val: number) => {
        setSlideCount(val);
        if (activeConversationId) {
            updatePresentationDraft(activeConversationId, { slideCount: val });
        }
    };

    useEffect(() => {
        if (presentationState && presentationState.slides.length > 0) {
            // If the selected slide is no longer valid or doesn't exist, select the first one.
            const selectedExists = presentationState.slides.some(s => s.id === selectedSlideId);
            if (!selectedSlideId || !selectedExists) {
                setSelectedSlideId(presentationState.slides[0].id);
            }
        } else {
             setSelectedSlideId(null);
        }
    }, [presentationState, selectedSlideId]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        generatePresentation(prompt, slideCount);
    };

    const handleSavePdf = () => {
        if (!presentationState) return;
        generatePresentationPdf(presentationState);
    };

    const handleSlideUpdate = (slideId: string, field: keyof PresentationSlide, value: any) => {
        if (!presentationState) return;
        const updatedSlides = presentationState.slides.map(s => 
            s.id === slideId ? { ...s, [field]: value } : s
        );
        updatePresentation({ ...presentationState, slides: updatedSlides });
    };

    const handleThemeChange = (theme: PresentationTheme) => {
        if (!presentationState) return;
        updatePresentation({ ...presentationState, theme });
    };

    const handleAddSlide = () => {
        if (!presentationState) return;
        const newSlide: PresentationSlide = {
            id: `slide_${Date.now()}`,
            slide_type: 'content_bullet_points',
            title: 'Novo Slide',
            content: ['**Tópico 1:** Adicione seu texto aqui.'],
            speaker_notes: 'Notas para o novo slide.',
        };
        const updatedSlides = [...presentationState.slides, newSlide];
        updatePresentation({ ...presentationState, slides: updatedSlides });
        setSelectedSlideId(newSlide.id);
    };

    const handleDeleteSlide = (slideId: string) => {
        if (!presentationState || presentationState.slides.length <= 1) return;
        
        const slideIndex = presentationState.slides.findIndex(s => s.id === slideId);
        const updatedSlides = presentationState.slides.filter(s => s.id !== slideId);
        updatePresentation({ ...presentationState, slides: updatedSlides });
        
        if (selectedSlideId === slideId) {
            const newIndex = Math.max(0, slideIndex - 1);
            setSelectedSlideId(updatedSlides[newIndex]?.id || null);
        }
    };
    
    const handleExportSlide = (slideId: string) => {
        if (!presentationState) return;
        const slide = presentationState.slides.find(s => s.id === slideId);
        if (slide) {
            generateSingleSlidePdf(slide, presentationState);
        }
    };

    const selectedSlide = useMemo(() => 
        presentationState?.slides.find(s => s.id === selectedSlideId),
        [presentationState, selectedSlideId]
    );

    if (isGeneratingPresentation) {
        return <GenerationProgress prompt={prompt} slideCount={slideCount} />;
    }
    
    if (!presentationState) {
        return (
            <div className="h-full flex flex-col justify-center items-center p-4 sm:p-8 animate-fade-in">
                <div className="w-full max-w-2xl text-center">
                    <i className="bi bi-file-slides-fill text-5xl text-greatek-blue/30 mx-auto mb-4"></i>
                    <h1 className="text-xl sm:text-2xl font-bold text-greatek-dark-blue">Criador de Apresentações</h1>
                    <p className="text-sm sm:text-base text-text-secondary mt-2">
                        Descreva o objetivo da sua apresentação e o agente criará uma estrutura completa, slide a slide, para você editar.
                    </p>
                    <div className="mt-6">
                        <div className="mb-4 text-left max-w-xs mx-auto">
                            <label htmlFor="slide-count" className="block text-sm font-medium text-text-primary mb-1">Número de Slides:</label>
                            <select 
                                id="slide-count" 
                                value={slideCount} 
                                onChange={(e) => handleSlideCountChange(Number(e.target.value))}
                                className="w-full p-2.5 rounded-lg border-greatek-border focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm bg-[#e9e9e9] text-black font-semibold"
                            >
                                {[...Array(13).keys()].map(i => i + 3).map(num => (
                                    <option key={num} value={num}>{num} Slides</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            rows={3}
                            value={prompt}
                            onChange={(e) => handlePromptChange(e.target.value)}
                            className="w-full p-3 rounded-lg border border-greatek-border focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm bg-[#e9e9e9] text-black placeholder:text-text-secondary/70 custom-scrollbar"
                            placeholder="Ex: Uma apresentação comercial sobre as vantagens das soluções de energia da Greatek para ISPs, comparando com concorrentes."
                        />
                         <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim()}
                            className="mt-3 w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:bg-gray-400"
                        >
                            Gerar Apresentação
                        </button>
                    </div>
                    {error && <p className="text-center text-red-600 text-sm mt-4">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-greatek-bg-light/50 animate-fade-in">
            <header className="flex-shrink-0 bg-white border-b border-greatek-border p-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="text-center sm:text-left">
                    <h2 className="font-bold text-greatek-dark-blue text-base truncate" title={presentationState.presentation_title}>{presentationState.presentation_title}</h2>
                    <p className="text-xs text-text-secondary">Público-alvo: {presentationState.target_audience}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                        value={presentationState.theme}
                        onChange={(e) => handleThemeChange(e.target.value as PresentationTheme)}
                        className="text-xs font-medium text-text-secondary bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-greatek-blue"
                    >
                        <option value="light">Tema Claro</option>
                        <option value="dark">Tema Escuro</option>
                        <option value="classic">Tema Clássico</option>
                    </select>
                    <button onClick={resetPresentation} className="text-xs font-medium text-text-secondary bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">Nova Apresentação</button>
                    <button onClick={handleSavePdf} className="flex items-center gap-2 text-xs font-semibold text-white bg-greatek-blue px-3 py-1.5 rounded-md hover:bg-greatek-dark-blue transition-colors">
                        <i className="bi bi-file-earmark-pdf-fill"></i>
                        Salvar em PDF
                    </button>
                </div>
            </header>
            <div className="flex-grow flex overflow-hidden">
                {/* Storyboard Sidebar */}
                <aside className="w-56 bg-white border-r border-greatek-border p-2 flex-shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        {presentationState.slides.map((slide, index) => (
                            <button 
                                key={slide.id} 
                                onClick={() => setSelectedSlideId(slide.id)}
                                className={`w-full p-2.5 rounded-lg text-left transition-colors relative group ${selectedSlideId === slide.id ? 'bg-greatek-blue/10' : 'bg-transparent hover:bg-greatek-bg-light'}`}
                            >
                                <span className="absolute top-1 right-1 text-xs text-gray-400 font-mono">{index + 1}</span>
                                <div className="flex items-start gap-2">
                                    <i className={`bi ${slideTypeMap[slide.slide_type]?.icon || 'bi-card-text'} text-greatek-blue mt-0.5`}></i>
                                    <div>
                                        <p className="text-sm font-bold text-greatek-dark-blue leading-tight pr-4">
                                            {slide.title}
                                        </p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {slideTypeMap[slide.slide_type]?.label || 'Conteúdo'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <button onClick={handleAddSlide} className="w-full mt-3 text-sm text-greatek-blue font-semibold p-2 rounded-md border-2 border-dashed border-greatek-border hover:bg-greatek-blue/10 hover:border-greatek-blue transition-colors">
                        <i className="bi bi-plus-circle-fill mr-1"></i> Adicionar Slide
                    </button>
                </aside>

                {/* Main Editor */}
                <main className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    {selectedSlide ? (
                        <EditableSlide 
                            key={selectedSlide.id}
                            slide={selectedSlide}
                            theme={presentationState.theme}
                            onUpdate={handleSlideUpdate}
                            onDelete={handleDeleteSlide}
                            onExport={handleExportSlide}
                            onUserImageUpdate={(slideId, base64) => updateSlideUserImage(slideId, base64)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary">Selecione um slide para editar.</div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PresentationBuilder;
