
import React, { useState, useMemo } from 'react';
import { ContentPlan, PlannedContentItem } from '../types';
import Modal from './ui/Modal';
import { useAppStore } from '../store/useAppStore';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_MAP: Record<string, number> = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11,
    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
};

// Helper to parse the "Month Year" string from the AI
const parseMonthYear = (monthStr: string): Date => {
    try {
        const parts = monthStr.toLowerCase().split(' ');
        // Find the month name
        const monthIndex = MONTHS_MAP[parts.find(p => MONTHS_MAP[p] !== undefined) || ''];
        // Find the year (4 digits)
        const year = parseInt(parts.find(p => /^\d{4}$/.test(p)) || new Date().getFullYear().toString());
        
        if (monthIndex !== undefined) {
            return new Date(year, monthIndex, 1);
        }
    } catch (e) {
        console.error("Error parsing date:", monthStr, e);
    }
    return new Date(); // Fallback to current date
};

const PlatformBadge: React.FC<{ platform: 'Blog' | 'LinkedIn' }> = ({ platform }) => {
    const colors = platform === 'Blog' 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-blue-100 text-blue-800 border-blue-200';
    
    const icon = platform === 'Blog' ? 'bi-globe' : 'bi-linkedin';

    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${colors}`}>
            <i className={`bi ${icon}`}></i> {platform}
        </span>
    );
};

const CalendarCard: React.FC<{ 
    item: PlannedContentItem; 
    onClick: () => void;
    onToggle: (e: React.MouseEvent) => void;
}> = ({ item, onClick, onToggle }) => (
    <div 
        onClick={onClick}
        className={`group relative p-2 rounded-md border shadow-sm transition-all cursor-pointer flex flex-col shrink-0
            ${item.isCompleted 
                ? 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80' 
                : 'bg-white border-greatek-border hover:shadow-md hover:border-greatek-blue/50'
            }`}
    >
        <div className="flex justify-between items-start mb-1 gap-1">
            <PlatformBadge platform={item.platform} />
            <button
                onClick={onToggle}
                className={`w-4 h-4 flex items-center justify-center rounded-full border transition-colors z-10
                    ${item.isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-gray-300 text-transparent hover:border-greatek-blue group-hover:text-gray-300'
                    }`}
                title={item.isCompleted ? "Marcar como pendente" : "Marcar como feito"}
            >
                <i className="bi bi-check text-[10px]"></i>
            </button>
        </div>
        <h4 className={`text-[10px] font-semibold leading-tight line-clamp-2 ${item.isCompleted ? 'text-gray-500 line-through' : 'text-greatek-dark-blue'}`}>
            {item.title}
        </h4>
    </div>
);

const ContentCalendar: React.FC<{ plan: ContentPlan }> = ({ plan }) => {
    const { activeConversationId, executeContentPlanItem, toggleContentPlanItemStatus } = useAppStore();
    const [selectedItem, setSelectedItem] = useState<PlannedContentItem | null>(null);

    // Calendar Logic
    const targetDate = useMemo(() => parseMonthYear(plan.month), [plan.month]);
    
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    const startDayOfWeek = targetDate.getDay(); // 0 = Sunday
    
    // Create array for grid: Empty slots for start offset + Days
    const calendarDays = useMemo(() => {
        const slots = [];
        // Empty slots before the 1st
        for (let i = 0; i < startDayOfWeek; i++) {
            slots.push(null);
        }
        // Real days
        for (let i = 1; i <= daysInMonth; i++) {
            slots.push(i);
        }
        return slots;
    }, [daysInMonth, startDayOfWeek]);

    const handleToggleStatus = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        if (activeConversationId) {
            toggleContentPlanItemStatus(activeConversationId, itemId);
        }
    };

    const handleExecute = () => {
        if (selectedItem) {
            executeContentPlanItem(selectedItem.briefing, selectedItem.platform);
        }
    };

    return (
        <div className="h-full flex flex-col bg-greatek-bg-light/30 animate-fade-in">
            {/* Header */}
            <header className="bg-white border-b border-greatek-border p-4 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                            <i className="bi bi-calendar3"></i>
                            <span className="uppercase tracking-wider font-semibold">{plan.month}</span>
                        </div>
                        <h1 className="text-xl font-bold text-greatek-dark-blue">Planejador Mensal</h1>
                    </div>
                    <div className="bg-greatek-blue/5 border border-greatek-blue/20 p-3 rounded-lg max-w-2xl text-xs">
                        <p className="text-greatek-dark-blue">
                            <strong>Estratégia:</strong> {plan.strategy_summary}
                        </p>
                    </div>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center sticky top-0 bg-greatek-bg-light/90 backdrop-blur-sm z-10 py-2">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="text-xs font-bold text-greatek-dark-blue/70 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="bg-transparent p-2 h-[220px]"></div>;
                        }

                        // Limit visually to prevent overflow, although scrollbar handles it.
                        // The agent is instructed to generate max 2, but we handle robustly here.
                        const itemsForDay = (plan.items || []).filter(i => i.day === day);
                        
                        return (
                            <div key={day} className="bg-white border border-greatek-border rounded-lg h-[220px] flex flex-col hover:border-greatek-blue/30 transition-colors overflow-hidden">
                                {/* Day Header */}
                                <div className={`p-2 flex justify-between items-center border-b border-gray-100/50 ${[0, 6].includes((index) % 7) ? 'bg-gray-50' : 'bg-white'}`}>
                                    <span className={`text-sm font-bold ${[0, 6].includes((index) % 7) ? 'text-red-400' : 'text-gray-600'}`}>
                                        {day}
                                    </span>
                                    {itemsForDay.length > 0 && (
                                        <span className="text-[9px] text-gray-400 font-medium">{itemsForDay.length} posts</span>
                                    )}
                                </div>
                                
                                {/* Content Scrollable Area */}
                                <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                                    {itemsForDay.map(item => (
                                        <CalendarCard 
                                            key={item.id}
                                            item={item}
                                            onClick={() => setSelectedItem(item)}
                                            onToggle={(e) => handleToggleStatus(e, item.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title="Detalhes do Conteúdo"
            >
                {selectedItem && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <PlatformBadge platform={selectedItem.platform} />
                                <span className="text-sm text-gray-500">Dia {selectedItem.day} de {plan.month}</span>
                            </div>
                            {selectedItem.isCompleted ? (
                                <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">
                                    <i className="bi bi-check-circle-fill mr-1.5"></i> Concluído
                                </span>
                            ) : (
                                <span className="flex items-center text-gray-500 text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                                    <i className="bi bi-hourglass-split mr-1.5"></i> Pendente
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-greatek-dark-blue">{selectedItem.title}</h3>
                            <p className="text-sm text-text-secondary mt-1">Formato: <strong>{selectedItem.format}</strong></p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold">Funil</p>
                                <p className="text-sm font-semibold text-gray-800">{selectedItem.funnel_stage}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold">Produto Foco</p>
                                <p className="text-sm font-semibold text-gray-800">{selectedItem.product_focus}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold">Palavra-Chave SEO</p>
                                <p className="text-sm font-semibold text-gray-800">{selectedItem.keyword_focus}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-greatek-blue/5 rounded-lg border-l-4 border-greatek-blue">
                            <h4 className="font-bold text-greatek-dark-blue mb-2 flex items-center gap-2">
                                <i className="bi bi-card-text"></i> Briefing para a IA
                            </h4>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {selectedItem.briefing}
                            </p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 gap-3">
                            <button
                                onClick={(e) => {
                                    if(activeConversationId) toggleContentPlanItemStatus(activeConversationId, selectedItem.id);
                                    setSelectedItem(prev => prev ? {...prev, isCompleted: !prev.isCompleted} : null);
                                }}
                                className={`flex items-center gap-2 px-4 py-3 font-bold rounded-lg transition-all border ${selectedItem.isCompleted ? 'bg-gray-100 text-gray-600 border-gray-300' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                            >
                                <i className={`bi ${selectedItem.isCompleted ? 'bi-arrow-counterclockwise' : 'bi-check-lg'}`}></i>
                                {selectedItem.isCompleted ? 'Marcar como Pendente' : 'Marcar como Feito'}
                            </button>
                            
                            <button
                                onClick={handleExecute}
                                className="flex items-center gap-2 px-6 py-3 bg-greatek-blue text-white font-bold rounded-lg shadow hover:bg-greatek-dark-blue transition-all transform hover:scale-105"
                            >
                                <i className="bi bi-stars"></i>
                                ✨ Escrever Agora
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ContentCalendar;
