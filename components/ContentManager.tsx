
import React, { useState } from 'react';
import { StudyContent, Subject, NavigationParams, Difficulty } from '../types';
import { Card, Button, Input, Select, Badge, Modal } from './ui/Components';
import { Plus, Trash2, Edit2, Search, Filter, BookOpen } from 'lucide-react';
import { StorageService } from '../services';

interface ContentManagerProps {
    userId: string;
    subjects: Subject[];
    contents: StudyContent[];
    onDataChange: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({
    userId,
    subjects,
    contents,
    onDataChange
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

    // Form States
    const [topic, setTopic] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

    const [newSubjectName, setNewSubjectName] = useState('');

    const handleAddContent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic || !selectedSubject) return;

        const today = new Date().toISOString().split('T')[0];
        StorageService.addContentWithReviews(userId, selectedSubject, topic, today, difficulty);

        setTopic('');
        onDataChange();
        setIsAddModalOpen(false);
    };

    const handleAddSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName) return;

        StorageService.addSubject(userId, newSubjectName);
        setNewSubjectName('');
        onDataChange();
        setIsSubjectModalOpen(false);
    };

    const handleDeleteContent = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este conteúdo? O histórico de revisões também será apagado.')) {
            StorageService.deleteContent(id);
            onDataChange();
        }
    };

    const handleDeleteSubject = (id: string) => {
        if (confirm('ATENÇÃO: Excluir a matéria apagará TODOS os conteúdos e revisões associados. Continuar?')) {
            StorageService.deleteSubject(id);
            onDataChange();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meus Conteúdos</h1>
                    <p className="text-slate-500 text-sm">Gerencie o que você estuda.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="secondary" onClick={() => setIsSubjectModalOpen(true)} className="flex-1 sm:flex-none">
                        Nova Matéria
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Conteúdo
                    </Button>
                </div>
            </div>

            {/* SUBJECTS LIST (Horizontal Scroll) */}
            {subjects.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {subjects.map(subject => (
                        <div key={subject.id} className="flex-none group relative">
                            <Badge variant="soft" className="px-3 py-1.5 text-sm flex items-center gap-2 pr-8" style={{ color: subject.color, backgroundColor: `${subject.color}15`, borderColor: `${subject.color}30` }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                                {subject.name}
                            </Badge>
                            <button
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* CONTENTS LIST */}
            {contents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Sua biblioteca está vazia</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 mb-6">
                        Comece adicionando as matérias que você estuda e registre os tópicos.
                    </p>
                    <Button onClick={() => setIsSubjectModalOpen(true)}>
                        Começar Agora
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {contents.slice().reverse().map(content => {
                        const subject = subjects.find(s => s.id === content.subjectId);
                        return (
                            <Card key={content.id} className="p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex w-12 h-12 rounded-xl items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: subject?.color || '#94a3b8' }}>
                                        {subject?.name[0]}
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-0.5">{content.topic}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px]">{subject?.name}</Badge>
                                            <span className="text-[10px] text-slate-400">
                                                Registrado em {new Date(content.dateStudied).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500" onClick={() => handleDeleteContent(content.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* MODALS */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Novo Conteúdo">
                <form onSubmit={handleAddContent} className="space-y-4">
                    <Select
                        label="Matéria"
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        required
                    >
                        <option value="">Selecione uma matéria...</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>

                    <Input
                        label="O que você estudou?"
                        placeholder="Ex: Revolução Francesa, Equação do 2º Grau..."
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Dificuldade</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setDifficulty(Difficulty.EASY)}
                                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${difficulty === Difficulty.EASY ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                Fácil
                            </button>
                            <button
                                type="button"
                                onClick={() => setDifficulty(Difficulty.MEDIUM)}
                                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${difficulty === Difficulty.MEDIUM ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                Médio
                            </button>
                            <button
                                type="button"
                                onClick={() => setDifficulty(Difficulty.HARD)}
                                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${difficulty === Difficulty.HARD ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                Difícil
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full">Salvar Conteúdo</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Nova Matéria">
                <form onSubmit={handleAddSubject} className="space-y-4">
                    <Input
                        label="Nome da Matéria"
                        placeholder="Ex: História, Matemática, Anatomia..."
                        value={newSubjectName}
                        onChange={e => setNewSubjectName(e.target.value)}
                        required
                        autoFocus
                    />
                    <div className="pt-2">
                        <Button type="submit" className="w-full">Criar Matéria</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};
