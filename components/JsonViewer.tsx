import React, { useState } from 'react';
import { PageOptimizationPackage } from '../types';
import { CopyIcon, CheckIcon } from './Icons';

interface JsonViewerProps {
  data: PageOptimizationPackage;
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
        <span className="text-sm font-semibold text-greatek-dark-blue">Pacote de Otimização (JSON)</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
        >
          {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4 text-text-secondary" />}
          <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-text-primary bg-white">
        <code>{jsonString}</code>
      </pre>
    </div>
  );
};

export default JsonViewer;