

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { 
    AppMode, 
    Conversation, 
    Message, 
    Attachment, 
    ImageAdPackage, 
    isImageAdPackage, 
    PresentationPackage, 
    PresentationSlide, 
    isPresentationPackage, 
    BusinessAnalysisResult, 
    GoalCalculatorState, 
    GoalComparisonState,
    PgrCalculatorState,
    PgrSeller,
    isAdCopy,
    KnowledgeBaseProduct
} from '../types';
import { 
    generateConversationTitle, 
    runGeminiJsonQuery, 
    streamGeminiQuery, 
    streamGoalComparisonAnalysis,
    generateImageAd, 
    runImageEditingQuery, 
    runImageCompositionQuery, 
    runDossierQuery
} from '../services/geminiService';
import { pgrInitialSellers } from '../data/pgrData';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface AppState {
    conversations: Conversation[];
    activeConversationId: string | null;
    isLoading: boolean;
    error: string | null;
    abortController: AbortController | null;
    attachments: File[];
    toastInfo: { message: string; type: 'success' | 'info' | 'error'; duration?: number } | null;
    feedbackModalState: { isOpen: boolean; conversationId: string | null; messageIndex: number | null; };
    isGeneratingPresentation: boolean;
    isAnalyzerOpen: boolean;
    isAnalyzing: boolean;
    isAnalyzingComparison: boolean;
    businessAnalysisResult: BusinessAnalysisResult | null;
    pgrSellers: PgrSeller[];
    userUploadedKnowledge: KnowledgeBaseProduct[];
    createNewConversation: (mode: AppMode) => void;
    setActiveConversationId: (id: string) => void;
    deleteConversation: (id: string) => void;
    updateConversationTitle: (id: string, newTitle: string) => void;
    returnToAgentSelection: () => void;
    submitQuery: (prompt: string) => void;
    stopGeneration: () => void;
    addAttachments: (files: File[]) => void;
    removeAttachment: (index: number) => void;
    showToast: (message: string, type?: 'success' | 'info' | 'error', duration?: number) => void;
    hideToast: () => void;
    setMessageFeedback: (conversationId: string, messageIndex: number, feedbackType: 'good' | 'bad') => void;
    openFeedbackModal: (conversationId: string, messageIndex: number) => void;
    closeFeedbackModal: () => void;
    submitNegativeFeedback: (reason: string) => void;
    upscaleImage: (conversationId: string, messageIndex: number) => Promise<void>;
    regenerateImage: (conversationId: string, messageIndex: number) => Promise<void>;
    createImageAdFromPrompt: (prompt: string) => void;
    updateGoalCalculatorState: (newState: Partial<GoalCalculatorState>) => void;
    resetGoalCalculator: () => void;
    updateGoalComparisonState: (payload: { period: 'previousMonth' | 'currentMonth', newState: Partial<GoalCalculatorState> }) => void;
    runGoalComparisonAnalysis: (data: { prev: any; curr: any; }) => Promise<void>;
    updatePgrCalculatorState: (newState: Partial<PgrCalculatorState>) => void;
    resetPgrCalculator: () => void;
    loginPgr: (sellerId: string) => void;
    logoutPgr: () => void;
    setPgrSellers: (sellers: PgrSeller[]) => void;
    generatePresentation: (prompt: string, numberOfSlides: number) => Promise<void>;
    resetPresentation: () => void;
    updatePresentation: (newPackage: PresentationPackage | null) => void;
    updateSlideImage: (slideId: string, imageUrl: string) => void;
    updateSlideUserImage: (slideId: string, imageBase64: string | null) => void;
    toggleAnalyzer: () => void;
    startBusinessAnalysis: (file: File) => Promise<void>;
    startAnalysisFromSpreadsheet: (file: File, instructions: string) => Promise<void>;
    handleNegativeSkywatchResponse: () => void;
    updateKnowledgeBaseFromFile: (file: File) => Promise<void>;
    resetKnowledgeBase: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
        conversations: [],
        activeConversationId: null,
        isLoading: false,
        error: null,
        abortController: null,
        attachments: [],
        toastInfo: null,
        feedbackModalState: { isOpen: false, conversationId: null, messageIndex: null },
        isGeneratingPresentation: false,
        isAnalyzerOpen: false,
        isAnalyzing: false,
        isAnalyzingComparison: false,
        businessAnalysisResult: null,
        pgrSellers: pgrInitialSellers,
        userUploadedKnowledge: [],

        // --- Conversation Management ---
        createNewConversation: async (mode) => {
            const newConversation: Conversation = {
                id: `conv_${Date.now()}`,
                title: `Nova Conversa (${mode})`,
                mode,
                messages: [],
                createdAt: new Date(),
                goalCalculatorState: { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '' },
                goalComparisonState: {
                    previousMonth: { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '' },
                    currentMonth: { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '' },
                },
                comparisonAnalysis: null,
            };
            set(state => ({
                conversations: [...state.conversations, newConversation],
                activeConversationId: newConversation.id,
                businessAnalysisResult: null, // Reset analyzer on new conversation
            }));
        },
        setActiveConversationId: (id) => set({ activeConversationId: id, businessAnalysisResult: null }),
        deleteConversation: (id) => {
            set(state => {
                const newConversations = state.conversations.filter(c => c.id !== id);
                let newActiveId = state.activeConversationId;
                if (state.activeConversationId === id) {
                    newActiveId = newConversations.length > 0 ? newConversations[0].id : null;
                }
                return { conversations: newConversations, activeConversationId: newActiveId };
            });
        },
        updateConversationTitle: (id, newTitle) => {
            set(state => ({
                conversations: state.conversations.map(c => c.id === id ? { ...c, title: newTitle } : c)
            }));
        },
        returnToAgentSelection: () => set({ activeConversationId: null, businessAnalysisResult: null }),

        // --- Core Query Logic ---
        submitQuery: async (prompt) => {
            const { activeConversationId, attachments, userUploadedKnowledge } = get();
            if (!activeConversationId) return;

            // Universal rule to handle "thank you" messages
            const normalizedPrompt = prompt.toLowerCase().trim().replace(/[!.,?]/g, '');
            const thanksWords = ['obrigado', 'obrigada', 'agradeço', 'valeu', 'grato', 'grata', 'agradecido', 'agradecida', 'thanks', 'thank you'];
            const isThankYou = thanksWords.some(word => normalizedPrompt.includes(word)) && normalizedPrompt.length < 30;

            if (isThankYou) {
                const userMessage: Message = { role: 'user', content: prompt };
                
                const cannedResponses = [
                    "De nada! Fico feliz em ajudar.",
                    "Por nada! Caso precise de algo, me avise.",
                    "Por nada.",
                ];
                
                let agentResponseContent = cannedResponses[0];
                if (normalizedPrompt.includes('ok')) {
                    agentResponseContent = cannedResponses[2];
                } else if (normalizedPrompt.includes('resposta')) {
                    agentResponseContent = cannedResponses[1];
                }
                
                const agentMessage: Message = { role: 'agent', content: agentResponseContent };

                set(state => ({
                    conversations: state.conversations.map(c => 
                        c.id === activeConversationId 
                            ? { ...c, messages: [...c.messages, userMessage, agentMessage] } 
                            : c
                    ),
                    attachments: [],
                }));
                
                return; // Stop execution to prevent API call
            }

            const abortController = new AbortController();
            set({ isLoading: true, error: null, abortController });

            const userMessage: Message = { role: 'user', content: prompt };
            
            const processedAttachments: Attachment[] = [];
            if (attachments.length > 0) {
                 try {
                    for (const file of attachments) {
                        processedAttachments.push({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: (await fileToBase64(file)).split(',')[1],
                        });
                    }
                    userMessage.attachments = processedAttachments;
                } catch(e) {
                    set({ error: "Falha ao processar anexos.", isLoading: false });
                    return;
                }
            }

            // Update conversation with user message
            set(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId ? { ...c, messages: [...c.messages, userMessage] } : c
                ),
                attachments: [], // Clear attachments after sending
            }));

            // Generate title for new conversations
            const conversation = get().conversations.find(c => c.id === activeConversationId);
            if (conversation && conversation.messages.length === 1) {
                generateConversationTitle(prompt).then(title => get().updateConversationTitle(conversation.id, title));
            }

            try {
                const currentConvo = get().conversations.find(c => c.id === activeConversationId)!;
                const history = currentConvo.messages;
                
                // Add empty agent message for streaming
                const agentMessage: Message = { role: 'agent', content: '' };
                set(state => ({
                    conversations: state.conversations.map(c =>
                        c.id === activeConversationId ? { ...c, messages: [...c.messages, agentMessage] } : c
                    )
                }));
                const agentMessageIndex = history.length;

                // Handle different response types based on mode
                const jsonModes = [AppMode.PAGE, AppMode.MARKET_INTEL, AppMode.INSTRUCTOR, AppMode.CONTENT, AppMode.BLOG_POST];
                const isFirstDossierMessage = currentConvo.mode === AppMode.CUSTOMER_DOSSIER && currentConvo.messages.length === 1;


                if (currentConvo.mode === AppMode.IMAGE_ADS) {
                    // FIX: The third argument to generateImageAd should be aspectRatio (string), not an AbortSignal.
                    // The signal is not supported by this function, so it's removed.
                    const result = await generateImageAd(prompt, processedAttachments);
                    set(state => ({
                        conversations: state.conversations.map(c => {
                            if (c.id === activeConversationId) {
                                const newMessages = [...c.messages];
                                newMessages[agentMessageIndex] = { role: 'agent', content: result };
                                return { ...c, messages: newMessages };
                            }
                            return c;
                        })
                    }));
                } else if (isFirstDossierMessage) {
                    const result = await runDossierQuery(history, abortController.signal);
                    set(state => ({
                        conversations: state.conversations.map(c => {
                             if (c.id === activeConversationId) {
                                const newMessages = [...c.messages];
                                newMessages[agentMessageIndex] = { role: 'agent', content: result };
                                return { ...c, messages: newMessages };
                            }
                            return c;
                        })
                    }));
                } else if (jsonModes.includes(currentConvo.mode)) {
                    const result = await runGeminiJsonQuery(currentConvo.mode, history, abortController.signal, { userKnowledge: userUploadedKnowledge });
                    set(state => ({
                        conversations: state.conversations.map(c => {
                             if (c.id === activeConversationId) {
                                const newMessages = [...c.messages];
                                newMessages[agentMessageIndex] = { role: 'agent', content: result };
                                return { ...c, messages: newMessages };
                            }
                            return c;
                        })
                    }));
                } else { // Streaming modes (now includes dossier follow-ups)
                    const isDossierFollowUp = currentConvo.mode === AppMode.CUSTOMER_DOSSIER;
                    const stream = streamGeminiQuery(currentConvo.mode, history, abortController.signal, { 
                        userKnowledge: userUploadedKnowledge,
                        isFollowUp: isDossierFollowUp
                    });
                    for await (const chunk of stream) {
                        set(state => ({
                            conversations: state.conversations.map(c => {
                                if (c.id === activeConversationId) {
                                    const newMessages = [...c.messages];
                                    const currentContent = (newMessages[agentMessageIndex].content as string) || '';
                                    newMessages[agentMessageIndex] = { role: 'agent', content: currentContent + chunk };
                                    return { ...c, messages: newMessages };
                                }
                                return c;
                            })
                        }));
                    }
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Gemini API Error:", error);
                    set({ error: error.message || 'Ocorreu um erro ao se comunicar com a IA.' });
                }
            } finally {
                set({ isLoading: false, abortController: null });
            }
        },
        stopGeneration: () => {
            get().abortController?.abort();
            set({ isLoading: false, abortController: null, isAnalyzingComparison: false });
        },

        // --- Attachments ---
        addAttachments: (files) => set(state => ({ attachments: [...state.attachments, ...files] })),
        removeAttachment: (index) => set(state => ({ attachments: state.attachments.filter((_, i) => i !== index) })),
        
        // --- UI State (Toasts, Modals) ---
        showToast: (message, type = 'success', duration = 4000) => set({ toastInfo: { message, type, duration } }),
        hideToast: () => set({ toastInfo: null }),
        openFeedbackModal: (conversationId, messageIndex) => set({ feedbackModalState: { isOpen: true, conversationId, messageIndex } }),
        closeFeedbackModal: () => set({ feedbackModalState: { isOpen: false, conversationId: null, messageIndex: null } }),
        
        // --- Feedback ---
        setMessageFeedback: (conversationId, messageIndex, feedbackType) => {
            set(state => ({
                conversations: state.conversations.map(c => {
                    if (c.id === conversationId) {
                        const newMessages = [...c.messages];
                        const currentFeedback = newMessages[messageIndex].feedback;
                        
                        // Toggle logic: if same feedback is clicked again, remove it.
                        if (currentFeedback?.type === feedbackType) {
                            newMessages[messageIndex].feedback = null;
                        } else {
                            newMessages[messageIndex].feedback = { type: feedbackType };
                        }

                        // If it's a 'bad' feedback, open the reason modal
                        if (newMessages[messageIndex].feedback?.type === 'bad') {
                            get().openFeedbackModal(conversationId, messageIndex);
                        }
                        
                        return { ...c, messages: newMessages };
                    }
                    return c;
                })
            }));
        },
        submitNegativeFeedback: (reason) => {
            const { conversationId, messageIndex } = get().feedbackModalState;
            if (conversationId === null || messageIndex === null) return;

            set(state => ({
                conversations: state.conversations.map(c => {
                    if (c.id === conversationId) {
                        const newMessages = [...c.messages];
                        if (newMessages[messageIndex] && newMessages[messageIndex].feedback) {
                            newMessages[messageIndex].feedback!.reason = reason;
                        }
                        return { ...c, messages: newMessages };
                    }
                    return c;
                })
            }));
            get().closeFeedbackModal();
            get().showToast('Obrigado pelo seu feedback!', 'success');
        },
        handleNegativeSkywatchResponse: () => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c =>
                    c.id === activeConversationId ? { ...c, skywatchDeclined: true } : c
                )
            }));
        },
        
        // --- Image Ad Actions ---
        upscaleImage: async (conversationId, messageIndex) => {
            // This is a placeholder as the Gemini API doesn't have a native upscale function.
            // We'll simulate it by re-running the edit with an "upscale" prompt.
            const conversation = get().conversations.find(c => c.id === conversationId);
            if (!conversation) return;
            const message = conversation.messages[messageIndex];
            if (!isImageAdPackage(message.content)) return;

            set(state => ({
                conversations: state.conversations.map(c => {
                    if (c.id === conversationId) {
                        const newMessages = [...c.messages];
                        (newMessages[messageIndex].content as ImageAdPackage).isUpscaling = true;
                        return { ...c, messages: newMessages };
                    }
                    return c;
                })
            }));
            
            try {
                const base64Data = (message.content.imageUrl).split(',')[1];
                const mimeType = 'image/jpeg';
                const prompt = "Melhore a qualidade e a resolução desta imagem, deixando-a mais nítida e detalhada (upscale).";
                const upscaledData = await runImageEditingQuery(base64Data, mimeType, prompt);
                
                set(state => ({
                    conversations: state.conversations.map(c => {
                        if (c.id === conversationId) {
                            const newMessages = [...c.messages];
                            const content = newMessages[messageIndex].content as ImageAdPackage;
                            content.isUpscaling = false;
                            content.isUpscaled = true;
                            content.imageUrl = `data:image/jpeg;base64,${upscaledData}`;
                            return { ...c, messages: newMessages };
                        }
                        return c;
                    })
                }));
            } catch (e: any) {
                 get().showToast(`Erro ao melhorar imagem: ${e.message}`, 'error');
            }
        },
        regenerateImage: async (conversationId, messageIndex) => {
             const conversation = get().conversations.find(c => c.id === conversationId);
            if (!conversation) return;
            const message = conversation.messages[messageIndex];
            if (!isImageAdPackage(message.content)) return;

            set(state => ({
                conversations: state.conversations.map(c => {
                    if (c.id === conversationId) {
                        const newMessages = [...c.messages];
                        (newMessages[messageIndex].content as ImageAdPackage).isRegenerating = true;
                        return { ...c, messages: newMessages };
                    }
                    return c;
                })
            }));

            try {
                // FIX: Pass the existing aspect ratio when regenerating the image.
                const { originalPrompt, referenceImage, aspectRatio } = message.content;
                const result = await generateImageAd(originalPrompt, referenceImage ? [referenceImage] : undefined, aspectRatio);

                 set(state => ({
                    conversations: state.conversations.map(c => {
                        if (c.id === conversationId) {
                            const newMessages = [...c.messages];
                            newMessages[messageIndex].content = result;
                            return { ...c, messages: newMessages };
                        }
                        return c;
                    })
                }));
            } catch (e: any) {
                get().showToast(`Erro ao gerar nova imagem: ${e.message}`, 'error');
                set(state => ({
                    conversations: state.conversations.map(c => {
                        if (c.id === conversationId) {
                            const newMessages = [...c.messages];
                            (newMessages[messageIndex].content as ImageAdPackage).isRegenerating = false;
                            return { ...c, messages: newMessages };
                        }
                        return c;
                    })
                }));
            }
        },
        createImageAdFromPrompt: (prompt) => {
            get().createNewConversation(AppMode.IMAGE_ADS);
            // Use a timeout to ensure the new conversation is active before submitting
            setTimeout(() => get().submitQuery(prompt), 100);
        },

        // --- Tools State (Goal Calculator) ---
        updateGoalCalculatorState: (newState) => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId ? { ...c, goalCalculatorState: { ...c.goalCalculatorState, ...newState } as GoalCalculatorState } : c
                )
            }));
        },
        resetGoalCalculator: () => {
             const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId ? { 
                        ...c, 
                        goalCalculatorState: { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '' },
                        goalComparisonState: {
                            previousMonth: { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '' },
                            currentMonth: { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '' },
                        },
                        comparisonAnalysis: null,
                    } : c
                )
            }));
        },
        updateGoalComparisonState: ({ period, newState }) => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c => {
                    if (c.id === activeConversationId) {
                        const newComparisonState = { ...c.goalComparisonState } as GoalComparisonState;
                        newComparisonState[period] = { ...newComparisonState[period], ...newState };
                        return { ...c, goalComparisonState: newComparisonState };
                    }
                    return c;
                })
            }));
        },
        runGoalComparisonAnalysis: async (data) => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            const abortController = new AbortController();
            set({ isAnalyzingComparison: true, error: null, abortController });

            // Clear previous analysis
            set(state => ({
                conversations: state.conversations.map(c =>
                    c.id === activeConversationId ? { ...c, comparisonAnalysis: '' } : c
                )
            }));

            try {
                const stream = streamGoalComparisonAnalysis(data, abortController.signal);
                for await (const chunk of stream) {
                    set(state => ({
                        conversations: state.conversations.map(c => {
                            if (c.id === activeConversationId) {
                                const newAnalysis = (c.comparisonAnalysis || '') + chunk;
                                return { ...c, comparisonAnalysis: newAnalysis };
                            }
                            return c;
                        })
                    }));
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Gemini Comparison Analysis Error:", error);
                    set({ error: error.message || 'Ocorreu um erro ao gerar a análise.' });
                }
            } finally {
                set({ isAnalyzingComparison: false, abortController: null });
            }
        },
        
        // --- Tools State (PGR Calculator) ---
        setPgrSellers: (sellers) => set({ pgrSellers: sellers }),
        loginPgr: (sellerId) => {
            const { activeConversationId, pgrSellers } = get();
            if (!activeConversationId) return;

            const sellerData = pgrSellers.find(s => s.id === sellerId);
            if (!sellerData) return;

            const newMetrics = Object.keys(sellerData.metas).reduce((acc, key) => {
                acc[key] = { meta: sellerData.metas[key], realizado: '' };
                return acc;
            }, {} as PgrCalculatorState['metrics']);

            set(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId 
                        ? { 
                            ...c, 
                            pgrAuthenticatedSellerId: sellerId,
                            pgrCalculatorState: {
                                sellerName: sellerData.name,
                                metrics: newMetrics,
                                selectedSellerId: sellerId,
                            }
                        } 
                        : c
                )
            }));
        },
        logoutPgr: () => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId 
                        ? { 
                            ...c, 
                            pgrAuthenticatedSellerId: null,
                            pgrCalculatorState: undefined
                          } 
                        : c
                )
            }));
        },
        updatePgrCalculatorState: (newState) => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c =>
                    c.id === activeConversationId ? { ...c, pgrCalculatorState: { ...(c.pgrCalculatorState || { sellerName: '', metrics: {}, selectedSellerId: '' }), ...newState } as PgrCalculatorState } : c
                )
            }));
        },
        resetPgrCalculator: () => {
            get().logoutPgr();
        },

        // --- Presentation Builder ---
        generatePresentation: async (prompt, numberOfSlides) => {
            set({ isGeneratingPresentation: true, error: null });
            const newConversationId = `conv_${Date.now()}`;
            const newConversation: Conversation = {
                id: newConversationId,
                title: 'Nova Apresentação',
                mode: AppMode.PRESENTATION_BUILDER,
                messages: [{ role: 'user', content: prompt }],
                createdAt: new Date(),
            };
            set(state => ({ conversations: [...state.conversations, newConversation], activeConversationId: newConversationId }));
             generateConversationTitle(`Gerar apresentação sobre: ${prompt}`).then(title => get().updateConversationTitle(newConversationId, title));

            try {
                const result = await runGeminiJsonQuery(AppMode.PRESENTATION_BUILDER, newConversation.messages, new AbortController().signal, { numberOfSlides });
                if (isPresentationPackage(result)) {
                    set(state => ({
                        conversations: state.conversations.map(c => c.id === newConversationId ? { ...c, presentationPackage: result } : c),
                    }));
                } else {
                    throw new Error("A IA retornou um formato de apresentação inválido.");
                }
            } catch (e: any) {
                set({ error: e.message });
            } finally {
                set({ isGeneratingPresentation: false });
            }
        },
        resetPresentation: () => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, presentationPackage: null } : c)
            }));
        },
        updatePresentation: (newPackage) => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;
            set(state => ({
                conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, presentationPackage: newPackage } : c)
            }));
        },
        updateSlideImage: (slideId, imageUrl) => {
            const { activeConversationId, conversations } = get();
            const conversation = conversations.find(c => c.id === activeConversationId);
            if (!conversation || !conversation.presentationPackage) return;
            const newSlides = conversation.presentationPackage.slides.map(s => s.id === slideId ? { ...s, imageUrl } : s);
            const newPackage = { ...conversation.presentationPackage, slides: newSlides };
            get().updatePresentation(newPackage);
        },
        updateSlideUserImage: (slideId, imageBase64) => {
             const { activeConversationId, conversations } = get();
            const conversation = conversations.find(c => c.id === activeConversationId);
            if (!conversation || !conversation.presentationPackage) return;
            const newSlides = conversation.presentationPackage.slides.map(s => s.id === slideId ? { ...s, userImage: imageBase64 || undefined } : s);
            const newPackage = { ...conversation.presentationPackage, slides: newSlides };
            get().updatePresentation(newPackage);
        },

        // --- Spreadsheet Analyzer ---
        toggleAnalyzer: () => set(state => ({ isAnalyzerOpen: !state.isAnalyzerOpen })),
        startAnalysisFromSpreadsheet: async (file, instructions) => {
            // Not a real implementation, just for state flow
            get().createNewConversation(AppMode.BUSINESS_ANALYZER);
            setTimeout(() => get().submitQuery(instructions), 100);
            get().toggleAnalyzer();
        },
        startBusinessAnalysis: async (file) => {
            set({ isAnalyzing: true, error: null, businessAnalysisResult: null });
             // Placeholder for analysis logic
             setTimeout(() => {
                set({
                    isAnalyzing: false,
                    businessAnalysisResult: {
                        kpis: [],
                        winReasons: [],
                        lossReasons: [],
                        aiInsights: "Análise de placeholder completa."
                    }
                })
            }, 2000);
        },

        // --- Custom Knowledge Base ---
        resetKnowledgeBase: () => {
            set({ userUploadedKnowledge: [] });
            get().showToast('Base de conhecimento customizada foi limpa.', 'info');
        },
        updateKnowledgeBaseFromFile: async (file) => {
            set({ isLoading: true, error: null });
            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
    
                if (json.length === 0) {
                    throw new Error("A planilha está vazia ou em formato incorreto.");
                }
    
                const headers = Object.keys(json[0]);
                const requiredHeaders = ['name', 'keywords', 'details'];
                if (!requiredHeaders.every(h => headers.includes(h))) {
                    throw new Error(`A planilha deve conter as colunas: ${requiredHeaders.join(', ')}.`);
                }
    
                const newUserKnowledge: KnowledgeBaseProduct[] = json.map((row, index) => {
                    if (!row.name || !row.details) {
                        throw new Error(`Linha ${index + 2} está incompleta. Colunas 'name' e 'details' são obrigatórias.`);
                    }
                    return {
                        name: String(row.name),
                        keywords: row.keywords ? String(row.keywords).split(',').map(k => k.trim()) : [],
                        details: String(row.details),
                    };
                });
    
                set({ userUploadedKnowledge: newUserKnowledge });
                get().showToast(`Base de conhecimento atualizada com ${newUserKnowledge.length} produtos da planilha.`, 'success');
    
            } catch (e: any) {
                console.error("Error processing spreadsheet:", e);
                const errorMessage = e.message || 'Erro desconhecido ao processar a planilha.';
                set({ error: errorMessage });
                get().showToast(errorMessage, 'error', 6000);
            } finally {
                set({ isLoading: false });
            }
        },
    }),
    {
      name: 'greatek-agent-storage-v1',
      partialize: (state) => {
        const { 
            // Transient state to omit
            isLoading, 
            error, 
            abortController, 
            attachments, 
            toastInfo, 
            feedbackModalState, 
            isAnalyzingComparison, 
            activeConversationId,
            
            // State to persist (but needs sanitization)
            conversations,
            
            // All other state to persist as-is
            ...rest 
        } = state;

        // Sanitize conversations to remove large base64 data to prevent storage quota errors
        const sanitizedConversations = conversations.map(conv => {
            const sanitizedMessages = conv.messages.map(msg => {
                const sanitizedMsg = { ...msg };

                // 1. Sanitize top-level attachments by removing the 'data' field
                if (sanitizedMsg.attachments) {
                    // FIX: Cast to any to satisfy TypeScript during serialization, as 'data' is intentionally removed.
                    sanitizedMsg.attachments = sanitizedMsg.attachments.map(att => ({
                        name: att.name,
                        type: att.type,
                        size: att.size,
                    })) as any;
                }

                // 2. Sanitize complex content objects
                if (typeof sanitizedMsg.content === 'object' && sanitizedMsg.content !== null) {
                    let newContent: any = { ...sanitizedMsg.content };

                    // Handle ImageAdPackage: remove imageUrl and sanitize referenceImage
                    if (isImageAdPackage(newContent)) {
                        newContent.imageUrl = ''; // Remove base64 image URL
                        if (newContent.referenceImage) {
                            // FIX: Cast to any to satisfy TypeScript during serialization, as 'data' is intentionally removed.
                            newContent.referenceImage = {
                                name: newContent.referenceImage.name,
                                type: newContent.referenceImage.type,
                                size: newContent.referenceImage.size,
                            } as any;
                        }
                    }

                    // Handle PresentationPackage: remove potentially large image data from slides
                    if (isPresentationPackage(newContent)) {
                        newContent.slides = newContent.slides.map((slide: PresentationSlide) => {
                            const { userImage, imageUrl, ...restOfSlide } = slide;
                            return restOfSlide; // Return a new slide object without image data
                        });
                    }

                    sanitizedMsg.content = newContent;
                }

                return sanitizedMsg;
            });

            return { ...conv, messages: sanitizedMessages };
        });

        return {
            ...rest,
            conversations: sanitizedConversations,
        };
      },
      storage: createJSONStorage(() => localStorage, {
          replacer: (key, value) => {
              if (value instanceof Date) {
                  return { __type: 'Date', value: value.toISOString() };
              }
              return value;
          },
          reviver: (key, value) => {
              if (
                typeof value === 'object' &&
                value !== null &&
                (value as any).__type === 'Date' &&
                typeof (value as any).value === 'string'
              ) {
                return new Date((value as any).value);
              }
              return value;
          },
      }),
    }
  )
);