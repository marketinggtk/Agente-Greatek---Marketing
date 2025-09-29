
import React, { useMemo } from 'react';
import useAppStore from '../store/useAppStore';

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
  <div className="flex-1">
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
}> = ({ title, value, iconClass }) => (
  <div className="p-4 rounded-lg shadow-sm flex items-center bg-white border border-greatek-border">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-greatek-bg-light text-greatek-dark-blue">
        <i className={`bi ${iconClass} text-lg`}></i>
      </div>
      <div className="ml-4">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</p>
        <p className="font-bold text-greatek-dark-blue text-xl sm:text-2xl">{value}</p>
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


const GoalCalculator: React.FC = () => {
    const { 
        conversations, 
        activeConversationId, 
        updateGoalCalculatorState, 
        resetGoalCalculator 
    } = useAppStore();

    const activeConversation = useMemo(() =>
        conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]
    );
    const calculatorState = activeConversation?.goalCalculatorState;

    const formatCurrency = (num: number) => {
        if (isNaN(num) || !isFinite(num)) return 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const {
        conversionRate,
        remainingGoal,
        avgTicket,
        dealsToWin,
        proposalsNeeded,
        proposalsPerSeller,
        percentageOverGoal,
        goalProgress,
        workingDaysLeft,
        currentMonthName,
        proposalsPerSellerPerDay
    } = useMemo(() => {
        const goal = parseNumericInput(calculatorState?.salesGoal || '');
        const sold = parseNumericInput(calculatorState?.salesSoFar || '');
        const total = parseNumericInput(calculatorState?.totalProposals || '');
        const won = parseNumericInput(calculatorState?.wonProposals || '');

        const rate = total > 0 ? (won / total) : 0;
        const remaining = goal - sold;
        const ticket = won > 0 ? (sold / won) : 0;
        
        const deals = remaining > 0 && ticket > 0 ? Math.ceil(remaining / ticket) : 0;
        const needed = remaining > 0 && rate > 0 ? Math.ceil(deals / rate) : 0;

        const NUMBER_OF_SELLERS = 7;
        const perSeller = needed > 0 ? (needed / NUMBER_OF_SELLERS) : 0;
        
        let overGoal = 0;
        if (sold > goal && goal > 0) {
            overGoal = ((sold - goal) / goal) * 100;
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
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
                remainingWorkDays++;
            }
        }
        const monthName = new Date().toLocaleString('pt-BR', { month: 'long' });
        const perSellerPerDay = needed > 0 && remainingWorkDays > 0 ? (needed / NUMBER_OF_SELLERS / remainingWorkDays) : 0;

        return {
            conversionRate: rate,
            remainingGoal: remaining,
            avgTicket: ticket,
            dealsToWin: deals,
            proposalsNeeded: needed,
            proposalsPerSeller: perSeller,
            percentageOverGoal: overGoal,
            goalProgress: progress,
            workingDaysLeft: remainingWorkDays,
            currentMonthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            proposalsPerSellerPerDay: perSellerPerDay,
        };
    }, [calculatorState]);

    const goalMet = remainingGoal <= 0 && parseNumericInput(calculatorState?.salesGoal || '') > 0;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-white animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-greatek-dark-blue">Calculadora de Metas</h1>
                <p className="text-sm sm:text-base text-text-secondary mt-1">Planeje seu esforço de vendas para atingir seus objetivos.</p>
            </div>
             <button
                onClick={resetGoalCalculator}
                className="mt-2 sm:mt-0 flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
            >
                <i className="bi bi-arrow-counterclockwise"></i>
                <span className='ml-1.5'>Limpar</span>
            </button>
        </div>
        
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
                <div className="mt-4 animate-fade-in">
                {percentageOverGoal > 0 ? (
                    <div className="p-6 text-center bg-green-50 border-l-4 border-green-500 rounded-lg">
                        <i className="bi bi-award-fill text-5xl text-green-500"></i>
                        <h3 className="mt-4 text-lg sm:text-xl font-bold text-green-800">Parabéns! Você ultrapassou {percentageOverGoal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% da sua meta!</h3>
                        <p className="text-green-700 mt-1">Continue com o ótimo trabalho!</p>
                    </div>
                ) : (
                    <div className="p-6 text-center bg-green-50 border-l-4 border-green-500 rounded-lg">
                        <i className="bi bi-check-circle-fill text-5xl text-green-500"></i>
                        <h3 className="mt-4 text-lg sm:text-xl font-bold text-green-800">Parabéns!</h3>
                        <p className="text-green-700">Você já atingiu sua meta de vendas para este mês.</p>
                    </div>
                )}
                </div>
            ) : (
                 <div className="mt-4 space-y-4 lg:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div className="p-4 rounded-lg shadow-sm bg-greatek-blue/10 border-2 border-greatek-blue flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                            <div className="flex-shrink-0">
                               <ProgressRing progress={goalProgress} />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-greatek-dark-blue uppercase tracking-wider">Plano de Ação Diário</p>
                                <p className="text-text-secondary mt-1">
                                    Faltam <strong className="text-greatek-dark-blue">{workingDaysLeft} dias úteis</strong> em {currentMonthName}. Cada vendedor precisa enviar ~<strong className="text-greatek-dark-blue text-2xl">{proposalsPerSellerPerDay.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</strong> propostas por dia para atingir a meta.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg shadow-sm bg-yellow-50 border-2 border-yellow-500 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                            <div className="flex-shrink-0 text-yellow-600">
                                <i className="bi bi-file-earmark-text-fill text-5xl"></i>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wider">Total de Propostas Faltantes</p>
                                <p className="font-bold text-yellow-900 text-4xl mt-1">{proposalsNeeded.toLocaleString('pt-BR')}</p>
                                <p className="text-xs text-yellow-800/80">para atingir a meta de negócios</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        <ResultCard title="Falta para a Meta" value={formatCurrency(remainingGoal)} iconClass="bi-bullseye" />
                        <ResultCard title="Taxa de Conversão" value={`${(conversionRate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} iconClass="bi-graph-up-arrow" />
                        <ResultCard title="Dias Úteis Restantes" value={`${workingDaysLeft} dias`} iconClass="bi-calendar-week-fill" />
                        <ResultCard title="Média Propostas / Vendedor" value={`~ ${proposalsPerSeller.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`} iconClass="bi-people-fill" />
                        <ResultCard title="Ticket Médio" value={formatCurrency(avgTicket)} iconClass="bi-tags-fill" />
                        <ResultCard title="Negócios a Ganhar" value={dealsToWin.toLocaleString('pt-BR')} iconClass="bi-trophy-fill" />
                    </div>
                </div>
            )}
        </div>

        <div className="mt-auto pt-4 text-xs text-text-secondary/80 text-center">
            <p>* O número de propostas é arredondado para cima para garantir que a meta seja atingida.</p>
        </div>
    </div>
  );
};

export default GoalCalculator;
