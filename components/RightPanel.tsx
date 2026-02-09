
import React from 'react';
import { Review, StudyContent, User, ReviewStatus } from '../types';
import { Card } from './ui/Components';
import { CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { formatDate } from '../services';

interface RightPanelProps {
    user: User | null;
    reviews: Review[];
    contents: StudyContent[];
    onDataChange: () => void;
    onNavigate: (tab: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
    user,
    reviews,
    contents
}) => {
    const today = formatDate(new Date());

    // Stats
    const completedToday = reviews.filter(r => r.status === ReviewStatus.COMPLETED && r.date === today).length;
    const pendingToday = reviews.filter(r => r.status === ReviewStatus.PENDING && r.date <= today).length;

    // Streak Logic (Mocked for now as we don't store streak yet)
    const streak = 3;

    return (
        <div className="space-y-6">

            {/* USER PROFILE SNIPPET */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    {user?.photoUrl ? (
                        <img src={user.photoUrl} alt="Me" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-slate-100">{user?.name[0]}</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.stage === 'university' ? 'Universitário' : 'Estudante'}</p>
                </div>
            </div>

            {/* DAILY PROGRESS */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Progresso Hoje</h3>
                <Card className="p-4 bg-slate-900 text-white border-0 shadow-lg shadow-slate-900/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-3xl opacity-20 -mr-10 -mt-10"></div>

                    <div className="relative z-10 flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">Revisões</span>
                        <span className="text-sm font-bold">{completedToday} / {completedToday + pendingToday}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(completedToday + pendingToday) > 0 ? (completedToday / (completedToday + pendingToday)) * 100 : 0}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Zap size={14} className="text-amber-400 fill-amber-400" />
                        <span>Sequência: <strong className="text-white">{streak} dias</strong></span>
                    </div>
                </Card>
            </div>

            {/* UP NEXT */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Próximas Metas</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                            <TrendingUp size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Manter o ritmo</p>
                            <p className="text-xs text-slate-500">Complete mais 2 revisões para bater a meta.</p>
                        </div>
                    </div>

                    {user?.onboardingCompleted && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Setup Completo</p>
                                <p className="text-xs text-slate-500">Seu perfil está configurado.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
