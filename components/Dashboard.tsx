
import React from 'react';
import { Review, StudyContent, Subject, User, NavigationParams, ReviewStatus, ReviewFeedback } from '../types';
import { Card, Button, Badge } from './ui/Components';
import { SuggestionService, ContextService } from '../services';
import { ArrowRight, CheckCircle2, AlertCircle, TrendingUp, Clock, BookOpen, BrainCircuit } from 'lucide-react';

interface DashboardProps {
    reviews: Review[];
    contents: StudyContent[];
    subjects: Subject[];
    user: User | null;
    onReviewUpdate: (id: string, status: ReviewStatus, feedback?: ReviewFeedback) => void;
    onDataChange: () => void;
    onNavigate: (tab: string, params?: NavigationParams) => void;
    navParams?: NavigationParams;
}

export const Dashboard: React.FC<DashboardProps> = ({
    reviews,
    contents,
    subjects,
    user,
    onNavigate
}) => {

    // 1. Get Suggestion
    const suggestion = SuggestionService.getNextAction(user?.id || '');
    const Icon = suggestion.icon;

    // 2. Get Context (Visual Identity)
    const context = ContextService.getContext(user?.goal);

    // 3. Calculate Stats
    const today = new Date().toISOString().split('T')[0];
    const pendingReviews = reviews.filter(r => r.status === ReviewStatus.PENDING && r.date <= today);
    const totalReviews = reviews.length;
    const completedReviews = reviews.filter(r => r.status === ReviewStatus.COMPLETED).length;
    const retentionRate = totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Olá, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {context.microcopy[0]}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm" onClick={() => onNavigate('contents')}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Conteúdos
                    </Button>
                    <Button size="sm" onClick={() => onNavigate('dashboard', { action: 'focus_add_content' })}>
                        Registrar Estudo
                    </Button>
                </div>
            </div>

            {/* SUGGESTION HERO CARD */}
            <Card className="p-0 overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0`}>
                        <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <Badge variant="soft">Sugestão do Dia</Badge>
                            {suggestion.priority <= 2 && <Badge variant="soft" className="text-amber-600 bg-amber-50 border-amber-100">Prioritário</Badge>}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">{suggestion.headline}</h2>
                        <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                            {suggestion.subtext}
                        </p>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        <Button
                            onClick={() => onNavigate(suggestion.route, suggestion.navParams)}
                            className="w-full md:w-auto"
                        >
                            {suggestion.cta}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <Card className="p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Retenção Estimada</p>
                        <p className="text-2xl font-bold text-slate-900">{retentionRate}%</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Revisões Pendentes</p>
                        <p className="text-2xl font-bold text-slate-900">{pendingReviews.length}</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Estudado</p>
                        <p className="text-2xl font-bold text-slate-900">{contents.length} tópicos</p>
                    </div>
                </Card>

            </div>

            {/* RECENT ACTIVITY OR EMPTY STATE */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Atividade Recente</h3>
                    <button onClick={() => onNavigate('contents')} className="text-sm font-semibold text-primary hover:underline">Ver tudo</button>
                </div>

                {contents.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Nenhum conteúdo ainda</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Registre o que você estudou hoje.</p>
                        <Button size="sm" variant="secondary" onClick={() => onNavigate('dashboard', { action: 'focus_add_content' })}>
                            Registrar Agora
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contents.slice(-5).reverse().map(content => {
                            const subject = subjects.find(s => s.id === content.subjectId);
                            return (
                                <Card key={content.id} className="p-4 flex items-center justify-between group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: subject?.color || '#cbd5e1' }}>
                                            {subject?.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{content.topic}</p>
                                            <p className="text-xs text-slate-500">{subject?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-slate-400">
                                            {new Date(content.dateStudied).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};
