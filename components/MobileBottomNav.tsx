
import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, BookOpen, Settings, Plus } from 'lucide-react';
import { NavigationParams } from '../types';

interface MobileBottomNavProps {
    activeTab: string;
    onTabChange: (tab: string, params?: NavigationParams) => void;
    onOpenActionMenu: () => void;
}

const MobileNavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
    >
        <Icon className={`w-6 h-6 mb-1 ${active ? 'fill-current opacity-20 stroke-2' : ''}`} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange, onOpenActionMenu }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40">
            <div className="flex items-center justify-between px-2 h-[60px]">
                <MobileNavItem icon={LayoutDashboard} label="Visão" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
                <MobileNavItem icon={CalendarIcon} label="Calendário" active={activeTab === 'calendar'} onClick={() => onTabChange('calendar')} />

                <div className="relative -top-5">
                    <button
                        onClick={onOpenActionMenu}
                        className="w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center transform active:scale-95 transition-transform border-4 border-[#F9FAFB]"
                    >
                        <Plus className="w-8 h-8" />
                    </button>
                </div>

                <MobileNavItem icon={BookOpen} label="Conteúdos" active={activeTab === 'contents'} onClick={() => onTabChange('contents')} />
                <MobileNavItem icon={Settings} label="Perfil" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
            </div>
        </div>
    );
};
