
import React from 'react';
import { PageOptimizationPackage } from '../types';
import JsonViewer from './JsonViewer';
import MarkdownViewer from './MarkdownViewer';

interface ResponseDisplayProps {
  response: PageOptimizationPackage | string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  if (typeof response === 'object' && response !== null) {
    return <JsonViewer data={response} />;
  }
  
  if (typeof response === 'string') {
    return <MarkdownViewer content={response} />;
  }

  return null;
};

export default ResponseDisplay;
