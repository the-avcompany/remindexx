
import React, { useState, useMemo } from 'react';
import { Subject, StudyContent, Difficulty, ReviewStatus, Review, RetentionEventType } from '../types';
import { Button, Input, Select, Card, Modal, Badge } from './ui/Components';
import { Plus, Trash2, Folder, Search, ChevronDown, ChevronRight, X, Calendar, AlertCircle, Brain, ThumbsDown, ThumbsUp, Pencil } from 'lucide-react';
import { StorageService, formatDate, addDays, getDaysDiff } from '../services';

interface ContentManagerProps {
  userId: string;
  subjects: Subject[];
  contents: StudyContent[];
  onDataChange: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ userId, subjects, contents, onDataChange }) => {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'overdue'>('all');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<StudyContent | null>(null);

  // Forms
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newContentTopic, setNewContentTopic] = useState('');
  const [newContentSubject, setNewContentSubject] = useState('');
  const [newContentDifficulty, setNewContentDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [newContentDate, setNewContentDate] = useState(new Date().toISOString().split('T')[0]);

  const reviews = StorageService.getReviews(userId);
  const today = formatDate(new Date());

  const getNextReview = (contentId: string) => {
    const pending = reviews
      .filter(r => r.contentId === contentId && r.status === ReviewStatus.PENDING)
      .sort((a, b) => a.date.localeCompare(b.date));
    return pending[0] || null;
  };

  const getRetentionStatus = (contentId: string) => {
    const next = getNextReview(contentId);
    if (!next) return 'Concluído';
    if (next.date < today) return 'Atrasado';
    if (next.date === today) return 'Hoje';
    const diff = getDaysDiff(today, next.date);
    if (diff <= 3) return 'Em breve';
    return 'Em dia';
  };

  const filteredContents = useMemo(() => {
    let filtered = contents.filter(c => c.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'overdue') {
      filtered = filtered.filter(c => {
        const next = getNextReview(c.id);
        return next && next.date < today;
      });
    } else if (filterType === 'upcoming') {
      filtered = filtered.filter(c => {
        const next = getNextReview(c.id);
        return next && next.date >= today && getDaysDiff(today, next.date) <= 3;
      });
    }
    return filtered;
  }, [contents, searchTerm, filterType, reviews, today]);

  const toggleSubject = (id: string) => {
    const newSet = new Set(expandedSubjectIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSubjectIds(newSet);
  };

  const handleAddSubject = () => {
    if (!newSubjectName) return;
    StorageService.addSubject(userId, newSubjectName);
    setNewSubjectName('');
    setIsSubjectModalOpen(false);
    onDataChange();
  };

  const handleAddContent = () => {
    if (!newContentTopic || !newContentSubject) return;
    StorageService.addContentWithReviews(userId, newContentSubject, newContentTopic, newContentDate, Number(newContentDifficulty));
    setNewContentTopic('');
    setNewContentSubject('');
    setIsContentModalOpen(false);
    onDataChange();
  };

  const handleDeleteContent = (id: string) => {
    if (window.confirm('Remover este conteúdo?')) {
      StorageService.deleteContent(id);
      if (selectedContentId === id) setSelectedContentId(null);
      onDataChange();
    }
  };

  const handleDeleteSubject = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Isso apagará todos os conteúdos desta matéria.')) {
      StorageService.deleteSubject(id);
      onDataChange();
    }
  };

  const handleRetentionAdjust = (contentId: string, type: RetentionEventType) => {
    StorageService.adjustSchedule(userId, contentId, type);
    onDataChange();
  };

  const handleMarkReviewDone = (reviewId: string) => {
    StorageService.updateReviewStatus(reviewId, ReviewStatus.COMPLETED);
    onDataChange();
  }

  const renderSubjectList = () => (
    <div className="space-y-4">
      {subjects.map(subject => {
        const subjectContents = filteredContents.filter(c => c.subjectId === subject.id);
        if (filteredContents.length > 0 && subjectContents.length === 0 && searchTerm) return null; 
        
        const isExpanded = expandedSubjectIds.has(subject.id);
        const pendingReviewsCount = reviews.filter(r => 
          subjectContents.some(c => c.id === r.contentId) && r.status === ReviewStatus.PENDING
        ).length;

        return (
          <div key={subject.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              onClick={() => toggleSubject(subject.id)}
              className="flex items-center justify-between p-4 md:p-5 cursor-pointer bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />}
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                   <h3 className="text-base md:text-lg font-bold text-slate-900 truncate">{subject.name}</h3>
                   <span className="text-xs font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-500 shrink-0">
                     {subjectContents.length}
                   </span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                 {pendingReviewsCount > 0 && (
                    <Badge variant="soft" className="hidden sm:inline-flex">{pendingReviewsCount} pendentes</Badge>
                 )}
                 {pendingReviewsCount > 0 && (
                    <div className="w-2 h-2 rounded-full bg-primary sm:hidden"></div>
                 )}
                 <button onClick={(e) => handleDeleteSubject(subject.id, e)} className="p-2 text-slate-300 hover:text-slate-600 rounded-lg">
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {isExpanded && (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {subjectContents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Nenhum conteúdo.</div>
                ) : (
                  subjectContents.map(content => {
                    const status = getRetentionStatus(content.id);
                    const nextReview = getNextReview(content.id);
                    const isSelected = selectedContentId === content.id;

                    return (
                      <div 
                        key={content.id} 
                        onClick={() => setSelectedContentId(content.id)}
                        className={`p-4 md:p-5 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-primary-soft border-l-4 border-l-primary' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                      >
                         <div className="flex-1 min-w-0 pr-2">
                            <h4 className={`font-semibold text-sm md:text-[15px] truncate ${isSelected ? 'text-primary-strong' : 'text-slate-900'}`}>{content.topic}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                               <span className="text-xs text-slate-400 font-medium">Estudado em {new Date(content.dateStudied).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-5 shrink-0">
                            <div className="text-right">
                               <p className={`text-xs font-bold ${status === 'Atrasado' ? 'text-primary-strong' : 'text-slate-600'}`}>{status}</p>
                               {nextReview && <p className="text-[11px] text-slate-400">{new Date(nextReview.date).toLocaleDateString()}</p>}
                            </div>
                         </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderDetailPanel = () => {
    if (!selectedContentId) return null;
    const content = contents.find(c => c.id === selectedContentId);
    if (!content) return null;
    
    const contentReviews = reviews.filter(r => r.contentId === content.id).sort((a, b) => a.date.localeCompare(b.date));
    const pending = contentReviews.filter(r => r.status === ReviewStatus.PENDING);
    const completed = contentReviews.filter(r => r.status === ReviewStatus.COMPLETED);

    return (
      <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl fixed inset-0 z-[60] md:static md:z-0 md:inset-auto md:w-full">
         <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white pt-safe">
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 truncate pr-4">{content.topic}</h2>
             <button onClick={() => setSelectedContentId(null)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg shrink-0">
                <X className="w-6 h-6" />
             </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
             <Card className="p-4 md:p-6 bg-slate-50 border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary-muted" /> Feedback Manual
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={() => handleRetentionAdjust(content.id, 'forgot')} className="h-auto py-3 flex flex-col">
                        <ThumbsDown className="w-5 h-5 mb-1 text-slate-400" /> Esqueci
                    </Button>
                    <Button variant="secondary" onClick={() => handleRetentionAdjust(content.id, 'remembered')} className="h-auto py-3 flex flex-col">
                        <ThumbsUp className="w-5 h-5 mb-1 text-primary" /> Lembrei
                    </Button>
                </div>
             </Card>

             <div>
                <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Cronograma
                </h3>
                <div className="relative border-l-2 border-slate-100 ml-2 space-y-6 pl-8 pb-4">
                    {pending.map(r => (
                        <div key={r.id} className="relative">
                            <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-white border-2 border-primary ring-4 ring-white"></div>
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{new Date(r.date).toLocaleDateString()}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Agendada</p>
                                </div>
                                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleMarkReviewDone(r.id)}>Concluir</Button>
                            </div>
                        </div>
                    ))}
                    {completed.map(r => (
                        <div key={r.id} className="relative opacity-60">
                            <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-slate-200 border-2 border-white ring-4 ring-white"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 line-through decoration-slate-400">{new Date(r.date).toLocaleDateString()}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Concluída</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         </div>

         <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center pb-safe">
             <button type="button" onClick={() => setEditingContent(content)} className="text-xs font-bold text-slate-400 hover:text-primary-strong transition-colors flex items-center gap-1.5 uppercase tracking-wide">
                <Pencil className="w-4 h-4" /> Editar
             </button>
             <button type="button" onClick={() => handleDeleteContent(content.id)} className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-wide">
                Deletar
             </button>
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-100px)]">
        <div className={`flex-1 flex flex-col pr-0 md:pr-6 overflow-hidden ${selectedContentId ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">Gerenciar Conteúdos</h1>
                    <p className="text-slate-500 text-sm md:text-base font-medium mt-1">Organize o que você já estudou.</p>
                </div>
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                    <Button onClick={() => setIsSubjectModalOpen(true)} variant="secondary" className="flex-1 sm:flex-none"><Folder className="w-5 h-5 mr-2" /> Matéria</Button>
                    <Button onClick={() => setIsContentModalOpen(true)} className="flex-1 sm:flex-none"><Plus className="w-5 h-5 mr-2" /> Conteúdo</Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary shadow-sm" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg px-4 py-3 focus:outline-none focus:border-primary cursor-pointer shadow-sm w-full sm:w-auto" value={filterType} onChange={(e: any) => setFilterType(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="upcoming">Próximos</option>
                    <option value="overdue">Atrasados</option>
                </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pb-20 md:pb-0 pr-1">
                {subjects.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Nenhuma matéria cadastrada.</p>
                    </div>
                ) : (
                    renderSubjectList()
                )}
            </div>
        </div>

        {selectedContentId && <div className="hidden md:block w-[400px] xl:w-[450px] shrink-0 h-full">{renderDetailPanel()}</div>}
        {selectedContentId && <div className="md:hidden">{renderDetailPanel()}</div>}

        <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Nova Matéria">
            <div className="space-y-6">
                <Input label="Nome" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
                <Button onClick={handleAddSubject} className="w-full">Salvar</Button>
            </div>
        </Modal>

        <Modal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} title="Registrar Estudo">
            <div className="space-y-6">
                <Select label="Matéria" value={newContentSubject} onChange={e => setNewContentSubject(e.target.value)}>
                    <option value="">Selecione...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <Input label="O que você estudou?" value={newContentTopic} onChange={e => setNewContentTopic(e.target.value)} />
                <Button onClick={handleAddContent} disabled={!newContentSubject || !newContentTopic} className="w-full">Gerar</Button>
            </div>
        </Modal>
    </div>
  );
};
