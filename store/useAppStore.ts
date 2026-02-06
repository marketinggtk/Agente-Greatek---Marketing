
import { create } from 'zustand';
import { 
    AppMode, 
    Conversation, 
    Message, 
    PresentationPackage,
    GoalCalculatorState,
    PortfolioSearchResultItem,
    BusinessAnalysisResult,
    OutboundReport,
    OutboundGoalInputs,
    SalesTeamMember
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

interface AppState {
    conversations: Conversation[];
    activeConversationId: string | null;
    isLoading: boolean;
    error: string | null;
    toastInfo: { message: string; type: 'success' | 'info' | 'error'; duration?: number } | null;
    attachments: File[];
    feedbackModalState: { isOpen: boolean };
    isWidgetSimulatorOpen: boolean;
    userUploadedKnowledge: any[];
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
    
    // Actions
    setWidgetSimulatorOpen: (isOpen: boolean) => void;
    createNewConversation: (mode: AppMode) => void;
    setActiveConversationId: (id: string) => void;
    deleteConversation: (id: string) => void;
    updateConversationTitle: (id: string, title: string) => void;
    returnToAgentSelection: () => void;
    
    addAttachments: (files: File[]) => void;
    removeAttachment: (index: number) => void;
    
    submitQuery: (prompt: string) => Promise<void>;
    stopGeneration: () => void;
    
    showToast: (message: string, type: 'success' | 'info' | 'error', duration?: number) => void;
    hideToast: () => void;
    
    setMessageFeedback: (conversationId: string, messageIndex: number, type: 'good' | 'bad') => void;
    closeFeedbackModal: () => void;
    submitNegativeFeedback: (reason: string) => void;
    
    updateKnowledgeBaseFromFile: (file: File) => Promise<void>;
    resetKnowledgeBase: () => void;
    
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

    // Abort Controller
    abortController: AbortController | null;
}

export const useAppStore = create<AppState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    isLoading: false,
    error: null,
    toastInfo: null,
    attachments: [],
    feedbackModalState: { isOpen: false },
    isWidgetSimulatorOpen: false,
    userUploadedKnowledge: [],
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

    setWidgetSimulatorOpen: (isOpen) => set({ isWidgetSimulatorOpen: isOpen }),
    
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
        conversations: state.conversations.map(c => c.id === id ? { ...c, title } : c)
    })),

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
            // Optimistic update user message
            const userMsg: Message = { role: 'user', content: prompt };
            
            const updatedConversations = conversations.map(c => 
                c.id === activeConversationId 
                ? { ...c, messages: [...c.messages, userMsg] }
                : c
            );
            set({ conversations: updatedConversations, attachments: [] });

            // Generate Title if needed
            if (conversation.messages.length === 0) {
                generateConversationTitle(prompt).then(title => {
                    set(state => ({
                        conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, title } : c)
                    }));
                });
            }

            const currentHistory = updatedConversations.find(c => c.id === activeConversationId)?.messages || [];
            
            let responseContent: any = "";
            
            if ([AppMode.MARKET_INTEL, AppMode.LEAD_HUNTER, AppMode.CONTENT_PLANNER, AppMode.PORTFOLIO_SEARCH, AppMode.BLOG_POST].includes(conversation.mode)) {
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
                      }
                    : c
                )
            }));

        } catch (e: any) {
            if (e.name !== 'AbortError') {
                set({ error: e.message || "Ocorreu um erro." });
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

    updateKnowledgeBaseFromFile: async (file) => {
        set({ userUploadedKnowledge: [{ name: file.name, keywords: [], details: "Uploaded content" }] });
    },
    resetKnowledgeBase: () => set({ userUploadedKnowledge: [] }),

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
        const newItems = conv.contentPlan.items.map(i => i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i);
        return {
            conversations: state.conversations.map(c => c.id === convId ? { ...c, contentPlan: { ...conv.contentPlan!, items: newItems } } : c)
        };
    }),

    generatePresentation: async (prompt, slides) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        set({ isGeneratingPresentation: true });
        await get().submitQuery(`Gere uma apresentação de ${slides} slides sobre: ${prompt}`);
        set({ isGeneratingPresentation: false });
    },
    resetPresentation: () => { /* Reset logic */ },
    updatePresentation: (pkg) => set(state => {
        const { activeConversationId } = state;
        return {
            conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, presentationPackage: pkg } : c)
        };
    }),
    updateSlideUserImage: (slideId, base64) => { /* Update logic */ },

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
