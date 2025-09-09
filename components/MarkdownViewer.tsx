import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface MarkdownViewerProps {
  content: string;
}

const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    // Regex para encontrar **negrito**, URLs, caminhos relativos e nomes de serviços específicos
    const regex = /(\*\*.*?\*\*|https?:\/\/[^\s]+|\/[^\s]+|Google Search Console|Google Analytics|GA4)/gi;
    const parts = text.split(regex);

    return parts.filter(part => part).map((part, index) => {
        const lowerPart = part.toLowerCase();
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('http')) {
            return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        if (part.startsWith('/')) {
            return <a key={index} href={`https://www.greatek.com.br${part}`} target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        if (lowerPart === 'google search console') {
            return <a key={index} href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        if (lowerPart === 'google analytics' || lowerPart === 'ga4') {
            return <a key={index} href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        return part;
    });
};


const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc pl-5 my-2 space-y-1">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-text-secondary leading-relaxed">{parseInlineMarkdown(item)}</li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        flushList();
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-greatek-dark-blue text-white p-4 rounded-md my-4 text-sm overflow-x-auto font-mono">
              <code>{codeBlockContent.trim()}</code>
            </pre>
          );
          codeBlockContent = '';
        }
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        return;
      }
      
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={index} className="text-3xl font-bold mt-6 mb-3 border-b border-greatek-border pb-2 text-greatek-dark-blue">{parseInlineMarkdown(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="text-2xl font-semibold mt-5 mb-2 text-greatek-dark-blue">{parseInlineMarkdown(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-text-primary">{parseInlineMarkdown(line.substring(4))}</h3>);
      } else if (line.match(/^(\*|-)\s/)) {
        listItems.push(line.substring(2));
      } else if (line.trim() === '') {
        flushList();
        elements.push(<div key={index} className="h-4" />);
      } else {
        flushList();
        elements.push(<p key={index} className="my-2 leading-relaxed text-text-secondary">{parseInlineMarkdown(line)}</p>);
      }
    });
    
    flushList(); // Garante que a última lista seja renderizada
    
    if (inCodeBlock && codeBlockContent) {
        elements.push(
            <pre key="code-end" className="bg-greatek-dark-blue text-white p-4 rounded-md my-4 text-sm overflow-x-auto font-mono">
                <code>{codeBlockContent.trim()}</code>
            </pre>
        );
    }

    return elements;
  };

  return (
    <div className="prose max-w-none animate-fade-in">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-greatek-border">
            <span className="text-sm font-semibold text-greatek-dark-blue">Resposta do Agente</span>
            <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
                >
                {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4 text-text-secondary" />}
                <span>{copied ? 'Copiado!' : 'Copiar Markdown'}</span>
            </button>
        </div>
      <div className="text-text-primary">{renderContent()}</div>
    </div>
  );
};

export default MarkdownViewer;
