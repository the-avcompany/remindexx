
import React, { useState } from 'react';
import { Review, StudyContent, Subject, NavigationParams, ReviewStatus } from '../types';
import { Card, Button, Badge } from './ui/Components';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Clock } from 'lucide-react';
import { formatDate, addDays, getDayOfWeek } from '../services';

interface CalendarViewProps {
    reviews: Review[];
    contents: StudyContent[];
    subjects: Subject[];
    navParams?: NavigationParams;
    onDataChange: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    reviews,
    contents,
    subjects,
    navParams
}) => {
    const [selectedDate, setSelectedDate] = useState(navParams?.date || formatDate(new Date()));

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = formatDate(new Date());

    // Generate 2 weeks view centered on selected date or today
    const generateCalendarDays = () => {
        const days = [];
        // Start from 3 days ago just to show context
        let current = addDays(today, -3);

        for (let i = 0; i < 14; i++) {
            days.push(current);
            current = addDays(current, 1);
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    const getDayReviews = (date: string) => {
        return reviews.filter(r => r.date === date && r.status === ReviewStatus.PENDING);
    };

    const selectedReviews = getDayReviews(selectedDate);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendário</h1>
                    <p className="text-slate-500 text-sm">Organize suas revisões.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Hoje</p>
                    <p className="text-lg font-bold text-primary-strong">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </div>

            {/* HORIZONTAL CALENDAR STRIP */}
            <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
                    {calendarDays.map(date => {
                        const dayReviews = getDayReviews(date);
                        const count = dayReviews.length;
                        const isSelected = date === selectedDate;
                        const isToday = date === today;
                        const dateObj = new Date(date + 'T12:00:00'); // Fix TZ

                        return (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`
                         flex-none w-[72px] h-[84px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 border snap-center
                         ${isSelected
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105 z-10'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:bg-slate-50'}
                      `}
                            >
                                <span className={`text-xs font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                    {weekDays[dateObj.getDay()]}
                                </span>
                                <span className="text-xl font-bold">
                                    {dateObj.getDate()}
                                </span>

                                {count > 0 && (
                                    <div className={`mt-1 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} style={{ width: Math.min(24, count * 4) }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SELECTED DAY DETAILS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-slate-900">
                        {selectedDate === today ? 'Para Hoje' : `Para ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                    </h2>
                    <Badge variant="soft" className="rounded-full px-3">{selectedReviews.length} revisões</Badge>
                </div>

                {selectedReviews.length === 0 ? (
                    <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6" />
                        </div>
                        <p className="text-slate-900 font-bold">Nada agendado para este dia</p>
                        <p className="text-slate-500 text-sm">Aproveite para descansar ou adiantar estudos.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {selectedReviews.map(review => {
                            const content = contents.find(c => c.id === review.contentId);
                            const subject = subjects.find(s => s.id === content?.subjectId);

                            return (
                                <Card key={review.id} className="p-4 flex items-center gap-4 group hover:border-primary/30 transition-all border-l-4" style={{ borderLeftColor: subject?.color }}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-[10px] bg-slate-50">{subject?.name}</Badge>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {review.effort > 1 ? 'Revisão Densa' : 'Revisão Rápida'}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900">{content?.topic}</h3>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-xs">
                                        Iniciar
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};
