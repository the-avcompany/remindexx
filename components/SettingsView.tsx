
import React, { useState, useRef } from 'react';
import { User, UserSettings, ThemeSettings, Difficulty, StudyStage } from '../types';
import { Card, Button, Input, Badge, Select } from './ui/Components';
import { User as UserIcon, Palette, Clock, Save, Upload, Check, Plus, AlertCircle, ChevronDown, Trash2, LogOut } from 'lucide-react';
import { StorageService } from '../services';

interface SettingsViewProps {
   user: User;
   settings: UserSettings;
   onUpdateUser: (updatedUser: User) => Promise<void> | void;
   onUpdateSettings: (updatedSettings: UserSettings) => Promise<void> | void;
   onResetData: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, settings, onUpdateUser, onUpdateSettings, onResetData }) => {
   const [name, setName] = useState(user.name);
   const [goal, setGoal] = useState(user.goal || '');
   const [stage, setStage] = useState<StudyStage>(user.stage || StudyStage.COLLEGE);
   const [dailyLimit, setDailyLimit] = useState(settings.dailyLimit);

   const [isSaving, setIsSaving] = useState(false);
   const [saveMessage, setSaveMessage] = useState('');

   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleSaveProfile = async () => {
      setIsSaving(true);
      await onUpdateUser({ ...user, name, goal, stage });
      setSaveMessage('Perfil salvo!');
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
   };

   const handleSaveLimit = async () => {
      await onUpdateSettings({ ...settings, dailyLimit });
   };

   const handleThemeChange = async (theme: ThemeSettings) => {
      await onUpdateSettings({ ...settings, theme });
   };

   const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = async () => {
            await onUpdateUser({ ...user, photoUrl: reader.result as string });
         };
         reader.readAsDataURL(file);
      }
   };

   const handleExport = async () => {
      const data = await StorageService.exportData(user.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remindex-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
   };

   const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && confirm('Isso substituirá seus dados atuais. Continuar?')) {
         const reader = new FileReader();
         reader.onload = async (event) => {
            if (event.target?.result) {
               await StorageService.importData(user.id, event.target.result as string);
               window.location.reload();
            }
         };
         reader.readAsText(file);
      }
   };

   const handleHardReset = async () => {
      if (confirm('Tem certeza absoluta? Isso apagará TUDO e é irreversível.')) {
         await onResetData();
      }
   };

   return (
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
         <header>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações</h1>
            <p className="text-slate-500 mt-1">Personalize sua experiência.</p>
         </header>

         {/* Profile Section */}
         <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-primary-soft rounded-lg text-primary-strong">
                  <UserIcon size={24} />
               </div>
               <h2 className="text-xl font-bold text-slate-900">Perfil</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden ring-4 ring-white shadow-lg relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     {user.photoUrl ? (
                        <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <UserIcon size={32} />
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white w-6 h-6" />
                     </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-primary hover:underline">Alterar Foto</button>
               </div>

               <div className="flex-1 space-y-4 w-full">
                  <Input label="Nome" value={name} onChange={e => setName(e.target.value)} />
                  <Select label="Estágio Atual" value={stage} onChange={e => setStage(e.target.value as StudyStage)}>
                     <option value={StudyStage.HIGH_SCHOOL}>Ensino Médio / Vestibular</option>
                     <option value={StudyStage.COLLEGE}>Faculdade / Graduação</option>
                     <option value={StudyStage.CONTEST}>Concursos</option>
                     <option value={StudyStage.SELF_LEARNING}>Autodidata</option>
                  </Select>
                  <Input label="Objetivo Principal" value={goal} onChange={e => setGoal(e.target.value)} />
                  <div className="flex items-center gap-4 pt-2">
                     <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                     </Button>
                     {saveMessage && <span className="text-green-600 font-bold text-sm animate-in fade-in slide-in-from-left-2 flex items-center gap-1"><Check size={14} /> {saveMessage}</span>}
                  </div>
               </div>
            </div>
         </Card>

         {/* Study Settings */}
         <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-primary-soft rounded-lg text-primary-strong">
                  <Clock size={24} />
               </div>
               <h2 className="text-xl font-bold text-slate-900">Ritmo de Estudo</h2>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Limite Diário de Revisões</label>
                  <div className="flex items-center gap-4">
                     <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(Number(e.target.value))}
                        className="flex-1 accent-primary h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="w-16 h-10 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-700 bg-white">
                        {dailyLimit}
                     </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Aumente para avançar mais rápido, diminua para evitar sobrecarga.</p>
               </div>
               <Button variant="secondary" onClick={handleSaveLimit}>Atualizar Limite</Button>
            </div>
         </Card>

         {/* Appearance */}
         <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-primary-soft rounded-lg text-primary-strong">
                  <Palette size={24} />
               </div>
               <h2 className="text-xl font-bold text-slate-900">Aparência</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                  { id: 'light', label: 'Claro', bg: 'bg-white' },
                  { id: 'dark', label: 'Escuro', bg: 'bg-slate-900' },
                  { id: 'sepia', label: 'Sépia', bg: 'bg-[#f4ebd0]' },
                  { id: 'system', label: 'Sistema', bg: 'bg-slate-200' }
               ].map(theme => (
                  <button
                     key={theme.id}
                     onClick={() => handleThemeChange(theme.id as ThemeSettings)}
                     className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.theme === theme.id ? 'border-primary bg-primary-soft' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                     <div className={`w-8 h-8 rounded-full shadow-sm border border-slate-200 ${theme.bg}`}></div>
                     <span className={`text-sm font-bold ${settings.theme === theme.id ? 'text-primary-strong' : 'text-slate-600'}`}>{theme.label}</span>
                  </button>
               ))}
            </div>
         </Card>

         {/* Data Management */}
         <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-primary-soft rounded-lg text-primary-strong">
                  <Save size={24} />
               </div>
               <h2 className="text-xl font-bold text-slate-900">Gerenciar Dados</h2>
            </div>

            <div className="space-y-4">
               <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="secondary" onClick={handleExport} className="flex-1">
                     <Upload className="mr-2 h-4 w-4" /> Exportar Backup (JSON)
                  </Button>
                  <div className="flex-1 relative">
                     <Button variant="secondary" className="w-full" onClick={() => document.getElementById('import-file')?.click()}>
                        <Save className="mr-2 h-4 w-4" /> Importar Backup
                     </Button>
                     <input id="import-file" type="file" className="hidden" accept=".json" onChange={handleImport} />
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 mt-6">
                  <h3 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-2"><AlertCircle size={16} /> Zona de Perigo</h3>
                  <Button variant="ghost" onClick={handleHardReset} className="w-full border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700">
                     <Trash2 className="mr-2 h-4 w-4" /> Resetar Toda a Conta
                  </Button>
               </div>
            </div>
         </Card>

         <div className="text-center text-xs text-slate-400">
            Remindex v2.1.0 • Build 2024.10
         </div>

      </div>
   );
};
