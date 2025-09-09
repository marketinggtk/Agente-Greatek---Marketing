import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greatek-blue"></div>
      <p className="mt-4 text-text-secondary">Consultando o Agente Greatek, aguardo um momento...</p>
    </div>
  );
};

export default Loader;