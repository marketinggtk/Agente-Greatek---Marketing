import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AppMode } from '../../types';
import { ConversationMessage, ConversationSession } from '../types/conversation';
import { AGENTS } from '../../constants';

// Auxiliar: Gera o título legível da conversa
export function generateTitleFromSession(session: ConversationSession): string {
  if (session.context?.productName) return String(session.context.productName);
  if (session.context?.selectedModule) {
    const mod = session.context.selectedModule as any;
    if (mod.displayTitle || mod.title) {
      return String(mod.displayTitle || mod.title);
    }
  }

  const firstUserMessage = session.messages.find(message => message.role === 'user');
  if (firstUserMessage?.content) {
    const cleanContent = String(firstUserMessage.content).replace(/<\/?[^>]+(>|$)/g, ""); // strip simple html if any
    return cleanContent.length > 48 ? cleanContent.slice(0, 45) + '...' : cleanContent;
  }

  return session.agentName || 'Nova conversa';
}

export function useConversationHistory() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    createNewConversation,
    updateConversationTitle,
    setSelectedModuleForConversation,
    clearAllConversations
  } = useAppStore();

  // Mapeia as conversas do useAppStore para as sessões de visualização
  const sessions = useMemo(() => {
    return conversations
      .map(conv => {
        const agent = AGENTS.find(a => a.mode === conv.mode);
        const agentName = agent ? agent.title : 'Nova Conversa';

        const lastMsg = conv.messages[conv.messages.length - 1];
        const preview = lastMsg ? (typeof lastMsg.content === 'string' ? lastMsg.content : '') : '';

        const messages: ConversationMessage[] = conv.messages.map((m, index) => ({
          id: index.toString(),
          role: m.role === 'user' ? 'user' : 'model',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          createdAt: conv.createdAt ? new Date(conv.createdAt).toISOString() : new Date().toISOString()
        }));

        const context: Record<string, unknown> = {
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
        };

        const session: ConversationSession = {
          id: conv.id,
          agentId: conv.mode,
          agentName,
          title: conv.title,
          preview,
          messages,
          context,
          createdAt: conv.createdAt ? new Date(conv.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: conv.updatedAt ? new Date(conv.updatedAt).toISOString() : (conv.createdAt ? new Date(conv.createdAt).toISOString() : new Date().toISOString())
        };

        // Mantém o título se já existir, senão gera um
        if (!session.title || session.title === 'Nova Conversa') {
            session.title = generateTitleFromSession(session);
        }

        return session;
      })
      .filter(session => session.agentId && (session.messages.length > 0 || session.context?.selectedModule || session.context?.portfolioSearchQuery || session.context?.contentPlan))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations]);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeConversationId) || null;
  }, [sessions, activeConversationId]);

  const createSession = (agentId: string) => {
    createNewConversation(agentId as AppMode);
  };

  const updateSession = (id: string, updates: Partial<ConversationSession>) => {
    if (updates.title) {
      updateConversationTitle(id, updates.title);
    }
    if (updates.context?.selectedModule !== undefined) {
      setSelectedModuleForConversation(id, updates.context.selectedModule);
    }
  };

  const setActiveSessionById = (id: string) => {
    setActiveConversationId(id);
  };

  const deleteSession = (id: string) => {
    deleteConversation(id);
  };

  const clearHistory = () => {
    clearAllConversations();
  };

  return {
    sessions,
    activeSession,
    activeSessionId: activeConversationId,
    createSession,
    updateSession,
    setActiveSessionById,
    deleteSession,
    clearHistory
  };
}
