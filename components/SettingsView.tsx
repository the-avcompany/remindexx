
import React, { useState, useRef } from 'react';
import { User, UserSettings, ThemeSettings, Difficulty, StudyStage } from '../types';
import { Card, Button, Input, Badge, Select } from './ui/Components';
import { User as UserIcon, Palette, Clock, Save, Upload, Check, Plus, AlertCircle, ChevronDown, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  settings: UserSettings;
  onUpdateUser: (updatedUser: User) => void;
  onUpdateSettings: (updatedSettings: UserSettings) => void;
  onResetData: () => void;
}

const STANDARD_INTERVALS = [1, 2, 3, 4, 5, 7, 10, 14, 15, 21, 30, 45, 60, 90, 120];

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  user, 
  settings, 
  onUpdateUser, 
  onUpdateSettings,
  onResetData 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const [tempUser, setTempUser] = useState<User>(user);
  const [tempSettings, setTempSettings] = useState<UserSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setTempUser({ ...user });
    setTempSettings(JSON.parse(JSON.stringify(settings))); 
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempUser(user);
    setTempSettings(settings);
  };

  const handleSave = () => {
    onUpdateUser(tempUser);
    onUpdateSettings(tempSettings);
    setIsEditing(false);
    alert('Preferências atualizadas com sucesso!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempUser(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeSelect = (name: ThemeSettings['name'], color: string, mode: 'light' | 'dark') => {
    setTempSettings(prev => ({
      ...prev,
      theme: { name, primaryColor: color, mode }
    }));
  };

  const handleIntervalChange = (diff: Difficulty, index: number, value: string) => {
    if (value === 'remove') {
      const newIntervals = { ...tempSettings.reviewIntervals };
      if (newIntervals[diff].length <= 1) return;
      newIntervals[diff].splice(index, 1);
      setTempSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
      return;
    }
    const val = parseInt(value);
    if (isNaN(val) || val < 1) return;
    const newIntervals = { ...tempSettings.reviewIntervals };
    newIntervals[diff][index] = val;
    newIntervals[diff].sort((a, b) => a - b);
    setTempSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
  };

  const addInterval = (diff: Difficulty) => {
    const newIntervals = { ...tempSettings.reviewIntervals };
    const lastVal = newIntervals[diff][newIntervals[diff].length - 1] || 1;
    let nextVal = lastVal + 7;
    for(let std of STANDARD_INTERVALS) {
        if(std > lastVal) {
            nextVal = std;
            break;
        }
    }
    newIntervals[diff].push(nextVal);
    setTempSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
  };

  const renderProfileSection = () => {
    // Correctly choose which data to display:
    // In edit mode: show the temp state being edited
    // In view mode: show the 'user' prop directly (which comes from App state)
    const displayUser = isEditing ? tempUser : user;
    
    // Map stage value to human readable label
    const stageLabels = {
        [StudyStage.SCHOOL]: 'Escola',
        [StudyStage.CRAM_SCHOOL]: 'Cursinho / Pré-vestibular',
        [StudyStage.SELF_STUDY]: 'Por conta própria',
        [StudyStage.UNIVERSITY]: 'Faculdade / Universidade',
    };

    return (
        <Card className="p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
            <UserIcon className="w-6 h-6 text-primary-muted" />
            <h3 className="text-xl font-bold text-slate-900">Perfil</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex flex-col items-center gap-4">
                <div 
                    className={`w-28 h-28 rounded-full bg-slate-100 overflow-hidden ring-4 ring-white shadow-sm flex items-center justify-center relative ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={() => isEditing && fileInputRef.current?.click()}
                >
                    {displayUser.photoUrl ? (
                    <img src={displayUser.photoUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                    <span className="text-3xl font-bold text-slate-300">{displayUser.name[0]?.toUpperCase()}</span>
                    )}
                    {isEditing && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                        <Upload size={24} />
                    </div>
                    )}
                </div>
                {isEditing && (
                    <button onClick={() => fileInputRef.current?.click()} className="text-sm text-primary-strong font-bold hover:underline">
                    Alterar foto
                    </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!isEditing} />
            </div>

            <div className="flex-1 w-full space-y-6">
                {isEditing ? (
                <>
                    <Input label="Nome Completo" value={tempUser.name} onChange={e => setTempUser({...tempUser, name: e.target.value})} />
                    
                    <Select 
                        label="Fase dos Estudos"
                        value={tempUser.stage || StudyStage.UNIVERSITY} 
                        onChange={e => setTempUser({...tempUser, stage: e.target.value as StudyStage})}
                    >
                        <option value={StudyStage.SCHOOL}>Escola (Fundamental/Médio)</option>
                        <option value={StudyStage.CRAM_SCHOOL}>Cursinho / Pré-vestibular</option>
                        <option value={StudyStage.SELF_STUDY}>Estudando por conta própria</option>
                        <option value={StudyStage.UNIVERSITY}>Faculdade / Universidade</option>
                    </Select>

                    <Input 
                        label={tempUser.stage === StudyStage.UNIVERSITY ? "Curso Atual" : "Curso Desejado"}
                        value={tempUser.goal || ''} 
                        onChange={e => setTempUser({...tempUser, goal: e.target.value})} 
                    />
                </>
                ) : (
                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Nome</p>
                        <p className="text-xl font-medium text-slate-900">{user.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Fase Atual</p>
                        <p className="text-lg text-slate-600">{user.stage ? stageLabels[user.stage] : 'Não informada'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Objetivo / Curso</p>
                        <p className="text-lg text-slate-600">{user.goal || 'Não definido'}</p>
                    </div>
                </div>
                )}
            </div>
        </div>
        </Card>
    );
  };

  const renderThemeSection = () => (
    <Card className="p-8">
       <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
          <Palette className="w-6 h-6 text-primary-muted" />
          <h3 className="text-xl font-bold text-slate-900">Aparência</h3>
       </div>

       {isEditing ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
             {[
                { name: 'green', label: 'Natureza', color: '33 184 146', hex: '#21B892', mode: 'light' },
                { name: 'blue', label: 'Oceano', color: '59 130 246', hex: '#3B82F6', mode: 'light' },
                { name: 'pink', label: 'Berry', color: '219 79 133', hex: '#DB4F85', mode: 'light' },
                { name: 'dark', label: 'Monocromo', color: '71 85 105', hex: '#475569', mode: 'light' },
              ].map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeSelect(theme.name as any, theme.color, theme.mode as any)}
                  className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                    tempSettings.theme.name === theme.name ? 'border-primary bg-primary-soft' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full shadow-sm" style={{ backgroundColor: theme.hex }}></div>
                  <span className="text-sm font-bold text-slate-700">{theme.label}</span>
                  {tempSettings.theme.name === theme.name && <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary"></div>}
                </button>
              ))}
          </div>
       ) : (
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 w-fit">
              <div className="w-8 h-8 rounded-full shadow-sm border border-black/5" style={{ backgroundColor: `rgb(${settings.theme.primaryColor})` }}></div>
              <span className="text-base font-medium capitalize text-slate-700">{settings.theme.name}</span>
          </div>
       )}
    </Card>
  );

  const renderIntervalsSection = () => (
    <Card className="p-8">
       <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
          <Clock className="w-6 h-6 text-primary-muted" />
          <h3 className="text-xl font-bold text-slate-900">Ritmo de Revisão</h3>
       </div>

       {isEditing && (
         <div className="bg-primary-soft text-primary-strong p-4 rounded-xl mb-8 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">Alterar estes intervalos recalculará automaticamente suas revisões futuras.</p>
         </div>
       )}

       <div className="space-y-8">
          {[
             { label: 'Fácil', diff: Difficulty.EASY },
             { label: 'Médio', diff: Difficulty.MEDIUM },
             { label: 'Difícil', diff: Difficulty.HARD },
          ].map((level) => (
             <div key={level.diff}>
                <div className="mb-3">
                   <Badge variant="soft">{level.label}</Badge>
                </div>
                
                {isEditing ? (
                   <div className="flex flex-wrap gap-3">
                      {tempSettings.reviewIntervals[level.diff].map((days, idx) => (
                         <div key={idx} className="relative">
                           <select 
                             value={days}
                             onChange={(e) => handleIntervalChange(level.diff, idx, e.target.value)}
                             className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg text-sm font-semibold focus:outline-none focus:border-primary hover:border-slate-300 cursor-pointer shadow-sm"
                           >
                              {STANDARD_INTERVALS.map(opt => <option key={opt} value={opt}>{opt} dias</option>)}
                              {!STANDARD_INTERVALS.includes(days) && <option value={days}>{days} dias</option>}
                              {tempSettings.reviewIntervals[level.diff].length > 1 && <option value="remove">Remover</option>}
                           </select>
                         </div>
                      ))}
                      <button 
                        onClick={() => addInterval(level.diff)}
                        className="p-2.5 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:text-primary-strong hover:border-primary-strong transition-colors"
                      >
                         <Plus className="w-5 h-5" />
                      </button>
                   </div>
                ) : (
                   <div className="flex gap-3">
                      {settings.reviewIntervals[level.diff].map((days, idx) => (
                         <span key={idx} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium text-slate-600">
                           {days} dias
                         </span>
                      ))}
                   </div>
                )}
             </div>
          ))}
       </div>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center pt-2">
         <div>
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Configurações</h2>
            <p className="text-slate-500 text-lg mt-1">Gerencie seu perfil e preferências.</p>
         </div>
         <div className="flex gap-4">
            {isEditing ? (
               <>
                  <Button variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                  <Button onClick={handleSave}><Save className="w-5 h-5 mr-2" /> Salvar</Button>
               </>
            ) : (
               <Button variant="secondary" onClick={handleStartEdit}>Editar</Button>
            )}
         </div>
      </div>

      {renderProfileSection()}
      {renderThemeSection()}
      {renderIntervalsSection()}

      {!isEditing && (
         <div className="pt-10 border-t border-slate-200 mt-10">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8">
               <h3 className="text-slate-700 font-bold text-lg mb-2">Zona de Perigo</h3>
               <p className="text-base text-slate-500 mb-6">
                  Ações aqui não podem ser desfeitas.
               </p>
               <Button variant="danger" onClick={onResetData}>
                  <Trash2 className="w-5 h-5 mr-2" /> Resetar Dados
               </Button>
            </div>
         </div>
      )}
    </div>
  );
};
