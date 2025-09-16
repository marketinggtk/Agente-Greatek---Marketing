import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppMode, Conversation, Message } from '../types';
import { generateConversationTitle, runGeminiJsonQuery, streamGeminiQuery } from '../services/geminiService';

interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  abortController: AbortController | null;

  createNewConversation: (mode: AppMode) => void;
  setActiveConversationId: (id: string) => void;
  startAgentResponse: (conversationId: string, userMessage: Message) => void;
  appendChunkToLastMessage: (conversationId: string, chunk: string) => void;
  updateLastMessage: (conversationId: string, newMessage: Message) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  setLoading: (isLoading: boolean) => void;
  setConversationError: (error: string | null) => void;
  deleteConversation: (id: string) => void;
  returnToAgentSelection: () => void;
  setAbortController: (controller: AbortController | null) => void;
  stopGeneration: () => void;
  setMessageFeedback: (conversationId: string, messageIndex: number, feedback: 'good' | 'bad') => void;
  submitQuery: (prompt: string) => Promise<void>;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      error: null,
      abortController: null,
      
      createNewConversation: (mode) => {
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          title: `Nova Conversa`,
          mode: mode,
          messages: [],
          createdAt: new Date(),
        };
        set(state => ({
          conversations: [...state.conversations, newConversation],
          activeConversationId: newConversation.id,
          error: null,
        }));
      },

      setActiveConversationId: (id) => set({
        activeConversationId: id,
        error: null
      }),
      
      startAgentResponse: (conversationId, userMessage) => set(state => {
        const conversations = state.conversations.map(conv => {
          if (conv.id === conversationId) {
            const agentPlaceholder: Message = { role: 'agent', content: '' };
            return {
              ...conv,
              messages: [
                ...conv.messages,
                userMessage,
                agentPlaceholder
              ],
            };
          }
          return conv;
        });
        return { 
          conversations, 
          isLoading: true,
          error: null 
        };
      }),
      
      appendChunkToLastMessage: (conversationId, chunk) => set(state => ({
        conversations: state.conversations.map(conv => {
          if (conv.id === conversationId) {
            const newMessages = [...conv.messages];
            const lastMessageIndex = newMessages.length - 1;
            const lastMessage = newMessages[lastMessageIndex];
            
            if (lastMessage && lastMessage.role === 'agent' && typeof lastMessage.content === 'string') {
              newMessages[lastMessageIndex] = {
                ...lastMessage,
                content: lastMessage.content + chunk
              };
              return { ...conv, messages: newMessages };
            }
          }
          return conv;
        })
      })),

      updateLastMessage: (conversationId, updatedMessage) => set(state => {
          const conversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                  const newMessages = [...conv.messages];
                  newMessages[newMessages.length - 1] = updatedMessage;
                  return { ...conv, messages: newMessages };
              }
              return conv;
          });
          return { conversations };
      }),

      updateConversationTitle: (conversationId, title) => set(state => {
          const conversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                  return { ...conv, title: title };
              }
              return conv;
          });
          return { conversations };
      }),

      setLoading: (isLoading) => set({ isLoading }),
      
      setConversationError: (error) => set({ error, isLoading: false }),

      deleteConversation: (id: string) => {
        set(state => {
          const remainingConversations = state.conversations.filter(c => c.id !== id);
    
          if (remainingConversations.length === 0) {
            return {
              conversations: [],
              activeConversationId: null,
            };
          }
    
          let nextActiveId = state.activeConversationId;
          if (state.activeConversationId === id) {
            const sorted = [...remainingConversations].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            nextActiveId = sorted[0].id;
          }
    
          return {
            conversations: remainingConversations,
            activeConversationId: nextActiveId,
          };
        });
      },

      returnToAgentSelection: () => set({ activeConversationId: null }),

      setAbortController: (controller) => set({ abortController: controller }),

      stopGeneration: () => {
        get().abortController?.abort();
        set({ isLoading: false, abortController: null });
      },

      setMessageFeedback: (conversationId, messageIndex, feedback) => set(state => ({
        conversations: state.conversations.map(conv => {
          if (conv.id === conversationId) {
            const newMessages = [...conv.messages];
            const messageToUpdate = newMessages[messageIndex];
            
            if (messageToUpdate) {
              newMessages[messageIndex] = {
                ...messageToUpdate,
                feedback: messageToUpdate.feedback === feedback ? null : feedback
              };
              return { ...conv, messages: newMessages };
            }
          }
          return conv;
        })
      })),
      
      submitQuery: async (prompt: string) => {
        const { activeConversationId, conversations, startAgentResponse, updateConversationTitle, setAbortController, appendChunkToLastMessage, updateLastMessage, setConversationError, setLoading } = get();
        const currentActiveConversation = conversations.find(c => c.id === activeConversationId);
        if (!prompt.trim() || !currentActiveConversation) return;

        const conversationId = currentActiveConversation.id;
        const mode = currentActiveConversation.mode;
        const isFirstUserMessage = currentActiveConversation.messages.filter(m => m.role === 'user').length === 0;

        const userMessage: Message = { role: 'user', content: prompt };
        startAgentResponse(conversationId, userMessage);
        
        if (isFirstUserMessage) {
            generateConversationTitle(prompt).then(title => {
                updateConversationTitle(conversationId, title);
            });
        }
        
        const controller = new AbortController();
        setAbortController(controller);

        const fullHistory = [...currentActiveConversation.messages, userMessage];

        try {
          if (mode === AppMode.PAGE || mode === AppMode.MARKET_INTEL || mode === AppMode.INSTRUCTOR || mode === AppMode.ARQUITETO || mode === AppMode.VIGIA) {
            const result = await runGeminiJsonQuery(mode, fullHistory, controller.signal);
            updateLastMessage(conversationId, { role: 'agent', content: result });
          } else {
            const stream = streamGeminiQuery(mode, fullHistory, controller.signal);
            for await (const chunk of stream) {
              appendChunkToLastMessage(conversationId, chunk);
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            console.log('Stream generation aborted by user.');
            updateLastMessage(conversationId, { role: 'agent', content: 'Geração interrompida.' });
          } else {
            const errorMessage = err instanceof Error ? `Ocorreu um erro: ${err.message}` : 'Ocorreu um erro desconhecido.';
            updateLastMessage(conversationId, { role: 'agent', content: errorMessage });
            setConversationError(errorMessage);
          }
        } finally {
          setLoading(false);
          setAbortController(null);
        }
      },
    }),
    {
      name: 'greatek-agent-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
            return new Date(value);
          }
          return value;
        },
      }),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);

export default useAppStore;