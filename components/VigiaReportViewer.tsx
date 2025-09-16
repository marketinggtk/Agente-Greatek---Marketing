import React, { useState } from 'react';
import { VigiaReport } from '../types';
import { CheckCircleIcon } from './Icons';

interface VigiaReportViewerProps {
  data: VigiaReport;
}

const VigiaReportViewer: React.FC<VigiaReportViewerProps> = ({ data }) => {
    const [copied, setCopied] = useState(false);
    
    const { 
        monitoring_topic,
        executive_summary,
        opportunities,
        threats,
        actionable_insight,
        sources
    } = data;

    const formatReportForCopy = () => {
        let text = `Relatório de Vigilância sobre: "${monitoring_topic}"\n\n`;
        text += `--- Resumo Executivo ---\n`;
        executive_summary.forEach(point => text += `- ${point}\n`);
        
        text += "\n--- Oportunidades ---\n";
        opportunities.forEach(point => text += `- ${point}\n`);

        text += "\n--- Ameaças ---\n";
        threats.forEach(point => text += `- ${point}\n`);
        
        text += `\n--- Insight Acionável ---\n${actionable_insight}\n\n`;

        if (sources && sources.length > 0) {
            text += "\n--- Fontes Encontradas ---\n";
            sources.forEach(source => {
                text += `- ${source.title || 'Fonte'}: ${source.uri}\n`;
            });
        }
        return text;
    };

    const handleCopy = () => {
        const reportText = formatReportForCopy();
        navigator.clipboard.writeText(reportText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="prose max-w-none">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-greatek-border">
                <span className="text-sm font-semibold text-greatek-dark-blue">Relatório de Vigilância</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
                >
                    {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
                    <span className="ml-1.5">{copied ? 'Copiado!' : 'Copiar Relatório'}</span>
                </button>
            </div>

            <p className="text-sm text-text-secondary/80">Monitorando: <em>"{monitoring_topic}"</em></p>

            <h3 className="text-xl font-semibold mt-6 mb-2 text-text-primary">Resumo Executivo</h3>
            <ul className="list-none pl-0 my-2 space-y-2">
                {executive_summary.map((item, idx) => (
                    <li key={idx} className="flex items-start text-text-secondary leading-relaxed">
                        <i className="bi bi-check-circle-fill text-greatek-blue mr-3 mt-1"></i>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div>
                    <h3 className="text-lg font-semibold text-green-700">Oportunidades</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        {opportunities.map((item, idx) => (
                            <li key={idx} className="text-text-secondary leading-relaxed">{item}</li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-red-700">Ameaças</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        {threats.map((item, idx) => (
                            <li key={idx} className="text-text-secondary leading-relaxed">{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="my-6 p-4 bg-greatek-blue/10 border-l-4 border-greatek-blue rounded-r-lg">
                <h3 className="text-lg font-semibold text-greatek-dark-blue not-prose">Insight Acionável</h3>
                <p className="mt-2 text-text-secondary">{actionable_insight}</p>
            </div>

            {sources && sources.length > 0 && (
                <>
                    <h3 className="text-xl font-semibold mt-8 mb-2 text-text-primary">Fontes</h3>
                    <ul className="list-disc pl-5 my-2 space-y-1 text-sm">
                        {sources.map((source, idx) => (
                            <li key={idx} className="text-text-secondary leading-relaxed truncate">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline" title={source.uri}>
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default VigiaReportViewer;