import React, { useState } from 'react';
import { MarketIntelReport } from '../types';
import { DataTableView } from './ui/DataTableView';

interface MarketIntelViewerProps {
  data: MarketIntelReport;
}

const MarketIntelViewer: React.FC<MarketIntelViewerProps> = ({ data }) => {
    const [copied, setCopied] = useState(false);
    
    const { 
        greatek_product_name, 
        competitor_product_name, 
        comparison_points, 
        competitive_advantages, 
        commercial_arguments,
        sales_pitch_summary,
        competitor_data_sources
    } = data;

    const formatReportForCopy = () => {
        let text = `Resumo de Vendas (Gancho Comercial):\n${sales_pitch_summary}\n\n`;
        text += `--- Comparativo: ${greatek_product_name} vs. ${competitor_product_name} ---\n\n`;
        
        comparison_points.forEach(point => {
            text += `${point.feature}:\n`;
            text += `  - ${greatek_product_name}: ${point.greatek}\n`;
            text += `  - ${competitor_product_name}: ${point.competitor}\n\n`;
        });
        
        text += `\n--- Por que escolher ${greatek_product_name}? ---\n`;
        competitive_advantages.forEach(adv => {
            text += `- ${adv}\n`;
        });

        text += "\n--- Argumentos de Venda para o Cliente ---\n";
        commercial_arguments.forEach(arg => {
            text += `- ${arg}\n`;
        });

        if (competitor_data_sources && competitor_data_sources.length > 0) {
            text += "\n--- Fontes de Dados do Concorrente ---\n";
            competitor_data_sources.forEach(source => {
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

    const tableHeaders = ['Característica', greatek_product_name, competitor_product_name];
    const tableRows = comparison_points.map(point => [point.feature, point.greatek, point.competitor]);

    return (
        <div className="prose max-w-none">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-greatek-border">
                <span className="text-sm font-semibold text-greatek-dark-blue">Relatório de Inteligência de Mercado</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
                >
                    {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
                    <span className="ml-1.5">{copied ? 'Copiado!' : 'Copiar Relatório'}</span>
                </button>
            </div>

            <div className="my-6 p-4 bg-greatek-blue/10 border-l-4 border-greatek-blue rounded-r-lg not-prose">
                <h3 className="text-lg font-semibold text-greatek-dark-blue not-prose flex items-center">
                    <i className="bi bi-bullseye mr-3"></i>
                    Resumo de Vendas (Gancho Comercial)
                </h3>
                <p className="mt-2 text-text-secondary">{sales_pitch_summary}</p>
            </div>
            
            <h2 className="text-2xl font-semibold mt-5 mb-2 text-greatek-dark-blue">
                Comparativo: {greatek_product_name} vs. {competitor_product_name}
            </h2>

            <DataTableView headers={tableHeaders} rows={tableRows} />

            <div className="mt-8">
                <h3 className="text-xl font-semibold text-text-primary flex items-center mb-3">
                    <i className="bi bi-shield-check text-green-600 mr-3"></i>
                    Por que escolher {greatek_product_name}?
                </h3>
                <div className="space-y-3 not-prose">
                    {competitive_advantages.map((item, idx) => (
                        <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-900 shadow-sm">
                            <i className="bi bi-check-circle-fill text-green-600 mr-3 mt-1 flex-shrink-0"></i>
                            <span className="text-text-secondary leading-relaxed">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold text-text-primary flex items-center mb-3">
                    <i className="bi bi-megaphone-fill text-greatek-blue mr-3"></i>
                    Argumentos de Venda para o Cliente
                </h3>
                <div className="space-y-3 not-prose">
                    {commercial_arguments.map((item, idx) => (
                        <div key={idx} className="p-4 bg-greatek-blue/10 border-l-4 border-greatek-blue rounded-r-lg">
                            <p className="flex items-start text-text-secondary leading-relaxed">
                                <i className="bi bi-quote text-2xl text-greatek-blue mr-3 -mt-1 flex-shrink-0"></i>
                                <span>{item}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>


            {competitor_data_sources && competitor_data_sources.length > 0 && (
                <>
                    <h3 className="text-xl font-semibold mt-8 mb-2 text-text-primary">Fontes de Dados do Concorrente</h3>
                    <ul className="list-disc pl-5 my-2 space-y-1 text-sm">
                        {competitor_data_sources.map((source, idx) => (
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

export default MarketIntelViewer;