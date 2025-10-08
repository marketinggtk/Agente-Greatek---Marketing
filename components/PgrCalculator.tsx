

import React, { useMemo, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PgrCalculatorState } from '../types';
import { generatePgrPdf } from '../services/pdfGenerator';

// --- Data Model ---
const pgrModel = [
    {
        id: 'faturamento', title: 'Faturamento', icon: 'bi-cash-coin',
        metrics: [ { id: 'volFin', description: 'Vendas Totais (c/ IPI)', indicator: 'Volume Financeiro', isPercentage: false, bonusValue: 0, eligibilityThreshold: 0.75 } ]
    },
    {
        id: 'mix', title: 'Mix de Produtos', icon: 'bi-boxes',
        metrics: [
            { id: 'energia', indicator: 'ENERGIA', isPercentage: false, bonusValue: 12.50, eligibilityThreshold: 0.75 },
            { id: 'fibraFerramentas', indicator: 'FIBRA - FERRAMENTAS', isPercentage: false, bonusValue: 12.50, eligibilityThreshold: 0.75 },
            { id: 'fibraPassivos', indicator: 'FIBRA - PASSIVOS', isPercentage: false, bonusValue: 12.50, eligibilityThreshold: 0.75 },
            { id: 'redes', indicator: 'Redes', isPercentage: false, bonusValue: 12.50, eligibilityThreshold: 0.75 },
            { id: 'onu', indicator: 'ONU', isPercentage: false, bonusValue: 12.50, eligibilityThreshold: 0.75 },
            { id: 'cftv', indicator: 'CFTV', isPercentage: false, bonusValue: 12.50, eligibilityThreshold: 0.75 },
            { id: 'enterprise', indicator: 'Enterprise', isPercentage: false, bonusValue: 12.50, eligibilityThreshold: 0.75 },
        ]
    },
    {
        id: 'relacionamento', title: 'Relacionamento', icon: 'bi-person-hearts',
        metrics: [
            { id: 'relatorio', indicator: 'Reuniões/Visitas', isPercentage: false, bonusValue: 52.50, eligibilityThreshold: 0.80 },
            { id: 'clientes', indicator: 'CNPJ’s únicos', isPercentage: false, bonusValue: 52.50, eligibilityThreshold: 0.80 },
            { id: 'ligacoes', indicator: 'Registros ligações', isPercentage: false, bonusValue: 52.50, eligibilityThreshold: 0.80 },
            { id: 'atividades', indicator: 'Registros CRM', isPercentage: false, bonusValue: 52.50, eligibilityThreshold: 0.80 },
            { id: 'registro', indicator: 'Propostas Mês', isPercentage: false, bonusValue: 52.50, eligibilityThreshold: 0.80 },
        ]
    },
    {
        id: 'desenvolvimento', title: 'Desenvolvimento de Mercado', icon: 'bi-graph-up-arrow',
        metrics: [
            { id: 'cnpjs', indicator: 'CNPJ’s únicos', isPercentage: false, bonusValue: 87.50, eligibilityThreshold: 0.90 },
            { id: 'ticket', indicator: 'Por NF', isPercentage: false, bonusValue: 87.50, eligibilityThreshold: 0.90 },
            { id: 'mixCliente', indicator: 'Média de SKU por cliente', isPercentage: false, bonusValue: 87.50, eligibilityThreshold: 0.90 },
            { id: 'recompra30', indicator: '% da carteira (30d)', isPercentage: true, bonusValue: 87.50, eligibilityThreshold: 0.90 },
            { id: 'recompra60', indicator: '% da carteira (60d)', isPercentage: true, bonusValue: 87.50, eligibilityThreshold: 0.90 },
            { id: 'recompra90', indicator: '% da carteira (90d)', isPercentage: true, bonusValue: 87.50, eligibilityThreshold: 0.90 },
        ]
    },
    {
        id: 'saude', title: 'Saúde', icon: 'bi-shield-check',
        metrics: [
            { id: 'preco', indicator: 'Preço', isPercentage: true, bonusValue: 140.00, eligibilityThreshold: 1.0 },
            { id: 'prazo', indicator: 'Prazo', isPercentage: true, bonusValue: 140.00, eligibilityThreshold: 1.0 },
        ]
    },
    {
        id: 'bonus', title: 'Bônus', icon: 'bi-gem',
        metrics: [
            { id: 'projetos', indicator: 'Novos Clientes', isPercentage: false, bonusValue: 0, eligibilityThreshold: 1.0 }, // Special case
        ]
    }
];

