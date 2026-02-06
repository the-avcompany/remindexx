
import React, { useMemo } from 'react';
import { User, Review, StudyContent, ReviewStatus, NavigationParams, UserSettings } from '../types';
import { formatDate, addDays, StorageService, PlannerService, ContextService, SuggestionService } from '../services';
import { BrainCircuit, Activity, Zap, ArrowRight, ShieldAlert, BarChart3, Settings } from 'lucide-react';
import { Button } from './ui/Components';

interface RightPanelProps {
    user: User;
    reviews: Review[];
    contents: StudyContent[];
    settings: UserSettings;
    onDataChange: () => void;
    onNavigate: (tab: string, params?: NavigationParams) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ user, reviews, contents, settings, onDataChange, onNavigate }) => {
    const today = formatDate(new Date());
    const tomorrow = addDays(today, 1);
    const context = ContextService.getContext(user.goal || '');

    // --- METRICS CALCULATION ---

    // 1. Today's Load (Cognitive State)
    const pendingToday = reviews.filter(r => r.status === ReviewStatus.PENDING && r.date <= today);
    const completedToday = reviews.filter(r => r.status === ReviewStatus.COMPLETED && r.date === today);
    const loadPercentage = pendingToday.length / Math.max(1, settings.dailyLimit);

    const getDayState = () => {
        if (pendingToday.length === 0 && completedToday.length > 0) return {
            label: 'Missão Cumprida',
            desc: 'Você finalizou seu ciclo.',
            icon: CheckIcon,
            colorClass: 'text-primary'
        };
        if (pendingToday.length === 0) return {
            label: 'Mente Livre',
            desc: 'Nenhuma pendência ativa.',
            icon: BrainCircuit,
            colorClass: 'text-slate-400'
        };
        if (loadPercentage < 0.5) return {
            label: 'Fluxo Leve',
            desc: 'Carga cognitiva baixa.',
            icon: Activity,
            colorClass: 'text-primary-muted'
        };
        if (loadPercentage <= 1.2) return {
            label: 'Foco Total',
            desc: 'Carga ideal para aprendizado.',
            icon: Zap,
            colorClass: 'text-primary'
        };
        return {
            label: 'Sobrecarga',
            desc: 'Considere adiar alguns itens.',
            icon: ShieldAlert,
            colorClass: 'text-primary-strong'
        };
    };

    const dayState = getDayState();
    const DayIcon = dayState.icon;

    // 2. Dynamic Suggested Action (Next Best Action)
    // Replaces the old static recommendation logic with the service-based one
    const suggestedAction = SuggestionService.getNextAction(user.id);

    // 3. Risk Radar (Retention Risk)
    const getRiskMetrics = () => {
        let high = 0, med = 0, low = 0;

        // Analyze NEXT pending review for each content
        contents.forEach(c => {
            const nextReview = reviews
                .filter(r => r.contentId === c.id && r.status === ReviewStatus.PENDING)
                .sort((a, b) => a.date.localeCompare(b.date))[0];

            if (!nextReview) {
                low++; // Completed or no review
                return;
            }

            if (nextReview.date < today) high++;
            else if (nextReview.date <= tomorrow) med++;
            else low++;
        });

        const total = Math.max(1, contents.length);
        return {
            high: (high / total) * 100,
            med: (med / total) * 100,
            low: (low / total) * 100,
            counts: { high, med, low }
        };
    };

    const risk = getRiskMetrics();

    // 4. Tomorrow Preview
    const tomorrowReviews = reviews.filter(r => r.status === ReviewStatus.PENDING && r.date === tomorrow);

    const handlePushTomorrow = async () => {
        if (tomorrowReviews.length === 0) return;
        if (confirm("Mover tarefas de amanhã para depois de amanhã? (Aliviar carga)")) {
            await PlannerService.setTomorrowHeavy(user.id); // Simulates a heavy day to push things
            onDataChange();
        }
    };

    // Helper for Contextual Background
    const getContextBg = (visual: string) => {
        switch (visual) {
            case 'organic': return 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent';
            case 'geometric': return 'bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-primary/5 via-primary/0 to-transparent';
            case 'structured': return 'bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-primary/5 to-transparent';
            case 'balanced': return 'bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-transparent via-primary/5 to-transparent';
            default: return '';
        }
    };

    // Select a random microcopy
    const randomMicrocopy = useMemo(() => {
        const opts = context.microcopy;
        return opts[Math.floor(Math.random() * opts.length)];
    }, [context.microcopy]);

    return (
        <div className="h-full flex flex-col font-sans">

            {/* 0. Header Minimal */}
            <div className="flex items-center gap-3 pb-6 mb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-300 text-white text-xs font-bold">
                            {user.name[0]}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">Olá, {user.name.split(' ')[0]}</p>
                </div>
                <button
                    onClick={() => onNavigate('settings')}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                    title="Configurações"
                >
                    <Settings size={18} />
                </button>
            </div>

            <div className="space-y-8 overflow-y-auto pr-1">

                {/* 1. Day State (Cognitive) */}
                <section>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Estado Mental</h4>
                    <div className="bg-primary-soft/50 rounded-xl p-5 border border-primary/10 flex items-start gap-4 transition-colors">
                        <div className={`p-2.5 rounded-lg bg-white shadow-sm ${dayState.colorClass}`}>
                            <DayIcon size={20} />
                        </div>
                        <div>
                            <h3 className={`text-base font-bold ${dayState.colorClass}`}>{dayState.label}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-tight mt-1">{dayState.desc}</p>
                        </div>
                    </div>
                </section>

                {/* 2. Contextual Identity Card */}
                <section>
                    <div className={`relative overflow-hidden rounded-xl border border-slate-100 p-5 ${getContextBg(context.visual)}`}>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary shrink-0 shadow-sm">
                                <context.identity.icon size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">{context.identity.title}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{context.identity.text}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Recommended Action (Dynamic) */}
                <section>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Próximo Passo</h4>
                    <button
                        onClick={() => onNavigate(suggestedAction.route, suggestedAction.navParams)}
                        className="w-full group bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 p-4 rounded-xl flex items-center justify-between transition-all duration-300 text-left"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                <suggestedAction.icon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{suggestedAction.headline}</p>
                                <p className="text-xs text-slate-500 font-medium">{suggestedAction.subtext}</p>
                                <span className="text-[10px] font-bold text-primary mt-1 inline-block uppercase tracking-wider group-hover:underline">
                                    {suggestedAction.cta}
                                </span>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                            <ArrowRight size={16} className="text-primary" />
                        </div>
                    </button>
                </section>

                {/* 4. Risk Radar */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Radar de Risco</h4>
                        <BarChart3 size={14} className="text-slate-300" />
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                        {/* Contextual Risk Text */}
                        <p className="text-xs text-slate-500 italic mb-2 border-l-2 border-primary/30 pl-3">
                            "{context.riskText}"
                        </p>

                        {/* High Risk */}
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-semibold text-slate-700">Crítico (Atrasado)</span>
                                <span className="font-bold text-primary-strong">{risk.counts.high}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div style={{ width: `${risk.high}%` }} className="h-full bg-primary-strong rounded-full" />
                            </div>
                        </div>

                        {/* Medium Risk */}
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-semibold text-slate-600">Atenção (Hoje/Amanhã)</span>
                                <span className="font-bold text-primary">{risk.counts.med}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div style={{ width: `${risk.med}%` }} className="h-full bg-primary/60 rounded-full" />
                            </div>
                        </div>

                        {/* Low Risk */}
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-semibold text-slate-500">Seguro (Futuro)</span>
                                <span className="font-bold text-slate-400">{risk.counts.low}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div style={{ width: `${risk.low}%` }} className="h-full bg-primary/20 rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Tomorrow Preview */}
                <section>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Previsão: Amanhã</h4>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div>
                            <span className="text-2xl font-bold text-slate-900 block leading-none">{tomorrowReviews.length}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">Revisões</span>
                        </div>

                        {tomorrowReviews.length > 5 ? (
                            <Button size="sm" variant="ghost" onClick={handlePushTomorrow} className="text-xs h-8 px-3 text-primary-strong hover:bg-primary-soft">
                                Aliviar
                            </Button>
                        ) : (
                            <div className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                                Carga Leve
                            </div>
                        )}
                    </div>
                </section>

                {/* 6. Contextual Microcopy Footer */}
                <div className="py-6 text-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-serif italic text-slate-500">
                        {randomMicrocopy}
                    </p>
                </div>

            </div>
        </div>
    );
};

// Simple Icon for "Mission Accomplished"
const CheckIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
