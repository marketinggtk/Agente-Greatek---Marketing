import React from 'react';
import { AppMode } from '../types';
import useAppStore from '../store/useAppStore';

interface TabsProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const TABS_COMMERCIAL = [
  { mode: AppMode.SALES_ASSISTANT, label: 'Divisor de Águas', iconClass: "bi-chat-dots" },
  { mode: AppMode.MARKET_INTEL, label: 'Mercado', iconClass: "bi-graph-up" },
  { mode: AppMode.INTEGRATOR, label: 'O Integrador', iconClass: "bi-bricks" },
];

const TABS_MARKETING = [
  { mode: AppMode.PAGE, label: 'Otimizar Página', iconClass: "bi-file-earmark-text" },
  { mode: AppMode.AUDIT, label: 'Auditoria Técnica', iconClass: "bi-shield-check" },
  { mode: AppMode.CONTENT, label: 'Conteúdo', iconClass: "bi-pencil-square" },
  { mode: AppMode.CAMPAIGN, label: 'Campanhas', iconClass: "bi-megaphone" },
  { mode: AppMode.COMPLIANCE, label: 'Endomarketing', iconClass: "bi-card-checklist" },
];

const Tabs: React.FC<TabsProps> = ({ currentMode, setMode }) => {

  const handleModeChange = (newMode: AppMode) => {
    if (newMode !== currentMode) {
        setMode(newMode);
    }
  };

  const renderTabGroup = (tabs: typeof TABS_COMMERCIAL) => (
    <nav className="-mb-px flex flex-wrap gap-x-2 sm:gap-x-4">
      {tabs.map(({ mode, label, iconClass }) => (
        <button
          key={mode}
          onClick={() => handleModeChange(mode)}
          className={`
            ${currentMode === mode
              ? 'border-greatek-blue text-greatek-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            }
            group inline-flex items-center py-3 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-greatek-blue/50 rounded-t-sm whitespace-nowrap
          `}
          aria-current={currentMode === mode ? 'page' : undefined}
        >
          <i className={`bi ${iconClass} ${currentMode === mode ? 'text-greatek-blue' : 'text-gray-400 group-hover:text-gray-500'} -ml-0.5 mr-2 text-base`}></i>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h3 className="px-2 pb-2 text-xs font-bold uppercase text-text-secondary/60 tracking-wider">Comercial</h3>
        <div className="border-b border-greatek-border">
          {renderTabGroup(TABS_COMMERCIAL)}
        </div>
      </div>
      <div>
        <h3 className="px-2 pb-2 text-xs font-bold uppercase text-text-secondary/60 tracking-wider">Marketing</h3>
        <div className="border-b border-greatek-border">
          {renderTabGroup(TABS_MARKETING)}
        </div>
      </div>
    </div>
  );
};

export default Tabs;