// --- Helper Functions ---
const parseValue = (value: string | undefined): number => {
    if (typeof value !== 'string' || !value) return 0;
    const cleaned = value.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').replace('%', '');
    return parseFloat(cleaned) || 0;
};

const formatCurrency = (num: number) => num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatPercentage = (num: number) => `${(num * 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;


// --- Sub-components ---
const MetricInputRow: React.FC<{ metric; value; onChange; atingimento; valorGanho }> = ({ metric, value, onChange, atingimento, valorGanho }) => {
    const atingimentoColor = atingimento >= metric.eligibilityThreshold ? 'text-green-600' : 'text-red-600';

    return (
        <div className="grid grid-cols-12 gap-x-2 items-center text-xs py-1 border-t border-black/5">
            <div className="col-span-4 truncate" title={metric.indicator}>{metric.indicator}</div>
            <div className="col-span-2">
                <input type="text" value={value.meta || ''} readOnly className="w-full bg-black/5 p-1 rounded focus:outline-none cursor-not-allowed text-gray-500"/>
            </div>
            <div className="col-span-2">
                <input type="text" value={value.realizado || ''} onChange={(e) => onChange(metric.id, 'realizado', e.target.value)} className="w-full bg-white border border-gray-300 p-1 rounded focus:bg-white focus:ring-1 focus:ring-greatek-blue focus:outline-none"/>
            </div>
            <div className={`col-span-2 text-center font-bold ${atingimentoColor}`}>{formatPercentage(atingimento)}</div>
            <div className={`col-span-2 text-right font-semibold ${valorGanho > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                {metric.bonusValue > 0 ? formatCurrency(valorGanho) : '-'}
            </div>
        </div>
    );
};

const KpiCard: React.FC<{ group; state; onChange; calculations; }> = ({ group, state, onChange, calculations }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
        <h3 className="text-sm font-bold text-greatek-dark-blue flex items-center mb-2">
            <i className={`bi ${group.icon} mr-2 text-lg text-greatek-blue`}></i>
            {group.title}
        </h3>
        <div className="text-xs text-gray-500 grid grid-cols-12 gap-x-2 font-semibold mb-1 px-1">
            <div className="col-span-4">Indicador</div>
            <div className="col-span-2">Meta</div>
            <div className="col-span-2">Realizado</div>
            <div className="col-span-2 text-center">Ating.</div>
            <div className="col-span-2 text-right">Valor</div>
        </div>
        <div className="space-y-1 flex-grow">
            {group.metrics.map((metric: any) => {
                const result = calculations.results.get(metric.id) || { atingimento: 0, valor: 0 };
                return (
                    <MetricInputRow 
                        key={metric.id}
                        metric={metric}
                        value={state?.metrics?.[metric.id] || { meta: '', realizado: '' }}
                        onChange={onChange}
                        atingimento={result.atingimento}
                        valorGanho={result.valor}
                    />
                )
            })}
        </div>
        <div className="mt-2 pt-2 border-t-2 border-gray-300 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600 uppercase">Total {group.title}</span>
            <span className="text-base font-bold text-greatek-dark-blue">
                {formatCurrency(calculations.groupSubtotals[group.id] || 0)}
            </span>
        </div>
    </div>
);

const FaturamentoCard: React.FC<{ value; onChange; atingimento; isEligible; }> = ({ value, onChange, atingimento, isEligible }) => {
    const atingimentoColor = atingimento >= 0.75 ? 'text-green-600' : 'text-red-600';

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 h-full">
            <div className="flex-1">
                <h3 className="text-base font-bold text-greatek-dark-blue flex items-center mb-2">
                    <i className="bi bi-cash-coin mr-2 text-lg text-greatek-blue"></i>
                    Faturamento (Volume Financeiro)
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Meta</label>
                        <input 
                            type="text" 
                            value={value.meta || ''} 
                            readOnly
                            className="w-full bg-black/5 p-2 rounded text-base font-bold text-greatek-dark-blue focus:outline-none cursor-not-allowed text-gray-500"
                        />
                    </div>
                     <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Realizado</label>
                        <input 
                            type="text" 
                            value={value.realizado || ''} 
                            onChange={(e) => onChange('volFin', 'realizado', e.target.value)} 
                            className="w-full bg-white border border-gray-300 p-2 rounded text-base font-bold text-greatek-dark-blue focus:bg-white focus:ring-1 focus:ring-greatek-blue focus:outline-none"
                        />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 text-center px-4">
                <div className="text-xs font-semibold text-gray-500 uppercase">Atingido</div>
                <div className={`text-4xl font-bold ${atingimentoColor}`}>{formatPercentage(atingimento)}</div>
                {!isEligible && atingimento > 0 && <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Abaixo do mínimo (75%)</span>}
                {isEligible && <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Elegível para bônus</span>}
            </div>
        </div>
    );
};


