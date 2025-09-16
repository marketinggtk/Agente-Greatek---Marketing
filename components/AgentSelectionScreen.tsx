

import React, { useState } from 'react';
import { AppMode } from '../types';
import { AGENTS, AgentDefinition } from '../constants';
import FeedbackModal from './FeedbackModal';

interface AgentSelectionScreenProps {
  onSelectAgent: (mode: AppMode) => void;
}

const AgentSelectionScreen: React.FC<AgentSelectionScreenProps> = ({ onSelectAgent }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const commercialAgents = AGENTS.filter(agent => agent.category === 'Comercial');
  const marketingAgents = AGENTS.filter(agent => agent.category === 'Marketing');
  

  const AgentCard: React.FC<{ agent: AgentDefinition }> = ({ agent }) => (
    <button
      onClick={() => onSelectAgent(agent.mode)}
      className="group w-full p-4 border border-white/50 rounded-lg text-left hover:bg-white/10 transition-colors duration-200"
    >
      <h3 className="text-lg font-semibold text-white flex items-center">
        <i className={`bi ${agent.iconClass} w-5 h-5 mr-3 text-white/80 group-hover:text-white`}></i>
        {agent.title}
      </h3>
    </button>
  );

  return (
    <div className="relative h-screen w-screen bg-greatek-blue flex flex-col items-center justify-center p-8 animate-fade-in text-white">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Selecione um Agente</h1>
        <p className="text-white/80 mt-2">Escolha com qual especialista você quer conversar.</p>
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        <div className="flex flex-col space-y-6">
          <h2 className="text-3xl font-bold text-center border-b-2 border-white/30 pb-2">Comercial</h2>
          <div className="flex flex-col space-y-4">
            {commercialAgents.map(agent => (
              <AgentCard key={agent.mode} agent={agent} />
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          <h2 className="text-3xl font-bold text-center border-b-2 border-white/30 pb-2">Marketing</h2>
          <div className="flex flex-col space-y-4">
            {marketingAgents.map(agent => (
              <AgentCard key={agent.mode} agent={agent} />
            ))}
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 w-full px-6 flex items-center justify-between text-white/80 text-xs">
        <span>Agente Greatek v1.0.0</span>
        <span className="absolute left-1/2 -translate-x-1/2">Greatek 2025 © - Todos os direitos reservados</span>
      </footer>

      <button
        onClick={() => setIsFeedbackModalOpen(true)}
        className="fixed bottom-6 right-6 bg-white text-greatek-dark-blue w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-greatek-bg-light transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Tem alguma ideia de melhoria?"
      >
        <i className="bi bi-question-lg text-3xl"></i>
      </button>
      
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />
    </div>
  );
};

export default AgentSelectionScreen;