
import React, { useState, useEffect, useMemo, useRef } from 'react';
import useAppStore from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import { AppMode } from '../types';

// Define the SpeechRecognition type for broader compatibility
// Fix: Cast window to 'any' to avoid TypeScript errors for non-standard properties.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const InteractionPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    conversations,
    activeConversationId,
    isLoading, 
    error,
    stopGeneration,
    submitQuery,
    attachments,
    addAttachments,
    removeAttachment,
  } = useAppStore();

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeConversationId),
    [conversations, activeConversationId]
  );
  
  const currentMode = activeConversation?.mode;
  const speechRecognitionSupported = !!recognition;

  // Setup speech recognition handlers
  useEffect(() => {
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
    };
  }, []);

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
    if (isLoading || (!prompt.trim() && attachments.length === 0)) return;

    submitQuery(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addAttachments(Array.from(e.target.files));
      e.target.value = ''; // Reset input value to allow selecting the same file again
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    removeAttachment(indexToRemove);
  };

  const handleToggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      {attachments.length > 0 && (
        <div className="mb-2 p-2 border border-greatek-border rounded-lg bg-white max-h-32 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-greatek-bg-light p-1.5 rounded-md text-xs text-text-secondary animate-fade-in">
                <i className="bi bi-file-earmark-text text-base"></i>
                <span className="font-medium truncate max-w-28">{file.name}</span>
                <span className="text-gray-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-0.5 rounded-full hover:bg-gray-300 flex-shrink-0"
                  aria-label={`Remover ${file.name}`}
                >
                  <i className="bi bi-x-lg text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-end w-full rounded-lg bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-greatek-blue focus-within:border-transparent transition-shadow duration-200">
        <button
          onClick={handleFileSelect}
          disabled={isInteractionDisabled}
          className="p-3 text-text-secondary hover:text-greatek-blue disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Anexar arquivos"
        >
          <i className="bi bi-paperclip text-xl"></i>
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.txt,.csv,.xls,.xlsx"
        />
        {speechRecognitionSupported && (
            <button
              onClick={handleToggleListening}
              disabled={isInteractionDisabled}
              className={`p-3 transition-colors ${
                isListening
                  ? 'text-red-500 animate-pulse'
                  : 'text-text-secondary hover:text-greatek-blue'
              } disabled:text-gray-400 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Parar gravação' : 'Gravar comando de voz'}
              title={isListening ? 'Parar gravação' : 'Gravar comando de voz'}
            >
              <i className="bi bi-mic-fill text-xl"></i>
            </button>
        )}
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Ouvindo..." : isInteractionDisabled ? "Aguarde..." : `Enviar uma mensagem para ${currentMode}...`}
          disabled={isInteractionDisabled}
          className="flex-grow py-3 pl-2 pr-2 bg-white text-text-primary placeholder-text-secondary/70 focus:outline-none resize-none overflow-y-auto"
          aria-label="Comando para o agente"
        />
        <SubmitButton
          onClick={handleSendMessage}
          disabled={isInteractionDisabled || (!prompt.trim() && attachments.length === 0)}
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