const SummaryCard: React.FC<{ title: string; value: string; icon: string; bgColor: string; }> = ({ title, value, icon, bgColor }) => (
    <div className={`p-4 rounded-lg shadow-lg text-white flex items-center ${bgColor}`}>
        <i className={`bi ${icon} text-4xl opacity-80`}></i>
        <div className="ml-4">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-90">{title}</div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    </div>
);

const PgrCalculator: React.FC = () => {
    const { conversations, activeConversationId, updatePgrCalculatorState, logoutPgr } = useAppStore();

    const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    const calculatorState = activeConversation?.pgrCalculatorState;

    const handleInputChange = useCallback((metricId: string, field: 'meta' | 'realizado', value: string) => {
        const currentMetrics = calculatorState?.metrics || {};
        const currentMetric = currentMetrics[metricId] || { meta: '', realizado: '' };
        updatePgrCalculatorState({ metrics: { ...currentMetrics, [metricId]: { ...currentMetric, [field]: value } } });
    }, [calculatorState, updatePgrCalculatorState]);

    const calculations = useMemo(() => {
        const metrics = calculatorState?.metrics || {};
        const results = new Map<string, { atingimento: number, valor: number }>();
        const groupSubtotals: Record<string, number> = {};

        const volFinMeta = parseValue(metrics.volFin?.meta);
        const volFinRealizado = parseValue(metrics.volFin?.realizado);
        const volFinAtingimento = volFinMeta > 0 ? volFinRealizado / volFinMeta : 0;
        
        const isFaturamentoEligibleBase = volFinAtingimento >= 0.75;
        const isFaturamentoEligibleSaude = volFinAtingimento >= 1.0;
        
        let premiacaoTotal = 0;
        let maxPremiacaoTotal = 0;

        for (const group of pgrModel) {
            if (group.id === 'faturamento' || group.id === 'bonus') continue;

            const isMasterEligible = group.id === 'saude' ? isFaturamentoEligibleSaude : isFaturamentoEligibleBase;
            let subtotal = 0;

            for (const metric of group.metrics) {
                const meta = parseValue(metrics[metric.id]?.meta);
                if(meta > 0) maxPremiacaoTotal += metric.bonusValue;
                
                const realizado = parseValue(metrics[metric.id]?.realizado);
                const atingimento = meta > 0 ? realizado / meta : 0;
                const valor = (isMasterEligible && atingimento >= metric.eligibilityThreshold) ? metric.bonusValue : 0;
                
                results.set(metric.id, { atingimento, valor });
                subtotal += valor;
            }
            groupSubtotals[group.id] = subtotal;
            premiacaoTotal += subtotal;
        }

        const projetosMeta = parseValue(metrics.projetos?.meta);
        const projetosRealizado = parseValue(metrics.projetos?.realizado);
        const projetosAtingimento = projetosMeta > 0 ? projetosRealizado / projetosMeta : 0;
        
        // Bônus é 0,2% (0.002) sobre o valor realizado, se a meta de projetos for 100% ou mais.
        const bonusProjetos = (projetosAtingimento >= 1) ? volFinRealizado * 0.002 : 0;
        
        const totalGeral = premiacaoTotal + bonusProjetos;

        // Cálculo da Nota PGR (escala de 0 a 10)
        const maxBonusForNota = volFinMeta > 0 ? volFinMeta * 0.002 : 0;
        const maxTotalPossibleForNota = maxPremiacaoTotal + maxBonusForNota;
        const calculatedNota = maxTotalPossibleForNota > 0 ? (totalGeral / maxTotalPossibleForNota) * 10 : 0;
        const notaPGR = Math.min(10, calculatedNota);

        groupSubtotals['bonus'] = bonusProjetos;
        results.set('volFin', { atingimento: volFinAtingimento, valor: 0 });
        results.set('projetos', { atingimento: projetosAtingimento, valor: bonusProjetos });


        return { results, groupSubtotals, premiacaoTotal, bonusProjetos, totalGeral, notaPGR, volFinAtingimento, isFaturamentoEligibleBase };
    }, [calculatorState]);
    
    const handleExportPdf = () => {
        if (!calculatorState) return;
        generatePgrPdf(calculatorState, calculations, pgrModel);
    };

    if (!calculatorState || !calculatorState.sellerName) {
        return <div className="p-8 text-center text-gray-500">Nenhum vendedor autenticado.</div>;
    }

    return (
        <div className="h-full flex flex-col p-4 bg-gray-50 overflow-y-auto custom-scrollbar animate-fade-in">
             <header className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <div>
                    <h1 className="text-xl font-bold text-greatek-dark-blue">Calculadora de PGR: {calculatorState.sellerName}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={logoutPgr} className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300">
                        <i className="bi bi-person-x-fill"></i><span>Trocar Vendedor</span>
                    </button>
                    <button onClick={handleExportPdf} className="flex items-center space-x-1.5 text-xs bg-greatek-blue hover:bg-greatek-dark-blue text-white font-semibold py-1.5 px-3 rounded-md transition-colors border border-greatek-blue">
                        <i className="bi bi-file-earmark-pdf-fill"></i><span>Exportar PDF</span>
                    </button>
                </div>
            </header>
            
            <main className="flex-grow grid grid-cols-12 grid-rows-6 gap-4">
                {/* Main KPIs Column */}
                <div className="col-span-12 lg:col-span-8 row-span-6 grid grid-cols-2 grid-rows-6 gap-4">
                    <div className="col-span-2 row-span-1">
                         <FaturamentoCard 
                            value={calculatorState?.metrics?.volFin || { meta: '', realizado: '' }}
                            onChange={handleInputChange}
                            atingimento={calculations.volFinAtingimento}
                            isEligible={calculations.isFaturamentoEligibleBase}
                        />
                    </div>
                    <div className="col-span-1 row-span-3"><KpiCard group={pgrModel[1]} state={calculatorState} onChange={handleInputChange} calculations={calculations} /></div>
                    <div className="col-span-1 row-span-3"><KpiCard group={pgrModel[2]} state={calculatorState} onChange={handleInputChange} calculations={calculations} /></div>
                    <div className="col-span-2 row-span-2"><KpiCard group={pgrModel[3]} state={calculatorState} onChange={handleInputChange} calculations={calculations} /></div>
                </div>
                
                {/* Side Column */}
                <div className="col-span-12 lg:col-span-4 row-span-6 grid grid-rows-6 gap-4">
                    <div className="row-span-2"><KpiCard group={pgrModel[4]} state={calculatorState} onChange={handleInputChange} calculations={calculations} /></div>
                    <div className="row-span-4 grid grid-rows-4 gap-4">
                        <div className="row-span-1"><KpiCard group={pgrModel[5]} state={calculatorState} onChange={handleInputChange} calculations={calculations} /></div>
                        <div className="row-span-3 grid grid-rows-3 gap-2">
                            <SummaryCard title="Premiação" value={formatCurrency(calculations.premiacaoTotal)} icon="bi-trophy-fill" bgColor="bg-blue-500" />
                            <SummaryCard title="Bônus" value={formatCurrency(calculations.bonusProjetos)} icon="bi-star-fill" bgColor="bg-amber-500" />
                            <div className="bg-green-600 p-4 rounded-lg shadow-lg text-white flex items-center justify-between">
                                <div className="flex items-center">
                                    <i className="bi bi-check-circle-fill text-3xl"></i>
                                    <div className="ml-3">
                                        <div className="text-xs font-semibold uppercase tracking-wider">Total</div>
                                        <div className="text-2xl font-bold">{formatCurrency(calculations.totalGeral)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs uppercase">Nota PGR</div>
                                    <div className="font-bold text-2xl">{calculations.notaPGR.toFixed(1)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PgrCalculator;