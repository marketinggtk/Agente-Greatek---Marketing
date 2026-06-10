

import React, { useState, useEffect } from 'react';
import { AppMode, LeadData, isLeadDataArray, Message } from '../types';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import { searchLeadsWithoutAI, enrichLeadsWithAI, enrichLeadsWithCnpj, getLeadHunterStatus } from '../services/leadSearchService';

const LeadHunter: React.FC = () => {
    const { showToast } = useAppStore();
    const [query, setQuery] = useState('');
    const [leads, setLeads] = useState<LeadData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [isValidatingCnpj, setIsValidatingCnpj] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiWarning, setAiWarning] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<{ source: string, fromCache: boolean } | null>(null);
    const [backendStatus, setBackendStatus] = useState<{ googlePlacesConfigured: boolean, environment: string, mockAllowed: boolean } | null>(null);
    const [lastSearchTime, setLastSearchTime] = useState<number>(0);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await getLeadHunterStatus();
            setBackendStatus(status);
            console.log("[LeadHunter] Backend Status:", status);
        };
        checkStatus();
    }, []);

    const normalizeQuery = (q: string) => {
        return q.trim().toLowerCase().replace(/\s+/g, ' ');
    };

    const handleSearch = async () => {
        const normalized = normalizeQuery(query);
        if (!normalized) return;

        // Rate limiting check (10 seconds)
        const now = Date.now();
        if (now - lastSearchTime < 10000 && lastSearchTime !== 0) {
            const remaining = Math.ceil((10000 - (now - lastSearchTime)) / 1000);
            showToast(`Aguarde ${remaining} segundos antes de buscar novamente.`, 'info');
            return;
        }

        if (normalized.length < 5) {
            setError("Busca muito curta. Ex: 'provedores de internet em Campinas SP'");
            return;
        }
        
        // Query restriction for broad terms
        const broadTerms = ["região", "centro oeste", "nordeste", "sudeste", "norte", "sul", "brasil"];
        if (broadTerms.some(term => normalized.includes(term)) && normalized.split(' ').length < 4) {
             setError("Para evitar limite da API, pesquise por cidade ou estado. Ex: 'provedores de internet em Goiânia GO'.");
             return;
        }

        // 1. Check Cache
        const CACHE_KEY = 'greatek-lead-hunter-cache-v6'; // Version bumped to v6 to force refresh
        
        // Automatic cleanup of old cache versions
        ['greatek-lead-hunter-cache', 'greatek-lead-hunter-cache-v2', 'greatek-lead-hunter-cache-v3', 'greatek-lead-hunter-cache-v4', 'greatek-lead-hunter-cache-v5'].forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`[LeadHunter] Cleaning up old cache: ${key}`);
                localStorage.removeItem(key);
            }
        });

        const cacheRaw = localStorage.getItem(CACHE_KEY);
        let cache: Record<string, { query: string, data: LeadData[], source: string, cnpjEnriched: boolean, aiEnriched: boolean, timestamp: number }> = {};
        
        try {
            if (cacheRaw) cache = JSON.parse(cacheRaw);
        } catch (e) {
            console.error("Cache parsing error", e);
        }

        const cachedEntry = cache[normalized];
        const isRecent = cachedEntry && (Date.now() - cachedEntry.timestamp < 24 * 60 * 60 * 1000);

        // INVALIDATE MOCK CACHE IF API KEY IS NOW PRESENT
        const shouldSkipCache = cachedEntry?.source === 'mock' && backendStatus?.googlePlacesConfigured;

        if (isRecent && !shouldSkipCache) {
            console.log("[LeadHunter] Cache hit for query:", normalized);
            console.log("[LeadHunter] Source:", cachedEntry.source);
            
            // SECURITY: Ensure we don't use cache from another query (Double check key)
            if (cachedEntry.query && cachedEntry.query !== normalized) {
                console.warn("[LeadHunter] Cache collision detected. Ignoring.");
            } else {
                setLeads(cachedEntry.data);
                setDataSource({ source: cachedEntry.source, fromCache: true });
                setAiWarning(null);
                if (cachedEntry.source === 'mock') {
                    setAiWarning("Resultados simulados carregados do cache.");
                }
                showToast(`Resultados carregados do cache!`, 'info');
                return;
            }
        } else if (shouldSkipCache) {
            console.log("[LeadHunter] Invaliding mock cache because Google Places API is configured.");
        }
        
        setIsLoading(true);
        setIsEnriching(false);
        setIsValidatingCnpj(false);
        setError(null);
        setAiWarning(null);
        setLeads([]);
        setDataSource(null);
        setLastSearchTime(Date.now());

        try {
            console.log("[LeadHunter] Invocando busca real...", { query: normalized });
            const result = await searchLeadsWithoutAI(normalized);
            let currentLeads = result.leads;
            
            console.log("[LeadHunter] Search Response Source:", result.source);
            setDataSource({ source: result.source, fromCache: false });
            
            if (currentLeads.length > 0) {
                setLeads(currentLeads);
                
                if (result.source === 'mock') {
                    setAiWarning("Resultados simulados: configure uma API de busca para obter empresas reais.");
                } else {
                    showToast(`${currentLeads.length} empresas encontradas.`, 'info');
                }
                
                // 2. Validate CNPJs (BrasilAPI) - Only if they have actual CNPJs (not 'N/A')
                const leadsToValidate = currentLeads.filter(l => l.cnpj && l.cnpj !== 'N/A' && l.cnpj_source !== 'mock');
                
                if (leadsToValidate.length > 0) {
                    setIsValidatingCnpj(true);
                    showToast(`Validando ${leadsToValidate.length} CNPJs...`, 'info');
                    try {
                        const cnpjEnriched = await enrichLeadsWithCnpj(currentLeads);
                        currentLeads = cnpjEnriched;
                        setLeads(currentLeads);
                        showToast("CNPJs validados com BrasilAPI!", 'success');
                    } catch (cnpjErr: any) {
                        console.warn("[LeadHunter] CNPJ enrichment failed", cnpjErr);
                        setAiWarning(prev => (prev ? prev + " | " : "") + "Não foi possível validar CNPJs agora.");
                    } finally {
                        setIsValidatingCnpj(false);
                    }
                }

                // 3. Start AI Enrichment (Gemini)
                setIsEnriching(true);
                try {
                    const aiEnrichedResults = await enrichLeadsWithAI(currentLeads, normalized);
                    setLeads(aiEnrichedResults);
                    showToast("Análise estratégica concluída!", 'success');
                    
                    // Save to cache fully enriched
                    cache[normalized] = {
                        query: normalized, // Added query to entry for validation
                        data: aiEnrichedResults,
                        source: result.source,
                        cnpjEnriched: true,
                        aiEnriched: true,
                        timestamp: Date.now()
                    };
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
                } catch (enrichErr: any) {
                    console.warn("[LeadHunter] AI Enrichment failed", enrichErr);
                    const isQuota = enrichErr.status === 429 || enrichErr.message?.includes('429') || enrichErr.message?.toLowerCase().includes('limite');
                    const isHighDemand = enrichErr.status === 503 || enrichErr.message?.includes('503') || enrichErr.message?.toLowerCase().includes('demanda');
                    
                    if (isQuota) {
                        setAiWarning(prev => (prev ? prev + " | " : "") + "IA em limite de cota.");
                    } else if (isHighDemand) {
                        setAiWarning(prev => (prev ? prev + " | " : "") + "IA em alta demanda (indisponível agora).");
                    } else {
                        setAiWarning(prev => (prev ? prev + " | " : "") + "Análise da IA indisponível.");
                    }

                    // Cache partially enriched results
                    cache[normalized] = {
                        query: normalized,
                        data: currentLeads,
                        source: result.source,
                        cnpjEnriched: true,
                        aiEnriched: false,
                        timestamp: Date.now()
                    };
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
                } finally {
                    setIsEnriching(false);
                }
            } else {
                setError("Nenhum lead encontrado para esta busca.");
            }
        } catch (e: any) {
            console.error("[LeadHunter] Search error:", e);
            const message = String(e.message || '');
            if (message.includes('Aguarde') || message.includes('Limite') || message.includes('Rate')) {
                setError("Limite temporário da API atingido. Aguarde alguns minutos ou refine a busca por cidade.");
            } else {
                setError(e.message || "Falha ao buscar leads.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyTable = () => {
        if (leads.length === 0) return;
        
        let text = "Nome Fantasia\tRazão Social\tSituação Cadastral\tCNPJ\tCNAE\tResponsáveis (QSA)\tCidade\tUF\tTelefone\tWebsite\tRelevância\n";
        leads.forEach(lead => {
            const name = lead.name || 'N/A';
            const legalName = lead.legal_name || 'N/A';
            const status = lead.company_status || 'N/A';
            const cnpj = lead.cnpj || 'N/A';
            const cnae = lead.main_cnae_description || 'N/A';
            const responsible = lead.qsa ? lead.qsa.join(' / ') : (lead.responsible_name || 'N/A');
            const city = lead.city || 'N/A';
            const uf = lead.uf || 'N/A';
            const phone = lead.contact_info || 'N/A';
            const website = lead.website || 'N/A';
            const score = lead.relevance_score || 'N/A';

            text += `${name}\t${legalName}\t${status}\t${cnpj}\t${cnae}\t${responsible}\t${city}\t${uf}\t${phone}\t${website}\t${score}\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            showToast("Dados copiados para o Excel!", 'success');
        });
    };

    const getRelevanceBadge = (score: string) => {
        switch(score) {
            case 'Alta': return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">Alta</span>;
            case 'Média': return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200">Média</span>;
            case 'Baixa': return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200">Baixa</span>;
            case 'Pendente': return <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 animate-pulse">Pendente</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200">N/A</span>;
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
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Ex: Provedores de Internet em Campinas SP"
                        className="w-full p-2.5 text-sm border border-greatek-border rounded-lg focus:ring-2 focus:ring-greatek-blue focus:border-transparent bg-[#e9e9e9] text-black pr-10"
                        disabled={isLoading}
                    />
                    {query && (
                        <button 
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <i className="bi bi-x-circle-fill"></i>
                        </button>
                    )}
                </div>
                
                <SubmitButton 
                    onClick={handleSearch} 
                    disabled={isLoading || !query.trim()}
                    className="px-4 py-2 rounded-lg font-semibold text-sm"
                >
                    {isLoading ? 'Buscando...' : 'Buscar'}
                </SubmitButton>

                <button 
                    onClick={() => {
                        ['greatek-lead-hunter-cache', 'greatek-lead-hunter-cache-v2', 'greatek-lead-hunter-cache-v3', 'greatek-lead-hunter-cache-v4', 'greatek-lead-hunter-cache-v5'].forEach(k => localStorage.removeItem(k));
                        setLeads([]);
                        setAiWarning(null);
                        setDataSource(null);
                        setError(null);
                        showToast("Cache do LeadHunter limpo.", 'info');
                    }}
                    className="p-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
                    title="Limpar Cache e Resultados"
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
                    {error}
                </div>
            )}

            {aiWarning && (
                <div className="p-3 mb-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-xs rounded flex items-start gap-2">
                    <i className="bi bi-info-circle-fill mt-0.5"></i>
                    <span>{aiWarning}</span>
                </div>
            )}

            {isValidatingCnpj && (
                <div className="mb-4 p-2 bg-purple-50 border border-purple-100 rounded text-xs text-purple-700 animate-pulse flex items-center justify-center gap-2">
                    <i className="bi bi-shield-check"></i>
                    Validando dados cadastrais via BrasilAPI...
                </div>
            )}

            {isEnriching && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 animate-pulse flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Fazendo análise estratégica com IA...
                </div>
            )}

            {leads.length > 0 && (
                <div className="flex-grow overflow-hidden flex flex-col border border-greatek-border rounded-lg shadow-sm bg-white">
                    <div className="p-2 border-b border-greatek-border bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-greatek-dark-blue text-xs">{leads.length} empresas</span>
                            {dataSource && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                    dataSource.source === 'google_places' 
                                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    <i className={`bi ${dataSource.source === 'google_places' ? 'bi-google' : 'bi-bug'}`}></i>
                                    Fonte: {dataSource.source === 'google_places' ? 'Google Places' : 'Simulado'}
                                    {dataSource.fromCache && <span className="opacity-70 ml-1">(Cache)</span>}
                                </span>
                            )}
                        </div>
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
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">Empresa / Razão Social</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">QSA (Sócios) / CNAE</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">Contatos</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">Localização</th>
                                    <th className="px-3 py-2 border-b border-gray-200 whitespace-nowrap text-center">Score</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-text-primary divide-y divide-gray-100">
                                {leads.map((lead, index) => (
                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-3 py-2 align-top max-w-[220px]">
                                            <div className="font-bold text-greatek-dark-blue truncate" title={lead.name}>{lead.name}</div>
                                            <div className="text-[10px] text-gray-500 truncate" title={lead.legal_name}>{lead.legal_name}</div>
                                            
                                            <div className="flex flex-wrap gap-1 mt-1 items-center">
                                                <div className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1 rounded border border-gray-200 flex items-center gap-1">
                                                    {lead.cnpj || 'CNPJ N/A'}
                                                    {lead.cnpj_validated && <i className="bi bi-patch-check-fill text-blue-500" title="Validado via BrasilAPI"></i>}
                                                </div>
                                                
                                                {lead.company_status && lead.company_status !== 'N/A' && (
                                                    <div className={`text-[9px] font-bold uppercase px-1 rounded border ${
                                                        lead.company_status.includes('ATIVA') 
                                                            ? 'text-green-600 border-green-200 bg-green-50' 
                                                            : 'text-red-500 border-red-200 bg-red-50'
                                                    }`}>
                                                        {lead.company_status}
                                                    </div>
                                                )}
                                            </div>

                                            {lead.website && lead.website !== 'N/A' && (
                                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline block mt-0.5 truncate">
                                                    Website <i className="bi bi-box-arrow-up-right text-[9px]"></i>
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 align-top max-w-[200px]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-start gap-1.5">
                                                    <i className="bi bi-person-circle text-gray-400 mt-0.5"></i>
                                                    <div className="text-xs">
                                                        <span className="truncate font-medium block" 
                                                            title={lead.qsa && lead.qsa.length > 0 ? lead.qsa.join(', ') : lead.responsible_name}>
                                                            {lead.qsa && lead.qsa.length > 0 
                                                                ? lead.qsa.slice(0, 2).join(', ') + (lead.qsa.length > 2 ? '...' : '')
                                                                : lead.responsible_name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {lead.main_cnae_description && lead.main_cnae_description !== 'N/A' && (
                                                    <div className="text-[9px] text-gray-500 bg-gray-50 p-1 border border-gray-100 rounded leading-tight italic" title={lead.main_cnae}>
                                                        {lead.main_cnae_description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 align-top min-w-[150px]">
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
                                            <div className="text-gray-500 uppercase text-[10px]">{lead.uf}</div>
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