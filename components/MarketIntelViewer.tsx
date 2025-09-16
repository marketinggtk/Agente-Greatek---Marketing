import React, { useState } from 'react';
import { MarketIntelReport } from '../types';

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
        
        data.comparison_points.forEach(point => {
            text += `${point.feature}:\n`;
            text += `  - ${greatek_product_name}: ${point.greatek}\n`;
            text += `  - ${competitor_product_name}: ${point.competitor}\n\n`;
        });
        
        text += "--- Diferenciais Competitivos ---\n";
        data.competitive_advantages.forEach(adv => {
            text += `- ${adv}\n`;
        });

        text += "\n--- Argumentos Comerciais ---\n";
        data.commercial_arguments.forEach(arg => {
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

            <div className="my-6 p-4 bg-greatek-blue/10 border-l-4 border-greatek-blue rounded-r-lg">
                <h3 className="text-lg font-semibold text-greatek-dark-blue not-prose">Resumo de Vendas (Gancho Comercial)</h3>
                <p className="mt-2 text-text-secondary">{sales_pitch_summary}</p>
            </div>
            
            <h2 className="text-2xl font-semibold mt-5 mb-2 text-greatek-dark-blue">
                Comparativo: {greatek_product_name} vs. {competitor_product_name}
            </h2>

            <div className="overflow-x-auto my-6 border border-greatek-border rounded-lg not-prose">
                <table className="min-w-full divide-y divide-greatek-border">
                    <thead className="bg-greatek-bg-light">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider">
                                Característica
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider">
                                {greatek_product_name}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider">
                                {competitor_product_name}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-greatek-border">
                        {comparison_points.map((point, index) => (
                            <tr key={index} className="hover:bg-greatek-bg-light/50">
                                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-text-primary">{point.feature}</td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-text-secondary">{point.greatek}</td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-text-secondary">{point.competitor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-2 text-text-primary">Diferenciais Competitivos</h3>
            <ul className="list-disc pl-5 my-2 space-y-1">
                {competitive_advantages.map((item, idx) => (
                    <li key={idx} className="text-text-secondary leading-relaxed">{item}</li>
                ))}
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-2 text-text-primary">Argumentos Comerciais</h3>
            <ul className="list-disc pl-5 my-2 space-y-1">
                {commercial_arguments.map((item, idx) => (
                    <li key={idx} className="text-text-secondary leading-relaxed">{item}</li>
                ))}
            </ul>

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