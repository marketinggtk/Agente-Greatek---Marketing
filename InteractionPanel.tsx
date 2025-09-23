import React, { useState, useEffect, useMemo, useRef } from 'react';
import useAppStore from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';

interface InteractionPanelProps {
  onSubmit: (prompt: string) => void;
}

const InteractionPanel: React.FC<InteractionPanelProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    conversations,
    activeConversationId,
    isLoading, 
    error,
    stopGeneration,
  } = useAppStore();

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeConversationId),
    [conversations, activeConversationId]
  );
  
  const currentMode = activeConversation?.mode;

  useEffect(() => {
    setPrompt('');
  }, [activeConversationId]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Max height is 160px (40 * 4 lines)
      textarea.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSendMessage = () => {
    if (isLoading || !prompt.trim()) return;
    onSubmit(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isInteractionDisabled = isLoading;

  return (
    <div className="p-2 sm:p-4 bg-greatek-bg-light/70 border-t border-greatek-border mt-auto shrink-0">
      {isLoading && (
        <div className="flex justify-center mb-2 animate-fade-in">
          <button
              onClick={stopGeneration}
              className="px-4 py-1.5 text-xs font-semibold text-greatek-dark-blue bg-greatek-border rounded-full hover:bg-gray-300 transition-colors flex items-center"
          >
              <i className="bi bi-stop-circle mr-2"></i>
              Parar de Gerar
          </button>
        </div>
      )}
      <div className="flex items-end w-full rounded-lg bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-greatek-blue focus-within:border-transparent transition-shadow duration-200">
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isInteractionDisabled ? "Aguarde..." : `Enviar uma mensagem para ${currentMode}...`}
          disabled={isInteractionDisabled}
          className="flex-grow py-3 pl-3 sm:pl-5 pr-2 text-text-primary placeholder-text-secondary/70 focus:outline-none bg-transparent resize-none overflow-y-auto"
          aria-label="Comando para o agente"
        />
        <SubmitButton
          onClick={handleSendMessage}
          disabled={isInteractionDisabled || !prompt.trim()}
          className="h-12 w-16"
          aria-label="Enviar comando"
        >
          <i className="bi bi-send-fill text-white text-lg"></i>
        </SubmitButton>
      </div>
       {error && <p className="text-red-600 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
};

export default InteractionPanel;