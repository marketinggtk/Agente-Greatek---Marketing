
import { create } from 'zustand';
import { 
    AppMode, 
    Conversation, 
    Message, 
    Attachment,
    PresentationPackage,
    GoalCalculatorState,
    PortfolioSearchResultItem,
    BusinessAnalysisResult,
    OutboundReport,
    OutboundGoalInputs,
    SalesTeamMember,
    isPresentationPackage
} from '../types';
import { 
    runGeminiJsonQuery, 
    streamGeminiQuery, 
    generateConversationTitle,
    generateImageAd,
    streamGoalComparisonAnalysis,
    runDossierQuery,
    streamTeamStrategy
} from '../services/geminiService';
import { sendFeedbackEmail } from '../services/emailService'; 
import { AGENTS } from '../constants';

const CONVERSATION_HISTORY_KEY = 'greatek-agent-conversation-history';

const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] || '';
            resolve(base64);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
};

function loadSessionsFromLocalStorage(): Conversation[] {
    try {
        const stored = localStorage.getItem(CONVERSATION_HISTORY_KEY);
        if (stored) {
            const sessions = JSON.parse(stored);
            if (Array.isArray(sessions)) {
                return sessions.map((session: any) => {
                    let safeMessages = [];
                    if (Array.isArray(session.messages)) {
                        safeMessages = session.messages;
                    } else if (session.messages && typeof session.messages === 'object') {
                        // Attempt to extract values if it was inadvertently saved as an object
                        safeMessages = Object.values(session.messages);
                    }

                    return {
                        id: session.id || String(Date.now()),
                        title: session.title || 'Conversa sem título',
                        mode: session.agentId as AppMode,
                        messages: safeMessages.map((m: any) => {
                            let parsedContent = m.content;
                            if (typeof m.content === 'string') {
                                const trimmed = m.content.trim();
                                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                                    try {
                                        parsedContent = JSON.parse(m.content);
                                    } catch (e) {
                                        // Keep as string if parsing fails
                                    }
                                }
                            }
                            
                            // Ensure role is mapped safely
                            let safeRole = m.role;
                            if (m.role === 'model') safeRole = 'agent';
                            if (!safeRole) safeRole = 'user'; // fallback
                            
                            return {
                                role: safeRole,
                                content: parsedContent,
                                attachments: m.attachments
                            };
                        }),
                        createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
                        updatedAt: session.updatedAt ? new Date(session.updatedAt) : (session.createdAt ? new Date(session.createdAt) : new Date()),
                        ...(session.context || {})
                    };
                });
            }
        }
    } catch (e) {
        console.error("Failed to load persistent conversation history", e);
    }
    return [];
}

function saveToHistoryLocalStorage(conversations: Conversation[]) {
    try {
        const mapped = conversations
            .map(conv => {
                const agent = AGENTS.find(a => a.mode === conv.mode);
                const agentName = agent ? agent.title : 'Nova Conversa';
                const lastMsg = conv.messages[conv.messages.length - 1];
                const preview = lastMsg ? (typeof lastMsg.content === 'string' ? lastMsg.content : '') : '';
                
                const messages = (conv.messages || []).map((m: any, index: number) => ({
                    id: index.toString(),
                    role: m.role === 'user' ? 'user' : 'model',
                    content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
                    attachments: m.attachments,
                    createdAt: conv.createdAt ? new Date(conv.createdAt).toISOString() : new Date().toISOString()
                }));

                const context = {
                    selectedModule: conv.selectedModule || null,
                    productName: conv.selectedModule ? (conv.selectedModule.displayTitle || conv.selectedModule.title) : undefined,
                    skywatchDeclined: conv.skywatchDeclined,
                    presentationPackage: conv.presentationPackage,
                    goalCalculatorState: conv.goalCalculatorState,
                    individualGoalCalculatorState: conv.individualGoalCalculatorState,
                    goalComparisonState: conv.goalComparisonState,
                    teamMembers: conv.teamMembers,
                    teamGlobalGoal: conv.teamGlobalGoal,
                    teamStrategyAnalysis: conv.teamStrategyAnalysis,
                    comparisonAnalysis: conv.comparisonAnalysis,
                    portfolioSearchQuery: conv.portfolioSearchQuery,
                    portfolioSearchResults: conv.portfolioSearchResults,
                    contentPlan: conv.contentPlan,
                    outboundReport: conv.outboundReport,
                    outboundGoals: conv.outboundGoals,
                    contentPlannerDraft: conv.contentPlannerDraft,
                    blogPostDraft: conv.blogPostDraft,
                    presentationDraft: conv.presentationDraft,
                };

                return {
                    id: conv.id,
                    agentId: conv.mode,
                    agentName,
                    title: conv.title,
                    preview,
                    messages,
                    context,
                    createdAt: conv.createdAt ? new Date(conv.createdAt).toISOString() : new Date().toISOString(),
                    updatedAt: conv.updatedAt ? new Date(conv.updatedAt).toISOString() : new Date().toISOString()
                };
            })
            .filter(session => session.agentId && (session.messages.length > 0 || session.context?.selectedModule || session.context?.portfolioSearchQuery || session.context?.contentPlan))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 30);

        localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(mapped));
    } catch (e) {
         console.error("LocalStorage save error:", e);
    }
}

