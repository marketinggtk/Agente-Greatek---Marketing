import React from 'react';
import { Message, AppMode } from '../types';
import ResponseDisplay from './ResponseDisplay';
import DynamicLoader from './DynamicLoader';

interface ChatMessageProps {
  message: Message;
  index: number;
  isLastMessage: boolean;
  isLoading: boolean;
  agentInfo?: { iconClass: string; title: string };
  activeConversationId: string;
  activeConversationMode: AppMode;
  onFeedback: (conversationId: string, messageIndex: number, type: 'good' | 'bad') => void;
  onUpscaleImage: (conversationId: string, messageIndex: number) => void;
  onRegenerateImage: (conversationId: string, messageIndex: number) => void;
}

const getFileIconClass = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'bi-file-earmark-image';
  if (mimeType === 'application/pdf') return 'bi-file-earmark-pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bi-file-earmark-spreadsheet';
  if (mimeType.includes('presentation')) return 'bi-file-earmark-ppt';
  if (mimeType.includes('word')) return 'bi-file-earmark-word';
  return 'bi-file-earmark-text';
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  isLastMessage,
  isLoading,
  agentInfo,
  activeConversationId,
  activeConversationMode,
  onFeedback,
  onUpscaleImage,
  onRegenerateImage,
}) => {
  const isAgent = (message.role as string) === 'agent' || (message.role as string) === 'model' || (message.role as string) === 'assistant';
  const isUser = message.role === 'user';
  const showLoader = isLoading && isLastMessage && isAgent && (message.content === '' || !message.content);

  return (
    <div className={`flex w-full mb-6 relative animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            
            {/* Agent Icon */}
            {isAgent && (
            <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-greatek-blue flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm">
                    <i className={`bi ${agentInfo?.iconClass || 'bi-robot'} text-lg`}></i>
                </div>
            </div>
            )}
            
            {/* Column for Bubble and Feedback */}
            <div className={`flex flex-col min-w-0 ${isUser ? 'items-end max-w-[85%]' : 'flex-1 items-start w-full max-w-4xl'}`}>
                
                {/* Content Wrapper */}
                <div className={isUser 
                    ? 'inline-block p-4 sm:p-5 rounded-[2rem] rounded-tr-none shadow-md bg-greatek-blue text-white break-words whitespace-pre-wrap overflow-wrap-anywhere text-sm md:text-base font-medium' 
                    : 'w-full p-6 rounded-2xl bg-white border border-slate-100 shadow-sm break-words overflow-wrap-anywhere text-sm md:text-base leading-7 text-slate-700'
                }>
                  {showLoader ? (
                    <DynamicLoader />
                  ) : isAgent ? (
                    <ResponseDisplay 
                        message={message} 
                        mode={activeConversationMode} 
                        isLastMessage={isLastMessage && !isLoading}
                        onUpscale={() => onUpscaleImage(activeConversationId, index)}
                        onRegenerate={() => onRegenerateImage(activeConversationId, index)}
                    />
                  ) : (
                    <>
                        <div className="whitespace-pre-wrap text-left break-words overflow-wrap-anywhere max-w-full text-sm md:text-base leading-7 mb-0">{typeof message.content === 'string' ? message.content : 'Conteúdo complexo'}</div>
                        {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-2 justify-start">
                            {message.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/10 p-1.5 rounded-md text-xs">
                                <i className={`bi ${getFileIconClass(att.type)}`}></i>
                                <span className="truncate max-w-36">{att.name}</span>
                            </div>
                            ))}
                        </div>
                        )}
                    </>
                  )}
                </div>

                {/* Feedback Buttons for Agent */}
                {isAgent && !showLoader && (
                    <div className="mt-2 flex items-center gap-2">
                    <button 
                        onClick={() => onFeedback(activeConversationId, index, 'good')} 
                        className={`p-1.5 rounded-full text-xs transition-colors ${message.feedback?.type === 'good' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'}`}
                        aria-label="Resposta boa"
                    >
                        <i className="bi bi-hand-thumbs-up-fill"></i>
                    </button>
                    <button 
                        onClick={() => onFeedback(activeConversationId, index, 'bad')} 
                        className={`p-1.5 rounded-full text-xs transition-colors ${message.feedback?.type === 'bad' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'}`}
                        aria-label="Resposta ruim"
                    >
                        <i className="bi bi-hand-thumbs-down-fill"></i>
                    </button>
                    </div>
                )}
            </div>
        
            {/* User Icon */}
            {isUser && (
            <div className="flex-shrink-0 ml-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm mt-1">
                    <i className="bi bi-person-fill text-lg"></i>
                </div>
            </div>
            )}
            
        </div>
    </div>
  );
};

export default ChatMessage;
