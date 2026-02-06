
import React from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';
import { LogoRemindex } from './ui/LogoRemindex';
import { User, NavigationParams } from '../types';

interface NavbarProps {
    user?: User | null;
    onToggleUserMenu: () => void;
    isUserMenuOpen: boolean;
    onLogout: () => void;
    onTabChange: (tab: string, params?: NavigationParams) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onToggleUserMenu, isUserMenuOpen, onLogout, onTabChange }) => {
    return (
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30 pt-safe">
            <div className="flex items-center gap-2">
                <LogoRemindex variant="text" className="h-6 text-primary-strong" />
            </div>

            <div className="relative">
                <button
                    onClick={onToggleUserMenu}
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
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={onToggleUserMenu}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="p-1">
                                <button
                                    onClick={() => { onToggleUserMenu(); onTabChange('settings'); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left"
                                >
                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                    Editar Perfil
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button
                                    onClick={() => { onToggleUserMenu(); onLogout(); }}
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
    );
};
