
import React from 'react';
import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, Settings, LogOut } from 'lucide-react';
import { LogoRemindex } from './ui/LogoRemindex';
import { NavigationParams } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string, params?: NavigationParams) => void;
  onLogout: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 group relative ${
      active 
        ? 'bg-primary/10 text-primary' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
    )}
    <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
    <span className="text-[15px]">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  return (
    <aside className="hidden md:flex w-64 lg:w-72 flex-col bg-white border-r border-slate-200 z-20 shrink-0 h-full transition-all">
      <div className="flex flex-col h-full py-6 px-4">
        <div className="mb-10 px-2 flex items-center gap-3">
          <LogoRemindex variant="full" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="px-4 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu Principal</span>
          </div>
          <NavItem 
            icon={LayoutDashboard} 
            label="Visão Geral" 
            active={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')} 
          />
          <NavItem 
            icon={CalendarIcon} 
            label="Calendário" 
            active={activeTab === 'calendar'} 
            onClick={() => onTabChange('calendar')} 
          />
          <NavItem 
            icon={BookOpen} 
            label="Meus Conteúdos" 
            active={activeTab === 'contents'} 
            onClick={() => onTabChange('contents')} 
          />
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/60 space-y-1">
          <NavItem 
            icon={Settings} 
            label="Configurações" 
            active={activeTab === 'settings'} 
            onClick={() => onTabChange('settings')} 
          />

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
            <span className="text-[15px]">Sair da conta</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
