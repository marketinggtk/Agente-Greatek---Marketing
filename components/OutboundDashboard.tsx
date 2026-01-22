
import React, { useState, useMemo, useEffect } from 'react';
import { OutboundReport, OutboundDailyPlan, OutboundGoalInputs } from '../types';
import Modal from './ui/Modal';
import { useAppStore } from '../store/useAppStore';
import { generateOutboundManagerialPdf } from '../services/pdfGenerator';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface CalculatedTargets {
    dailySalesNeeded: number; // Valor R$
    dailyDealsNeeded: number; // Qtd Vendas
    dailyProposalsNeeded: number; // Qtd Propostas
    dailyCallsNeeded: number; // Qtd Ligações
}

// ---- DENSE COMPONENT UI HELPERS ----

const DenseMetricCard: React.FC<{ 
    label: string; 
    value: string | number; 
    subValue?: string;
    icon?: string;
    color?: string;
}> = ({ label, value, subValue, icon, color = 'bg-white' }) => (
    <div className={`p-2.5 rounded border border-greatek-border flex items-center justify-between shadow-sm ${color}`}>
        <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-greatek-dark-blue leading-tight">{value}</p>
            {subValue && <p className="text-[10px] text-gray-400 leading-none mt-0.5">{subValue}</p>}
        </div>
        {icon && <i className={`bi ${icon} text-xl text-greatek-blue/50`}></i>}
    </div>
);

const DenseContactRow: React.FC<{ contact: any }> = ({ contact }) => (
    <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-greatek-dark-blue truncate">{contact.name}</span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 rounded truncate max-w-[100px]">{contact.company}</span>
            </div>
            <p className="text-[10px] text-gray-500 truncate mt-0.5 italic">{contact.reason}</p>
        </div>
        <div className="text-right pl-2 flex-shrink-0">
             <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {contact.suggested_action}
             </span>
        </div>
    </div>
);

// ---- MAIN DASHBOARD ----

