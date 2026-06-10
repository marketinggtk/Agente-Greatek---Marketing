

import React, { useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AGENTS, MODE_DESCRIPTIONS } from '../constants';
import AgentWelcome from './AgentWelcome';
import ChatMessage from './ChatMessage';

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
    conversations.find(c => String(c.id) === String(activeConversationId)),
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
    <div ref={scrollRef} className="flex-grow overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar w-full min-w-0">
      <div className="max-w-4xl mx-auto space-y-6 w-full min-w-0 flex flex-col">
        {activeConversation.messages.length === 0 && !isLoading ? (
          <AgentWelcome mode={activeConversation.mode} />
        ) : (
          <>
              {/* Context Header for existing conversations */}
              {modeInfo && (
                   <div className="text-center py-3 border-b border-greatek-border/80 w-full">
                      <h2 className="text-base font-semibold text-greatek-dark-blue">{modeInfo.title}</h2>
                  </div>
              )}
             
              {activeConversation.messages.map((message, index) => (
                  <ChatMessage 
                      key={index}
                      message={message}
                      index={index}
                      isLastMessage={index === activeConversation.messages.length - 1}
                      isLoading={isLoading}
                      agentInfo={agentInfo}
                      activeConversationId={activeConversation.id}
                      activeConversationMode={activeConversation.mode}
                      onFeedback={setMessageFeedback}
                      onUpscaleImage={upscaleImage}
                      onRegenerateImage={regenerateImage}
                  />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatDisplay;