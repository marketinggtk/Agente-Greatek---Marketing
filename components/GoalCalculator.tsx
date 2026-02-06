
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import DynamicLoader from './DynamicLoader';
import MarkdownViewer from './MarkdownViewer';
import { AppMode, GoalCalculatorState, SalesTeamMember } from '../types';

const TEAM_SELLERS_COUNT = 4; // Constante para a aba de equipe (mantida para cálculos legados se necessário)

const parseNumericInput = (value: string): number => {
    if (!value) return 0;
    const cleaned = value
        .replace(/R\$\s?/, '')
        .replace(/\./g, '')
        .replace(',', '.');
    return parseFloat(cleaned) || 0;
};

const formatCurrency = (num: number) => {
    if (isNaN(num) || !isFinite(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  placeholder?: string;
  className?: string;
}> = ({ id, label, value, onChange, prefix, placeholder, className = '' }) => (
  <div className={`flex-1 min-w-[100px] ${className}`}>
    <label htmlFor={id} className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative rounded-md shadow-sm">
      {prefix && (
        <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400 text-xs">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full py-2 px-2.5 rounded border border-gray-200 focus:border-greatek-blue focus:ring-1 focus:ring-greatek-blue text-xs bg-gray-50 text-greatek-dark-blue font-semibold ${prefix ? 'pl-7' : ''}`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const ResultCard: React.FC<{
  title: string;
  value: string;
  iconClass: string;
  description?: string;
}> = ({ title, value, iconClass, description }) => (
  <div className="p-4 rounded-lg shadow-sm flex items-center bg-white border border-greatek-border">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-greatek-bg-light text-greatek-dark-blue">
        <i className={`bi ${iconClass} text-lg`}></i>
      </div>
      <div className="ml-4 overflow-hidden">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider truncate">{title}</p>
        <p className="font-bold text-greatek-dark-blue text-xl sm:text-2xl truncate">{value}</p>
        {description && <p className="text-xs text-text-secondary/80 mt-1">{description}</p>}
      </div>
  </div>
);


const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
    const validProgress = Math.min(Math.max(progress, 0), 100);
    const radius = 52;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (validProgress / 100) * circumference;

    return (
        <div className="relative">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    stroke="#e9e9e9"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#0081cc"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-greatek-dark-blue">
                    {validProgress.toFixed(0)}%
                </span>
            </div>
        </div>
    );
};

const ComparisonRow: React.FC<{
    metricName: string;
    prevValue: string;
    currValue: string;
    variance: number;
}> = ({ metricName, prevValue, currValue, variance }) => {
    const isPositive = variance >= 0;
    const varianceColor = isPositive ? 'text-green-600' : 'text-red-600';
    const varianceIcon = isPositive ? 'bi-arrow-up-short' : 'bi-arrow-down-short';
    const isInfinite = !isFinite(variance);

    return (
        <div className="grid grid-cols-4 items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            <div className="col-span-1 text-xs font-semibold text-text-secondary">{metricName}</div>
            <div className="col-span-1 text-sm font-medium text-text-primary text-right">{prevValue}</div>
            <div className="col-span-1 text-sm font-bold text-greatek-dark-blue text-right">{currValue}</div>
            <div className={`col-span-1 flex items-center justify-end text-sm font-bold ${varianceColor}`}>
                {!isInfinite && <i className={`bi ${varianceIcon}`}></i>}
                <span>{isInfinite ? 'N/A' : `${variance.toFixed(1)}%`}</span>
            </div>
        </div>
    );
};

// --- Vertical Bar Chart Component ---
const VerticalGoalChart: React.FC<{ goal: number; realized: number }> = ({ goal, realized }) => {
    const safeGoal = goal || 1;
    const percentage = Math.min((realized / safeGoal) * 100, 100);
    const isOver = realized > goal;
    
    return (
        <div className="h-24 w-8 bg-gray-100 rounded-full relative overflow-hidden flex items-end justify-center group" title={`Realizado: ${percentage.toFixed(1)}%`}>
            <div 
                className={`w-full transition-all duration-700 ease-out ${isOver ? 'bg-green-500' : 'bg-greatek-blue'}`}
                style={{ height: `${percentage}%` }}
            ></div>
            {/* Goal Marker Line */}
            <div className="absolute top-0 w-full border-b-2 border-dashed border-gray-400 opacity-50" style={{top: '0%'}}></div>
        </div>
    );
};

const REGIONS = [
    'Norte',
    'Nordeste',
    'Centro-Oeste',
    'Sudeste',
    'Sul',
    'Key Accounts',
    'ISP - Geral',
    'Distribuição'
];

const REGION_ICONS: Record<string, string> = {
    'Norte': 'bi-tree',
    'Nordeste': 'bi-brightness-high',
    'Centro-Oeste': 'bi-compass',
    'Sudeste': 'bi-buildings',
    'Sul': 'bi-snow',
    'Key Accounts': 'bi-star-fill',
    'ISP - Geral': 'bi-router',
    'Distribuição': 'bi-box-seam',
};

const REGION_COLORS: Record<string, string> = {
    'Norte': 'text-green-600 bg-green-50 border-green-200',
    'Nordeste': 'text-orange-600 bg-orange-50 border-orange-200',
    'Centro-Oeste': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'Sudeste': 'text-blue-600 bg-blue-50 border-blue-200',
    'Sul': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'Key Accounts': 'text-purple-600 bg-purple-50 border-purple-200',
    'ISP - Geral': 'text-cyan-600 bg-cyan-50 border-cyan-200',
    'Distribuição': 'text-slate-600 bg-slate-50 border-slate-200',
};

// Seller Card Component for Team Tab
const SellerInputCard: React.FC<{
    member: SalesTeamMember;
    onUpdate: (id: string, data: Partial<SalesTeamMember>) => void;
}> = ({ member, onUpdate }) => {
    // Calculate derived metrics on the fly for display
    const goal = parseNumericInput(member.individualGoal);
    const realized = parseNumericInput(member.realizedSales);
    const sent = parseNumericInput(member.proposalsSent);
    const won = parseNumericInput(member.proposalsWon);

    const conversionRate = sent > 0 ? (won / sent) * 100 : 0;
    const avgTicket = won > 0 ? realized / won : 0;
    const progress = goal > 0 ? (realized / goal) * 100 : 0;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-greatek-blue/30 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
            {/* Status Indicator Stripe */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-greatek-blue' : 'bg-yellow-400'}`}></div>
            
            <div className="pl-3 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <i className="bi bi-geo-alt-fill text-gray-400 text-[10px]"></i>
                            <select 
                                value={member.region}
                                onChange={(e) => onUpdate(member.id, { region: e.target.value })}
                                className="text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-greatek-blue outline-none"
                            >
                                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <h3 className="font-bold text-greatek-dark-blue text-lg leading-tight">{member.name}</h3>
                    </div>
                    <div className="text-right">
                        <div className={`text-xl font-black ${progress >= 100 ? 'text-green-600' : 'text-greatek-blue'}`}>
                            {progress.toFixed(0)}<span className="text-sm">%</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 flex-grow">
                    {/* Inputs Column */}
                    <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                            <InputField 
                                id={`goal-${member.id}`} 
                                label="Meta (R$)" 
                                value={member.individualGoal} 
                                onChange={(e) => onUpdate(member.id, { individualGoal: e.target.value })} 
                                placeholder="Meta"
                            />
                            <InputField 
                                id={`realized-${member.id}`} 
                                label="Realizado (R$)" 
                                value={member.realizedSales} 
                                onChange={(e) => onUpdate(member.id, { realizedSales: e.target.value })} 
                                placeholder="Vendas"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <InputField 
                                id={`sent-${member.id}`} 
                                label="Props." 
                                value={member.proposalsSent} 
                                onChange={(e) => onUpdate(member.id, { proposalsSent: e.target.value })} 
                                placeholder="Env"
                            />
                            <InputField 
                                id={`won-${member.id}`} 
                                label="Ganhas" 
                                value={member.proposalsWon} 
                                onChange={(e) => onUpdate(member.id, { proposalsWon: e.target.value })} 
                                placeholder="Ok"
                            />
                        </div>
                    </div>

                    {/* Chart Column */}
                    <div className="flex flex-col items-center justify-end pb-1">
                        <VerticalGoalChart goal={goal} realized={realized} />
                        <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Progresso</span>
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Conversão</p>
                        <p className={`text-sm font-bold ${conversionRate < 15 ? 'text-red-500' : 'text-greatek-dark-blue'}`}>{conversionRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Ticket Médio</p>
                        <p className="text-sm font-bold text-greatek-dark-blue truncate">{formatCurrency(avgTicket)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to calculate metrics for a given period
const calculateMetrics = (state: GoalCalculatorState | undefined) => {
    const goal = parseNumericInput(state?.salesGoal || '');
    const sold = parseNumericInput(state?.salesSoFar || '');
    const total = parseNumericInput(state?.totalProposals || '');
    const won = parseNumericInput(state?.wonProposals || '');

    const conversionRate = total > 0 ? (won / total) : 0;
    const avgTicket = won > 0 ? (sold / won) : 0;

    return { goal, sold, conversionRate, avgTicket };
};

// Reusable hook-like function for calculations
const useGoalCalculations = (state: GoalCalculatorState | undefined, sellersCount: number) => {
    const { goal, sold, conversionRate, avgTicket } = calculateMetrics(state);

    const remaining = goal - sold;
    const deals = remaining > 0 && avgTicket > 0 ? Math.ceil(remaining / avgTicket) : 0;
    
    const totalProposals = parseNumericInput(state?.totalProposals || '');
    const avgProposalValue = totalProposals > 0 ? (sold / totalProposals) : 0;
    const needed = remaining > 0 && avgProposalValue > 0 ? Math.ceil(remaining / avgProposalValue) : 0;

    let overGoal = 0;
    const surplus = sold > goal ? sold - goal : 0;
    if (surplus > 0 && goal > 0) {
        overGoal = (surplus / goal) * 100;
    }

    const progress = goal > 0 ? (sold / goal) * 100 : 0;
    
    const workingDays = parseNumericInput(state?.workingDays || '');
    
    const proposalsPerSellerPerDay = needed > 0 && workingDays > 0 && sellersCount > 0
        ? (needed / sellersCount / workingDays)
        : 0;

    return {
        goal,
        conversionRate,
        remainingGoal: remaining,
        avgTicket,
        dealsToWin: deals,
        proposalsNeeded: needed,
        percentageOverGoal: overGoal,
        goalProgress: progress,
        proposalsPerSellerPerDay: proposalsPerSellerPerDay,
        surplusAmount: surplus,
    };
};

const GoalCalculator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'monthly' | 'individual' | 'team' | 'comparison'>('monthly');
    const { 
        conversations, 
        activeConversationId, 
        updateGoalCalculatorState,
        updateIndividualGoalCalculatorState, 
        resetGoalCalculator,
        updateGoalComparisonState,
        runGoalComparisonAnalysis,
        isAnalyzingComparison,
        stopGeneration,
        // Team Actions
        updateTeamMember,
        updateTeamGlobalGoal,
        generateTeamStrategy,
        isGeneratingTeamStrategy
    } = useAppStore();

    const activeConversation = useMemo(() =>
        conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]
    );
    
    const calculatorState = activeConversation?.goalCalculatorState;
    const individualState = activeConversation?.individualGoalCalculatorState;
    const comparisonState = activeConversation?.goalComparisonState;
    const analysisResult = activeConversation?.comparisonAnalysis;
    
    const teamMembers = activeConversation?.teamMembers || [];
    const teamGlobalGoal = activeConversation?.teamGlobalGoal || '';
    const teamStrategyAnalysis = activeConversation?.teamStrategyAnalysis;

    // Calculations for Team (Monthly) Tab
    const teamMetrics = useMemo(() => 
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useGoalCalculations(calculatorState, TEAM_SELLERS_COUNT), 
    [calculatorState]);

    // Calculations for Individual Tab
    const individualMetrics = useMemo(() => 
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useGoalCalculations(individualState, 1), 
    [individualState]);

    // Comparison Logic
    const comparisonResults = useMemo(() => {
        const prev = calculateMetrics(comparisonState?.previousMonth);
        const curr = calculateMetrics(comparisonState?.currentMonth);

        const calcVariance = (p: number, c: number) => {
            if (p === 0) return c > 0 ? Infinity : 0;
            return ((c - p) / p) * 100;
        };

        return {
            prev,
            curr,
            goalVariance: calcVariance(prev.goal, curr.goal),
            soldVariance: calcVariance(prev.sold, curr.sold),
            conversionVariance: calcVariance(prev.conversionRate, curr.conversionRate),
            ticketVariance: calcVariance(prev.avgTicket, curr.avgTicket),
        };
    }, [comparisonState]);

    const handleRunAnalysis = () => {
        const data = {
            prev: {
                goal: formatCurrency(comparisonResults.prev.goal),
                sold: formatCurrency(comparisonResults.prev.sold),
                conversionRate: `${(comparisonResults.prev.conversionRate * 100).toFixed(1)}%`,
                avgTicket: formatCurrency(comparisonResults.prev.avgTicket)
            },
            curr: {
                goal: formatCurrency(comparisonResults.curr.goal),
                sold: formatCurrency(comparisonResults.curr.sold),
                conversionRate: `${(comparisonResults.curr.conversionRate * 100).toFixed(1)}%`,
                avgTicket: formatCurrency(comparisonResults.curr.avgTicket)
            }
        };
        runGoalComparisonAnalysis(data);
    };
    
    const handleGenerateTeamStrategy = () => {
        if (!teamGlobalGoal) {
            alert("Por favor, defina a Meta Global Mensal.");
            return;
        }
        generateTeamStrategy(teamGlobalGoal, teamMembers);
    };

    const renderGoalView = (
        state: GoalCalculatorState | undefined, 
        updateFn: (s: Partial<GoalCalculatorState>) => void,
        metrics: ReturnType<typeof useGoalCalculations>,
        isTeam: boolean
    ) => {
        const goalMet = metrics.remainingGoal <= 0 && metrics.goal > 0;

        return (
            <>
                <div className="p-4 border border-greatek-border rounded-lg bg-greatek-bg-light/30">
                    <h2 className="text-base font-semibold text-greatek-dark-blue mb-3">
                        {isTeam ? "Métricas Gerais (Simulação Rápida)" : "Suas Métricas Individuais"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <InputField id="salesGoal" label="Meta de Vendas" value={state?.salesGoal || ''} onChange={(e) => updateFn({ salesGoal: e.target.value })} prefix="R$" placeholder="50.000,00" />
                        <InputField id="salesSoFar" label="Vendas Realizadas" value={state?.salesSoFar || ''} onChange={(e) => updateFn({ salesSoFar: e.target.value })} prefix="R$" placeholder="25.000,00" />
                        <InputField id="totalProposals" label="Propostas Enviadas" value={state?.totalProposals || ''} onChange={(e) => updateFn({ totalProposals: e.target.value })} placeholder="40" />
                        <InputField id="wonProposals" label="Propostas Ganhas" value={state?.wonProposals || ''} onChange={(e) => updateFn({ wonProposals: e.target.value })} placeholder="8" />
                        <InputField id="workingDays" label="Dias Úteis no Mês" value={state?.workingDays || ''} onChange={(e) => updateFn({ workingDays: e.target.value })} placeholder="22" />
                    </div>
                </div>
                 <div className="mt-6 flex-grow">
                    <h2 className="text-lg font-semibold text-greatek-dark-blue border-b border-greatek-border pb-2 mb-4">Caminho para a Meta</h2>
                    {goalMet ? (
                         <div className="mt-4 animate-fade-in space-y-4">
                            <div className="p-6 text-center bg-green-50 border-l-4 border-green-500 rounded-lg">
                                <i className="bi bi-award-fill text-5xl text-green-500"></i>
                                <h3 className="mt-4 text-lg sm:text-xl font-bold text-green-800">Parabéns, meta batida!</h3>
                                <p className="text-green-700 mt-1">Você superou o objetivo. Continue com o ótimo trabalho!</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ResultCard title="Meta Superada" value={formatCurrency(metrics.surplusAmount)} description={`Isso representa ${metrics.percentageOverGoal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% acima do objetivo.`} iconClass="bi-trophy-fill" />
                                <ResultCard title="Taxa de Conversão" value={`${(metrics.conversionRate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} iconClass="bi-graph-up-arrow" />
                                <ResultCard title="Ticket Médio" value={formatCurrency(metrics.avgTicket)} iconClass="bi-tags-fill" />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4 lg:space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                <div className="p-4 rounded-lg shadow-sm bg-greatek-blue/10 border-2 border-greatek-blue flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                    <div className="flex-shrink-0"><ProgressRing progress={metrics.goalProgress} /></div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-greatek-dark-blue uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">Plano de Ação Diário<i className="bi bi-info-circle text-gray-400 cursor-help" title="Calculado com base no valor restante da meta, no valor médio efetivo de cada proposta e nos dias úteis informados."></i></p>
                                        <p className="text-text-secondary mt-1">
                                            {isTeam ? "Cada vendedor precisa enviar ~" : "Você precisa enviar ~"}
                                            <strong className="text-greatek-dark-blue text-2xl mx-1">{metrics.proposalsPerSellerPerDay.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</strong> 
                                            propostas por dia.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg shadow-sm bg-yellow-50 border-2 border-yellow-500 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                    <div className="flex-shrink-0 text-yellow-600"><i className="bi bi-file-earmark-text-fill text-5xl"></i></div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wider">Total de Propostas Faltantes</p>
                                        <p className="font-bold text-yellow-900 text-4xl mt-1">{metrics.proposalsNeeded.toLocaleString('pt-BR')}</p>
                                        <p className="text-xs text-yellow-800/80">para atingir a meta de negócios</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-6 rounded-lg shadow-lg bg-greatek-dark-blue text-white flex flex-col items-center justify-center text-center"><i className="bi bi-trophy-fill text-4xl text-yellow-300"></i><p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/80">Negócios a Ganhar</p><p className="font-bold text-white text-5xl">{metrics.dealsToWin.toLocaleString('pt-BR')}</p></div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <ResultCard title="Falta para a Meta" value={formatCurrency(metrics.remainingGoal)} iconClass="bi-bullseye" />
                                    <ResultCard title="Taxa de Conversão" value={`${(metrics.conversionRate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} iconClass="bi-graph-up-arrow" />
                                    <ResultCard title="Ticket Médio" value={formatCurrency(metrics.avgTicket)} iconClass="bi-tags-fill" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

    const renderComparisonTab = () => {
        const isComparisonReady = comparisonResults.prev.sold > 0 && comparisonResults.curr.sold > 0;
        return (
         <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 border border-greatek-border rounded-lg bg-greatek-bg-light/30">
                    <h2 className="text-base font-semibold text-greatek-dark-blue mb-3">Mês Anterior</h2>
                    <div className="flex flex-wrap gap-4">
                        <InputField id="prev_salesGoal" label="Meta de Vendas" value={comparisonState?.previousMonth.salesGoal || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { salesGoal: e.target.value }})} prefix="R$" />
                        <InputField id="prev_salesSoFar" label="Vendas Realizadas" value={comparisonState?.previousMonth.salesSoFar || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { salesSoFar: e.target.value }})} prefix="R$" />
                        <InputField id="prev_totalProposals" label="Propostas Enviadas" value={comparisonState?.previousMonth.totalProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { totalProposals: e.target.value }})} />
                        <InputField id="prev_wonProposals" label="Propostas Ganhas" value={comparisonState?.previousMonth.wonProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { wonProposals: e.target.value }})} />
                        <InputField id="prev_workingDays" label="Dias Úteis" value={comparisonState?.previousMonth.workingDays || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { workingDays: e.target.value }})} />
                    </div>
                </div>
                <div className="p-4 border border-greatek-border rounded-lg bg-greatek-bg-light/30">
                    <h2 className="text-base font-semibold text-greatek-dark-blue mb-3">Mês Atual</h2>
                    <div className="flex flex-wrap gap-4">
                        <InputField id="curr_salesGoal" label="Meta de Vendas" value={comparisonState?.currentMonth.salesGoal || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { salesGoal: e.target.value }})} prefix="R$" />
                        <InputField id="curr_salesSoFar" label="Vendas Realizadas" value={comparisonState?.currentMonth.salesSoFar || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { salesSoFar: e.target.value }})} prefix="R$" />
                        <InputField id="curr_totalProposals" label="Propostas Enviadas" value={comparisonState?.currentMonth.totalProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { totalProposals: e.target.value }})} />
                        <InputField id="curr_wonProposals" label="Propostas Ganhas" value={comparisonState?.currentMonth.wonProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { wonProposals: e.target.value }})} />
                        <InputField id="curr_workingDays" label="Dias Úteis" value={comparisonState?.currentMonth.workingDays || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { workingDays: e.target.value }})} />
                    </div>
                </div>
            </div>
            {isComparisonReady && (
                <div className="animate-fade-in space-y-4">
                    <div className="p-4 bg-white border border-greatek-border rounded-lg shadow-sm">
                        <h2 className="text-base font-semibold text-greatek-dark-blue mb-2">Painel Comparativo</h2>
                        <div className="grid grid-cols-4 items-center gap-2 text-xs font-bold text-gray-500 border-b pb-1">
                            <div className="col-span-1">Métrica</div>
                            <div className="col-span-1 text-right">Mês Anterior</div>
                            <div className="col-span-1 text-right">Mês Atual</div>
                            <div className="col-span-1 text-right">% Variação</div>
                        </div>
                        <div className="mt-1">
                            <ComparisonRow metricName="Meta de Vendas" prevValue={formatCurrency(comparisonResults.prev.goal)} currValue={formatCurrency(comparisonResults.curr.goal)} variance={comparisonResults.goalVariance} />
                            <ComparisonRow metricName="Vendas Realizadas" prevValue={formatCurrency(comparisonResults.prev.sold)} currValue={formatCurrency(comparisonResults.curr.sold)} variance={comparisonResults.soldVariance} />
                            <ComparisonRow metricName="Taxa de Conversão" prevValue={`${(comparisonResults.prev.conversionRate * 100).toFixed(1)}%`} currValue={`${(comparisonResults.curr.conversionRate * 100).toFixed(1)}%`} variance={comparisonResults.conversionVariance} />
                            <ComparisonRow metricName="Ticket Médio" prevValue={formatCurrency(comparisonResults.prev.avgTicket)} currValue={formatCurrency(comparisonResults.curr.avgTicket)} variance={comparisonResults.ticketVariance} />
                        </div>
                    </div>
                    
                    <div className="p-4 bg-white border border-greatek-border rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-base font-semibold text-greatek-dark-blue flex items-center gap-2"><i className="bi bi-robot text-greatek-blue"></i>Análise da IA</h2>
                             <button onClick={handleRunAnalysis} disabled={isAnalyzingComparison} className="flex items-center gap-2 text-xs font-semibold text-white bg-greatek-blue px-3 py-1.5 rounded-md hover:bg-greatek-dark-blue transition-colors disabled:bg-gray-400">
                                <i className="bi bi-sparkles"></i>{isAnalyzingComparison ? 'Analisando...' : 'Analisar Comparativo'}
                            </button>
                        </div>
                        {isAnalyzingComparison ? <DynamicLoader /> : (
                            analysisResult ? (
                                <MarkdownViewer content={analysisResult} mode={AppMode.GOAL_CALCULATOR} isLastMessage={true} />
                            ) : (
                                <p className="text-sm text-center text-text-secondary/80 py-4">Clique em "Analisar Comparativo" para receber insights sobre sua performance.</p>
                            )
                        )}
                         {isAnalyzingComparison && (
                            <div className="flex justify-center mt-2">
                                <button onClick={stopGeneration} className="px-3 py-1 text-xs font-semibold text-greatek-dark-blue bg-greatek-border rounded-full hover:bg-gray-300 transition-colors flex items-center"><i className="bi bi-stop-circle mr-1.5"></i>Parar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )};

    const renderTeamTab = () => (
        <div className="space-y-8 pb-10">
            <div className="bg-greatek-blue/5 p-6 rounded-2xl border border-greatek-blue/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-greatek-blue text-white rounded-2xl flex items-center justify-center text-3xl shadow-md">
                        <i className="bi bi-globe-americas"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-greatek-dark-blue">Meta Global Mensal</h2>
                        <p className="text-sm text-text-secondary">Defina o objetivo principal para calibrar toda a equipe.</p>
                    </div>
                </div>
                <div className="w-full md:w-auto">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-greatek-dark-blue font-bold">R$</span>
                        <input 
                            type="text" 
                            value={teamGlobalGoal}
                            onChange={(e) => updateTeamGlobalGoal(e.target.value)}
                            placeholder="1.000.000,00"
                            className="w-full md:w-64 text-2xl font-black text-right p-3 pl-10 rounded-xl border-2 border-greatek-blue focus:outline-none focus:ring-4 focus:ring-greatek-blue/20 bg-white text-greatek-dark-blue placeholder:text-gray-300 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {REGIONS.map((region) => {
                    const regionMembers = teamMembers.filter(m => m.region === region);
                    if (regionMembers.length === 0) return null;

                    return (
                        <div key={region} className="animate-fade-in">
                            <div className={`flex items-center gap-3 mb-4 p-2 rounded-lg border-l-4 ${REGION_COLORS[region]}`}>
                                <i className={`bi ${REGION_ICONS[region]} text-xl`}></i>
                                <h3 className="text-lg font-bold uppercase tracking-wider">{region}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                                {regionMembers.map(member => (
                                    <SellerInputCard 
                                        key={member.id} 
                                        member={member} 
                                        onUpdate={updateTeamMember} 
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-8 border-t border-greatek-border">
                <button
                    onClick={handleGenerateTeamStrategy}
                    disabled={isGeneratingTeamStrategy || !teamGlobalGoal}
                    className="flex items-center gap-3 bg-greatek-blue text-white text-lg font-bold px-10 py-4 rounded-2xl hover:bg-greatek-dark-blue transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none"
                >
                    {isGeneratingTeamStrategy ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Criando Estratégia...</>
                    ) : (
                        <><i className="bi bi-lightning-charge-fill text-yellow-300"></i> Gerar Planejamento de Performance</>
                    )}
                </button>
            </div>

            {teamStrategyAnalysis && (
                <div className="mt-8 bg-white border border-greatek-border rounded-xl shadow-lg p-6 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-greatek-border">
                        <div className="w-12 h-12 bg-greatek-dark-blue text-white rounded-lg flex items-center justify-center">
                            <i className="bi bi-briefcase-fill text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-greatek-dark-blue">Planejamento Estratégico da Equipe</h2>
                            <p className="text-sm text-text-secondary">Gerado por IA com base na Meta Global de {teamGlobalGoal}</p>
                        </div>
                    </div>
                    <MarkdownViewer content={teamStrategyAnalysis} mode={AppMode.GOAL_CALCULATOR} isLastMessage={true} />
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-white animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-greatek-dark-blue">Calculadora de Metas & Performance</h1>
                    <p className="text-sm sm:text-base text-text-secondary mt-1">Planeje e compare seu esforço de vendas para atingir seus objetivos.</p>
                </div>
                <button onClick={resetGoalCalculator} className="mt-2 sm:mt-0 flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"><i className="bi bi-arrow-counterclockwise"></i><span className='ml-1.5'>Limpar</span></button>
            </div>
            
            <div className="mb-6 border-b border-greatek-border flex space-x-4 overflow-x-auto">
                <button onClick={() => setActiveTab('monthly')} className={`py-2 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'monthly' ? 'text-greatek-blue border-b-2 border-greatek-blue' : 'text-text-secondary hover:text-text-primary'}`}>Meta Simples</button>
                <button onClick={() => setActiveTab('individual')} className={`py-2 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'individual' ? 'text-greatek-blue border-b-2 border-greatek-blue' : 'text-text-secondary hover:text-text-primary'}`}>Meta Individual</button>
                <button onClick={() => setActiveTab('team')} className={`py-2 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'team' ? 'text-greatek-blue border-b-2 border-greatek-blue' : 'text-text-secondary hover:text-text-primary'}`}>Performance da Equipe</button>
                <button onClick={() => setActiveTab('comparison')} className={`py-2 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'comparison' ? 'text-greatek-blue border-b-2 border-greatek-blue' : 'text-text-secondary hover:text-text-primary'}`}>Comparar Meses</button>
            </div>
            
            {activeTab === 'monthly' && renderGoalView(calculatorState, updateGoalCalculatorState, teamMetrics, true)}
            {activeTab === 'individual' && renderGoalView(individualState, updateIndividualGoalCalculatorState, individualMetrics, false)}
            {activeTab === 'team' && renderTeamTab()}
            {activeTab === 'comparison' && renderComparisonTab()}
    
            <div className="mt-auto pt-4 text-xs text-text-secondary/80 text-center">
                <p>* O número de propostas é arredondado para cima para garantir que a meta seja atingida.</p>
            </div>
        </div>
    );
};

export default GoalCalculator;
