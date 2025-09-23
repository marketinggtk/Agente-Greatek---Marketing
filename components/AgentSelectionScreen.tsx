
import React, { useState } from 'react';
import { AppMode } from '../types';
import { AGENTS, MODE_DESCRIPTIONS } from '../constants';
import useAppStore from '../store/useAppStore';
import FeedbackModal from './FeedbackModal';

// Card principal para o grid da esquerda
const PrimaryAgentCard: React.FC<{
  title: string;
  description: string;
  iconClass: string;
  onClick: () => void;
}> = ({ title, description, iconClass, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col justify-between w-full p-6 border border-white/10 rounded-2xl text-left bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/50 overflow-hidden"
  >
    <i className={`bi ${iconClass} absolute -top-4 -right-4 text-8xl text-white/5 group-hover:text-white/10 transition-colors duration-300 transform rotate-12`}></i>
    <div className="relative z-10 flex flex-col h-full">
      <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        <i className={`bi ${iconClass} text-2xl text-white`}></i>
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-white/70 mt-2 flex-grow">{description}</p>
    </div>
  </button>
);

// Card compacto para a coluna da direita
const SecondaryCard: React.FC<{
  title: string;
  iconClass: string;
  onClick: () => void;
  isTool?: boolean;
}> = ({ title, iconClass, onClick, isTool = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/50 ${isTool ? 'bg-greatek-dark-blue/30 hover:bg-greatek-dark-blue/50' : 'bg-white/5 hover:bg-white/10'}`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${isTool ? 'bg-white/90 text-greatek-dark-blue' : 'bg-white/10 text-white'}`}>
      <i className={`bi ${iconClass} text-xl`}></i>
    </div>
    <div>
      <h4 className="font-bold text-white">{title}</h4>
    </div>
  </button>
);

interface AgentSelectionScreenProps {
  onSelectAgent: (mode: AppMode) => void;
}

const AgentSelectionScreen: React.FC<AgentSelectionScreenProps> = ({ onSelectAgent }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const { toggleAnalyzer } = useAppStore();

  const commercialAgents = AGENTS.filter(a => a.category === 'Comercial');
  const marketingAgents = AGENTS.filter(a => a.category === 'Marketing');

  // Ordena os agentes comerciais com base na hierarquia solicitada
  const hierarchy = [
    AppMode.INTEGRATOR, AppMode.ARQUITETO, AppMode.INSTRUCTOR,
    AppMode.SKYWATCH_ASSISTANT, AppMode.MARKET_INTEL, AppMode.SALES_ASSISTANT
  ];
  const orderedCommercialAgents = commercialAgents.sort((a, b) => {
    const indexA = hierarchy.indexOf(a.mode);
    const indexB = hierarchy.indexOf(b.mode);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="min-h-screen w-full bg-greatek-blue flex flex-col items-center p-4 sm:p-6 lg:p-8 animate-fade-in text-white overflow-hidden">
      <header className="w-full max-w-7xl mx-auto text-left mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter">Bem-vindo(a)</h1>
        <p className="text-white/80 mt-2 text-lg">Selecione um agente ou ferramenta para começar.</p>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col lg:flex-row gap-6">
        {/* Coluna de Agentes Principais */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orderedCommercialAgents.map(agent => (
                 <PrimaryAgentCard
                    key={agent.mode}
                    title={agent.title}
                    description={MODE_DESCRIPTIONS[agent.mode].description}
                    iconClass={agent.iconClass}
                    onClick={() => onSelectAgent(agent.mode)}
                />
            ))}
        </div>

        {/* Coluna Lateral para Ferramentas e Marketing */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
             <h3 className="text-sm font-semibold uppercase text-white/60 tracking-wider px-2">Ferramentas Úteis</h3>
             <SecondaryCard
                title="Analisador de Planilha"
                iconClass="bi-file-earmark-spreadsheet-fill"
                onClick={toggleAnalyzer}
                isTool
             />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 flex-1">
             <h3 className="text-sm font-semibold uppercase text-white/60 tracking-wider px-2">Marketing</h3>
             {marketingAgents.map(agent => (
                <SecondaryCard
                    key={agent.mode}
                    title={agent.title}
                    iconClass={agent.iconClass}
                    onClick={() => onSelectAgent(agent.mode)}
                />
             ))}
          </div>
        </aside>
      </main>

      <footer className="w-full text-center text-white/60 text-xs mt-8 pb-4">
        <span>Agente Greatek v1.0.0 | Greatek 2025 © - Todos os direitos reservados</span>
      </footer>

      {/* Botão de Feedback */}
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