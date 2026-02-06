
import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, Settings, LogOut, Plus, X, Layers, FileText, User as UserIcon } from 'lucide-react';
import { LogoRemindex } from './ui/LogoRemindex';
import { NavigationParams, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string, params?: NavigationParams) => void;
  user?: User | null;
  onLogout: () => void;
  rightPanel?: React.ReactNode;
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

const MobileNavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
      active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon className={`w-6 h-6 mb-1 ${active ? 'fill-current opacity-20 stroke-2' : ''}`} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout, rightPanel }) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleMobileAction = (action: 'focus_add_content' | 'focus_add_subject') => {
    setIsActionMenuOpen(false);
    onTabChange('dashboard', { action });
  };

  const NavContentDesktop = () => (
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
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden text-base">
      
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      {/* Tablet: Visible. Mobile: Hidden. */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col bg-white border-r border-slate-200 z-20 shrink-0 h-full transition-all">
        <NavContentDesktop />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] relative h-full">
        
        {/* MOBILE TOP BAR */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30 pt-safe">
           <div className="flex items-center gap-2">
            <LogoRemindex variant="text" className="h-6 text-primary-strong" />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
              className="flex items-center gap-2 focus:outline-none p-1 rounded-lg active:bg-slate-50"
            >
              <span className="text-xs font-bold text-slate-700 hidden sm:block truncate max-w-[100px]">
                {user?.name?.split(' ')[0]}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs font-bold">
                    {user?.name?.[0]}
                  </div>
                )}
              </div>
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsUserMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-1">
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); onTabChange('settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Editar Perfil
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da conta
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
           {/* Padding Logic:
               Mobile: Top safe is handled by header. Bottom needs space for nav (pb-24 + safe-bottom).
               Desktop: p-8 or p-12.
           */}
           <div className="max-w-[1400px] mx-auto w-full p-4 pb-28 md:p-6 lg:p-8 xl:p-10">
             {children}
           </div>
        </div>
      </main>

      {/* DESKTOP RIGHT PANEL */}
      {/* Hidden on Mobile & Tablet (< 1280px/xl). Visible only on Desktop XL+. */}
      {rightPanel && (
        <aside className="hidden xl:block w-80 bg-[#F9FAFB] border-l border-slate-200 overflow-y-auto p-6 shrink-0 h-full z-10 transition-all">
          {rightPanel}
        </aside>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40">
        <div className="flex items-center justify-between px-2 h-[60px]">
          <MobileNavItem icon={LayoutDashboard} label="Visão" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
          <MobileNavItem icon={CalendarIcon} label="Calendário" active={activeTab === 'calendar'} onClick={() => onTabChange('calendar')} />
          
          <div className="relative -top-5">
            <button 
              onClick={() => setIsActionMenuOpen(true)}
              className="w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center transform active:scale-95 transition-transform border-4 border-[#F9FAFB]"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>

          <MobileNavItem icon={BookOpen} label="Conteúdos" active={activeTab === 'contents'} onClick={() => onTabChange('contents')} />
          <MobileNavItem icon={Settings} label="Perfil" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
        </div>
      </div>

      {/* ACTION DRAWER */}
      {isActionMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsActionMenuOpen(false)} />
          <div className="relative bg-white w-full rounded-t-2xl shadow-2xl p-6 pb-safe animate-in slide-in-from-bottom duration-300">
             <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Ações Rápidas</h3>
                <button onClick={() => setIsActionMenuOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full"><X size={20} /></button>
             </div>
             <div className="space-y-3">
                <button onClick={() => handleMobileAction('focus_add_content')} className="w-full flex items-center gap-4 p-4 bg-primary text-white rounded-xl shadow-md shadow-primary/20 active:scale-[0.98] transition-transform">
                   <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                   <div className="text-left"><span className="block font-bold text-base">Registrar Conteúdo</span><span className="block text-xs text-white/80 font-medium">O que você estudou hoje?</span></div>
                </button>
                <button onClick={() => handleMobileAction('focus_add_subject')} className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all">
                   <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                   <div className="text-left"><span className="block font-bold text-base">Nova Matéria</span><span className="block text-xs text-slate-500 font-medium">Adicione uma disciplina</span></div>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
