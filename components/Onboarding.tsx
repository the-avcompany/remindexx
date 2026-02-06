
import React, { useState, useEffect, useRef } from 'react';
import { User, UserSettings, Difficulty, ReviewIntervals, ThemeSettings, StudyStage } from '../types';
import { Button, Input, Card, Badge } from './ui/Components';
import { Check, ChevronRight, ChevronLeft, Upload, ChevronDown, Plus, GraduationCap, School, BookOpen, Lightbulb } from 'lucide-react';
import { StorageService } from '../services';

interface OnboardingProps {
  user: User;
  onComplete: () => void;
  onUpdateTheme: (theme: ThemeSettings) => void;
}

const STANDARD_INTERVALS = [1, 2, 3, 4, 5, 7, 10, 14, 15, 21, 30, 45, 60, 90, 120];

export const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete, onUpdateTheme }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<User>(user);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings(user.id));
  const [activePreset, setActivePreset] = useState<'standard' | 'intense' | 'light' | 'custom'>('standard');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save on step change
  useEffect(() => {
    StorageService.updateUser(formData);
    StorageService.saveSettings(user.id, settings);
  }, [step]); 

  // Step 1: Profile Handlers
  const handleProfileChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfileChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Step 2: Review Handlers
  const handleIntervalChange = (diff: Difficulty, index: number, value: string) => {
    if (value === 'remove') {
      removeInterval(diff, index);
      return;
    }

    const val = parseInt(value);
    if (isNaN(val) || val < 1) return;
    
    const newIntervals = { ...settings.reviewIntervals };
    newIntervals[diff][index] = val;
    newIntervals[diff].sort((a, b) => a - b);
    setSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
    setActivePreset('custom');
  };

  const addInterval = (diff: Difficulty) => {
    const newIntervals = { ...settings.reviewIntervals };
    const lastVal = newIntervals[diff][newIntervals[diff].length - 1] || 1;
    let nextVal = 1;
    // Find next logical standard interval
    for(let std of STANDARD_INTERVALS) {
        if(std > lastVal) {
            nextVal = std;
            break;
        }
    }
    if (nextVal === 1 && lastVal >= Math.max(...STANDARD_INTERVALS)) nextVal = lastVal + 30;

    newIntervals[diff].push(nextVal);
    setSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
    setActivePreset('custom');
  };

  const removeInterval = (diff: Difficulty, index: number) => {
    const newIntervals = { ...settings.reviewIntervals };
    if (newIntervals[diff].length <= 1) return;
    newIntervals[diff].splice(index, 1);
    setSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
    setActivePreset('custom');
  };

  const applyPreset = (type: 'standard' | 'intense' | 'light') => {
    let newIntervals: ReviewIntervals;
    if (type === 'intense') {
      newIntervals = {
        [Difficulty.EASY]: [7, 15, 30],
        [Difficulty.MEDIUM]: [3, 7, 15, 30],
        [Difficulty.HARD]: [1, 3, 7, 15]
      };
    } else if (type === 'light') {
      newIntervals = {
        [Difficulty.EASY]: [30, 90],
        [Difficulty.MEDIUM]: [15, 45, 90],
        [Difficulty.HARD]: [7, 15, 30]
      };
    } else {
      // Standard
       newIntervals = {
        [Difficulty.EASY]: [14, 60],
        [Difficulty.MEDIUM]: [7, 21, 60],
        [Difficulty.HARD]: [2, 7, 15, 30]
      };
    }
    setSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
    setActivePreset(type);
  };

  // Step 3: Theme Handlers
  const handleThemeChange = (name: ThemeSettings['name'], color: string, mode: 'light' | 'dark') => {
    const newTheme = { name, primaryColor: color, mode };
    setSettings(prev => ({ ...prev, theme: newTheme }));
    onUpdateTheme(newTheme);
  };

  const finishOnboarding = () => {
    const finalUser = { ...formData, onboardingCompleted: true };
    StorageService.updateUser(finalUser);
    StorageService.saveSettings(user.id, settings);
    onComplete();
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Vamos criar seu perfil</h2>
        <p className="text-slate-500">Para começar, conte um pouco sobre você.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div 
          onClick={triggerFileUpload}
          className="w-28 h-28 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary-light/20 cursor-pointer overflow-hidden relative transition-colors"
        >
          {formData.photoUrl ? (
            <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <Upload className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-medium">Upload</span>
            </div>
          )}
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <p className="text-xs text-slate-400">Clique na imagem para alterar</p>
      </div>

      <div className="space-y-4">
        <Input 
          label="Seu Nome" 
          value={formData.name} 
          onChange={(e) => handleProfileChange('name', e.target.value)} 
          placeholder="Como quer ser chamado?"
        />

        {/* STUDY STAGE SELECTOR */}
        <div className="space-y-2">
           <label className="block text-sm font-medium text-slate-700">Em que fase dos estudos você está?</label>
           <div className="grid grid-cols-2 gap-2">
              {[
                { id: StudyStage.SCHOOL, label: 'Escola', icon: School },
                { id: StudyStage.CRAM_SCHOOL, label: 'Cursinho', icon: BookOpen },
                { id: StudyStage.SELF_STUDY, label: 'Por conta', icon: Lightbulb },
                { id: StudyStage.UNIVERSITY, label: 'Faculdade', icon: GraduationCap },
              ].map(option => (
                <button
                   key={option.id}
                   onClick={() => handleProfileChange('stage', option.id)}
                   className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                     formData.stage === option.id 
                     ? 'bg-primary-soft border-primary text-primary-strong ring-1 ring-primary' 
                     : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                   }`}
                >
                   <option.icon size={20} className="mb-1" />
                   <span className="text-xs font-semibold">{option.label}</span>
                </button>
              ))}
           </div>
        </div>

        {/* TARGET COURSE (CONDITIONAL TEXT) */}
        {formData.stage && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <Input 
                  label={formData.stage === StudyStage.UNIVERSITY ? "Qual curso você está fazendo?" : "Qual curso você quer passar?"}
                  placeholder={formData.stage === StudyStage.UNIVERSITY ? "Ex: Direito, Engenharia..." : "Ex: Medicina, Arquitetura..."}
                  value={formData.goal || ''} 
                  onChange={(e) => handleProfileChange('goal', e.target.value)}
                />
            </div>
        )}
      </div>

      <Button 
        className="w-full mt-4" 
        onClick={() => setStep(2)}
        disabled={!formData.goal || !formData.stage}
      >
        Continuar <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const getPresetButtonClass = (type: string) => {
    const base = "text-xs px-4 py-1.5 rounded-full border transition-all duration-200 font-medium";
    if (activePreset === type) {
      return `${base} bg-primary text-white border-primary shadow-sm`;
    }
    return `${base} bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300`;
  };

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Personalize suas revisões</h2>
        <p className="text-slate-500">Defina os intervalos (em dias) para cada dificuldade.</p>
      </div>

      <div className="flex justify-center gap-3 mb-4">
         <button onClick={() => applyPreset('light')} className={getPresetButtonClass('light')}>Leve</button>
         <button onClick={() => applyPreset('standard')} className={getPresetButtonClass('standard')}>Padrão</button>
         <button onClick={() => applyPreset('intense')} className={getPresetButtonClass('intense')}>Intenso</button>
      </div>

      <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 pb-2">
        {[
          { label: 'Fácil (Nível 1)', diff: Difficulty.EASY, color: 'green' },
          { label: 'Médio (Nível 2)', diff: Difficulty.MEDIUM, color: 'yellow' },
          { label: 'Difícil (Nível 3)', diff: Difficulty.HARD, color: 'red' },
        ].map((level) => (
          <Card key={level.diff} className="p-5 border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <Badge color={level.color as any}>{level.label}</Badge>
             </div>
             <div className="flex flex-wrap gap-3">
                {settings.reviewIntervals[level.diff].map((days, idx) => (
                  <div key={idx} className="relative">
                    <select 
                      value={days}
                      onChange={(e) => handleIntervalChange(level.diff, idx, e.target.value)}
                      className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm font-semibold transition-all cursor-pointer hover:border-slate-300 min-w-[90px]"
                    >
                      {STANDARD_INTERVALS.map(opt => (
                        <option key={opt} value={opt}>{opt} dias</option>
                      ))}
                      {!STANDARD_INTERVALS.includes(days) && (
                        <option value={days}>{days} dias</option>
                      )}
                      {settings.reviewIntervals[level.diff].length > 1 && (
                        <option value="remove">Remover</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => addInterval(level.diff)} 
                  className="h-[38px] px-3 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium flex items-center gap-1"
                  title="Adicionar intervalo"
                >
                  <Plus className="w-4 h-4" />
                </button>
             </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-2" /> Voltar</Button>
        <Button className="flex-1" onClick={() => setStep(3)}>Continuar <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Escolha seu tema</h2>
        <p className="text-slate-500">Deixe o Remindex com a sua cara.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'green', label: 'Natureza', color: '33 184 146', hex: '#21B892', mode: 'light' },
          { name: 'blue', label: 'Oceano', color: '59 130 246', hex: '#3B82F6', mode: 'light' },
          { name: 'pink', label: 'Berry', color: '236 72 153', hex: '#EC4899', mode: 'light' },
          { name: 'dark', label: 'Dark Mode', color: '33 184 146', hex: '#1F2937', mode: 'dark' },
        ].map((theme) => (
          <button
            key={theme.name}
            onClick={() => handleThemeChange(theme.name as any, theme.color, theme.mode as any)}
            className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              settings.theme.name === theme.name ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div 
              className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-105"
              style={{ backgroundColor: theme.hex }}
            >
              {settings.theme.name === theme.name && <Check className="text-white w-6 h-6" />}
            </div>
            <span className="text-sm font-medium text-slate-700">{theme.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-slate-50 p-4 rounded-lg text-center mt-4 border border-slate-100">
         <span className="text-xs text-slate-400 uppercase tracking-wide">Preview do Botão</span>
         <div className="mt-2">
            <Button>Botão Principal</Button>
         </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-2" /> Voltar</Button>
        <Button className="flex-1" onClick={finishOnboarding}>Finalizar <Check className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-8 px-2">
          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
             <span className={step >= 1 ? 'text-primary' : ''}>Perfil</span>
             <span className={step >= 2 ? 'text-primary' : ''}>Revisões</span>
             <span className={step >= 3 ? 'text-primary' : ''}>Tema</span>
          </div>
        </div>

        <Card className="p-8 shadow-xl border-0">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </Card>
      </div>
    </div>
  );
};