interface AppState {
    conversations: Conversation[];
    activeConversationId: string | null;
    isLoading: boolean;
    error: string | null;
    toastInfo: { message: string; type: 'success' | 'info' | 'error'; duration?: number } | null;
    attachments: File[];
    feedbackModalState: { isOpen: boolean };
    isAnalyzerOpen: boolean;
    isAnalyzing: boolean;
    isAnalyzingComparison: boolean;
    isAnalyzingOutbound: boolean;
    isGeneratingPresentation: boolean;
    isGeneratingTeamStrategy: boolean;
    businessAnalysisResult: BusinessAnalysisResult | null;
    
    // Strategic Planner State
    isStrategicPlanning: boolean;
    commercialDatabase: any[];
    dbLastUpdated: Date | null;
    
    // Daily Usage Tracking
    dailyRequestsCount: number;

    // Actions
    createNewConversation: (mode: AppMode) => void;
    setActiveConversationId: (id: string) => void;
    deleteConversation: (id: string) => void;
    updateConversationTitle: (id: string, title: string) => void;
    setSelectedModuleForConversation: (id: string, selectedModule: any) => void;
    updateContentPlannerDraft: (id: string, draft: Partial<{ month: string; focus: string }>) => void;
    updateBlogPostDraft: (id: string, draft: Partial<{ topic: string; selectedCategory: string }>) => void;
    updatePresentationDraft: (id: string, draft: Partial<{ prompt: string; slideCount: number }>) => void;
    clearAllConversations: () => void;
    returnToAgentSelection: () => void;
    
    addAttachments: (files: File[]) => void;
    removeAttachment: (index: number) => void;
    
    submitQuery: (prompt: string) => Promise<void>;
    incrementDailyRequests: () => void;
    stopGeneration: () => void;
    
    showToast: (message: string, type: 'success' | 'info' | 'error', duration?: number) => void;
    hideToast: () => void;
    
    setMessageFeedback: (conversationId: string, messageIndex: number, type: 'good' | 'bad') => void;
    closeFeedbackModal: () => void;
    submitNegativeFeedback: (reason: string) => void;
    
    toggleAnalyzer: () => void;
    startAnalysisFromSpreadsheet: (file: File, instructions: string) => Promise<void>;
    startBusinessAnalysis: (file: File) => Promise<void>;
    
    generateContentPlan: (month: string, focus: string) => Promise<void>;
    executeContentPlanItem: (briefing: string, platform: 'Blog' | 'LinkedIn') => Promise<void>;
    toggleContentPlanItemStatus: (conversationId: string, itemId: string) => void;
    
    generatePresentation: (prompt: string, slideCount: number) => Promise<void>;
    resetPresentation: () => void;
    updatePresentation: (pkg: PresentationPackage) => void;
    updateSlideUserImage: (slideId: string, base64: string | null) => void;
    
    validatePresentationQuality: (pkg: PresentationPackage) => void;
    
    updateGoalCalculatorState: (newState: Partial<GoalCalculatorState>) => void;
    updateIndividualGoalCalculatorState: (newState: Partial<GoalCalculatorState>) => void;
    resetGoalCalculator: () => void;
    updateGoalComparisonState: (payload: { period: 'previousMonth' | 'currentMonth', newState: Partial<GoalCalculatorState> }) => void;
    runGoalComparisonAnalysis: (data: any) => Promise<void>;
    
    // Team Planner Actions
    updateTeamMember: (id: string, data: Partial<SalesTeamMember>) => void;
    updateTeamGlobalGoal: (goal: string) => void;
    generateTeamStrategy: (globalGoal: string, members: SalesTeamMember[]) => Promise<void>;

    createImageAdFromPrompt: (prompt: string) => void;
    upscaleImage: (conversationId: string, messageIndex: number) => Promise<void>;
    regenerateImage: (conversationId: string, messageIndex: number) => Promise<void>;
    
    runOutboundAnalysis: (text: string) => Promise<void>;
    updateOutboundGoals: (salespersonName: string, goals: OutboundGoalInputs) => void;
    sendOutboundPlanEmail: (email: string, data: any) => Promise<void>;

