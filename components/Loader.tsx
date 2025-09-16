import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div 
        className="w-12 h-12 border-4 border-greatek-blue/20 border-t-greatek-blue rounded-full animate-spin"
        role="status"
      >
        <span className="sr-only">Carregando...</span>
      </div>
      <p className="mt-4 text-base font-medium text-text-secondary">
        Aguarde, estamos gerando sua resposta
        <span className="inline-block animate-blink [animation-delay:0s]">.</span>
        <span className="inline-block animate-blink [animation-delay:0.2s]">.</span>
        <span className="inline-block animate-blink [animation-delay:0.4s]">.</span>
      </p>
    </div>
  );
};

export default Loader;