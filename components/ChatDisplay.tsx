

import React, { useEffect, useRef, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import ResponseDisplay from './ResponseDisplay';
import { AGENTS, MODE_DESCRIPTIONS } from '../constants';
import AgentWelcome from './AgentWelcome';
import DynamicLoader from './DynamicLoader';

const getFileIconClass = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'bi-file-earmark-image';
  if (mimeType === 'application/pdf') return 'bi-file-earmark-pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bi-file-earmark-spreadsheet';
  if (mimeType.includes('presentation')) return 'bi-file-earmark-ppt';
  if (mimeType.includes('word')) return 'bi-file-earmark-word';
  return 'bi-file-earmark-text';
};

const ChatDisplay: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    isLoading, 
    setMessageFeedback, 
    upscaleImage, 
    regenerateImage 
  } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isLoading]);

  if (!activeConversation) {
    return <div className="h-full flex items-center justify-center"><p>Selecione uma conversa para começar.</p></div>;
  }
  
  const agentInfo = AGENTS.find(agent => agent.mode === activeConversation.mode);
  const modeInfo = activeConversation ? MODE_DESCRIPTIONS[activeConversation.mode] : undefined;

  return (
    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
      {activeConversation.messages.length === 0 && !isLoading ? (
        <AgentWelcome mode={activeConversation.mode} />
      ) : (
        <>
            {/* Context Header for existing conversations */}
            {modeInfo && (
                 <div className="text-center py-3 border-b border-greatek-border/80">
                    <h2 className="text-base font-semibold text-greatek-dark-blue">{modeInfo.title}</h2>
                </div>
            )}
           
            {activeConversation.messages.map((message, index) => {
                const isLastMessage = index === activeConversation.messages.length - 1;
                const showLoader = isLoading && isLastMessage && message.role === 'agent' && message.content === '';

                return (
                <div key={index} className={`flex items-start gap-3 sm:gap-4 animate-fade-in-up ${message.role === 'user' ? 'justify-end' : ''}`}>
                    
                    {/* Agent Icon */}
                    {message.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-greatek-blue flex items-center justify-center text-white flex-shrink-0 mt-1">
                        <i className={`bi ${agentInfo?.iconClass || 'bi-robot'} text-lg`}></i>
                    </div>
                    )}
                    
                    {/* Content Wrapper */}
                    <div className={`flex flex-col ${message.role === 'user' ? 'w-full max-w-3xl items-end' : 'flex-1 items-start'}`}>
                      {/* Bubble for user, plain container for agent */}
                      <div className={message.role === 'user' 
                          ? 'inline-block p-3 sm:p-4 rounded-xl shadow-sm bg-greatek-blue text-white rounded-br-none' 
                          : 'w-full'
                      }>
                        {showLoader ? (
                          <DynamicLoader />
                        ) : message.role === 'agent' ? (
                          <ResponseDisplay 
                              message={message} 
                              mode={activeConversation.mode} 
                              isLastMessage={isLastMessage && !isLoading}
                              onUpscale={() => upscaleImage(activeConversation.id, index)}
                              onRegenerate={() => regenerateImage(activeConversation.id, index)}
                          />
                        ) : (
                          <>
                              <p className="whitespace-pre-wrap text-left">{typeof message.content === 'string' ? message.content : 'Conteúdo complexo'}</p>
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
                      {message.role === 'agent' && !showLoader && (
                          <div className="mt-2 flex items-center gap-2">
                          <button 
                              onClick={() => setMessageFeedback(activeConversation.id, index, 'good')} 
                              className={`p-1.5 rounded-full text-xs transition-colors ${message.feedback?.type === 'good' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'}`}
                              aria-label="Resposta boa"
                          >
                              <i className="bi bi-hand-thumbs-up-fill"></i>
                          </button>
                          <button 
                              onClick={() => setMessageFeedback(activeConversation.id, index, 'bad')} 
                              className={`p-1.5 rounded-full text-xs transition-colors ${message.feedback?.type === 'bad' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'}`}
                              aria-label="Resposta ruim"
                          >
                              <i className="bi bi-hand-thumbs-down-fill"></i>
                          </button>
                          </div>
                      )}
                    </div>

                    {/* User Icon */}
                    {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 mt-1">
                        <i className="bi bi-person-fill text-lg"></i>
                    </div>
                    )}

                </div>
                );
            })}
        </>
      )}
    </div>
  );
};

export default ChatDisplay;