    loadCommercialDatabase: (file: File) => Promise<void>;
    runStrategicAnalysisFromDB: (options: any) => Promise<void>;

    handleNegativeSkywatchResponse: () => void;

    // Abort Controller
    abortController: AbortController | null;
}

export const useAppStore = create<AppState>((set, get) => ({
    conversations: loadSessionsFromLocalStorage(),
    activeConversationId: null,
    isLoading: false,
    error: null,
    toastInfo: null,
    attachments: [],
    feedbackModalState: { isOpen: false },
    isAnalyzerOpen: false,
    isAnalyzing: false,
    isAnalyzingComparison: false,
    isAnalyzingOutbound: false,
    isGeneratingPresentation: false,
    isGeneratingTeamStrategy: false,
    businessAnalysisResult: null,
    abortController: null,
    
    isStrategicPlanning: false,
    commercialDatabase: [],
    dbLastUpdated: null,
    
    dailyRequestsCount: (() => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const stored = localStorage.getItem(`gemini_usage_${today}`);
            return stored ? parseInt(stored, 10) : 0;
        } catch {
            return 0;
        }
    })(),

    handleNegativeSkywatchResponse: () => {
        const { activeConversationId, conversations } = get();
        if (!activeConversationId) return;
        set({
            conversations: conversations.map(c => 
                c.id === activeConversationId ? { ...c, skywatchDeclined: true } : c
            )
        });
    },

    incrementDailyRequests: () => {
        const today = new Date().toISOString().split('T')[0];
        set(state => {
            const newCount = state.dailyRequestsCount + 1;
            localStorage.setItem(`gemini_usage_${today}`, newCount.toString());
            return { dailyRequestsCount: newCount };
        });
    },

    createNewConversation: (mode) => {
        // Initialize Team Members if mode is Goal Calculator
        let teamMembers: SalesTeamMember[] | undefined;
        if (mode === AppMode.GOAL_CALCULATOR) {
            teamMembers = [
                { id: '1', name: 'Rodrigo Santos', region: 'Sul', individualGoal: '', realizedSales: '', proposalsSent: '', proposalsWon: '' },
                { id: '2', name: 'Paula Rosa', region: 'Sudeste', individualGoal: '', realizedSales: '', proposalsSent: '', proposalsWon: '' },
                { id: '3', name: 'Carlos Silva', region: 'Centro-Oeste', individualGoal: '', realizedSales: '', proposalsSent: '', proposalsWon: '' },
                { id: '4', name: 'Vitoria Abreu', region: 'Nordeste', individualGoal: '', realizedSales: '', proposalsSent: '', proposalsWon: '' },
                { id: '5', name: 'Lucas Santos', region: 'Norte', individualGoal: '', realizedSales: '', proposalsSent: '', proposalsWon: '' },
                { id: '6', name: 'Lucas Teixeira', region: 'Key Accounts', individualGoal: '', realizedSales: '', proposalsSent: '', proposalsWon: '' },
            ];
        }

        const newConv: Conversation = {
            id: Date.now().toString(),
            title: 'Nova Conversa',
            mode,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            teamMembers,
            teamGlobalGoal: ''
        };
        set(state => ({
            conversations: [...state.conversations, newConv],
            activeConversationId: newConv.id,
            error: null,
            businessAnalysisResult: null
        }));
    },

    setActiveConversationId: (id) => set({ activeConversationId: id, error: null }),
    
    deleteConversation: (id) => set(state => {
        const newConvs = state.conversations.filter(c => c.id !== id);
        return {
            conversations: newConvs,
            activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
        };
    }),

    updateConversationTitle: (id, title) => set(state => ({
        conversations: state.conversations.map(c => c.id === id ? { ...c, title, updatedAt: new Date() } : c)
    })),

    setSelectedModuleForConversation: (id, selectedModule) => set(state => ({
        conversations: state.conversations.map(c => c.id === id ? { ...c, selectedModule, updatedAt: new Date() } : c)
    })),

    updateContentPlannerDraft: (id, draft) => set(state => ({
        conversations: state.conversations.map(c => c.id === id ? { 
            ...c, 
            contentPlannerDraft: { ...(c.contentPlannerDraft || { month: '', focus: '' }), ...draft },
            updatedAt: new Date() 
        } : c)
    })),

    updateBlogPostDraft: (id, draft) => set(state => ({
        conversations: state.conversations.map(c => c.id === id ? { 
            ...c, 
            blogPostDraft: { ...(c.blogPostDraft || { topic: '', selectedCategory: 'auto' }), ...draft },
            updatedAt: new Date() 
        } : c)
    })),

    updatePresentationDraft: (id, draft) => set(state => ({
        conversations: state.conversations.map(c => c.id === id ? { 
            ...c, 
            presentationDraft: { ...(c.presentationDraft || { prompt: '', slideCount: 8 }), ...draft },
            updatedAt: new Date() 
        } : c)
    })),

    clearAllConversations: () => {
        set({ conversations: [], activeConversationId: null });
        localStorage.removeItem(CONVERSATION_HISTORY_KEY);
    },

    returnToAgentSelection: () => set({ activeConversationId: null }),

    addAttachments: (files) => set(state => ({ attachments: [...state.attachments, ...files] })),
    
    removeAttachment: (index) => set(state => ({
        attachments: state.attachments.filter((_, i) => i !== index)
    })),

    submitQuery: async (prompt) => {
        const { activeConversationId, conversations, attachments } = get();
        if (!activeConversationId) return;

        const conversation = conversations.find(c => c.id === activeConversationId);
        if (!conversation) return;

        const abortController = new AbortController();
        set({ isLoading: true, error: null, abortController });

        try {
            // Read all attachments as Base64 strings first
            const parsedAttachments: Attachment[] = [];
            if (attachments && attachments.length > 0) {
                for (const file of attachments) {
                    try {
                        const base64Content = await readFileAsBase64(file);
                        parsedAttachments.push({
                            name: file.name,
                            type: file.type || 'application/octet-stream',
                            size: file.size,
                            content: base64Content
                        });
                    } catch (err) {
                        console.error(`Failed to read file ${file.name}:`, err);
                    }
                }
            }

            // Optimistic update user message with attachments
            const userMsg: Message = { 
                role: 'user', 
                content: prompt,
                attachments: parsedAttachments.length > 0 ? parsedAttachments : undefined
            };
            
            // Increment usage counter
            get().incrementDailyRequests();
            
            const updatedConversations = conversations.map(c => 
                c.id === activeConversationId 
                ? { ...c, messages: [...c.messages, userMsg], updatedAt: new Date() }
                : c
            );
            set({ conversations: updatedConversations, attachments: [] });

            // Generate Title if needed
            if (conversation.messages.length === 0) {
                // Truncate prompt to avoid prompt injection from large system instructions
                const titlePrompt = prompt.length > 300 ? prompt.substring(0, 300) + "..." : prompt;
                generateConversationTitle(titlePrompt).then(title => {
                    set(state => ({
                        conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, title, updatedAt: new Date() } : c)
                    }));
                });
            }

            const currentHistory = updatedConversations.find(c => c.id === activeConversationId)?.messages || [];
            
            let responseContent: any = "";
            
            if ([AppMode.MARKET_INTEL, AppMode.CONTENT_PLANNER, AppMode.PORTFOLIO_SEARCH, AppMode.BLOG_POST, AppMode.PRESENTATION_BUILDER, AppMode.REVERSE_DIAGNOSIS].includes(conversation.mode)) {
                 responseContent = await runGeminiJsonQuery(conversation.mode, currentHistory, abortController.signal);
            } else if (conversation.mode === AppMode.CUSTOMER_DOSSIER) {
                 responseContent = await runDossierQuery(currentHistory, abortController.signal);
            } else if (conversation.mode === AppMode.IMAGE_ADS) {
                 responseContent = await generateImageAd(prompt);
            } else {
                 // Streaming
                 let fullText = "";
                 const stream = streamGeminiQuery(conversation.mode, currentHistory, abortController.signal);
                 
                 // Initial empty agent message
                 set(state => ({
                    conversations: state.conversations.map(c => 
                        c.id === activeConversationId 
                        ? { ...c, messages: [...c.messages, { role: 'agent', content: '' }] }
                        : c
                    )
                 }));

                 for await (const chunk of stream) {
                     fullText += chunk;
                     set(state => ({
                        conversations: state.conversations.map(c => {
                            if (c.id !== activeConversationId) return c;
                            const msgs = [...c.messages];
                            const lastMsg = msgs[msgs.length - 1];
                            if (lastMsg.role === 'agent') {
                                lastMsg.content = fullText;
                            }
                            return { ...c, messages: msgs };
                        })
                     }));
                 }
                 responseContent = fullText;
                 return;
            }

            set(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId 
                    ? { 
                        ...c, 
                        messages: [...c.messages, { role: 'agent', content: responseContent }],
                        portfolioSearchResults: conversation.mode === AppMode.PORTFOLIO_SEARCH ? (Array.isArray(responseContent) ? responseContent : []) : c.portfolioSearchResults,
                        portfolioSearchQuery: conversation.mode === AppMode.PORTFOLIO_SEARCH ? prompt : c.portfolioSearchQuery,
                        contentPlan: conversation.mode === AppMode.CONTENT_PLANNER ? responseContent : c.contentPlan,
                        presentationPackage: conversation.mode === AppMode.PRESENTATION_BUILDER ? responseContent : c.presentationPackage,
                        updatedAt: new Date()
                      }
                    : c
                )
            }));

        } catch (e: any) {
            if (e.name !== 'AbortError') {
                let errorMessage = e.message || e.error?.message || "Ocorreu um erro.";
                const errorString = JSON.stringify(e);
                
                // Transform technical quota error into user-friendly message
                if (
                    errorMessage.includes('429') || 
                    errorMessage.toLowerCase().includes('quota') || 
                    errorMessage.includes('RESOURCE_EXHAUSTED') ||
                    e.error?.code === 429 ||
                    e.error?.status === 'RESOURCE_EXHAUSTED' ||
                    errorString.includes('RESOURCE_EXHAUSTED')
                ) {
                    errorMessage = "Cota de uso da IA atingida (429). Por favor, aguarde alguns instantes e tente novamente.";
                }
                set({ error: errorMessage });
            }
        } finally {
            set({ isLoading: false, abortController: null });
        }
    },

    stopGeneration: () => {
        const { abortController } = get();
        if (abortController) {
            abortController.abort();
            set({ isLoading: false, abortController: null });
        }
    },

    showToast: (message, type, duration) => {
        set({ toastInfo: { message, type, duration } });
    },
    hideToast: () => set({ toastInfo: null }),

    setMessageFeedback: (convId, idx, type) => { /* Implementation */ },
    closeFeedbackModal: () => set({ feedbackModalState: { isOpen: false } }),
    submitNegativeFeedback: (reason) => { 
        get().showToast("Feedback enviado com sucesso.", 'success'); 
        set({ feedbackModalState: { isOpen: false } }); 
    },

    toggleAnalyzer: () => set(state => ({ isAnalyzerOpen: !state.isAnalyzerOpen })),
    startAnalysisFromSpreadsheet: async (file, instructions) => {
        get().createNewConversation(AppMode.SALES_ASSISTANT);
        get().submitQuery(`Analise esta planilha: ${instructions}`);
        set({ isAnalyzerOpen: false });
    },
    startBusinessAnalysis: async (file) => {
        set({ isAnalyzing: true });
        setTimeout(() => {
            set({
                isAnalyzing: false,
                businessAnalysisResult: {
                    kpis: [{ title: 'Win Rate', value: '35%', icon: 'bi-trophy' }],
                    winReasons: [],
                    lossReasons: [],
                    aiInsights: "Análise simulada concluída."
                }
            });
        }, 2000);
    },
    
    generateContentPlan: async (month, focus) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        set({ isLoading: true });
        await get().submitQuery(`Planeje o conteúdo para ${month} com foco em ${focus}`);
    },
    executeContentPlanItem: async (briefing, platform) => {
        await get().submitQuery(`Crie um post para ${platform}: ${briefing}`);
    },
    toggleContentPlanItemStatus: (convId, itemId) => set(state => {
        const conv = state.conversations.find(c => c.id === convId);
        if (!conv || !conv.contentPlan) return {};
        const newItems = (conv.contentPlan.items || []).map(i => i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i);
        return {
            conversations: state.conversations.map(c => c.id === convId ? { ...c, contentPlan: { ...conv.contentPlan!, items: newItems } } : c)
        };
    }),

    generatePresentation: async (prompt, slideCount) => {
        const { activeConversationId, conversations } = get();
        if (!activeConversationId) return;

        const conversation = conversations.find(c => String(c.id) === String(activeConversationId));
        if (!conversation) return;

        const abortController = new AbortController();
        set({ isGeneratingPresentation: true, error: null, abortController });

        const userMsg: Message = {
            role: 'user',
            content: `Gere uma apresentação de ${slideCount} slides sobre: ${prompt}`
        };

        set(state => ({
            conversations: state.conversations.map(c =>
                String(c.id) === String(activeConversationId)
                    ? {
                        ...c,
                        messages: [...c.messages, userMsg],
                        presentationDraft: {
                            ...(c.presentationDraft || { prompt: '', slideCount: 8 }),
                            prompt,
                            slideCount
                        },
                        updatedAt: new Date()
                    }
                    : c
            )
        }));

        try {
            get().incrementDailyRequests();
            
            const updatedConversation = get().conversations.find(c => String(c.id) === String(activeConversationId));
            const currentHistory = updatedConversation?.messages || [userMsg];

            const presentationPackage = await runGeminiJsonQuery(
                AppMode.PRESENTATION_BUILDER,
                currentHistory,
                abortController.signal
            );

            if (!isPresentationPackage(presentationPackage)) {
                 throw new Error("Falha ao gerar o pacote da apresentação. Formato inválido recebido da IA.");
            }

            // Perform quality validation
            get().validatePresentationQuality(presentationPackage);

            const agentMsg: Message = {
                role: 'agent',
                content: presentationPackage
            };

            set(state => ({
                conversations: state.conversations.map(c =>
                    String(c.id) === String(activeConversationId)
                        ? {
                            ...c,
                            presentationPackage,
                            messages: [...c.messages, agentMsg],
                            title: c.title === 'Nova Conversa' ? `Apresentação: ${prompt.slice(0, 40)}` : c.title,
                            updatedAt: new Date()
                        }
                        : c
                )
            }));
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                set({
                    error: error?.message || 'Erro ao gerar apresentação.'
                });
            }
        } finally {
            set({
                isGeneratingPresentation: false,
                abortController: null
            });
        }
    },
    resetPresentation: () => set(state => ({
        conversations: state.conversations.map(c =>
            String(c.id) === String(state.activeConversationId)
                ? {
                    ...c,
                    presentationPackage: null,
                    presentationDraft: undefined,
                    updatedAt: new Date()
                }
                : c
        ),
        error: null
    })),
    updatePresentation: (pkg) => set(state => ({
        conversations: state.conversations.map(c => 
            String(c.id) === String(state.activeConversationId) 
            ? { ...c, presentationPackage: pkg, updatedAt: new Date() } 
            : c
        )
    })),
    updateSlideUserImage: (slideId, base64) => set(state => {
        const { activeConversationId, conversations } = state;
        const conversation = conversations.find(c => String(c.id) === String(activeConversationId));
        if (!conversation || !conversation.presentationPackage) return {};

        const updatedSlides = conversation.presentationPackage.slides.map(s => 
            s.id === slideId ? { ...s, userImageBase64: base64 } : s
        );

        return {
            conversations: conversations.map(c => 
                String(c.id) === String(activeConversationId) 
                ? { 
                    ...c, 
                    presentationPackage: { ...conversation.presentationPackage!, slides: updatedSlides },
                    updatedAt: new Date()
                } 
                : c
            )
        };
    }),

    validatePresentationQuality: (pkg: PresentationPackage) => {
        if (!pkg.presentation_title) {
            throw new Error("A apresentação precisa de um título.");
        }
        if (!Array.isArray(pkg.slides) || pkg.slides.length < 3) {
            throw new Error("A apresentação deve ter pelo menos 3 slides.");
        }

        const contentSlides = pkg.slides.filter(s => 
            !['title_slide', 'agenda', 'section_header', 'closing_slide'].includes(s.slide_type)
        );

        pkg.slides.forEach((slide, index) => {
            if (!slide.id || !slide.slide_type || !slide.title || !slide.content || !slide.speaker_notes) {
                throw new Error(`O slide ${index + 1} está incompleto.`);
            }

            // Quality check for content slides
            if (contentSlides.includes(slide)) {
                if (slide.speaker_notes.length < 80) {
                    throw new Error(`As notas do apresentador no slide "${slide.title}" estão muito curtas. Tente gerar novamente.`);
                }

                const checkItemCount = (items: any, min: number, name: string) => {
                    if (!Array.isArray(items) || items.length < min) {
                        throw new Error(`O slide "${slide.title}" (${name}) deve ter pelo menos ${min} itens.`);
                    }
                };

                switch (slide.slide_type) {
                    case 'content_bullet_points':
                        checkItemCount(slide.content, 3, "Bullet Points");
                        break;
                    case 'key_metrics':
                        if (!slide.content?.metrics || !Array.isArray(slide.content.metrics) || slide.content.metrics.length < 3) {
                            throw new Error(`O slide "${slide.title}" (Métricas) deve ter pelo menos 3 métricas.`);
                        }
                        break;
                    case 'three_column_cards':
                        if (!slide.content?.cards || !Array.isArray(slide.content.cards) || slide.content.cards.length < 3) {
                            throw new Error(`O slide "${slide.title}" (Cards) deve ter pelo menos 3 cards.`);
                        }
                        break;
                    case 'numbered_list':
                        if (!slide.content?.items || !Array.isArray(slide.content.items) || slide.content.items.length < 3) {
                            throw new Error(`O slide "${slide.title}" (Lista Numerada) deve ter pelo menos 3 itens.`);
                        }
                        break;
                    case 'bento_grid':
                        if (!slide.content?.items || !Array.isArray(slide.content.items) || slide.content.items.length < 4) {
                            throw new Error(`O slide "${slide.title}" (Bento Grid) deve ter pelo menos 4 itens.`);
                        }
                        break;
                    case 'two_column_text':
                        if (!Array.isArray(slide.content?.left_column) || !Array.isArray(slide.content?.right_column) || slide.content.left_column.length < 3) {
                            throw new Error(`O slide "${slide.title}" (Duas Colunas) deve ter pelo menos 3 itens em cada coluna.`);
                        }
                        break;
                    case 'table_slide':
                        if (!slide.content?.headers || !slide.content?.rows || !Array.isArray(slide.content.rows) || slide.content.rows.length < 3) {
                            throw new Error(`O slide "${slide.title}" (Tabela) deve ter pelo menos 3 linhas.`);
                        }
                        break;
                }
            }
        });
    },

    updateGoalCalculatorState: (newState) => set(state => {
        const c = state.conversations.find(i => i.id === state.activeConversationId);
        if(!c) return {};
        const old = c.goalCalculatorState || { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '', workingDays: '' };
        return {
            conversations: state.conversations.map(conv => conv.id === state.activeConversationId ? { ...conv, goalCalculatorState: { ...old, ...newState } } : conv)
        };
    }),
    updateIndividualGoalCalculatorState: (newState) => set(state => {
        const c = state.conversations.find(i => i.id === state.activeConversationId);
        if(!c) return {};
        const old = c.individualGoalCalculatorState || { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '', workingDays: '' };
        return {
            conversations: state.conversations.map(conv => conv.id === state.activeConversationId ? { ...conv, individualGoalCalculatorState: { ...old, ...newState } } : conv)
        };
    }),
    resetGoalCalculator: () => set(state => ({
        conversations: state.conversations.map(c => c.id === state.activeConversationId ? { ...c, goalCalculatorState: undefined, individualGoalCalculatorState: undefined, goalComparisonState: undefined, comparisonAnalysis: null, teamStrategyAnalysis: null } : c)
    })),
    updateGoalComparisonState: (payload) => set(state => {
         const c = state.conversations.find(i => i.id === state.activeConversationId);
         if(!c) return {};
         const defaultState = { salesGoal: '', salesSoFar: '', totalProposals: '', wonProposals: '', workingDays: '' };
         const oldComp = c.goalComparisonState || { previousMonth: defaultState, currentMonth: defaultState };
         
         const newComp = { ...oldComp, [payload.period]: { ...oldComp[payload.period], ...payload.newState } };
         
         return {
             conversations: state.conversations.map(conv => conv.id === state.activeConversationId ? { ...conv, goalComparisonState: newComp } : conv)
         }
    }),
    runGoalComparisonAnalysis: async (data) => {
        set({ isAnalyzingComparison: true });
        const stream = streamGoalComparisonAnalysis(data, new AbortController().signal);
        let text = "";
        for await (const chunk of stream) {
            text += chunk;
            set(state => ({
                conversations: state.conversations.map(c => c.id === state.activeConversationId ? { ...c, comparisonAnalysis: text } : c)
            }));
        }
        set({ isAnalyzingComparison: false });
    },

    // Team Planner Actions
    updateTeamMember: (id, data) => set(state => {
        const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
        if (!activeConv || !activeConv.teamMembers) return {};
        const newMembers = activeConv.teamMembers.map(m => m.id === id ? { ...m, ...data } : m);
        return {
            conversations: state.conversations.map(c => c.id === state.activeConversationId ? { ...c, teamMembers: newMembers } : c)
        };
    }),
    updateTeamGlobalGoal: (goal) => set(state => {
        return {
            conversations: state.conversations.map(c => c.id === state.activeConversationId ? { ...c, teamGlobalGoal: goal } : c)
        };
    }),
    generateTeamStrategy: async (globalGoal, members) => {
        set({ isGeneratingTeamStrategy: true });
        const abortController = new AbortController();
        set({ abortController });
        
        try {
            const stream = streamTeamStrategy(globalGoal, members, abortController.signal);
            let text = "";
            for await (const chunk of stream) {
                text += chunk;
                set(state => ({
                    conversations: state.conversations.map(c => c.id === state.activeConversationId ? { ...c, teamStrategyAnalysis: text } : c)
                }));
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                set({ error: e.message || "Erro ao gerar estratégia." });
            }
        } finally {
            set({ isGeneratingTeamStrategy: false, abortController: null });
        }
    },

    createImageAdFromPrompt: (prompt) => {
        get().createNewConversation(AppMode.IMAGE_ADS);
        get().submitQuery(prompt);
    },
    upscaleImage: async (id, idx) => { /* Mock */ },
    regenerateImage: async (id, idx) => { /* Mock */ },

    runOutboundAnalysis: async (text) => {
        set({ isAnalyzingOutbound: true });
        // Simulate processing delay
        setTimeout(() => {
            const mockReport: OutboundReport[] = [{
                salesperson_name: "Vendedor Exemplo",
                action_report: {
                    weekly_planning: [
                        { day: "Segunda", calls_goal: 20, key_actions: ["Focar em leads quentes", "Revisar propostas"] },
                        { day: "Terça", calls_goal: 25, key_actions: ["Prospecção ativa", "Follow-up"] },
                        { day: "Quarta", calls_goal: 25, key_actions: ["Negociações", "Fechamento"] },
                        { day: "Quinta", calls_goal: 25, key_actions: ["Prospecção", "Admin"] },
                        { day: "Sexta", calls_goal: 20, key_actions: ["Planejamento", "Relatórios"] }
                    ],
                    performance_analysis: "O vendedor apresenta bom volume mas baixa conversão. Necessário focar em qualificação."
                },
                abc_curve: {
                    weekly_contacts: [{ name: "Contato A", company: "Empresa A", reason: "Potencial alto", suggested_action: "Ligar" }],
                    biweekly_contacts: [{ name: "Contato B", company: "Empresa B", reason: "Médio potencial", suggested_action: "Email" }],
                    monthly_contacts: [{ name: "Contato C", company: "Empresa C", reason: "Manutenção", suggested_action: "WhatsApp" }]
                },
                management_report: {
                    approach_strategy: "Focar em valor, não preço. Destacar benefícios técnicos.",
                    coaching_tips: ["Treinar objeções de preço", "Melhorar script de abertura"],
                    contingency_plan: "Aumentar volume de prospecção se conversão cair abaixo de 10%."
                }
            }];
            
            set(state => {
                const updatedConvs = state.conversations.map(c => 
                    c.id === state.activeConversationId ? { ...c, outboundReport: mockReport } : c
                );
                return { conversations: updatedConvs, isAnalyzingOutbound: false };
            });
        }, 2000);
    },
    updateOutboundGoals: (salespersonName, goals) => {
        set(state => {
            const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
            if (!activeConv) return {};
            
            const newGoals = { ...(activeConv.outboundGoals || {}), [salespersonName]: goals };
            const updatedConvs = state.conversations.map(c => 
                c.id === state.activeConversationId ? { ...c, outboundGoals: newGoals } : c
            );
            return { conversations: updatedConvs };
        });
    },
    sendOutboundPlanEmail: async (email, data) => {
        get().showToast("Relatório enviado com sucesso (simulação)", 'success');
    },

    loadCommercialDatabase: async (file: File) => {
        set({ isLoading: true });
        // Simulating DB loading
        setTimeout(() => {
            set({ 
                commercialDatabase: [{ id: 1, client: "Mock Client", value: 1000 }], 
                dbLastUpdated: new Date(),
                isLoading: false
            });
            get().showToast("Base de dados carregada com sucesso!", 'success');
        }, 1500);
    },

    runStrategicAnalysisFromDB: async (options: any) => {
        set({ isStrategicPlanning: true });
        
        setTimeout(() => {
             const { activeConversationId } = get();
             if (activeConversationId) {
                 const message = `## Análise Estratégica: ${options.region || 'Geral'}\n\n` +
                 `**Base Analisada:** ${get().commercialDatabase.length} registros.\n\n` +
                 `### Insights Principais\n` +
                 `- **Oportunidade de Expansão:** A região apresenta um crescimento de 15% em relação ao período anterior.\n` +
                 `- **Ticket Médio:** O ticket médio está 10% acima da meta estipulada.\n` +
                 `- **Produto Destaque:** A linha de OLTs teve a maior saída na região.\n\n` +
                 `### Recomendações\n` +
                 `1. Focar em campanhas de upsell para clientes da base.\n` +
                 `2. Treinar a equipe em soluções de maior valor agregado.\n\n` +
                 `> *Nota: Esta é uma análise simulada baseada nos dados carregados.*`;

                 const agentMsg: Message = { role: 'agent', content: message };
                 
                 set(state => ({
                     conversations: state.conversations.map(c => 
                        c.id === activeConversationId 
                        ? { ...c, messages: [...c.messages, agentMsg] }
                        : c
                     ),
                     isStrategicPlanning: false
                 }));
             } else {
                 set({ isStrategicPlanning: false });
             }
        }, 2000);
    }
}));

try {
    useAppStore.subscribe((state) => {
        saveToHistoryLocalStorage(state.conversations);
    });
} catch (e) {
    console.error("Zustand history auto-save subscription failed:", e);
}

