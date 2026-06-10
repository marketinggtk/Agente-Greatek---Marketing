import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ConsultantThinking } from './ConsultantThinking';
import { Message } from '../../../../types';
import { TrainingModule } from '../types/trainingModule';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { motion, AnimatePresence } from 'motion/react';
import { ChatStartPanel } from './ChatStartPanel';

interface ChatTabProps {
    messages: (Message & { id: string })[];
    input: string;
    setInput: (val: string) => void;
    isLoading: boolean;
    onSendMessage: (customInput?: string) => void;
    module: TrainingModule;
}

export const ChatTab: React.FC<ChatTabProps> = ({ 
    messages, 
    input, 
    setInput, 
    isLoading, 
    onSendMessage, 
    module 
}) => {
    const scrollRef = useAutoScroll(messages);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage();
    };

    // Determine if we should show the thinking state
    const lastMessage = messages[messages.length - 1];
    const showThinking = isLoading && (!lastMessage || lastMessage.role === 'user' || (['model', 'agent', 'assistant'].includes(lastMessage.role as string) && !lastMessage.content.trim()));

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full min-h-full bg-transparent space-y-8"
        >
            <div className="space-y-8">
                {messages.length === 0 ? (
                    <ChatStartPanel module={module} onSelectSuggestion={onSendMessage} />
                ) : (
                    <div className="space-y-10 pb-4">
                        {messages.map((m) => (
                            <ChatMessage key={m.id} message={m} />
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {showThinking && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex justify-start w-full"
                        >
                            <ConsultantThinking />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input visual esperado: integrado de forma leve e natural ao fluxo da página, sem faixa branca artificial */}
            <form onSubmit={handleFormSubmit} className="mt-8 flex items-center gap-4">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Tire suas dúvidas técnicas ou peça dicas de venda..." 
                    className="flex-grow rounded-2xl border border-gray-200 bg-white px-6 py-5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-greatek-blue/40 focus:ring-4 focus:ring-greatek-blue/10"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()} 
                    className="h-16 w-16 rounded-2xl bg-greatek-dark-blue hover:bg-greatek-blue text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-sm shrink-0"
                    id="submit-message-btn"
                >
                    <i className="bi bi-send-fill text-xl"></i>
                </button>
            </form>

            {/* Scrolling target element at the end of the content */}
            <div ref={scrollRef} className="h-2" />
        </motion.div>
    );
};

