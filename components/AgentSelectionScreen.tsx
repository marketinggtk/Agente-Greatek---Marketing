import React, { useState } from 'react';
import { AppMode } from '../types';
import { AGENTS, MODE_DESCRIPTIONS } from '../constants';
import { useAppStore } from '../store/useAppStore';
import FeedbackModal from './FeedbackModal';
import ControlPanel from './ControlPanel';
import Modal from './ui/Modal';

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
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const commercialAgents = AGENTS.filter(a => a.category === 'Comercial');
  const marketingAgents = AGENTS.filter(a => a.category === 'Marketing');
  const tools = AGENTS.filter(a => a.category === 'Ferramentas');

  // Ordena os agentes comerciais com base na hierarquia solicitada
  const hierarchy = [
    AppMode.INTEGRATOR,
    AppMode.ARQUITETO,
    AppMode.INSTRUCTOR,
    AppMode.SKYWATCH,
    AppMode.MARKET_INTEL,
    AppMode.CUSTOMER_DOSSIER,
    AppMode.SALES_ASSISTANT
  ];
  const orderedCommercialAgents = commercialAgents.sort((a, b) => {
    const indexA = hierarchy.indexOf(a.mode);
    const indexB = hierarchy.indexOf(b.mode);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const handleControlPanelClick = () => {
    setIsPasswordPromptOpen(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === 'GTK@2025') {
      setIsPasswordPromptOpen(false);
      setIsControlPanelOpen(true);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
      setPasswordInput('');
    }
  };

  const handleClosePasswordPrompt = () => {
    setIsPasswordPromptOpen(false);
    setPasswordInput('');
    setPasswordError('');
  };

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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
             <h3 className="text-sm font-semibold uppercase text-white/60 tracking-wider px-2 mb-3">Ferramentas Úteis</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {tools.map(tool => (
                    <SecondaryCard
                        key={tool.mode}
                        title={tool.title}
                        iconClass={tool.iconClass}
                        onClick={() => onSelectAgent(tool.mode)}
                        isTool
                    />
                ))}
             </div>
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

      {/* Botões Flutuantes */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <button
          onClick={handleControlPanelClick}
          className="bg-white text-greatek-dark-blue w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-greatek-bg-light transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Abrir Painel de Controle"
          title="Painel de Controle"
        >
          <i className="bi bi-sliders text-2xl"></i>
        </button>
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="bg-white text-greatek-dark-blue w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-greatek-bg-light transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Tem alguma ideia de melhoria?"
          title="Enviar Feedback"
        >
          <i className="bi bi-lightbulb-fill text-3xl"></i>
        </button>
      </div>
      
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />

      <Modal
        isOpen={isPasswordPromptOpen}
        onClose={handleClosePasswordPrompt}
        title="Acesso Restrito"
      >
        <div className="p-4 text-center">
            <p className="text-text-secondary mb-4">
                Esta área é reservada para testes. Por favor, insira a senha de acesso.
            </p>
            <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
                className="w-full max-w-xs mx-auto p-3 text-center rounded-md border-transparent shadow-sm focus:border-greatek-blue focus:ring-greatek-blue text-lg bg-[#e9e9e9] text-black placeholder:text-gray-500"
                placeholder="••••••"
            />
            {passwordError && <p className="text-red-600 text-sm mt-3">{passwordError}</p>}
            <div className="mt-6">
                 <button
                    onClick={handlePasswordSubmit}
                    className="w-full max-w-xs mx-auto inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2"
                >
                    Acessar
                </button>
            </div>
        </div>
      </Modal>

      {isControlPanelOpen && (
        <ControlPanel onClose={() => setIsControlPanelOpen(false)} />
      )}
    </div>
  );
};

export default AgentSelectionScreen;