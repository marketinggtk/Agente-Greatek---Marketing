import React from 'react';
import { Service } from '../types';
import { SettingsIcon } from './Icons';

interface ConnectionPromptProps {
  services: Service[];
  onOpenAdminPanel: () => void;
}

const serviceNames: Record<Service, string> = {
    ga4: 'Google Analytics 4',
    gsc: 'Google Search Console',
    lighthouse: 'Google Lighthouse',
};

const ConnectionPrompt: React.FC<ConnectionPromptProps> = ({ services, onOpenAdminPanel }) => {
    const requiredServices = services.map(s => serviceNames[s]).join(' e ');

  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-8 animate-fade-in">
      <div className="max-w-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-greatek-blue/10">
          <SettingsIcon className="h-6 w-6 text-greatek-blue" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-greatek-dark-blue">Conexão Necessária</h2>
        <p className="mt-3 text-base text-text-secondary">
          Para gerar {services.includes('ga4') ? 'relatórios precisos' : 'uma auditoria completa'}, o agente precisa de acesso ao <strong>{requiredServices}</strong>.
        </p>
        <p className="mt-2 text-sm text-text-secondary/80">
          Por favor, conecte o serviço no painel de configurações para continuar.
        </p>
        <div className="mt-6">
          <button
            onClick={onOpenAdminPanel}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2"
          >
            Abrir Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPrompt;
