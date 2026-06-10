import React, { useState, useMemo } from 'react';
import { AppMode } from '../types';
import { AGENTS, MODE_DESCRIPTIONS } from '../constants';
import FeedbackModal from './FeedbackModal';
import ControlPanel from './ControlPanel';

// Highlight descriptions for the 6 prioritized cards (3 Vendas, 3 Marketing)
const CUSTOM_DESCRIPTIONS: Partial<Record<AppMode, string>> = {
  [AppMode.INTEGRATOR]: 'Monte soluções completas com base no portfólio Greatek.',
  [AppMode.TRAINING_COACH]: 'Simule dúvidas e treine respostas comerciais.',
  [AppMode.SALES_ASSISTANT]: 'Receba recomendações e argumentos para apoiar a venda.',
  [AppMode.BLOG_POST]: 'Crie conteúdos estruturados para blog e SEO.',
  [AppMode.CONTENT]: 'Produza textos para campanhas, redes sociais e e-mails.',
  [AppMode.STRATEGIC_PLANNER]: 'Organize ações, campanhas e planos de comunicação.',
  [AppMode.REVERSE_DIAGNOSIS]: 'Analise propostas já enviadas e descubra qual dor elas tentam resolver, quais riscos existem e como defender melhor a decisão.',
};

// Card principal para Vendas e Marketing (Cards Grandes)
const PrimaryCard: React.FC<{
  title: string;
  description: string;
  iconClass: string;
  onClick: () => void;
  badge?: string;
}> = ({ title, description, iconClass, onClick, badge }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col justify-between w-full h-full p-6 sm:p-8 bg-white hover:bg-slate-50/55 border border-slate-200/80 hover:border-greatek-blue/40 rounded-2xl text-left transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-greatek-blue/10 overflow-hidden"
  >
    {/* Decoração background discreto */}
    <div className="absolute top-4 right-4 text-slate-100 group-hover:text-greatek-blue/5 transition-colors duration-300 pointer-events-none">
      <i className={`bi ${iconClass} text-5xl sm:text-6xl`}></i>
    </div>
    
    <div className="relative z-10 flex flex-col h-full justify-between gap-5">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-greatek-blue/10 text-greatek-blue flex items-center justify-center shrink-0">
            <i className={`bi ${iconClass} text-xl`}></i>
          </div>
          {badge && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-greatek-blue/10 text-greatek-blue px-2.5 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-black text-greatek-dark-blue tracking-tight uppercase group-hover:text-greatek-blue transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-greatek-blue group-hover:text-greatek-dark-blue transition-colors self-start">
        <span>Acessar</span>
        <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1"></i>
      </div>
    </div>
  </button>
);

// Card médio para Ferramentas úteis
const MediumCard: React.FC<{
  title: string;
  description: string;
  iconClass: string;
  onClick: () => void;
}> = ({ title, description, iconClass, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex items-start gap-4 p-5 bg-white hover:bg-slate-50/50 border border-slate-200/85 hover:border-greatek-blue/30 rounded-xl text-left transition-all duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-4 focus:ring-greatek-blue/5 overflow-hidden"
  >
    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-greatek-blue/10 group-hover:text-greatek-blue flex items-center justify-center shrink-0 transition-all">
      <i className={`bi ${iconClass} text-lg`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-greatek-blue transition-colors truncate">
        {title}
      </h4>
      <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
        {description}
      </p>
    </div>
  </button>
);

// Card menor para Outros agentes
const SmallerCard: React.FC<{
  title: string;
  iconClass: string;
  onClick: () => void;
}> = ({ title, iconClass, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center p-3.5 bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-greatek-blue/20 rounded-lg text-left transition-all duration-200 shadow-sm hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-greatek-blue/10 w-full"
  >
    <div className="w-8 h-8 rounded bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:text-greatek-blue flex items-center justify-center mr-3 shrink-0 transition-all border border-slate-100">
      <i className={`bi ${iconClass} text-sm`}></i>
    </div>
    <span className="text-xs font-bold text-slate-700 group-hover:text-slate-950 transition-colors truncate">
      {title}
    </span>
  </button>
);

interface AgentSelectionScreenProps {
  onSelectAgent: (mode: AppMode) => void;
}

const AgentSelectionScreen: React.FC<AgentSelectionScreenProps> = ({ onSelectAgent }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Vendas high priority cards
  const primarySalesModes = [
    AppMode.INTEGRATOR,
    AppMode.TRAINING_COACH,
    AppMode.SALES_ASSISTANT,
    AppMode.REVERSE_DIAGNOSIS
  ];

  // 2. Marketing high priority cards
  const primaryMarketingModes = [
    AppMode.BLOG_POST,
    AppMode.CONTENT,
    AppMode.STRATEGIC_PLANNER
  ];

  // 3. Ferramentas úteis medium cards
  const mediumToolModes = [
    AppMode.GOAL_CALCULATOR,
    AppMode.PRESENTATION_BUILDER,
    AppMode.PORTFOLIO_SEARCH,
    AppMode.CONTENT_PLANNER,
    AppMode.LEAD_HUNTER,
    AppMode.IMAGE_ADS
  ];

  // 4. Outros agentes smaller cards
  const smallerAgenciesModes = [
    AppMode.ARQUITETO,
    AppMode.INSTRUCTOR,
    AppMode.SKYWATCH,
    AppMode.MARKET_INTEL,
    AppMode.PAGE,
    AppMode.AUDIT,
    AppMode.CAMPAIGN,
    AppMode.COMPLIANCE
  ];

  // Map to get descriptions safely
  const getAgentDescription = (mode: AppMode): string => {
    return CUSTOM_DESCRIPTIONS[mode] || MODE_DESCRIPTIONS[mode]?.description || '';
  };

  // Build ordered data structures based on available agents in the store definition
  const salesGroup = useMemo(() => {
    return primarySalesModes.map(mode => AGENTS.find(a => a.mode === mode)).filter(Boolean) as typeof AGENTS;
  }, []);

  const marketingGroup = useMemo(() => {
    return primaryMarketingModes.map(mode => AGENTS.find(a => a.mode === mode)).filter(Boolean) as typeof AGENTS;
  }, []);

  const toolsGroup = useMemo(() => {
    return mediumToolModes.map(mode => AGENTS.find(a => a.mode === mode)).filter(Boolean) as typeof AGENTS;
  }, []);

  const otherGroup = useMemo(() => {
    return smallerAgenciesModes.map(mode => AGENTS.find(a => a.mode === mode)).filter(Boolean) as typeof AGENTS;
  }, []);

  // Filter query logic
  const isSearching = searchQuery.trim() !== '';
  const filteredResults = useMemo(() => {
    if (!isSearching) return [];
    const query = searchQuery.toLowerCase().trim();
    return AGENTS.filter(agent => {
      const title = agent.title.toLowerCase();
      const customDesc = getAgentDescription(agent.mode).toLowerCase();
      const originalDesc = (MODE_DESCRIPTIONS[agent.mode]?.description || '').toLowerCase();
      return title.includes(query) || customDesc.includes(query) || originalDesc.includes(query);
    });
  }, [searchQuery, isSearching]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center p-6 sm:p-10 lg:p-12 animate-fade-in text-slate-800">
      
      {/* HEADER SECTION WITH TITLE, SUBTITLE AND LIVE SEARCH */}
      <header className="w-full max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black text-greatek-dark-blue tracking-tighter uppercase">
              Bem-vindo(a)
            </h1>
            <p className="text-slate-500 font-medium text-base sm:text-lg">
              Escolha uma área ou ferramenta para começar.
            </p>
          </div>
          
          {/* Search box with modern interface and reset option */}
          <div className="relative w-full md:w-96">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ferramenta, agente ou recurso..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:border-greatek-blue/40 focus:ring-4 focus:ring-greatek-blue/10 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-semibold shadow-sm outline-none transition-all"
              aria-label="Buscar ferramenta ou recurso"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Limpar busca"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="w-full max-w-7xl mx-auto flex-grow space-y-14">
        {isSearching ? (
          /* SEARCH RESULTS ENVIRONMENT */
          <section className="space-y-6">
            <div className="border-l-4 border-greatek-blue pl-4">
              <h2 className="text-2xl font-black text-greatek-dark-blue uppercase tracking-tight">
                Resultados encontrados
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Mostrando ferramentas que correspondem à sua busca por "{searchQuery}".
              </p>
            </div>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map(agent => {
                  const isPrimary = primarySalesModes.includes(agent.mode) || primaryMarketingModes.includes(agent.mode);
                  if (isPrimary) {
                    return (
                      <PrimaryCard
                        key={agent.mode}
                        title={agent.title}
                        description={getAgentDescription(agent.mode)}
                        iconClass={agent.iconClass}
                        onClick={() => onSelectAgent(agent.mode)}
                        badge={primarySalesModes.includes(agent.mode) ? 'Vendas' : 'Marketing'}
                      />
                    );
                  } else {
                    return (
                      <MediumCard
                        key={agent.mode}
                        title={agent.title}
                        description={MODE_DESCRIPTIONS[agent.mode]?.description || ''}
                        iconClass={agent.iconClass}
                        onClick={() => onSelectAgent(agent.mode)}
                      />
                    );
                  }
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200/60 rounded-2xl shadow-xs">
                <i className="bi bi-emoji-frown text-4xl text-slate-300 block mb-3"></i>
                <p className="text-slate-600 font-bold text-lg">Nenhuma ferramenta encontrada.</p>
                <p className="text-slate-400 text-sm mt-1">Verifique a digitação ou tente buscar por termos complementares.</p>
              </div>
            )}
          </section>
        ) : (
          /* STANDARD CATEGORIZED DISPLAY PATH */
          <>
            {/* SECTION 1: VENDAS */}
            <section className="space-y-6">
              <div className="border-l-4 border-greatek-blue pl-4">
                <h2 className="text-2xl font-black text-greatek-dark-blue uppercase tracking-tight">
                  Vendas
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Ferramentas para apoio comercial, treinamento e recomendação de soluções.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {salesGroup.map(agent => (
                  <PrimaryCard
                    key={agent.mode}
                    title={agent.title}
                    description={getAgentDescription(agent.mode)}
                    iconClass={agent.iconClass}
                    onClick={() => onSelectAgent(agent.mode)}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 2: MARKETING */}
            <section className="space-y-6">
              <div className="border-l-4 border-greatek-blue pl-4">
                <h2 className="text-2xl font-black text-greatek-dark-blue uppercase tracking-tight">
                  Marketing
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Ferramentas para planejamento, produção de conteúdo e estratégia.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {marketingGroup.map(agent => (
                  <PrimaryCard
                    key={agent.mode}
                    title={agent.title}
                    description={getAgentDescription(agent.mode)}
                    iconClass={agent.iconClass}
                    onClick={() => onSelectAgent(agent.mode)}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 3: FERRAMENTAS ÚTEIS */}
            <section className="space-y-6">
              <div className="border-l-4 border-greatek-blue pl-4">
                <h2 className="text-2xl font-black text-greatek-dark-blue uppercase tracking-tight">
                  Ferramentas úteis
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Recursos rápidos para produtividade e apoio operacional.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {toolsGroup.map(tool => (
                  <MediumCard
                    key={tool.mode}
                    title={tool.title}
                    description={MODE_DESCRIPTIONS[tool.mode]?.description || ''}
                    iconClass={tool.iconClass}
                    onClick={() => onSelectAgent(tool.mode)}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 4: OUTROS AGENTES */}
            <section className="space-y-6">
              <div className="border-l-4 border-greatek-blue/40 pl-4">
                <h2 className="text-2xl font-black text-greatek-dark-blue uppercase tracking-tight">
                  Outros agentes
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Soluções complementares para análise, infraestrutura e apoio técnico.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {otherGroup.map(agent => (
                  <SmallerCard
                    key={agent.mode}
                    title={agent.title}
                    iconClass={agent.iconClass}
                    onClick={() => onSelectAgent(agent.mode)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto text-center text-slate-400 text-xs mt-20 pb-8 border-t border-slate-200/60 pt-8">
        <span>Agente Greatek 2026 © - Todos os direitos reservados</span>
      </footer>

      {/* FLOATING ACTION UTILITIES */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        <button
          onClick={() => setIsControlPanelOpen(true)}
          className="bg-greatek-dark-blue hover:bg-greatek-blue text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-greatek-blue/20"
          aria-label="Abrir Painel de Controle"
          title="Painel de Controle"
        >
          <i className="bi bi-sliders text-xl"></i>
        </button>
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="bg-greatek-dark-blue hover:bg-greatek-blue text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-greatek-blue/20"
          aria-label="Tem alguma ideia de melhoria?"
          title="Enviar Feedback"
        >
          <i className="bi bi-lightbulb-fill text-2xl"></i>
        </button>
      </div>
      
      {/* MODALS */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />

      {isControlPanelOpen && (
        <ControlPanel onClose={() => setIsControlPanelOpen(false)} />
      )}
    </div>
  );
};

export default AgentSelectionScreen;
