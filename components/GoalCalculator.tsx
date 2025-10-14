
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import DynamicLoader from './DynamicLoader';
import MarkdownViewer from './MarkdownViewer';
import { AppMode } from '../types';

const NUMBER_OF_SELLERS = 7;

const parseNumericInput = (value: string): number => {
    if (!value) return 0;
    const cleaned = value
        .replace(/R\$\s?/, '')
        .replace(/\./g, '')
        .replace(',', '.');
    return parseFloat(cleaned) || 0;
};

const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  placeholder?: string;
}> = ({ id, label, value, onChange, prefix, placeholder }) => (
  <div className="flex-1 min-w-[150px]">
    <label htmlFor={id} className="block text-xs font-medium text-text-secondary mb-1">
      {label}
    </label>
    <div className="relative rounded-md shadow-sm">
      {prefix && (
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full p-2.5 rounded-lg border-greatek-border focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm bg-greatek-bg-light/80 text-greatek-dark-blue font-semibold ${prefix ? 'pl-8' : ''}`}
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

// Helper to calculate metrics for a given period
const calculateMetrics = (state: any) => {
    const goal = parseNumericInput(state?.salesGoal || '');
    const sold = parseNumericInput(state?.salesSoFar || '');
    const total = parseNumericInput(state?.totalProposals || '');
    const won = parseNumericInput(state?.wonProposals || '');

    const conversionRate = total > 0 ? (won / total) : 0;
    const avgTicket = won > 0 ? (sold / won) : 0;

    return { goal, sold, conversionRate, avgTicket };
};

const GoalCalculator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'monthly' | 'comparison'>('monthly');
    const { 
        conversations, 
        activeConversationId, 
        updateGoalCalculatorState, 
        resetGoalCalculator,
        updateGoalComparisonState,
        runGoalComparisonAnalysis,
        isAnalyzingComparison,
        stopGeneration
    } = useAppStore();

    const activeConversation = useMemo(() =>
        conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]
    );
    const calculatorState = activeConversation?.goalCalculatorState;
    const comparisonState = activeConversation?.goalComparisonState;
    const analysisResult = activeConversation?.comparisonAnalysis;

    const formatCurrency = (num: number) => {
        if (isNaN(num) || !isFinite(num)) return 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // --- Single Month Calculation ---
    const {
        remainingGoal,
        avgTicket,
        dealsToWin,
        proposalsNeeded,
        percentageOverGoal,
        goalProgress,
        workingDaysLeft,
        currentMonthName,
        proposalsPerSellerPerDay,
        surplusAmount,
        conversionRate,
    } = useMemo(() => {
        const { goal, sold, conversionRate, avgTicket } = calculateMetrics(calculatorState);

        const remaining = goal - sold;
        const deals = remaining > 0 && avgTicket > 0 ? Math.ceil(remaining / avgTicket) : 0;
        
        const totalProposals = parseNumericInput(calculatorState?.totalProposals || '');
        const avgProposalValue = totalProposals > 0 ? (sold / totalProposals) : 0;
        const needed = remaining > 0 && avgProposalValue > 0 ? Math.ceil(remaining / avgProposalValue) : 0;

        let overGoal = 0;
        const surplus = sold > goal ? sold - goal : 0;
        if (surplus > 0 && goal > 0) {
            overGoal = (surplus / goal) * 100;
        }

        const progress = goal > 0 ? (sold / goal) * 100 : 0;
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let remainingWorkDays = 0;
        for (let day = today.getDate(); day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { remainingWorkDays++; }
        }
        const monthName = new Date().toLocaleString('pt-BR', { month: 'long' });
        
        const proposalsPerSellerPerDay = needed > 0 && remainingWorkDays > 0 && NUMBER_OF_SELLERS > 0
            ? (needed / NUMBER_OF_SELLERS / remainingWorkDays)
            : 0;

        return {
            conversionRate,
            remainingGoal: remaining,
            avgTicket,
            dealsToWin: deals,
            proposalsNeeded: needed,
            percentageOverGoal: overGoal,
            goalProgress: progress,
            workingDaysLeft: remainingWorkDays,
            currentMonthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            proposalsPerSellerPerDay: proposalsPerSellerPerDay,
            surplusAmount: surplus,
        };
    }, [calculatorState]);

    const goalMet = remainingGoal <= 0 && parseNumericInput(calculatorState?.salesGoal || '') > 0;

    // --- Comparison Calculation ---
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

    const isComparisonReady = comparisonResults.prev.sold > 0 && comparisonResults.curr.sold > 0;

    const renderMonthlyGoalTab = () => (
        <>
            <div className="p-4 border border-greatek-border rounded-lg bg-greatek-bg-light/30">
                <h2 className="text-base font-semibold text-greatek-dark-blue mb-3">Suas Métricas Atuais</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField id="salesGoal" label="Meta de Vendas" value={calculatorState?.salesGoal || ''} onChange={(e) => updateGoalCalculatorState({ salesGoal: e.target.value })} prefix="R$" placeholder="750.000,00" />
                    <InputField id="salesSoFar" label="Vendas Realizadas" value={calculatorState?.salesSoFar || ''} onChange={(e) => updateGoalCalculatorState({ salesSoFar: e.target.value })} prefix="R$" placeholder="450.000,00" />
                    <InputField id="totalProposals" label="Propostas Enviadas" value={calculatorState?.totalProposals || ''} onChange={(e) => updateGoalCalculatorState({ totalProposals: e.target.value })} placeholder="172" />
                    <InputField id="wonProposals" label="Propostas Ganhas" value={calculatorState?.wonProposals || ''} onChange={(e) => updateGoalCalculatorState({ wonProposals: e.target.value })} placeholder="28" />
                </div>
            </div>
             <div className="mt-6 flex-grow">
                <h2 className="text-lg font-semibold text-greatek-dark-blue border-b border-greatek-border pb-2 mb-4">Seu Caminho para a Meta</h2>
                {goalMet ? (
                     <div className="mt-4 animate-fade-in space-y-4">
                        <div className="p-6 text-center bg-green-50 border-l-4 border-green-500 rounded-lg">
                            <i className="bi bi-award-fill text-5xl text-green-500"></i>
                            <h3 className="mt-4 text-lg sm:text-xl font-bold text-green-800">Parabéns, meta batida!</h3>
                            <p className="text-green-700 mt-1">Você superou seu objetivo. Continue com o ótimo trabalho!</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ResultCard title="Meta Superada" value={formatCurrency(surplusAmount)} description={`Isso representa ${percentageOverGoal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% acima do objetivo.`} iconClass="bi-trophy-fill" />
                            <ResultCard title="Taxa de Conversão" value={`${(conversionRate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} iconClass="bi-graph-up-arrow" />
                            <ResultCard title="Ticket Médio" value={formatCurrency(avgTicket)} iconClass="bi-tags-fill" />
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 space-y-4 lg:space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                            <div className="p-4 rounded-lg shadow-sm bg-greatek-blue/10 border-2 border-greatek-blue flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                <div className="flex-shrink-0"><ProgressRing progress={goalProgress} /></div>
                                <div className="flex-grow">
                                    <p className="text-sm font-semibold text-greatek-dark-blue uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">Plano de Ação Diário<i className="bi bi-info-circle text-gray-400 cursor-help" title="Calculado com base no valor restante da meta e no valor médio efetivo de cada proposta."></i></p>
                                    <p className="text-text-secondary mt-1">Faltam <strong className="text-greatek-dark-blue">{workingDaysLeft} dias úteis</strong> em {currentMonthName}. Cada vendedor precisa enviar ~<strong className="text-greatek-dark-blue text-2xl">{proposalsPerSellerPerDay.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</strong> propostas por dia.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg shadow-sm bg-yellow-50 border-2 border-yellow-500 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                <div className="flex-shrink-0 text-yellow-600"><i className="bi bi-file-earmark-text-fill text-5xl"></i></div>
                                <div className="flex-grow">
                                    <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wider">Total de Propostas Faltantes</p>
                                    <p className="font-bold text-yellow-900 text-4xl mt-1">{proposalsNeeded.toLocaleString('pt-BR')}</p>
                                    <p className="text-xs text-yellow-800/80">para atingir a meta de negócios</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-6 rounded-lg shadow-lg bg-greatek-dark-blue text-white flex flex-col items-center justify-center text-center"><i className="bi bi-trophy-fill text-4xl text-yellow-300"></i><p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/80">Negócios a Ganhar</p><p className="font-bold text-white text-5xl">{dealsToWin.toLocaleString('pt-BR')}</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ResultCard title="Falta para a Meta" value={formatCurrency(remainingGoal)} iconClass="bi-bullseye" />
                                <ResultCard title="Taxa de Conversão" value={`${(conversionRate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} iconClass="bi-graph-up-arrow" />
                                <ResultCard title="Ticket Médio" value={formatCurrency(avgTicket)} iconClass="bi-tags-fill" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    const renderComparisonTab = () => (
         <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 border border-greatek-border rounded-lg bg-greatek-bg-light/30">
                    <h2 className="text-base font-semibold text-greatek-dark-blue mb-3">Mês Anterior</h2>
                    <div className="flex flex-wrap gap-4">
                        <InputField id="prev_salesGoal" label="Meta de Vendas" value={comparisonState?.previousMonth.salesGoal || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { salesGoal: e.target.value }})} prefix="R$" />
                        <InputField id="prev_salesSoFar" label="Vendas Realizadas" value={comparisonState?.previousMonth.salesSoFar || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { salesSoFar: e.target.value }})} prefix="R$" />
                        <InputField id="prev_totalProposals" label="Propostas Enviadas" value={comparisonState?.previousMonth.totalProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { totalProposals: e.target.value }})} />
                        <InputField id="prev_wonProposals" label="Propostas Ganhas" value={comparisonState?.previousMonth.wonProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'previousMonth', newState: { wonProposals: e.target.value }})} />
                    </div>
                </div>
                <div className="p-4 border border-greatek-border rounded-lg bg-greatek-bg-light/30">
                    <h2 className="text-base font-semibold text-greatek-dark-blue mb-3">Mês Atual</h2>
                    <div className="flex flex-wrap gap-4">
                        <InputField id="curr_salesGoal" label="Meta de Vendas" value={comparisonState?.currentMonth.salesGoal || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { salesGoal: e.target.value }})} prefix="R$" />
                        <InputField id="curr_salesSoFar" label="Vendas Realizadas" value={comparisonState?.currentMonth.salesSoFar || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { salesSoFar: e.target.value }})} prefix="R$" />
                        <InputField id="curr_totalProposals" label="Propostas Enviadas" value={comparisonState?.currentMonth.totalProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { totalProposals: e.target.value }})} />
                        <InputField id="curr_wonProposals" label="Propostas Ganhas" value={comparisonState?.currentMonth.wonProposals || ''} onChange={(e) => updateGoalComparisonState({ period: 'currentMonth', newState: { wonProposals: e.target.value }})} />
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
    );

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-white animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-greatek-dark-blue">Calculadora de Metas</h1>
                    <p className="text-sm sm:text-base text-text-secondary mt-1">Planeje e compare seu esforço de vendas para atingir seus objetivos.</p>
                </div>
                <button onClick={resetGoalCalculator} className="mt-2 sm:mt-0 flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"><i className="bi bi-arrow-counterclockwise"></i><span className='ml-1.5'>Limpar</span></button>
            </div>
            
            <div className="mb-6 border-b border-greatek-border flex space-x-4">
                <button onClick={() => setActiveTab('monthly')} className={`py-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'monthly' ? 'text-greatek-blue border-b-2 border-greatek-blue' : 'text-text-secondary hover:text-text-primary'}`}>Meta do Mês</button>
                <button onClick={() => setActiveTab('comparison')} className={`py-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'comparison' ? 'text-greatek-blue border-b-2 border-greatek-blue' : 'text-text-secondary hover:text-text-primary'}`}>Comparar Meses</button>
            </div>
            
            {activeTab === 'monthly' ? renderMonthlyGoalTab() : renderComparisonTab()}
    
            <div className="mt-auto pt-4 text-xs text-text-secondary/80 text-center">
                <p>* O número de propostas é arredondado para cima para garantir que a meta seja atingida.</p>
            </div>
        </div>
    );
};

export default GoalCalculator;
