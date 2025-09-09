import React from 'react';
import { AppMode } from '../types';
import { PageIcon, SalesAssistantIcon, AuditIcon, ContentIcon, CampaignIcon, ComplianceIcon, MarketIntelIcon } from './Icons';

interface TabsProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const TABS = [
  { mode: AppMode.PAGE, label: 'Otimizar Página', icon: PageIcon },
  { mode: AppMode.SALES_ASSISTANT, label: 'Divisor de Águas', icon: SalesAssistantIcon },
  { mode: AppMode.AUDIT, label: 'Auditoria Técnica', icon: AuditIcon },
  { mode: AppMode.CONTENT, label: 'Conteúdo', icon: ContentIcon },
  { mode: AppMode.CAMPAIGN, label: 'Campanhas', icon: CampaignIcon },
  { mode: AppMode.COMPLIANCE, label: 'Endomarketing', icon: ComplianceIcon },
  { mode: AppMode.MARKET_INTEL, label: 'Mercado', icon: MarketIntelIcon },
];

const Tabs: React.FC<TabsProps> = ({ currentMode, setMode }) => {
  return (
    <div className="mb-6 border-b border-greatek-border">
      <nav className="-mb-px flex flex-wrap gap-x-2 sm:gap-x-4" aria-label="Tabs">
        {TABS.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`
              ${currentMode === mode
                ? 'border-greatek-blue text-greatek-blue'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              }
              group inline-flex items-center py-3 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-greatek-blue/50 rounded-t-sm whitespace-nowrap
            `}
            aria-current={currentMode === mode ? 'page' : undefined}
          >
            <Icon className={`
              ${currentMode === mode ? 'text-greatek-blue' : 'text-gray-400 group-hover:text-gray-500'}
              -ml-0.5 mr-2 h-5 w-5
            `} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
