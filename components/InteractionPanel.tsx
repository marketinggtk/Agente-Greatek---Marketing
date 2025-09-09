import React, { useState, useEffect } from 'react';
import { AppMode, PageOptimizationPackage } from '../types';
import { PLACEHOLDER_PROMPTS } from '../constants';
import ResponseDisplay from './ResponseDisplay';
import ModeDescription from './ModeDescription';
import { SendIcon } from './Icons';
import Loader from './Loader';

interface InteractionPanelProps {
  mode: AppMode;
  isLoading: boolean;
  error: string | null;
  response: PageOptimizationPackage | string | null;
  onSubmit: (prompt: string) => void;
}

const InteractionPanel: React.FC<InteractionPanelProps> = ({ mode, isLoading, error, response, onSubmit }) => {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt('');
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };
  
  const renderContent = () => {
    if (isLoading) return <Loader />;
    if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-md m-4 border border-red-200">{error}</div>;
    if (response) return <div className="p-4"><ResponseDisplay response={response} /></div>;

    return <ModeDescription mode={mode} />;
  };

  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg overflow-hidden border border-greatek-border">
      {/* Área de Resposta */}
      <div className="flex-grow p-1 md:p-2 overflow-y-auto min-h-[500px]">
        {renderContent()}
      </div>

      {/* Área de Input */}
      <div className="p-4 bg-greatek-bg-light/70 border-t border-greatek-border mt-auto">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PLACEHOLDER_PROMPTS[mode]}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 rounded-full py-3 pl-5 pr-16 text-text-primary placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:border-transparent transition-shadow duration-200"
            aria-label="Comando para o agente"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute inset-y-0 right-0 flex items-center justify-center h-12 w-12 rounded-full bg-greatek-blue hover:bg-greatek-dark-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greatek-blue"
            aria-label="Enviar comando"
          >
            <SendIcon className="h-5 w-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InteractionPanel;