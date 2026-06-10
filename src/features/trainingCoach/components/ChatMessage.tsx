import React from 'react';
import Markdown from 'react-markdown';
import { Message } from '../../../../types';
import { ConsultantResponseSections } from './ConsultantResponseSections';

interface ChatMessageProps {
    message: Message & { id: string };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isAssistant = (message.role as string) === 'assistant' || (message.role as string) === 'model' || (message.role as string) === 'agent';

    // Hide empty AI messages (when still thinking and no content yet)
    if (isAssistant && !message.content.trim()) {
        return null;
    }

    return (
        <div className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            <div className={`${
                isAssistant 
                    ? 'w-full py-2' 
                    : 'max-w-[75%] p-6 rounded-[2rem] rounded-tr-none bg-greatek-blue text-white shadow-lg'
            }`}>
                {isAssistant && (
                    <div className="flex items-center gap-3 mb-6 text-greatek-blue">
                        <div className="w-8 h-8 bg-greatek-blue/10 text-greatek-blue rounded-lg flex items-center justify-center">
                            <i className="bi bi-person-badge-fill text-sm"></i>
                        </div>
                        <p className="font-black text-greatek-blue uppercase tracking-[0.35em] text-[10px]">
                            Consultor Sênior Greatek
                        </p>
                    </div>
                )}
                
                {isAssistant ? (
                    <ConsultantResponseSections content={message.content} />
                ) : (
                    <div className="prose prose-sm md:prose-base max-w-none text-white prose-invert font-bold">
                        <Markdown>{message.content}</Markdown>
                    </div>
                )}
            </div>
        </div>
    );
};
