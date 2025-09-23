
import React, { useState } from 'react';
import { PageOptimizationPackage } from '../types';

// Fix: Changed type from PageOptimizationPackage to a generic object to allow for wider use.
interface JsonViewerProps {
  data: object;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-greatek-dark-blue/5 rounded-lg overflow-hidden animate-fade-in border border-greatek-border">
      <div className="flex justify-between items-center p-3 bg-greatek-border/50">
        {/* Fix: Made title more generic */}
        <span className="text-sm font-semibold text-greatek-dark-blue">Resposta em JSON</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
        >
          {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
          <span className='ml-1.5'>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-text-primary bg-white">
        <code>{jsonString}</code>
      </pre>
    </div>
  );
};

export default JsonViewer;
