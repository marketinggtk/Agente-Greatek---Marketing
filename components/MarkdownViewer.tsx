import React, { useState } from 'react';
import { AppMode } from '../types';
import { generateIntegratorPdf } from '../services/pdfGenerator';
import { useAppStore } from '../store/useAppStore';
import { DataTableView } from './ui/DataTableView';

interface MarkdownViewerProps {
  content: string;
  mode: AppMode;
  isLastMessage: boolean;
}

const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|https?:\/\/[^\s]+|\/[^\s]+|Google Search Console|Google Analytics|GA4)/gi;
    const parts = text.split(regex);

    return parts.filter(part => part).map((part, index) => {
        if (!part) return null;
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

const parseSalesCardContent = (content: string) => {
    const titleMatch = content.match(/### 🏅 Produto Recomendado:(.*)/);
    const whyMatch = content.match(/\*\*Por que este produto\?\*\*\s*([\s\S]*?)\s*\*\*Especificações Chave:\*\*/);
    const specsMatch = content.match(/\*\*Especificações Chave:\*\*\s*([\s\S]*)/);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const why = whyMatch ? whyMatch[1].trim().replace(/\n/g, ' ') : '';
    const specsContent = specsMatch ? specsMatch[1].trim() : '';
    
    const specs = specsContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('*'))
        .map(line => line.substring(1).trim());
        
    return { title, why, specs };
};

const parseDiagnosisContent = (content: string) => {
    const titleMatch = content.match(/## (.*)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Diagnóstico do Cenário Atual';
    const body = content.replace(/## .*\n?/, '').trim();
    return { title, body };
};


const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, mode, isLastMessage }) => {
  const [copied, setCopied] = useState(false);
  const { submitQuery, isLoading, conversations, activeConversationId, handleNegativeSkywatchResponse } = useAppStore();

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const isIntegratorResponse = mode === AppMode.INTEGRATOR;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleGeneratePdf = () => {
    if (content) {
        const conversationTitle = activeConversation?.title || 'Proposta-Solucao-Greatek';
        generateIntegratorPdf(content, conversationTitle);
    }
  };

  const handleSkywatchInteractiveClick = (positiveResponse: boolean) => {
    if (positiveResponse) {
      submitQuery("Gostaria de saber mais sobre o SkyWatch para ofertar para o cliente.");
    } else {
      handleNegativeSkywatchResponse();
    }
  };

  const renderContent = () => {
    const cleanContent = content.replace('[SKYWATCH_PROMPT_INTERACTIVE]', '').trim();
    const lines = cleanContent.split('\n');
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let listItems: string[] = [];
    let inSalesCard = false;
    let salesCardContent = '';
    let inDiagnosisCard = false;
    let diagnosisCardContent = '';
    let blockquoteItems: string[] = [];

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
    
    const flushBlockquote = () => {
        if (blockquoteItems.length > 0) {
            elements.push(
                <blockquote key={`quote-${elements.length}`} className="not-prose border-l-4 border-greatek-border pl-4 my-4 italic">
                    {blockquoteItems.map((item, idx) => (
                        <p key={idx} className="text-text-secondary leading-relaxed mb-2 last:mb-0">{parseInlineMarkdown(item)}</p>
                    ))}
                </blockquote>
            );
            blockquoteItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.trim() === '[RECOMENDACAO_PRINCIPAL_START]') {
          flushList();
          flushBlockquote();
          inSalesCard = true;
          continue;
      }

      if (line.trim() === '[DIAGNOSTICO_START]') {
          flushList();
          flushBlockquote();
          inDiagnosisCard = true;
          continue;
      }
      
      if (line.trim() === '[RECOMENDACAO_PRINCIPAL_END]') {
          if (inSalesCard) {
              const cardData = parseSalesCardContent(salesCardContent);
              elements.push(
                  <div key={`sales-card-${i}`} className="not-prose my-6 p-5 bg-greatek-blue/10 border-2 border-greatek-blue rounded-xl shadow-lg animate-fade-in">
                      <div className="flex items-center">
                          <span className="text-3xl mr-3">🏅</span>
                          <div>
                              <span className="text-xs font-semibold uppercase text-greatek-blue tracking-wider">Produto Recomendado</span>
                              <h3 className="text-xl font-bold text-greatek-dark-blue not-prose m-0 -mt-1">{cardData.title}</h3>
                          </div>
                      </div>
                      <div className="mt-4 pl-2 border-l-4 border-greatek-blue/30">
                          <p className="font-semibold text-text-primary text-sm">Por que este produto?</p>
                          <p className="text-text-secondary text-sm leading-relaxed">{cardData.why}</p>
                      </div>
                      {cardData.specs.length > 0 && (
                          <div className="mt-4">
                               <p className="font-semibold text-text-primary text-sm">Especificações Chave:</p>
                              <ul className="mt-2 space-y-1.5 list-none p-0">
                                  {cardData.specs.map((spec, index) => (
                                       <li key={index} className="flex items-start text-sm text-text-secondary">
                                          <i className="bi bi-check-circle-fill text-green-600 mr-2.5 mt-0.5 flex-shrink-0"></i>
                                          <span dangerouslySetInnerHTML={{ __html: spec.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>') }} />
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}
                  </div>
              );
              salesCardContent = '';
              inSalesCard = false;
          }
          continue;
      }

      if (line.trim() === '[DIAGNOSTICO_END]') {
          if (inDiagnosisCard) {
              const cardData = parseDiagnosisContent(diagnosisCardContent);
              elements.push(
                  <div key={`diag-card-${i}`} className="not-prose my-6 p-5 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg animate-fade-in">
                    <div className="flex items-start">
                        <i className="bi bi-exclamation-triangle-fill text-2xl mr-4 text-yellow-500 mt-1"></i>
                        <div>
                            <h3 className="text-lg font-bold text-yellow-800 not-prose m-0">{cardData.title}</h3>
                            <div className="text-text-secondary mt-2 leading-relaxed">{parseInlineMarkdown(cardData.body)}</div>
                        </div>
                    </div>
                  </div>
              );
              diagnosisCardContent = '';
              inDiagnosisCard = false;
          }
          continue;
      }


      if (inSalesCard) {
          salesCardContent += line + '\n';
          continue;
      }

      if (inDiagnosisCard) {
          diagnosisCardContent += line + '\n';
          continue;
      }

      const isTableSeparator = (l: string) => l.trim().startsWith('|') && l.includes('---') && l.trim().endsWith('|');
      const isTableRow = (l: string) => l.trim().startsWith('|') && l.trim().endsWith('|');
      
      if (!inCodeBlock && isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
          flushList();
          flushBlockquote();

          const headerLine = lines[i];
          const headers = headerLine.split('|').slice(1, -1).map(cell => cell.trim());
          
          const rows: string[][] = [];
          let j = i + 2;
          while(j < lines.length && isTableRow(lines[j])) {
              const rowLine = lines[j];
              const rowCells = rowLine.split('|').slice(1, -1).map(cell => cell.trim());
              rows.push(rowCells);
              j++;
          }
          
          if (headers.length > 0 && rows.length > 0) {
              elements.push(
                  <DataTableView key={`table-${i}`} headers={headers} rows={rows} />
              );
          }

          i = j - 1;
          continue;
      }

      if (line.startsWith('```')) {
        flushList();
        flushBlockquote();
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="bg-greatek-dark-blue text-white p-4 rounded-md my-4 text-sm font-mono whitespace-pre-wrap break-words">
              <code>{codeBlockContent.trim()}</code>
            </pre>
          );
          codeBlockContent = '';
        }
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }
      
      if (line.startsWith('# ')) {
        flushList();
        flushBlockquote();
        elements.push(<h1 key={i} className="text-3xl font-bold mt-6 mb-3 border-b border-greatek-border pb-2 text-greatek-dark-blue">{parseInlineMarkdown(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        flushBlockquote();
        elements.push(<h2 key={i} className="text-2xl font-semibold mt-5 mb-2 text-greatek-dark-blue">{parseInlineMarkdown(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        flushBlockquote();
        elements.push(<h3 key={i} className="text-xl font-semibold mt-4 mb-2 text-text-primary">{parseInlineMarkdown(line.substring(4))}</h3>);
       } else if (line.startsWith('#### ')) {
        flushList();
        flushBlockquote();
        elements.push(<h4 key={i} className="text-lg font-semibold mt-4 mb-2 text-text-primary">{parseInlineMarkdown(line.substring(5))}</h4>);
      } else if (line.startsWith('> ')) {
        flushList();
        blockquoteItems.push(line.substring(2));
      } else if (line.match(/^(\*|-)\s/)) {
        flushBlockquote();
        listItems.push(line.substring(2));
      } else if (line.trim() === '') {
        flushList();
        flushBlockquote();
        elements.push(<div key={i} className="h-4" />);
      } else if (line.trim() !== ''){
        flushList();
        flushBlockquote();
        elements.push(<p key={i} className="my-2 leading-relaxed text-text-secondary">{parseInlineMarkdown(line)}</p>);
      }
    }
    
    flushList();
    flushBlockquote();
    
    if (inCodeBlock && codeBlockContent) {
        elements.push(
            <pre key="code-end" className="bg-greatek-dark-blue text-white p-4 rounded-md my-4 text-sm font-mono whitespace-pre-wrap break-words">
                <code>{codeBlockContent.trim()}</code>
            </pre>
        );
    }

    return elements;
  };
  
  const showSkywatchButtons = isLastMessage && content.includes('[SKYWATCH_PROMPT_INTERACTIVE]') && !activeConversation?.skywatchDeclined && !isLoading;

  return (
    <div className="prose max-w-none">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-greatek-border">
            <span className="text-sm font-semibold text-greatek-dark-blue">Resposta do Agente</span>
            <div className="flex items-center space-x-2">
                 {isIntegratorResponse && content && (
                    <button
                        onClick={handleGeneratePdf}
                        className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
                    >
                        <i className="bi bi-file-earmark-pdf-fill text-red-600"></i>
                        <span className='ml-1.5'>Gerar PDF</span>
                    </button>
                )}
                <button
                    onClick={handleCopy}
                    disabled={!content}
                    className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300 disabled:opacity-50"
                    >
                    {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
                    <span className='ml-1.5'>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
            </div>
        </div>
      <div className="text-text-primary">
        {renderContent()}
      </div>

      {showSkywatchButtons && (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 not-prose animate-fade-in p-4 bg-greatek-bg-light rounded-lg border border-greatek-border">
            <p className="text-sm font-semibold text-greatek-dark-blue flex-grow text-center sm:text-left">Gostaria de saber mais sobre o SkyWatch para esta solução?</p>
            <div className='flex items-center gap-2 flex-shrink-0'>
                <button
                    onClick={() => handleSkywatchInteractiveClick(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-greatek-blue rounded-md hover:bg-greatek-dark-blue transition-colors"
                >
                    Sim, gostaria
                </button>
                <button
                    onClick={() => handleSkywatchInteractiveClick(false)}
                    className="px-4 py-2 text-sm font-medium text-text-secondary bg-white rounded-md hover:bg-greatek-border border border-gray-300 transition-colors"
                >
                    Não, obrigado
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownViewer;