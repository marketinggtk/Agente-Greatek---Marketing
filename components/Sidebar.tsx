import React from 'react';
import { useConversationHistory } from '../src/hooks/useConversationHistory';
import { useAppStore } from '../store/useAppStore';
import { AppMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    sessions,
    activeSessionId,
    setActiveSessionById,
    deleteSession,
    clearHistory
  } = useConversationHistory();

  const { returnToAgentSelection, createNewConversation, dailyRequestsCount } = useAppStore();

  const handleNewConversation = () => {
    returnToAgentSelection(); // Goes back to home screen/Agent Selection
    onClose();
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionById(id);
    onClose();
  };

  const handleOpenTool = (mode: AppMode) => {
    createNewConversation(mode);
    onClose();
  };

  const formatSessionDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      if (isNaN(date.getTime())) return '';

      const isToday = date.getDate() === now.getDate() &&
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear();

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      if (isToday) {
        return `Hoje, ${hours}:${minutes}`;
      }
      
      const day = date.getDate();
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const month = months[date.getMonth()];
      return `${day} ${month}, ${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <aside className={`
      w-72 bg-white rounded-lg shadow-lg border border-greatek-border flex flex-col p-4 flex-shrink-0
      transition-transform transform duration-300 ease-in-out
      fixed md:static inset-y-0 left-0 z-30 h-full
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    `}>
      {/* Botão Nova Conversa */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleNewConversation}
          className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-white bg-greatek-blue rounded-xl hover:bg-greatek-dark-blue transition-all focus:outline-none focus:ring-4 focus:ring-greatek-blue/20 cursor-pointer shadow-sm active:scale-95"
          id="btn-nova-conversa"
        >
          <i className="bi bi-plus-lg mr-2 font-black"></i>
          Nova Conversa
        </button>
      </div>

      {/* Histórico Real */}
      <div className="flex-grow overflow-y-auto -mr-2 pr-2 custom-scrollbar flex flex-col">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Histórico de Sessões</h2>
        
        {sessions.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <i className="bi bi-archive text-2xl mb-2 text-slate-300"></i>
            <p className="text-xs font-semibold text-slate-400">Nenhum histórico ativo</p>
            <p className="text-[10px] text-slate-400/80 mt-1 max-w-[180px]">Suas conversas e ferramentas aparecerão salvos aqui.</p>
          </div>
        ) : (
          <nav className="space-y-2 flex-grow">
            {sessions.map((session) => {
              const isActive = activeSessionId === session.id;
              
              return (
                <div 
                  key={session.id} 
                  className={`group relative rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-greatek-blue/[0.04] border-greatek-blue/20 shadow-xs' 
                      : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                  }`}
                >
                  {/* Indicador de borda esquerda ativa */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-greatek-blue rounded-full"></div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelectSession(session.id)}
                    className="w-full text-left pl-4 pr-10 py-3 block focus:outline-none focus:ring-2 focus:ring-greatek-blue/30 rounded-xl"
                    aria-label={`Sessão ${session.title} de ${session.agentName}`}
                  >
                    {/* Nome do Agente */}
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-greatek-blue transition-colors">
                      {session.agentName}
                    </div>

                    {/* Título da Conversa */}
                    <div className={`text-xs font-bold truncate mt-0.5 ${
                      isActive ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                    }`}>
                      {session.title}
                    </div>

                    {/* Data/Horário */}
                    <div className="text-[9px] font-bold text-slate-400/85 mt-1.5 flex items-center gap-1">
                      <span>{formatSessionDate(session.updatedAt)}</span>
                    </div>
                  </button>

                  {/* Ação rápida de exclusão */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="absolute right-2.5 top-1/2 -track-y-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 border border-transparent md:opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400"
                    title="Remover sessão do histórico"
                    aria-label="Excluir sessão"
                  >
                    <i className="bi bi-trash-fill text-xs"></i>
                  </button>
                </div>
              );
            })}
          </nav>
        )}
      </div>

      {/* Seção inferior de Atalhos para Ferramentas */}
      <div className="mt-auto pt-4 border-t border-greatek-border">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Atalhos rápidos</h2>
        <div className="space-y-1">
          <button
            onClick={() => handleOpenTool(AppMode.CONTENT_PLANNER)}
            className="flex items-center w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-greatek-blue transition-all"
          >
            <i className="bi bi-calendar-week-fill text-slate-400 group-hover:text-greatek-blue mr-2.5 shrink-0"></i>
            <span className="truncate flex-1">Planejador de Conteúdo</span>
          </button>
          <button
            onClick={() => handleOpenTool(AppMode.PORTFOLIO_SEARCH)}
            className="flex items-center w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-greatek-blue transition-all"
          >
            <i className="bi bi-lightbulb-fill text-slate-400 mr-2.5 shrink-0"></i>
            <span className="truncate flex-1">Pesquisa de Portfólio</span>
          </button>
          <button
            onClick={() => handleOpenTool(AppMode.GOAL_CALCULATOR)}
            className="flex items-center w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-greatek-blue transition-all"
          >
            <i className="bi bi-calculator-fill text-slate-400 mr-2.5 shrink-0"></i>
            <span className="truncate flex-1">Calculadora de Metas</span>
          </button>
        </div>
      </div>
      
      {/* Contador de requisições diárias */}
      <div className="mt-4 pt-3 border-t border-greatek-border text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-greatek-blue/[0.04] border border-greatek-blue/10 rounded-lg text-[10px] font-bold text-slate-500" title="Contador local de requisições diárias">
          <i className="bi bi-lightning-charge-fill text-yellow-500"></i>
          <span>Uso Hoje: {dailyRequestsCount} de 50</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
