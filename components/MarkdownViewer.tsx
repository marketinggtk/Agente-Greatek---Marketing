
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

// --- Helper Parsing Functions for Special Cards ---

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

const parsePillarCardContent = (content: string) => {
    const titleMatch = content.match(/### (.*)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Pilar do Design';
    const body = content.replace(/### .*\n?/, '').trim();
    const iconMap: Record<string, string> = {
        'escalabilidade': 'bi-arrows-angle-expand',
        'gerenciamento centralizado': 'bi-motherboard-fill',
        'segurança': 'bi-shield-lock-fill',
        'performance': 'bi-speedometer2',
        'redundância': 'bi-intersect',
    };
    const icon = iconMap[title.toLowerCase()] || 'bi-check2-circle';
    return { title, body, icon };
};

const parseComponentCardContent = (content: string) => {
    const titleMatch = content.match(/### (.*)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Componente';
    
    const productMatch = content.match(/\*\*Produto Recomendado:\*\*\s*(.*)/);
    const product = productMatch ? productMatch[1].trim() : '';

    const whyMatch = content.match(/\*\*Por que foi escolhido\?\*\*\s*([\s\S]*?)\s*(\*\*Recursos-Chave|\n\n)/);
    const why = whyMatch ? whyMatch[1].trim().replace(/\n$/, '') : '';

    const specsMatch = content.match(/\*\*Recursos-Chave para este projeto:\*\*\s*([\s\S]*)/);
    const specsContent = specsMatch ? specsMatch[1].trim() : '';
    
    const specs = specsContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('*'))
        .map(line => line.substring(1).trim());
        
    return { title, product, why, specs };
};

const parseStrategyCardContent = (content: string) => {
    const sellerMatch = content.match(/\*\*Vendedor:\*\*\s*(.*)/);
    const productMatch = content.match(/\*\*Produto Foco.*:\*\*\s*(.*)/);
    const gapMatch = content.match(/\*\*Gap.*:\*\*\s*(.*)/);
    const iconMatch = content.match(/\*\*Ícone:\*\*\s*(.*)/);
    
    // Split the rest of content for body parsing (Diagnosis, Agenda, Action)
    // We remove the header lines we just parsed
    let body = content
        .replace(/\*\*Vendedor:\*\*.*\n?/, '')
        .replace(/\*\*Produto Foco.*:\*\*.*\n?/, '')
        .replace(/\*\*Gap.*:\*\*.*\n?/, '')
        .replace(/\*\*Ícone:\*\*.*\n?/, '')
        .trim();

    return {
        seller: sellerMatch ? sellerMatch[1].trim() : 'Vendedor',
        productFocus: productMatch ? productMatch[1].trim() : 'Mix Geral',
        gap: gapMatch ? gapMatch[1].trim() : '-',
        icon: iconMatch ? iconMatch[1].trim() : 'bi-graph-up',
        body: body
    };
};

const parseSocialPost = (content: string, attributes: string) => {
    const platformMatch = attributes.match(/platform="(.*?)"/);
    return {
        platform: platformMatch ? platformMatch[1] : 'Conteúdo Sugerido',
        body: content.trim()
    };
};

const parseVisualBrief = (content: string) => {
    return content.trim();
};

const parseSeoMetrics = (content: string) => {
    return content.trim().split('\n').filter(line => line.trim().length > 0);
};

const parseTechDiagram = (content: string, attributes: string) => {
    const titleMatch = attributes.match(/title="(.*?)"/);
    return {
        title: titleMatch ? titleMatch[1] : 'Diagrama Técnico',
        body: content.trim()
    };
};

const parseTrainingCard = (content: string, attributes: string) => {
    const titleMatch = attributes.match(/title="(.*?)"/);
    const iconMatch = attributes.match(/icon="(.*?)"/);
    
    return {
        title: titleMatch ? titleMatch[1] : 'Destaque',
        icon: iconMatch ? iconMatch[1] : 'bi-lightbulb-fill',
        body: content.trim()
    };
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
    let blockquoteItems: string[] = [];
    
    // State variables for multi-line card parsing
    let inSalesCard = false; let salesCardContent = '';
    let inDiagnosisCard = false; let diagnosisCardContent = '';
    let inPillarCard = false; let pillarCardContent = '';
    let inComponentCard = false; let componentCardContent = '';
    
    // New Marketing Visuals State
    let inSocialPost = false; let socialPostContent = ''; let socialPostAttrs = '';
    let inVisualBrief = false; let visualBriefContent = '';
    let inSeoMetrics = false; let seoMetricsContent = '';
    let inTechDiagram = false; let techDiagramContent = ''; let techDiagramAttrs = '';
    
    // Instructor & Strategy Cards
    let inTrainingCard = false; let trainingCardContent = ''; let trainingCardAttrs = '';
    let inStrategyCard = false; let strategyCardContent = '';


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

    const flushAll = () => {
        flushList();
        flushBlockquote();
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Cleaning potentially formatted tags (e.g., `[TAG]`)
      const cleanTagLine = line.trim().replace(/^`+|`+$/g, '');

      // --- Start Tag Checks ---
      if (cleanTagLine === '[RECOMENDACAO_PRINCIPAL_START]') { flushAll(); inSalesCard = true; continue; }
      if (cleanTagLine === '[DIAGNOSTICO_START]') { flushAll(); inDiagnosisCard = true; continue; }
      if (cleanTagLine === '[DESIGN_PILLAR_START]') { flushAll(); inPillarCard = true; continue; }
      if (cleanTagLine === '[COMPONENT_CARD_START]') { flushAll(); inComponentCard = true; continue; }
      if (cleanTagLine === '[STRATEGY_CARD_START]') { flushAll(); inStrategyCard = true; continue; }
      
      // New Marketing Tags
      if (cleanTagLine.startsWith('[SOCIAL_POST_START')) { 
          flushAll(); 
          inSocialPost = true; 
          socialPostAttrs = cleanTagLine.substring(18, cleanTagLine.length - 1); // Extract attributes
          continue; 
      }
      if (cleanTagLine === '[VISUAL_BRIEF_START]') { flushAll(); inVisualBrief = true; continue; }
      if (cleanTagLine === '[SEO_METRICS_START]') { flushAll(); inSeoMetrics = true; continue; }
      if (cleanTagLine.startsWith('[TECH_DIAGRAM_START')) {
          flushAll();
          inTechDiagram = true;
          techDiagramAttrs = cleanTagLine.substring(19, cleanTagLine.length - 1);
          continue;
      }
      if (cleanTagLine.startsWith('[TRAINING_CARD_START')) {
          flushAll();
          inTrainingCard = true;
          trainingCardAttrs = cleanTagLine.substring(20, cleanTagLine.length - 1);
          continue;
      }


      // --- End Tag Checks ---
      if (cleanTagLine === '[RECOMENDACAO_PRINCIPAL_END]') {
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
              salesCardContent = ''; inSalesCard = false;
          }
          continue;
      }

      if (cleanTagLine === '[DIAGNOSTICO_END]') {
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
              diagnosisCardContent = ''; inDiagnosisCard = false;
          }
          continue;
      }
      
      if (cleanTagLine === '[DESIGN_PILLAR_END]') {
          if (inPillarCard) {
              const cardData = parsePillarCardContent(pillarCardContent);
              elements.push(
                   <div key={`pillar-${i}`} className="not-prose my-4 p-5 bg-greatek-bg-light border-l-4 border-greatek-blue rounded-r-lg animate-fade-in">
                        <div className="flex items-start">
                            <i className={`bi ${cardData.icon} text-2xl mr-4 text-greatek-blue mt-1`}></i>
                            <div>
                                <h3 className="text-lg font-bold text-greatek-dark-blue not-prose m-0">{cardData.title}</h3>
                                <div className="text-text-secondary mt-2 leading-relaxed text-sm">{parseInlineMarkdown(cardData.body)}</div>
                            </div>
                        </div>
                    </div>
              );
              pillarCardContent = ''; inPillarCard = false;
          }
          continue;
      }
      
      if (cleanTagLine === '[COMPONENT_CARD_END]') {
          if (inComponentCard) {
              const cardData = parseComponentCardContent(componentCardContent);
              elements.push(
                  <div key={`component-card-${i}`} className="not-prose my-6 p-5 bg-white border border-greatek-border rounded-xl shadow-sm animate-fade-in hover:border-greatek-blue/50 transition-colors">
                    <h3 className="text-sm font-semibold uppercase text-greatek-blue tracking-wider">{cardData.title}</h3>
                    <h4 className="text-xl font-bold text-greatek-dark-blue not-prose mt-1">{cardData.product}</h4>
                    
                    <div className="mt-4 pl-3 border-l-4 border-greatek-blue/30">
                        <p className="font-semibold text-text-primary text-sm">Por que foi escolhido?</p>
                        <p className="text-text-secondary text-sm leading-relaxed">{cardData.why}</p>
                    </div>

                    {cardData.specs.length > 0 && (
                        <div className="mt-4">
                            <p className="font-semibold text-text-primary text-sm">Recursos-Chave para este projeto:</p>
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
              componentCardContent = ''; inComponentCard = false;
          }
          continue;
      }

      if (cleanTagLine === '[SOCIAL_POST_END]') {
          if (inSocialPost) {
              const postData = parseSocialPost(socialPostContent, socialPostAttrs);
              elements.push(
                  <div key={`social-post-${i}`} className="not-prose my-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white animate-fade-in">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <i className="bi bi-file-earmark-text text-greatek-blue"></i>
                              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Sugestão de Texto ({postData.platform})</span>
                          </div>
                          <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                          </div>
                      </div>
                      <div className="p-6 bg-white">
                          <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                              {postData.body.split('\n').map((l, idx) => (
                                  <p key={idx} className="mb-3 last:mb-0">{parseInlineMarkdown(l)}</p>
                              ))}
                          </div>
                      </div>
                  </div>
              );
              socialPostContent = ''; inSocialPost = false;
          }
          continue;
      }

      if (cleanTagLine === '[VISUAL_BRIEF_END]') {
          if (inVisualBrief) {
              const briefText = parseVisualBrief(visualBriefContent);
              elements.push(
                  <div key={`visual-brief-${i}`} className="not-prose my-6 p-5 bg-purple-50 border border-purple-200 rounded-lg shadow-sm animate-fade-in">
                      <div className="flex items-center gap-2 mb-3 border-b border-purple-200 pb-2">
                          <i className="bi bi-palette-fill text-purple-600"></i>
                          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Briefing Visual</h3>
                      </div>
                      <div className="text-sm text-purple-900/80 space-y-2">
                          {briefText.split('\n').map((l, idx) => (
                              <div key={idx} dangerouslySetInnerHTML={{ __html: l.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-950">$1</strong>') }} />
                          ))}
                      </div>
                  </div>
              );
              visualBriefContent = ''; inVisualBrief = false;
          }
          continue;
      }

      if (cleanTagLine === '[SEO_METRICS_END]') {
          if (inSeoMetrics) {
              const metrics = parseSeoMetrics(seoMetricsContent);
              elements.push(
                  <div key={`seo-metrics-${i}`} className="not-prose my-6 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                      {metrics.map((metric, idx) => {
                          const parts = metric.split(':');
                          const label = parts[0]?.replace(/\*|-/g, '').trim();
                          const value = parts[1]?.trim();
                          if (!label || !value) return null;
                          return (
                              <div key={idx} className="bg-slate-800 text-white p-3 rounded-lg text-center shadow-md">
                                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</p>
                                  <p className="font-medium text-sm mt-1">{value}</p>
                              </div>
                          );
                      })}
                  </div>
              );
              seoMetricsContent = ''; inSeoMetrics = false;
          }
          continue;
      }

      if (cleanTagLine === '[TECH_DIAGRAM_END]') {
          if (inTechDiagram) {
              const diagramData = parseTechDiagram(techDiagramContent, techDiagramAttrs);
              elements.push(
                  <div key={`tech-diagram-${i}`} className="not-prose my-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in">
                      <h3 className="text-center font-bold text-greatek-dark-blue mb-4">{diagramData.title}</h3>
                      <div className="flex flex-wrap justify-center items-center gap-2 text-sm">
                          {diagramData.body.split('->').map((step, idx, arr) => (
                              <React.Fragment key={idx}>
                                  <div className="bg-greatek-bg-light border border-greatek-blue text-greatek-dark-blue px-3 py-2 rounded-md font-medium">
                                      {step.trim()}
                                  </div>
                                  {idx < arr.length - 1 && (
                                      <i className="bi bi-arrow-right text-gray-400"></i>
                                  )}
                              </React.Fragment>
                          ))}
                      </div>
                  </div>
              );
              techDiagramContent = ''; inTechDiagram = false;
          }
          continue;
      }

      if (cleanTagLine === '[TRAINING_CARD_END]') {
          if (inTrainingCard) {
              const cardData = parseTrainingCard(trainingCardContent, trainingCardAttrs);
              elements.push(
                  <div key={`training-card-${i}`} className="not-prose my-6 p-5 bg-white border border-greatek-border rounded-xl shadow-sm border-l-4 border-l-greatek-blue animate-fade-in hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-greatek-blue/10 flex items-center justify-center flex-shrink-0">
                              <i className={`bi ${cardData.icon} text-xl text-greatek-blue`}></i>
                          </div>
                          <div className="flex-1">
                              <h4 className="text-lg font-bold text-greatek-dark-blue mb-2">{cardData.title}</h4>
                              <div className="text-text-secondary text-sm leading-relaxed">
                                  {cardData.body.split('\n').map((l, idx) => (
                                      <p key={idx} className="mb-2 last:mb-0">{parseInlineMarkdown(l)}</p>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              );
              trainingCardContent = ''; inTrainingCard = false;
          }
          continue;
      }

      if (cleanTagLine === '[STRATEGY_CARD_END]') {
          if (inStrategyCard) {
              const cardData = parseStrategyCardContent(strategyCardContent);
              
              // Helper to parse internal markdown sections of the card body (like Tables inside)
              // We create a mini-instance of the rendering logic
              const renderBody = (bodyText: string) => {
                  const bodyLines = bodyText.split('\n');
                  const bodyElements = [];
                  for (let j = 0; j < bodyLines.length; j++) {
                      const l = bodyLines[j];
                      // Table Parsing Logic reuse
                      const isTableSeparator = (line: string) => line.trim().startsWith('|') && line.includes('---') && line.trim().endsWith('|');
                      const isTableRow = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|');

                      if (isTableRow(l) && j + 1 < bodyLines.length && isTableSeparator(bodyLines[j + 1])) {
                          const headerLine = l;
                          const headers = headerLine.split('|').slice(1, -1).map(cell => cell.trim());
                          const rows: string[][] = [];
                          let k = j + 2;
                          while(k < bodyLines.length && isTableRow(bodyLines[k])) {
                              const rowCells = bodyLines[k].trim().split('|').slice(1, -1).map(cell => cell.trim());
                              rows.push(rowCells);
                              k++;
                          }
                          bodyElements.push(<DataTableView key={`internal-table-${j}`} headers={headers} rows={rows} />);
                          j = k - 1;
                      } else if (l.startsWith('### ')) {
                          bodyElements.push(<h4 key={`h4-${j}`} className="text-base font-bold text-greatek-dark-blue mt-4 mb-2">{l.substring(4)}</h4>);
                      } else if (l.trim()) {
                          bodyElements.push(<p key={`p-${j}`} className="text-sm text-text-secondary mb-1">{parseInlineMarkdown(l)}</p>);
                      }
                  }
                  return bodyElements;
              };

              elements.push(
                  <div key={`strategy-card-${i}`} className="not-prose my-8 p-6 bg-white border border-greatek-border rounded-xl shadow-lg border-t-4 border-t-greatek-blue animate-fade-in relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                          <i className={`bi ${cardData.icon} text-8xl`}></i>
                      </div>
                      
                      <div className="relative z-10">
                          <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                              <div>
                                  <span className="text-xs uppercase font-bold text-greatek-blue tracking-wider bg-greatek-blue/10 px-2 py-1 rounded">Estratégia Individual</span>
                                  <h3 className="text-2xl font-bold text-greatek-dark-blue mt-2">{cardData.seller}</h3>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-text-secondary">Foco Principal</p>
                                  <p className="text-lg font-bold text-greatek-dark-blue">{cardData.productFocus}</p>
                              </div>
                          </div>
                          
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4 inline-block w-full">
                              <span className="font-bold text-yellow-800 text-sm"><i className="bi bi-exclamation-triangle-fill mr-1"></i> GAP: {cardData.gap}</span>
                          </div>

                          <div className="space-y-2">
                              {renderBody(cardData.body)}
                          </div>
                      </div>
                  </div>
              );
              strategyCardContent = ''; inStrategyCard = false;
          }
          continue;
      }


      // --- Content Accumulation ---
      if (inSalesCard) { salesCardContent += line + '\n'; continue; }
      if (inDiagnosisCard) { diagnosisCardContent += line + '\n'; continue; }
      if (inPillarCard) { pillarCardContent += line + '\n'; continue; }
      if (inComponentCard) { componentCardContent += line + '\n'; continue; }
      if (inSocialPost) { socialPostContent += line + '\n'; continue; }
      if (inVisualBrief) { visualBriefContent += line + '\n'; continue; }
      if (inSeoMetrics) { seoMetricsContent += line + '\n'; continue; }
      if (inTechDiagram) { techDiagramContent += line + '\n'; continue; }
      if (inTrainingCard) { trainingCardContent += line + '\n'; continue; }
      if (inStrategyCard) { strategyCardContent += line + '\n'; continue; }
      
      // --- Standard Markdown Parsing ---
      const isTableSeparator = (l: string) => l.trim().startsWith('|') && l.includes('---') && l.trim().endsWith('|');
      const isTableRow = (l: string) => l.trim().startsWith('|') && l.trim().endsWith('|');
      
      if (!inCodeBlock && isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
          flushAll();

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
        flushAll();
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
        flushAll();
        elements.push(<h1 key={i} className="text-3xl font-bold mt-6 mb-3 border-b border-greatek-border pb-2 text-greatek-dark-blue">{parseInlineMarkdown(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        flushAll();
        elements.push(<h2 key={i} className="text-2xl font-semibold mt-5 mb-2 text-greatek-dark-blue">{parseInlineMarkdown(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        flushAll();
        elements.push(<h3 key={i} className="text-xl font-semibold mt-4 mb-2 text-text-primary">{parseInlineMarkdown(line.substring(4))}</h3>);
       } else if (line.startsWith('#### ')) {
        flushAll();
        elements.push(<h4 key={i} className="text-lg font-semibold mt-4 mb-2 text-text-primary">{parseInlineMarkdown(line.substring(5))}</h4>);
      } else if (line.startsWith('> ')) {
        flushList();
        blockquoteItems.push(line.substring(2));
      } else if (line.match(/^(\*|-)\s/)) {
        flushBlockquote();
        listItems.push(line.substring(2));
      } else if (line.trim() === '') {
        flushAll();
        elements.push(<div key={i} className="h-4" />);
      } else if (line.trim() !== ''){
        flushAll();
        elements.push(<p key={i} className="my-2 leading-relaxed text-text-secondary">{parseInlineMarkdown(line)}</p>);
      }
    }
    
    flushAll();
    
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
