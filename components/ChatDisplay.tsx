import React, { useEffect, useRef, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import ResponseDisplay from './ResponseDisplay';
import { AGENTS } from '../constants';
import AgentWelcome from './AgentWelcome';

const ChatDisplay: React.FC = () => {
  const { conversations, activeConversationId, isLoading, setMessageFeedback } = useAppStore();
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

  const showWelcome = activeConversation.messages.length === 0 && !isLoading && agentInfo;

  const messages = activeConversation.messages;
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Show typing indicator only when loading and the last message is an empty placeholder from the agent.
  const isAgentReplying = isLoading && lastMessage?.role === 'agent' && (typeof lastMessage.content === 'string' && lastMessage.content === '');
  
  // Do not render the empty placeholder message itself.
  const messagesToRender = isAgentReplying ? messages.slice(0, -1) : messages;
  
  return (
    <div className="flex-grow flex flex-col relative overflow-hidden">
      <div className="p-3 border-b border-greatek-border bg-greatek-bg-light/80 sticky top-0 z-10 flex items-center justify-center min-h-[45px]">
        {agentInfo && (
          <div className="flex items-center gap-2 text-greatek-dark-blue">
            <i className={`bi ${agentInfo.iconClass} text-base`}></i>
            <h3 className="text-sm font-semibold">{agentInfo.title}</h3>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-grow space-y-6 p-4 overflow-y-auto" aria-live="polite" aria-relevant="additions">
        {showWelcome && <AgentWelcome mode={activeConversation.mode} />}
        
        {messagesToRender.map((message, index) => (
          <div key={index} className={`flex items-start gap-4 animate-fade-in-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'agent' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-greatek-dark-blue flex items-center justify-center">
                  <i className="bi bi-robot text-white text-lg"></i>
              </div>
            )}

            <div className={
                message.role === 'user'
                ? 'max-w-xl w-fit p-4 rounded-xl shadow-sm bg-greatek-blue text-white rounded-br-none'
                : 'w-full flex flex-col'
            }>
              {message.role === 'user' ? (
                <p className="whitespace-pre-wrap">{message.content as string}</p>
              ) : (
                <>
                  <ResponseDisplay message={message} mode={activeConversation.mode} isLastMessage={index === messagesToRender.length - 1} />
                  {!isLoading && index === messagesToRender.length - 1 && (
                    <div className="mt-2 flex items-center gap-1">
                      <button
                          onClick={() => setMessageFeedback(activeConversation.id, index, 'good')}
                          className={`p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors ${message.feedback === 'good' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}`}
                          aria-label="Resposta útil"
                      >
                          <i className="bi bi-hand-thumbs-up"></i>
                      </button>
                      <button
                          onClick={() => setMessageFeedback(activeConversation.id, index, 'bad')}
                          className={`p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors ${message.feedback === 'bad' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}`}
                          aria-label="Resposta não foi útil"
                      >
                          <i className="bi bi-hand-thumbs-down"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <i className="bi bi-person-fill text-gray-600 text-lg"></i>
              </div>
            )}
          </div>
        ))}
        {isAgentReplying && (
            <div className={`flex items-start gap-4 animate-fade-in-up justify-start`}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-greatek-dark-blue flex items-center justify-center">
                    <i className="bi bi-robot text-white text-lg"></i>
                </div>
                <div className="p-3 bg-white border border-greatek-border rounded-xl rounded-bl-none shadow-sm">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatDisplay;