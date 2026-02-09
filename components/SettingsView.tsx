
import React from 'react';
import { User, UserSettings } from '../types';
import { Button, Card, Select, Input } from './ui/Components';
import { Monitor, Moon, Sun, Shield, Database, LogOut } from 'lucide-react';

interface SettingsViewProps {
    user: User | null;
    settings: UserSettings;
    onUpdateUser: (user: User) => void;
    onUpdateSettings: (settings: UserSettings) => void;
    onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    user,
    settings,
    onUpdateUser,
    onUpdateSettings,
    onResetData
}) => {

    const handleThemeChange = (color: string) => {
        onUpdateSettings({
            ...settings,
            theme: { ...settings.theme, primaryColor: color }
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações</h1>
                <p className="text-slate-500 text-sm">Personalize sua experiência.</p>
            </div>

            {/* ACCOUNT */}
            <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Conta
                </h3>
                <Card className="p-6 space-y-4">
                    <Input label="Nome" value={user?.name || ''} disabled className="bg-slate-50" />
                    <Input label="Email" value={user?.email || ''} disabled className="bg-slate-50" />
                </Card>
            </section>

            {/* APPEARANCE */}
            <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> Aparência
                </h3>
                <Card className="p-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Cor Principal</label>
                    <div className="flex gap-3">
                        {[
                            { name: 'Emerald', color: '33 184 146', hex: '#21B892' },
                            { name: 'Blue', color: '59 130 246', hex: '#3B82F6' },
                            { name: 'Violet', color: '139 92 246', hex: '#8B5CF6' },
                            { name: 'Rose', color: '244 63 94', hex: '#F43F5E' },
                        ].map(theme => (
                            <button
                                key={theme.name}
                                onClick={() => handleThemeChange(theme.color)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${settings.theme.primaryColor === theme.color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'
                                    }`}
                                style={{ backgroundColor: theme.hex }}
                            />
                        ))}
                    </div>
                </Card>
            </section>

            {/* DATA ZONE */}
            <section>
                <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Zona de Perigo
                </h3>
                <Card className="p-6 border-red-100 bg-red-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-base font-bold text-slate-900">Resetar Dados</h4>
                            <p className="text-sm text-slate-500">Apaga todo o seu histórico local.</p>
                        </div>
                        <Button variant="danger" size="sm" onClick={onResetData}>
                            Apagar Tudo
                        </Button>
                    </div>
                </Card>
            </section>

        </div>
    );
};
