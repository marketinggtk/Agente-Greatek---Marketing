

import React, { useState } from 'react';
import { AppMode, LeadData, isLeadDataArray, Message } from '../types';
import { runGeminiJsonQuery } from '../services/geminiService';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';

const LeadHunter: React.FC = () => {
    const { showToast } = useAppStore();
    const [query, setQuery] = useState('');
    const [leads, setLeads] = useState<LeadData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setLeads([]);

        try {
            // Construct a temporary message for the query
            const messages: Message[] = [{ role: 'user', content: `Encontre leads para: ${query}` }];
            
            // Use the AppMode.LEAD_HUNTER which is configured for JSON response and Google Search
            const result = await runGeminiJsonQuery(
                AppMode.LEAD_HUNTER, 
                messages, 
                new AbortController().signal
            );

            if (isLeadDataArray(result)) {
                setLeads(result);
                showToast(`${result.length} leads encontrados!`, 'success');
            } else {
                setError("O formato dos dados retornados é inválido.");
            }

        } catch (e: any) {
            console.error("Lead Hunter Error:", e);
            setError(e.message || "Falha ao buscar leads.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyTable = () => {
        if (leads.length === 0) return;
        
        // Formato otimizado para Excel (Tab-Separated Values)
        let text = "Nome Fantasia\tRazão Social\tCNPJ\tResponsável (QSA)\tCidade\tUF\tTelefone Fixo\tWhatsApp/Celular\tWebsite\tRelevância\tMotivo\tProdutos Potenciais\n";
        leads.forEach(lead => {
            const name = lead.name || 'N/A';
            const legalName = lead.legal_name || 'N/A';
            const cnpj = lead.cnpj || 'N/A';
            const responsible = lead.responsible_name || 'N/A';
            const city = lead.city || 'N/A';
            const uf = lead.uf || 'N/A';
            const phone = lead.contact_info || 'N/A';
            const whatsapp = lead.whatsapp || 'N/A';
            const website = lead.website || 'N/A';
            const score = lead.relevance_score || 'N/A';
            const reason = lead.reason || 'N/A';
            const products = lead.potential_products ? lead.potential_products.join(', ') : 'N/A';

            text += `${name}\t${legalName}\t${cnpj}\t${responsible}\t${city}\t${uf}\t${phone}\t${whatsapp}\t${website}\t${score}\t${reason}\t${products}\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            showToast("Dados copiados! Cole no Excel (Ctrl+V).", 'success');
        });
    };

    const getRelevanceBadge = (score: string) => {
        switch(score) {
            case 'Alta': return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">Alta</span>;
            case 'Média': return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200">Média</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200">Baixa</span>;
        }
    };

    return (
        <div className="flex flex-col h-full p-1">
            <div className="mb-4 text-center">
                <i className="bi bi-crosshair text-3xl text-greatek-blue/50 mb-2 block"></i>
                <h2 className="text-lg font-bold text-greatek-dark-blue">Caçador de Leads B2B</h2>
                <p className="text-xs text-text-secondary">Enriqueça sua prospecção com dados reais de QSA, CNPJ e Contato.</p>
            </div>

            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Ex: Provedores de Internet em Campinas SP"
                    className="flex-grow p-2.5 text-sm border border-greatek-border rounded-lg focus:ring-2 focus:ring-greatek-blue focus:border-transparent bg-[#e9e9e9] text-black"
                    disabled={isLoading}
                />
                <SubmitButton 
                    onClick={handleSearch} 
                    disabled={isLoading || !query.trim()}
                    className="px-4 py-2 rounded-lg font-semibold text-sm"
                >
                    {isLoading ? 'Buscando...' : 'Buscar'}
                </SubmitButton>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
                    {error}
                </div>
            )}

            {leads.length > 0 && (
                <div className="flex-grow overflow-hidden flex flex-col border border-greatek-border rounded-lg shadow-sm bg-white">
                    <div className="p-2 border-b border-greatek-border bg-gray-50 flex justify-between items-center">
                        <span className="font-semibold text-greatek-dark-blue text-xs">{leads.length} empresas</span>
                        <button 
                            onClick={handleCopyTable}
                            className="text-xs flex items-center gap-1 text-white bg-green-600 hover:bg-green-700 font-medium px-3 py-1.5 rounded transition-colors"
                        >
                            <i className="bi bi-file-earmark-spreadsheet"></i> Copiar para Excel
                        </button>
                    </div>
                    <div className="overflow-auto custom-scrollbar flex-grow p-0">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[11px] text-gray-500 uppercase bg-gray-100 sticky top-0 z-10 font-semibold">
                                <tr>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">Empresa (Razão Social)</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">Responsável (QSA)</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">Contatos</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">Localização</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap text-center">Score</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-text-primary divide-y divide-gray-100">
                                {leads.map((lead, index) => (
                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-3 py-2 align-top max-w-[200px]">
                                            <div className="font-bold text-greatek-dark-blue truncate" title={lead.name}>{lead.name}</div>
                                            <div className="text-[10px] text-gray-500 truncate" title={lead.legal_name}>{lead.legal_name}</div>
                                            <div className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1 rounded inline-block mt-0.5 border border-gray-200">
                                                {lead.cnpj || 'CNPJ N/A'}
                                            </div>
                                            {lead.website && lead.website !== 'N/A' && (
                                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline block mt-0.5 truncate">
                                                    Website <i className="bi bi-box-arrow-up-right text-[9px]"></i>
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 align-top max-w-[150px]">
                                            <div className="flex items-start gap-1.5">
                                                <i className="bi bi-person-circle text-gray-400 mt-0.5"></i>
                                                <span className="truncate font-medium" title={lead.responsible_name}>{lead.responsible_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 align-top min-w-[160px]">
                                            <div className="flex flex-col gap-1">
                                                {lead.whatsapp && lead.whatsapp !== 'N/A' && (
                                                    <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 w-fit">
                                                        <i className="bi bi-whatsapp text-[10px]"></i>
                                                        <span className="font-mono font-medium">{lead.whatsapp}</span>
                                                    </div>
                                                )}
                                                {lead.contact_info && lead.contact_info !== 'N/A' && (
                                                    <div className="flex items-center gap-1.5 text-gray-600 ml-0.5">
                                                        <i className="bi bi-telephone text-[10px]"></i>
                                                        <span className="font-mono">{lead.contact_info}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <div className="font-medium">{lead.city}</div>
                                            <div className="text-gray-500">{lead.uf}</div>
                                        </td>
                                        <td className="px-3 py-2 align-top text-center">
                                            {getRelevanceBadge(lead.relevance_score)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {!isLoading && leads.length === 0 && !error && (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                    <i className="bi bi-search text-5xl mb-3"></i>
                    <p className="text-sm">Digite um segmento e região para prospectar.</p>
                </div>
            )}
        </div>
    );
};

export default LeadHunter;