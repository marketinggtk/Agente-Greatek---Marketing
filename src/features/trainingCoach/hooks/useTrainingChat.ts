import { useState, useCallback, useMemo } from 'react';
import { AppMode, Message } from '../../../../types';
import { streamGeminiQuery } from '../../../../services/geminiService';
import { TrainingModule } from '../types/trainingModule';
import { buildSystemPrompt } from '../utils/promptBuilder';
import { useAppStore } from '../../../../store/useAppStore';

export type TrainingChatMessage = Message & { 
    id: string; 
    status?: 'streaming' | 'done' | 'error';
};

/**
 * Hook to manage the chat logic with the AI Specialist
 */
export const useTrainingChat = (selectedModule: TrainingModule | null) => {
    const { conversations, activeConversationId } = useAppStore();
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messages = useMemo(() => {
        if (!activeConversation) return [];
        return (activeConversation.messages || []).map((m, index) => ({
            id: `msg-${index}-${m.role}`,
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
            status: 'done' as const
        }));
    }, [activeConversation]);

    const sendMessage = useCallback(async (customInput?: string) => {
        if (isLoading || !selectedModule || !activeConversationId) return;
        const textToSend = customInput?.trim() || input.trim();
        if (!textToSend) return;

        const userMessage: Message = { 
            role: 'user', 
            content: textToSend 
        };
        
        // Save history in store
        useAppStore.setState(state => ({
            conversations: state.conversations.map(c => 
                c.id === activeConversationId 
                ? { ...c, messages: [...(c.messages || []), userMessage] }
                : c
            )
        }));

        const currentHistory = activeConversation ? [...activeConversation.messages, userMessage] : [userMessage];

        if (!customInput) setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = buildSystemPrompt(selectedModule);
            
            // Add initial empty assistant message to store
            useAppStore.setState(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId 
                    ? { ...c, messages: [...(c.messages || []), { role: 'agent', content: "" }] }
                    : c
                )
            }));

            const stream = streamGeminiQuery(AppMode.TRAINING_COACH, [
                { role: 'user', content: systemPrompt },
                ...currentHistory.map(({ role, content }) => ({ role, content }))
            ]);

            let assistantContent = "";

            for await (const chunk of stream) {
                assistantContent += chunk;
                useAppStore.setState(state => ({
                    conversations: state.conversations.map(c => {
                        if (c.id !== activeConversationId) return c;
                        const msgs = [...c.messages];
                        if (msgs.length > 0 && msgs[msgs.length - 1].role === 'agent') {
                            msgs[msgs.length - 1].content = assistantContent;
                        }
                        return { ...c, messages: msgs };
                    })
                }));
            }

            // Update title if needed
            if (activeConversation && (!activeConversation.title || activeConversation.title === 'Nova Conversa')) {
                useAppStore.setState(state => ({
                    conversations: state.conversations.map(c => 
                        c.id === activeConversationId 
                        ? { ...c, title: selectedModule.displayTitle || selectedModule.title }
                        : c
                    )
                }));
            }

        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = "Tive uma instabilidade ao consultar o especialista. Tente novamente em alguns instantes.";
            useAppStore.setState(state => ({
                conversations: state.conversations.map(c => {
                    if (c.id !== activeConversationId) return c;
                    const msgs = [...c.messages];
                    if (msgs.length > 0 && msgs[msgs.length - 1].role === 'agent') {
                        msgs[msgs.length - 1].content = errorMsg;
                    }
                    return { ...c, messages: msgs };
                })
            }));
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, activeConversation, activeConversationId, selectedModule]);

    const handleClearChat = useCallback(() => {
        if (activeConversationId) {
            useAppStore.setState(state => ({
                conversations: state.conversations.map(c => 
                    c.id === activeConversationId 
                    ? { ...c, messages: [] }
                    : c
                )
            }));
        }
        setInput('');
    }, [activeConversationId]);

    return {
        messages,
        input,
        setInput,
        isLoading,
        sendMessage,
        clearChat: handleClearChat
    };
};
