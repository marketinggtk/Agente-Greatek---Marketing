import React from 'react';
import { Service } from '../types';
import { GoogleAnalyticsIcon, GoogleSearchConsoleIcon, LighthouseIcon, CheckCircleIcon } from './Icons';

interface AdminPanelProps {
  onClose: () => void;
  connectedServices: Record<Service, boolean>;
  onToggleService: (service: Service) => void;
}

const serviceConfig: Record<Service, { name: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; description: string; }> = {
    ga4: { name: 'Google Analytics 4', icon: GoogleAnalyticsIcon, description: 'Dados de tráfego, engajamento e conversão.' },
    gsc: { name: 'Google Search Console', icon: GoogleSearchConsoleIcon, description: 'Consultas de pesquisa, CTR e status de indexação.' },
    lighthouse: { name: 'Google Lighthouse', icon: LighthouseIcon, description: 'Métricas de Core Web Vitals e performance.' },
};

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, connectedServices, onToggleService }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl animate-fade-in-down z-50">
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-xl font-semibold text-greatek-dark-blue" id="modal-title">
            Gerenciador de Conexões
          </h3>
          <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={onClose}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-secondary">Conecte as ferramentas para que o agente possa trabalhar com dados em tempo real e fornecer análises mais precisas. (Simulação de Autenticação)</p>
          {Object.keys(serviceConfig).map(key => {
            const serviceKey = key as Service;
            const { name, icon: Icon, description } = serviceConfig[serviceKey];
            const isConnected = connectedServices[serviceKey];
            return (
              <div key={serviceKey} className="flex items-center justify-between p-3 border rounded-lg bg-greatek-bg-light/50">
                <div className="flex items-center">
                  <Icon className="h-8 w-8 mr-4 text-greatek-dark-blue" />
                  <div>
                    <p className="font-semibold text-text-primary">{name}</p>
                    <p className="text-xs text-text-secondary">{description}</p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleService(serviceKey)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isConnected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-greatek-blue text-white hover:bg-greatek-dark-blue'
                  }`}
                >
                  {isConnected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b">
          <button onClick={onClose} type="button" className="text-white bg-greatek-blue hover:bg-greatek-dark-blue focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
