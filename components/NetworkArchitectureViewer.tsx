
import React, { useState } from 'react';
import { NetworkArchitectureReport } from '../types';

interface NetworkArchitectureViewerProps {
  data: NetworkArchitectureReport;
}

const NetworkArchitectureViewer: React.FC<NetworkArchitectureViewerProps> = ({ data }) => {
    const [copied, setCopied] = useState(false);

    const formatReportForCopy = () => {
        let text = `Relatório de Arquitetura de Rede\n\n`;
        text += `--- Diagnóstico do Cenário Atual ---\n${data.diagnosis}\n\n`;
        text += `--- Solução Proposta: ${data.proposed_solution.title} ---\n${data.proposed_solution.description}\n\n`;
        
        text += "--- Simulação de Benefícios ---\n";
        data.benefit_simulation.forEach(item => {
            text += `${item.metric}:\n`;
            text += `  - Cenário Atual: ${item.current_scenario}\n`;
            text += `  - Cenário Proposto: ${item.proposed_scenario}\n`;
            text += `  - Melhoria: ${item.improvement}\n\n`;
        });
        
        text += "--- Argumentos Comerciais para o Cliente ---\n";
        data.commercial_arguments.forEach(arg => text += `- ${arg}\n`);
        
        text += "\n--- Produtos Recomendados ---\n";
        data.required_products.forEach(prod => {
            text += `- Categoria: ${prod.category}\n`;
            text += `  - Produto: ${prod.product}\n`;
            text += `  - Sugestão: ${prod.suggestion}\n\n`;
        });
        
        return text;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatReportForCopy()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="prose max-w-none">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-greatek-border">
                <span className="text-sm font-semibold text-greatek-dark-blue">Relatório de Arquitetura de Rede</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
                >
                    {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
                    <span className="ml-1.5">{copied ? 'Copiado!' : 'Copiar Relatório'}</span>
                </button>
            </div>

            <div className="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <h3 className="text-lg font-semibold text-yellow-800 not-prose flex items-center">
                    <i className="bi bi-exclamation-triangle-fill mr-3"></i>
                    Diagnóstico do Cenário Atual
                </h3>
                <p className="mt-2 text-yellow-900">{data.diagnosis}</p>
            </div>

            <div className="my-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <h3 className="text-lg font-semibold text-green-800 not-prose flex items-center">
                     <i className="bi bi-lightbulb-fill mr-3"></i>
                    Solução Proposta: {data.proposed_solution.title}
                </h3>
                <p className="mt-2 text-green-900">{data.proposed_solution.description}</p>
            </div>
            
            <h3 className="text-xl font-semibold mt-8 mb-2 text-text-primary">Simulação de Benefícios</h3>
            <div className="overflow-x-auto my-4 border border-greatek-border rounded-lg not-prose">
                <table className="min-w-full divide-y divide-greatek-border">
                    <thead className="bg-greatek-bg-light">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider">Métrica</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider">Cenário Atual</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider">Cenário Proposto</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider">Melhoria</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-greatek-border">
                        {data.benefit_simulation.map((item, index) => (
                            <tr key={index} className="hover:bg-greatek-bg-light/50">
                                <td className="px-4 py-2 whitespace-normal text-sm font-medium text-text-primary">{item.metric}</td>
                                <td className="px-4 py-2 whitespace-normal text-sm text-text-secondary">{item.current_scenario}</td>
                                <td className="px-4 py-2 whitespace-normal text-sm text-text-secondary font-semibold text-green-700">{item.proposed_scenario}</td>
                                <td className="px-4 py-2 whitespace-normal text-sm font-semibold text-greatek-blue">{item.improvement}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-2 text-text-primary">Argumentos Comerciais para o Cliente</h3>
            <ul className="list-disc pl-5 my-2 space-y-1">
                {data.commercial_arguments.map((item, idx) => (
                    <li key={idx} className="text-text-secondary leading-relaxed">{item}</li>
                ))}
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-2 text-text-primary">Produtos Recomendados</h3>
             <div className="space-y-3 not-prose">
                {data.required_products.map((item, idx) => (
                    <div key={idx} className="p-3 border border-greatek-border rounded-lg bg-white">
                        <p className="font-semibold text-greatek-dark-blue">{item.product}</p>
                        <p className="text-xs uppercase text-text-secondary/70 tracking-wider">{item.category}</p>
                        <p className="text-sm text-text-secondary mt-2">{item.suggestion}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NetworkArchitectureViewer;