const OutboundDashboard: React.FC<{ report: OutboundReport[] }> = ({ report }) => {
    const { 
        conversations, 
        activeConversationId, 
        updateOutboundGoals,
        sendOutboundPlanEmail
    } = useAppStore();

    // Access the conversation state to get persistent goals
    const conversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    const storedGoals = conversation?.outboundGoals || {};

    const [selectedSellerIndex, setSelectedSellerIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'sales' | 'managerial'>('sales'); // New Tab Logic
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [email, setEmail] = useState('');

    const currentReport = useMemo(() => report[selectedSellerIndex], [report, selectedSellerIndex]);
    const currentGoalInput = storedGoals[currentReport.salesperson_name] || null;

    // --- Inputs State (Local to allow editing, synced on blur/save) ---
    // We initialize form fields with stored data if available, or defaults
    const [formState, setFormState] = useState({
        goal: '',
        days: '20',
        ticket: '5000,00',
        conversion: '20'
    });

    // Update form when seller changes or goals load
    useEffect(() => {
        if (currentGoalInput) {
            setFormState({
                // FIX: Removed (* 100) multiplication here. 
                // The stored value is already a float unit (e.g., 5000), not cents.
                goal: currentGoalInput.goal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                days: currentGoalInput.days.toString(),
                ticket: currentGoalInput.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                conversion: currentGoalInput.conversionRate.toString()
            });
        } else {
            // Reset to defaults if no goal saved for this seller
            setFormState({ goal: '', days: '20', ticket: '5000,00', conversion: '20' });
        }
    }, [currentGoalInput, selectedSellerIndex]);

    const formatMoneyInput = (val: string) => {
        const raw = val.replace(/\D/g, '');
        return (Number(raw) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };

    const handleGoalSave = () => {
        // Prevent parsing empty strings which results in NaN
        if (!formState.goal) return;

        const numGoal = parseFloat(formState.goal.replace(/\./g, '').replace(',', '.'));
        const numDays = parseInt(formState.days);
        const numTicket = parseFloat(formState.ticket.replace(/\./g, '').replace(',', '.'));
        const numConv = parseFloat(formState.conversion);

        if (numGoal > 0) {
            updateOutboundGoals(currentReport.salesperson_name, {
                goal: numGoal,
                days: numDays,
                avgTicket: numTicket,
                conversionRate: numConv
            });
        }
    };

    // --- Calculations ---
    const calculatedTargets: CalculatedTargets | null = useMemo(() => {
        if (!currentGoalInput) return null;

        const { goal, days, avgTicket, conversionRate } = currentGoalInput;
        const dailySales = goal / days;
        const dailyDeals = dailySales / avgTicket;
        const dailyProposals = dailyDeals / (conversionRate / 100);
        const CONTACT_TO_PROPOSAL_RATIO = 0.30; 
        const dailyCalls = dailyProposals / CONTACT_TO_PROPOSAL_RATIO;

        return {
            dailySalesNeeded: dailySales,
            dailyDealsNeeded: dailyDeals,
            dailyProposalsNeeded: dailyProposals,
            dailyCallsNeeded: dailyCalls
        };
    }, [currentGoalInput]);

    const handleGeneratePdf = () => {
        const targetsFormatted = calculatedTargets ? {
            vendas_diarias: formatCurrency(calculatedTargets.dailySalesNeeded),
            ligacoes_diarias: Math.ceil(calculatedTargets.dailyCallsNeeded),
            propostas_diarias: Math.ceil(calculatedTargets.dailyProposalsNeeded)
        } : null;
        
        generateOutboundManagerialPdf(currentReport, targetsFormatted);
    };

    const handleSendEmail = async () => {
        if (email) {
            const targetsFormatted = calculatedTargets ? {
                meta_restante: formatCurrency(currentGoalInput!.goal),
                dias_uteis: currentGoalInput!.days,
                ligacoes_diarias: Math.ceil(calculatedTargets.dailyCallsNeeded),
                propostas_diarias: Math.ceil(calculatedTargets.dailyProposalsNeeded),
                vendas_diarias: formatCurrency(calculatedTargets.dailySalesNeeded)
            } : null;

            await sendOutboundPlanEmail(email, {
                ...currentReport.action_report,
                calculated_targets: targetsFormatted,
                report_type: 'Relatório Gerencial'
            });
            setIsEmailModalOpen(false);
            setEmail('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Sidebar List of Sellers */}
            <div className="flex h-full">
                <aside className="w-48 border-r border-greatek-border bg-gray-50 flex flex-col flex-shrink-0">
                    <div className="p-3 border-b border-gray-200">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vendedores</h3>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {report.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedSellerIndex(index)}
                                className={`w-full text-left px-3 py-3 text-xs font-medium border-l-4 transition-all ${
                                    selectedSellerIndex === index
                                        ? 'bg-white border-greatek-blue text-greatek-blue shadow-sm'
                                        : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="truncate">{item.salesperson_name}</span>
                                    {storedGoals[item.salesperson_name] && <i className="bi bi-check-circle-fill text-[8px] text-green-500"></i>}
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Top Bar: Goal Calibration & Tabs */}
                    <div className="bg-white border-b border-greatek-border p-4 shadow-sm z-10 flex-shrink-0">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-bold text-greatek-dark-blue flex items-center gap-2">
                                <i className="bi bi-person-badge-fill text-greatek-blue"></i>
                                {currentReport.salesperson_name}
                            </h2>
                            {calculatedTargets && (
                                <div className="flex gap-2">
                                    {activeTab === 'managerial' && (
                                        <>
                                            <button onClick={handleGeneratePdf} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-gray-50 transition-colors">
                                                <i className="bi bi-file-earmark-pdf"></i> Baixar PDF
                                            </button>
                                            <button onClick={() => setIsEmailModalOpen(true)} className="flex items-center gap-1.5 bg-greatek-blue text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-greatek-dark-blue transition-colors">
                                                <i className="bi bi-envelope"></i> Enviar p/ Gestor
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dense Goal Input Form */}
                        <div className="bg-greatek-bg-light rounded-lg border border-greatek-border p-3 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <i className="bi bi-sliders"></i> Calibragem de Meta (Dados salvos automaticamente)
                                </h4>
                                <button onClick={handleGoalSave} className="text-[10px] text-greatek-blue hover:underline font-bold">Salvar Alterações</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Meta (R$)</label>
                                    <input 
                                        type="text" 
                                        value={formState.goal}
                                        onChange={(e) => setFormState(prev => ({...prev, goal: formatMoneyInput(e.target.value)}))}
                                        onBlur={handleGoalSave}
                                        className="w-full p-1.5 text-xs font-bold border border-gray-300 rounded bg-white focus:ring-1 focus:ring-greatek-blue focus:border-greatek-blue"
                                        placeholder="0,00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Ticket Médio (R$)</label>
                                    <input 
                                        type="text" 
                                        value={formState.ticket}
                                        onChange={(e) => setFormState(prev => ({...prev, ticket: formatMoneyInput(e.target.value)}))}
                                        onBlur={handleGoalSave}
                                        className="w-full p-1.5 text-xs font-bold border border-gray-300 rounded bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Dias Úteis</label>
                                    <input 
                                        type="number" 
                                        value={formState.days}
                                        onChange={(e) => setFormState(prev => ({...prev, days: e.target.value}))}
                                        onBlur={handleGoalSave}
                                        className="w-full p-1.5 text-xs font-bold border border-gray-300 rounded bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Conversão (%)</label>
                                    <input 
                                        type="number" 
                                        value={formState.conversion}
                                        onChange={(e) => setFormState(prev => ({...prev, conversion: e.target.value}))}
                                        onBlur={handleGoalSave}
                                        className="w-full p-1.5 text-xs font-bold border border-gray-300 rounded bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('sales')}
                                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                    activeTab === 'sales'
                                        ? 'border-greatek-blue text-greatek-blue'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <i className="bi bi-cart-check"></i> Relatório de Vendas
                            </button>
                            <button
                                onClick={() => setActiveTab('managerial')}
                                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                    activeTab === 'managerial'
                                        ? 'border-purple-600 text-purple-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <i className="bi bi-briefcase"></i> Relatório Gerencial
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-gray-50/50">
                        {/* Only show content if goals are set, otherwise prompt */}
                        {!calculatedTargets ? (
                            <div className="flex h-full items-center justify-center text-center text-gray-400">
                                <div>
                                    <i className="bi bi-arrow-up-circle text-3xl mb-2"></i>
                                    <p className="text-sm">Preencha a meta acima para gerar os cálculos.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* SALES TAB */}
                                {activeTab === 'sales' && (
                                    <div className="space-y-4 animate-fade-in">
                                        {/* Metrics Row */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <DenseMetricCard label="Meta Diária (Venda)" value={formatCurrency(calculatedTargets.dailySalesNeeded)} icon="bi-currency-dollar" color="bg-green-50 border-green-200" />
                                            <DenseMetricCard label="Ligações/Dia" value={Math.ceil(calculatedTargets.dailyCallsNeeded)} subValue="Volume Necessário" icon="bi-telephone-outbound" />
                                            <DenseMetricCard label="Propostas/Dia" value={Math.ceil(calculatedTargets.dailyProposalsNeeded)} subValue="Para Conversão" icon="bi-file-earmark-text" />
                                            <DenseMetricCard label="Novos Negócios/Dia" value={calculatedTargets.dailyDealsNeeded.toFixed(1)} icon="bi-trophy" />
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[400px]">
                                            {/* Weekly Plan */}
                                            <div className="lg:col-span-1 bg-white border border-greatek-border rounded-lg shadow-sm flex flex-col">
                                                <div className="p-3 border-b border-gray-100 bg-gray-50">
                                                    <h3 className="font-bold text-xs text-greatek-dark-blue uppercase">Plano da Semana</h3>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[500px] custom-scrollbar">
                                                    {currentReport.action_report.weekly_planning.map((day, idx) => (
                                                        <div key={idx} className="p-2 border border-gray-100 rounded hover:border-blue-100 transition-colors">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-bold text-greatek-blue">{day.day}</span>
                                                                <span className="text-[9px] bg-gray-100 px-1.5 rounded text-gray-600">{day.calls_goal} Ligações</span>
                                                            </div>
                                                            <ul className="list-disc list-inside text-[10px] text-gray-500">
                                                                {day.key_actions.slice(0, 2).map((a, i) => (
                                                                    <li key={i} className="truncate">{a}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* ABC Curve */}
                                            <div className="lg:col-span-2 bg-white border border-greatek-border rounded-lg shadow-sm flex flex-col">
                                                <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                                    <h3 className="font-bold text-xs text-greatek-dark-blue uppercase">Curva ABC & Oportunidades</h3>
                                                    <div className="flex gap-2 text-[10px] font-bold">
                                                        <span className="text-green-600"><i className="bi bi-circle-fill"></i> Quente</span>
                                                        <span className="text-yellow-600"><i className="bi bi-circle-fill"></i> Morno</span>
                                                        <span className="text-gray-400"><i className="bi bi-circle-fill"></i> Frio</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                                                    {/* Combining all contacts into one list with priority markers could be cleaner, but let's stick to sections for density */}
                                                    <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-green-700 bg-green-50/50 uppercase">Prioridade Alta (Semanal)</div>
                                                    {currentReport.abc_curve.weekly_contacts.map((c, i) => <DenseContactRow key={'w'+i} contact={c} />)}
                                                    
                                                    <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-yellow-700 bg-yellow-50/50 uppercase border-t border-gray-100">Prioridade Média (Quinzenal)</div>
                                                    {currentReport.abc_curve.biweekly_contacts.map((c, i) => <DenseContactRow key={'b'+i} contact={c} />)}
                                                    
                                                    <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-gray-600 bg-gray-50/50 uppercase border-t border-gray-100">Manutenção (Mensal)</div>
                                                    {currentReport.abc_curve.monthly_contacts.map((c, i) => <DenseContactRow key={'m'+i} contact={c} />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MANAGERIAL TAB */}
                                {activeTab === 'managerial' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                                            <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2 mb-2">
                                                <i className="bi bi-bar-chart-line-fill"></i> Análise de Performance
                                            </h3>
                                            <p className="text-xs text-gray-700 leading-relaxed text-justify">
                                                {currentReport.action_report.performance_analysis}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                <h3 className="text-sm font-bold text-greatek-dark-blue mb-3 border-b border-gray-100 pb-2">
                                                    Estratégia de Abordagem
                                                </h3>
                                                <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                    {currentReport.management_report.approach_strategy}
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                <h3 className="text-sm font-bold text-greatek-dark-blue mb-3 border-b border-gray-100 pb-2">
                                                    Dicas de Coaching
                                                </h3>
                                                <ul className="space-y-2">
                                                    {currentReport.management_report.coaching_tips.map((tip, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                            <i className="bi bi-lightbulb-fill text-yellow-400 flex-shrink-0"></i>
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                            <h3 className="text-sm font-bold text-red-800 mb-2">Plano de Contingência</h3>
                                            <p className="text-xs text-red-700 leading-relaxed">
                                                {currentReport.management_report.contingency_plan}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Email Modal */}
            <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title={`Enviar Relatório Gerencial: ${currentReport.salesperson_name}`}>
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                        Envie o relatório gerencial completo (Estratégia, Performance e Coaching) para o gestor responsável.
                    </p>
                    <div>
                        <label className="block text-sm font-semibold text-greatek-dark-blue mb-1">E-mail do Gestor</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="gestor@greatek.com.br"
                            className="w-full p-3 border border-greatek-border rounded-lg bg-[#e9e9e9] text-black"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSendEmail}
                            className="bg-greatek-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-greatek-dark-blue transition-colors"
                        >
                            Enviar Relatório
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default OutboundDashboard;
