
import React, { useState, useEffect } from 'react';
import { Review, StudyContent, Subject, ReviewStatus, Difficulty, DayException, NavigationParams, User } from '../types';
import { Card, Badge, Button } from './ui/Components';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, X, BarChart3, Zap, Layers, AlertCircle, CheckCircle2, ArrowLeft, Brain, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { formatDate, StorageService, PlannerService, generateId } from '../services';

interface CalendarViewProps {
    user: User;
    reviews: Review[];
    contents: StudyContent[];
    subjects: Subject[];
    navParams?: NavigationParams;
    onDataChange: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ user, reviews, contents, subjects, navParams, onDataChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // State for hierarchical navigation: Day -> Review
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

    // Confirmation state for delete
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const [exceptions, setExceptions] = useState<DayException[]>([]);

    useEffect(() => {
        const loadExceptions = async () => {
            if (user?.id) {
                const ex = await StorageService.getExceptions(user.id);
                setExceptions(ex);
            }
        };
        loadExceptions();
    }, [user.id, reviews]); // reload exceptions when data changes or user changes

    // Handle Intent
    useEffect(() => {
        if (navParams?.action === 'open_day' && navParams.date) {
            const targetDate = new Date(navParams.date);
            setCurrentDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
            setSelectedDateStr(navParams.date);
            setSelectedReviewId(null); // Reset deep dive
        }
    }, [navParams]);

