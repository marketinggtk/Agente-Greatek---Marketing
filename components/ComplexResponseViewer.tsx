import React, { useState } from 'react';
import { PageOptimizationPackage, AppMode } from '../types';
import Modal from './ui/Modal';
import JsonViewer from './JsonViewer';

interface ComplexResponseViewerProps {
  data: PageOptimizationPackage;
  mode: AppMode;
}

const ComplexResponseViewer: React.FC<ComplexResponseViewerProps> = ({ data, mode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInfo = (mode: AppMode) => {
    switch (mode) {
      case AppMode.PAGE:
        return {
          icon: 'bi-file-earmark-code',
          title: 'Pacote de Otimização de Página',
          description: 'O agente gerou um pacote completo com sugestões de SEO para a URL solicitada. Clique no botão abaixo para ver os detalhes em formato JSON.',
          buttonText: 'Visualizar Pacote de Otimização'
        };
      default:
        return {
          icon: 'bi-filetype-json',
          title: 'Resposta em JSON Recebida',
          description: 'O agente retornou dados estruturados. Clique para visualizar o conteúdo completo.',
          buttonText: 'Visualizar JSON'
        };
    }
  };

  const info = getInfo(mode);

  return (
    <>
      <div className="p-6 bg-greatek-bg-light border border-greatek-border rounded-lg text-center animate-fade-in">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-greatek-blue/10">
            <i className={`bi ${info.icon} text-3xl text-greatek-blue`}></i>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-greatek-dark-blue">{info.title}</h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">{info.description}</p>
        <div className="mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2"
          >
            <i className="bi bi-box-arrow-up-right mr-2"></i>
            {info.buttonText}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={info.title}
      >
        <JsonViewer data={data} />
      </Modal>
    </>
  );
};

export default ComplexResponseViewer;
