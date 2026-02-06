
import React from 'react';
import { X, FileText, Layers } from 'lucide-react';
import { NavigationParams } from '../types';

interface ActionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onAction: (action: 'focus_add_content' | 'focus_add_subject') => void;
}

export const ActionDrawer: React.FC<ActionDrawerProps> = ({ isOpen, onClose, onAction }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative bg-white w-full rounded-t-2xl shadow-2xl p-6 pb-safe animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Ações Rápidas</h3>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full"><X size={20} /></button>
                </div>
                <div className="space-y-3">
                    <button onClick={() => onAction('focus_add_content')} className="w-full flex items-center gap-4 p-4 bg-primary text-white rounded-xl shadow-md shadow-primary/20 active:scale-[0.98] transition-transform">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                        <div className="text-left"><span className="block font-bold text-base">Registrar Conteúdo</span><span className="block text-xs text-white/80 font-medium">O que você estudou hoje?</span></div>
                    </button>
                    <button onClick={() => onAction('focus_add_subject')} className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                        <div className="text-left"><span className="block font-bold text-base">Nova Matéria</span><span className="block text-xs text-slate-500 font-medium">Adicione uma disciplina</span></div>
                    </button>
                </div>
            </div>
        </div>
    );
};
