
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Review, StudyContent, Subject, ReviewStatus, ReviewFeedback, User, Difficulty, DayException, NavigationParams, UserSettings } from '../types';
import { Card, Button, Input, Select, Badge } from './ui/Components';
import { Clock, CalendarCheck, Plus, BookOpen, X, ArrowRight, Check, ListTodo, Zap, ZapOff, Activity, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate, StorageService, SubjectSuggestions, addDays, PlannerService } from '../services';

interface DashboardProps {
  user: User;
  reviews: Review[];
  contents: StudyContent[];
  subjects: Subject[];
  settings: UserSettings;
  onReviewUpdate: (id: string, status: ReviewStatus, feedback?: ReviewFeedback) => void;
  onDataChange: () => void;
  onNavigate: (tab: string, params?: NavigationParams) => void;
  navParams?: NavigationParams;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, reviews, contents, subjects, settings, onReviewUpdate, onDataChange, onNavigate, navParams }) => {
  // Settings are now passed as props, no need to manage local state for them

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLSelectElement>(null);

  const [newSubject, setNewSubject] = useState('');
  const [quickTopic, setQuickTopic] = useState('');
  const [quickSubject, setQuickSubject] = useState('');
  const [quickDifficulty, setQuickDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [quickDate, setQuickDate] = useState(formatDate(new Date()));

  const today = formatDate(new Date());
  const tomorrow = addDays(today, 1);

  const pendingReviews = useMemo(() => reviews.filter(r =>
    r.status === ReviewStatus.PENDING && r.date <= today
  ).sort((a, b) => a.date.localeCompare(b.date)), [reviews, today]);

  const overdueReviews = useMemo(() => reviews.filter(r =>
    r.status === ReviewStatus.PENDING && r.date < today
  ), [reviews, today]);

  const tomorrowReviews = useMemo(() => reviews.filter(r =>
    r.status === ReviewStatus.PENDING && r.date === tomorrow
  ), [reviews, tomorrow]);

  useEffect(() => {
    if (navParams?.action === 'focus_add_subject') {
      if (subjectInputRef.current) {
        subjectInputRef.current.focus();
        subjectInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    if (navParams?.action === 'focus_add_content') {
      if (contentInputRef.current) {
        contentInputRef.current.focus();
        contentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [navParams]);

  const getContentDetails = (contentId: string) => {
    const content = contents.find(c => c.id === contentId);
    const subject = subjects.find(s => s.id === content?.subjectId);
    return { content, subject };
  };

  const handleAddSubject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubject.trim()) return;
    await StorageService.addSubject(user.id, newSubject.trim());
    setNewSubject('');
    onDataChange();
  };

  const handleQuickAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopic || !quickSubject) return;
    await StorageService.addContentWithReviews(user.id, quickSubject, quickTopic, quickDate, Number(quickDifficulty));
    setQuickTopic('');
    setQuickSubject('');
    setQuickDifficulty(Difficulty.MEDIUM);
    onDataChange();
  };

  const handleSetTomorrowHeavy = async () => {
    if (confirm('Marcar amanhã como dia pesado?')) {
      await PlannerService.setTomorrowHeavy(user.id);
      onDataChange();
    }
  };

  const handlePaceChange = async (mode: 'faster' | 'slower') => {
    await PlannerService.setPace(user.id, mode);
    onDataChange();
  };

  const handleRedistributeOverdue = async () => {
    if (confirm('Redistribuir atrasos?')) {
      await PlannerService.rebalanceSchedule(user.id);
      onDataChange();
    }
  };

  const { checklist } = settings;
  const checklistItems = [
    { id: 'sub', label: 'Adicionar matérias', done: checklist.hasSubjects || subjects.length > 0 },
    { id: 'con', label: 'Registrar conteúdo', done: checklist.hasContents || contents.length > 0 },
    { id: 'cal', label: 'Conferir calendário', done: checklist.checkedCalendar },
  ];

  const getWeekStatus = () => {
    if (overdueReviews.length > 0) return { label: 'Atenção', text: 'Conteúdos acumulados', sub: `${overdueReviews.length} itens atrasados` };
    return { label: 'Em dia', text: 'Tudo organizado', sub: 'Cronograma equilibrado' };
  };
  const status = getWeekStatus();

  let tomorrowLabel = 'Moderado';
  if (tomorrowReviews.length < 3) tomorrowLabel = 'Leve';
  if (tomorrowReviews.length > 7) tomorrowLabel = 'Pesado';

  const isSetupMode = !settings.setupCompleted;
  const availableSuggestions = SubjectSuggestions.getSuggestions(user.goal, user.stage).filter(s => !subjects.some(sub => sub.name === s));

  const renderSetup = () => (
    <Card className="p-6 md:p-8 border-primary/20 bg-primary-soft relative overflow-hidden transition-all duration-300">
      <div className="relative z-10">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 tracking-tight">{subjects.length === 0 ? 'Adicione suas matérias' : 'Continue configurando'}</h2>

        <form onSubmit={handleAddSubject} className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 max-w-xl">
          <div className="flex-1">
            <Input ref={subjectInputRef} value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Ex: Matemática..." className="bg-white" />
          </div>
          <Button type="submit" disabled={!newSubject.trim()} variant="secondary" className="w-full sm:w-auto"><Plus className="w-5 h-5 mr-2" /> Add</Button>
        </form>

        {subjects.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Adicionadas</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {subjects.map(s => (
                <span key={s.id} className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs md:text-sm font-medium shadow-sm">
                  {s.name}
                  <button
                    onClick={async () => { await StorageService.deleteSubject(s.id); onDataChange(); }}
                    className="ml-2 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {availableSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
            {availableSuggestions.map(s => <button key={s} onClick={async () => { await StorageService.addSubject(user.id, s); onDataChange(); }} className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/50 border border-primary/20 text-primary-strong text-xs md:text-sm font-medium hover:bg-white transition-colors">+ {s}</button>)}
          </div>
        )}

        {subjects.length > 0 && <Button onClick={async () => {
          const newS = { ...settings, setupCompleted: true };
          await StorageService.saveSettings(user.id, newS);
          onDataChange();
        }} size="lg" className="w-full sm:w-auto">Concluir Setup <ArrowRight className="w-5 h-5 ml-2" /></Button>}
      </div>
    </Card>
  );

  const renderQuickAdd = () => (
    <Card className="p-5 md:p-8 border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-soft rounded-lg text-primary-strong"><BookOpen className="w-5 h-5" /></div>
        <h2 className="text-lg md:text-xl font-bold text-slate-900">Registrar Estudo</h2>
      </div>
      <form onSubmit={handleQuickAddContent} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
        <div className="md:col-span-3">
          <Select ref={contentInputRef} value={quickSubject} onChange={(e) => setQuickSubject(e.target.value)}>
            <option value="">Matéria...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <div className="md:col-span-5">
          <Input placeholder="Tópico estudado" value={quickTopic} onChange={(e) => setQuickTopic(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Select value={quickDifficulty} onChange={(e) => setQuickDifficulty(Number(e.target.value))}>
            <option value={Difficulty.EASY}>Fácil</option>
            <option value={Difficulty.MEDIUM}>Médio</option>
            <option value={Difficulty.HARD}>Difícil</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={!quickTopic || !quickSubject}>Salvar</Button>
        </div>
      </form>
    </Card>
  );

  const renderWeeklyPreview = () => {
    const todayObj = new Date();
    const currentDay = todayObj.getDay();
    const startOfWeek = new Date(todayObj);
    startOfWeek.setDate(todayObj.getDate() - currentDay);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
      <Card className="p-5 border-slate-200 bg-white">
        <div className="flex justify-between items-center mb-4 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Esta Semana</h3>
          </div>
          <span className="text-xs font-medium text-slate-400 hidden sm:block">Clique para ver detalhes</span>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
          {weekDays.map((date, idx) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            const count = reviews.filter(r => r.date === dateStr && r.status === ReviewStatus.PENDING).length;

            let bgClass = "bg-transparent hover:bg-slate-50";
            let textClass = "text-slate-500";
            let countClass = "bg-slate-100 text-slate-400";

            if (isToday) {
              bgClass = "bg-primary text-white shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2";
              textClass = "text-white";
              countClass = "bg-white/20 text-white";
            } else if (count > 0) {
              bgClass = "bg-primary-soft hover:bg-primary/20";
              textClass = "text-primary-strong";
              countClass = "bg-primary/10 text-primary-strong";
              if (count > 7) {
                countClass = "bg-primary text-white";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => onNavigate('calendar', { action: 'open_day', date: dateStr })}
                className={`flex flex-col items-center justify-center py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 group ${bgClass}`}
              >
                <span className={`text-[10px] font-bold mb-1 ${isToday ? 'opacity-80' : 'text-slate-400'}`}>{dayNames[idx]}</span>
                <span className={`text-xs sm:text-sm font-bold mb-1.5 ${textClass}`}>{date.getDate()}</span>

                <div className={`h-4 w-4 sm:h-5 sm:w-auto sm:px-1.5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-transform group-hover:scale-110 ${countClass} ${count === 0 && !isToday ? 'opacity-0' : 'opacity-100'}`}>
                  {count > 0 ? count : (isToday ? '-' : '')}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">Visão Geral</h1>
        <p className="text-slate-500 mt-1 md:mt-2 text-base md:text-lg">Motor de revisão inteligente ativo.</p>
      </header>

      <div className="space-y-6">
        {isSetupMode ? renderSetup() : renderQuickAdd()}
        {renderWeeklyPreview()}
      </div>

      {/* Grid Responsiveness: 1 col mobile, 2 col tablet (md), 3 col desktop (xl) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">

        {/* 1. Checklist */}
        <Card className="p-5 md:p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <ListTodo size={20} className="text-primary-muted" />
            <h3 className="text-lg font-bold text-slate-900">Próximos Passos</h3>
          </div>
          <div className="space-y-3 md:space-y-4">
            {checklistItems.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.done ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                  {item.done && <Check size={12} className="text-white" />}
                </div>
                <span className={`text-sm font-medium ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.label}</span>
              </div>
            ))}
            {!checklist.checkedCalendar && (
              <Button variant="ghost" size="sm" onClick={async () => { await StorageService.updateChecklist(user.id, 'checkedCalendar'); onNavigate('calendar'); }} className="text-sm w-full mt-2">Ir para Calendário</Button>
            )}
          </div>
        </Card>

        {/* 2. Status */}
        <Card className="p-5 md:p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <Activity size={20} className="text-primary-muted" />
            <h3 className="text-lg font-bold text-slate-900">Status da Semana</h3>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <p className="text-xl font-bold text-slate-900">{status.text}</p>
              {status.label === 'Atenção' && (
                <Badge variant="soft" className="bg-primary-soft text-primary-strong">
                  <AlertCircle className="w-3 h-3 mr-1" /> Atrasos
                </Badge>
              )}
            </div>
            <p className="text-base text-slate-500 mb-6">{status.sub}</p>

            {status.label === 'Atenção' && (
              <div className="mt-auto">
                <Button variant="secondary" size="sm" onClick={handleRedistributeOverdue} className="w-full text-sm">
                  <Zap className="w-4 h-4 mr-2" /> Reorganizar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 3. Tomorrow */}
        <Card className="p-5 md:p-6 flex flex-col h-full md:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <Clock size={20} className="text-primary-muted" />
            <h3 className="text-lg font-bold text-slate-900">Amanhã</h3>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-3xl md:text-4xl font-bold text-slate-900">{tomorrowReviews.length}</span>
              <Badge variant="soft">{tomorrowLabel}</Badge>
            </div>

            {tomorrowReviews.length > 0 && (
              <p className="text-sm text-slate-500 mb-6 truncate">
                {tomorrowReviews.slice(0, 3).map(r => subjects.find(s => s.id === contents.find(c => c.id === r.contentId)?.subjectId)?.name).join(', ')}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <Button variant="secondary" size="sm" onClick={() => handlePaceChange('faster')} className="px-2">
                <Zap size={16} />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handlePaceChange('slower')} className="px-2">
                <ZapOff size={16} />
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSetTomorrowHeavy} className="col-span-2 text-sm text-slate-600">
                Amanhã Pesado
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Para Hoje</h2>
          <span className="text-xs md:text-sm font-semibold text-primary-strong bg-primary-soft px-3 py-1.5 rounded-lg">{pendingReviews.length} tarefas</span>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mb-4">
              <CalendarCheck className="w-8 h-8 text-primary-strong" />
            </div>
            <p className="text-base md:text-lg text-slate-600 font-medium">Você está em dia por hoje!</p>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {pendingReviews.map(review => {
              const { content, subject } = getContentDetails(review.contentId);
              if (!content || !subject) return null;
              const isOverdue = review.date < today;

              return (
                <Card key={review.id} className="group p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-slate-400">{subject.name}</span>
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-primary-strong bg-primary-soft px-2 py-0.5 rounded">
                          <AlertCircle size={10} /> Atrasada
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">{content.topic}</h3>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={() => onReviewUpdate(review.id, ReviewStatus.COMPLETED, ReviewFeedback.FORGOT)}>
                      Esqueci
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => onReviewUpdate(review.id, ReviewStatus.COMPLETED, ReviewFeedback.SOMEWHAT)}>
                      Difícil
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1 sm:flex-none" onClick={() => onReviewUpdate(review.id, ReviewStatus.COMPLETED, ReviewFeedback.REMEMBERED)}>
                      Lembrei
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