    // Reset delete confirm when switching views
    useEffect(() => {
        setDeleteConfirm(null);
    }, [selectedReviewId, selectedDateStr]);

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
        setSelectedDateStr(null);
        setSelectedReviewId(null);
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const mobileMonthName = currentDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }).replace(' de ', ' ');
    const today = formatDate(new Date());

    // --- ACTIONS ---

    const handleMarkHeavy = async () => {
        if (!selectedDateStr || !user.id) return;
        const existing = exceptions.find(e => e.date === selectedDateStr);
        if (existing) return;

        // DayException expects all fields, though some might be optional in type def? 
        // Checking types.ts: export interface DayException { id: string; userId: string; date: string; type: 'heavy' | 'off'; capacityMultiplier: number; }
        // generateId handles ID creation.
        const exception: DayException = { id: generateId(), userId: user.id, date: selectedDateStr, type: 'heavy', capacityMultiplier: 0.5 };

        await StorageService.addException(exception);
        setExceptions([...exceptions, exception]);
        await PlannerService.rebalanceSchedule(user.id);
        onDataChange();
    };

    const handleRedistribute = async () => {
        if (!reviews.length) return;
        if (confirm("Redistribuir a carga deste dia para os próximos?")) {
            await PlannerService.rebalanceSchedule(user.id);
            onDataChange();
        }
    };

    const handleAdjustMemory = async (review: Review, type: 'remembered' | 'forgot') => {
        await StorageService.adjustSchedule(review.userId, review.contentId, type, review.id);
        onDataChange();
    };

    const handleDeleteContent = async (contentId: string) => {
        // Inline confirmation check
        if (deleteConfirm !== contentId) {
            setDeleteConfirm(contentId);
            return;
        }

        await StorageService.deleteContent(contentId);
        setSelectedReviewId(null);
        onDataChange();
    };

    // --- RENDERING HELPERS ---

    const getLoadLevel = (count: number, hasHeavyException: boolean) => {
        if (hasHeavyException) return { label: 'Limitado', colorClass: 'bg-slate-400', textClass: 'text-slate-500' };
        if (count === 0) return { label: 'Livre', colorClass: 'bg-slate-100', textClass: 'text-slate-400' };
        if (count <= 3) return { label: 'Leve', colorClass: 'bg-primary/30', textClass: 'text-primary-muted' };
        if (count <= 7) return { label: 'Moderado', colorClass: 'bg-primary', textClass: 'text-primary' };
        return { label: 'Pesado', colorClass: 'bg-primary-strong', textClass: 'text-primary-strong' };
    };

    // --- SUB-COMPONENTS ---

    const CalendarHeader = () => (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Calendário</h1>
                <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Gestão visual do cronograma.</p>
            </div>
            <div className="flex items-center justify-between md:justify-center bg-white rounded-xl shadow-soft border border-slate-200 p-1 w-full md:w-auto">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors flex-shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-2 md:px-6 font-bold text-slate-900 capitalize flex-1 md:flex-none md:min-w-[160px] text-center text-sm md:text-base whitespace-nowrap">
                    <span className="md:hidden">{mobileMonthName}</span>
                    <span className="hidden md:inline">{monthName}</span>
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors flex-shrink-0">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderCalendarGrid = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[80px] md:min-h-[130px] bg-slate-50/50 border-b border-r border-slate-100/80"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            const dayReviews = reviews.filter(r => r.date === dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDateStr;

            const pendingCount = dayReviews.filter(r => r.status === ReviewStatus.PENDING).length;
            const completedCount = dayReviews.filter(r => r.status === ReviewStatus.COMPLETED).length;
            const totalCount = dayReviews.length;

            const isException = exceptions.some(e => e.date === dateStr && e.type === 'heavy');
            const load = getLoadLevel(pendingCount, isException);
            const hasActivity = totalCount > 0 || isException;

            days.push(
                <div
                    key={day}
                    onClick={() => { setSelectedDateStr(dateStr); setSelectedReviewId(null); }}
                    className={`
                min-h-[80px] md:min-h-[130px] p-2 md:p-3 border-b border-r border-slate-100 relative transition-all duration-200 group flex flex-col justify-between
                ${isSelected ? 'bg-primary-soft/40 ring-2 ring-inset ring-primary z-10' : 'hover:bg-slate-50 cursor-pointer bg-white'}
            `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`
                    w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-xs md:text-sm font-bold transition-colors
                    ${isToday ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-slate-600'}
                `}>
                            {day}
                        </span>

                        {isException && (
                            <div title="Dia Limitado" className="bg-slate-200 text-slate-500 rounded p-1">
                                <AlertCircle size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            </div>
                        )}
                    </div>

                    {hasActivity && (
                        <div className="my-1 md:my-3">
                            <div className="w-full h-1 md:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${load.colorClass}`} style={{ width: `${Math.min(100, Math.max(10, (pendingCount / 8) * 100))}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-1 md:gap-3">
                        {pendingCount > 0 && (
                            <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-bold text-primary-strong">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                {pendingCount}
                            </div>
                        )}
                        {completedCount > 0 && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                <CheckCircle2 size={12} />
                                {completedCount}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return days;
    };

    // --- REVIEW DETAIL PANEL (DEEP DIVE) ---
    const renderReviewDetail = () => {
        const review = reviews.find(r => r.id === selectedReviewId);
        if (!review) return null;

        const content = contents.find(c => c.id === review.contentId);
        // Safety check: Content might be deleted while review still lingering in props before refresh
        if (!content) return null;

        const subject = subjects.find(s => s.id === content?.subjectId);

        // Get timeline for this content
        const history = reviews.filter(r => r.contentId === review.contentId).sort((a, b) => a.date.localeCompare(b.date));

        return (
            <div className="h-full flex flex-col bg-white">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedReviewId(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{content?.topic}</h2>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{subject?.name}</span>
                        </div>
                    </div>
                    <button onClick={() => { setSelectedReviewId(null); setSelectedDateStr(null); }} className="p-2 text-slate-400 hover:text-red-500 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">

                    {/* Memory Actions */}
                    {review.status === ReviewStatus.PENDING && (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-primary-strong">
                                <Brain size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-4">Como foi sua memória hoje?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="secondary" onClick={() => handleAdjustMemory(review, 'forgot')} className="flex flex-col h-auto py-3 border-red-100 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600">
                                    <ThumbsDown className="w-5 h-5 mb-1 opacity-50" />
                                    <span className="text-xs">Esqueci</span>
                                </Button>
                                <Button onClick={() => handleAdjustMemory(review, 'remembered')} className="flex flex-col h-auto py-3 bg-primary text-white hover:bg-primary-strong shadow-md shadow-primary/20">
                                    <ThumbsUp className="w-5 h-5 mb-1" />
                                    <span className="text-xs">Lembrei</span>
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-3 max-w-[200px] mx-auto leading-tight">
                                "Esqueci" agendará um reforço imediato. "Lembrei" aumentará o espaçamento.
                            </p>
                        </div>
                    )}

                    {/* Timeline */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layers size={14} /> Linha do Tempo
                        </h3>
                        <div className="relative border-l-2 border-slate-100 ml-2 space-y-6 pl-6 pb-2">
                            {history.map(r => {
                                const isPast = r.date < today || r.status === ReviewStatus.COMPLETED;
                                const isCurrent = r.id === review.id;

                                return (
                                    <div key={r.id} className={`relative ${isCurrent ? 'opacity-100 scale-100' : 'opacity-60 scale-95'} transition-all`}>
                                        <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ring-4 ring-white ${isCurrent ? 'bg-primary border-primary' :
                                                r.status === ReviewStatus.COMPLETED ? 'bg-slate-300 border-slate-300' : 'bg-white border-primary'
                                            }`}></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`text-sm font-bold ${isCurrent ? 'text-primary-strong' : 'text-slate-700'}`}>
                                                    {new Date(r.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">
                                                    {r.status === ReviewStatus.COMPLETED ? 'Concluída' : 'Agendada'}
                                                </p>
                                            </div>
                                            {isCurrent && (
                                                <span className="text-[10px] bg-primary-soft text-primary-strong px-2 py-0.5 rounded font-bold">Atual</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-slate-100">
                        <button
                            onClick={() => handleDeleteContent(content.id)}
                            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide ${deleteConfirm === content.id
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                                }`}
                        >
                            <Trash2 size={16} />
                            {deleteConfirm === content.id ? 'Confirmar Exclusão?' : 'Excluir Conteúdo'}
                        </button>
                    </div>

                </div>
            </div>
        );
    };

    // --- DAY DETAIL PANEL (LIST OF ITEMS) ---
    const renderDayDetail = () => {
        if (!selectedDateStr) return null;

        const dateObj = new Date(selectedDateStr + 'T12:00:00');
        const dayReviews = reviews.filter(r => r.date === selectedDateStr);
        const pending = dayReviews.filter(r => r.status === ReviewStatus.PENDING);
        const completed = dayReviews.filter(r => r.status === ReviewStatus.COMPLETED);
        const isException = exceptions.some(e => e.date === selectedDateStr);

        return (
            <div className="h-full flex flex-col bg-white">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 capitalize">
                            {dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">{dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p>
                    </div>
                    <button onClick={() => setSelectedDateStr(null)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <span className="text-xl md:text-2xl font-bold text-primary-strong">{pending.length}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pendentes</span>
                        </div>
                        <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center text-slate-400">
                            <span className="text-xl md:text-2xl font-bold text-slate-600">{completed.length}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Feitas</span>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Zap size={14} /> Ações Rápidas
                        </h3>
                        {!isException && (
                            <Button variant="secondary" onClick={handleMarkHeavy} className="w-full justify-start text-xs h-10 border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
                                <AlertCircle size={14} className="mr-2 text-slate-400" />
                                Limitar Dia (Pesado)
                            </Button>
                        )}
                        {pending.length > 0 && (
                            <Button variant="secondary" onClick={handleRedistribute} className="w-full justify-start text-xs h-10 border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
                                <BarChart3 size={14} className="mr-2 text-slate-400" />
                                Redistribuir Carga
                            </Button>
                        )}
                    </div>

                    {/* List Items */}
                    {dayReviews.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={14} /> Cronograma do Dia
                            </h3>
                            <div className="space-y-2">
                                {dayReviews.map(r => {
                                    const content = contents.find(c => c.id === r.contentId);
                                    const subject = subjects.find(s => s.id === content?.subjectId);
                                    const isDone = r.status === ReviewStatus.COMPLETED;

                                    // Skip if content deleted
                                    if (!content) return null;

                                    return (
                                        <div
                                            key={r.id}
                                            onClick={() => setSelectedReviewId(r.id)}
                                            className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-all cursor-pointer ${isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5'}`}
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                        {subject?.name}
                                                    </span>
                                                </div>
                                                <p className={`text-sm font-semibold truncate ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                                    {content?.topic}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronRight size={16} className="text-slate-300" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Main Render Logic for Panel
    const renderPanelContent = () => {
        if (selectedReviewId) return renderReviewDetail();
        if (selectedDateStr) return renderDayDetail();
        return null;
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-theme(spacing.24))]">
            <CalendarHeader />

            <div className="flex-1 flex gap-6 overflow-hidden items-start">
                {/* Main Grid */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                            <div key={i} className="py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-7 auto-rows-fr">
                            {renderCalendarGrid()}
                        </div>
                    </div>
                </div>

                {/* Desktop Side Panel */}
                {(selectedDateStr || selectedReviewId) && (
                    <div className="hidden lg:block w-[380px] shrink-0 h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right-10 duration-300">
                        {renderPanelContent()}
                    </div>
                )}
            </div>

            {/* Mobile Overlay */}
            {(selectedDateStr || selectedReviewId) && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => { setSelectedReviewId(null); setSelectedDateStr(null); }} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                        {renderPanelContent()}
                    </div>
                </div>
            )}
        </div>
    );
};
