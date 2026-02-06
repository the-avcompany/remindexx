
import React, { useState, useEffect, useRef } from 'react';
import { User, UserSettings, Difficulty, ReviewIntervals, ThemeSettings, StudyStage } from '../types';
import { Button, Input, Card, Badge } from './ui/Components';
import { Check, ChevronRight, ChevronLeft, Upload, ChevronDown, Plus, GraduationCap, School, BookOpen, Lightbulb } from 'lucide-react';
import { StorageService } from '../services';

interface OnboardingProps {
  user: User;
  settings: UserSettings;
  onComplete: () => void;
  onUpdateTheme: (theme: ThemeSettings) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ user, settings: initialSettings, onComplete, onUpdateTheme }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.name);
  const [goal, setGoal] = useState(user.goal || '');
  const [localSettings, setLocalSettings] = useState<UserSettings>(initialSettings);
  const [stage, setStage] = useState<StudyStage>(user.stage || StudyStage.COLLEGE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await StorageService.updateUser({ ...user, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    if (key === 'theme') {
      onUpdateTheme(value as ThemeSettings);
    }
  };

  const handleFinish = async () => {
    await StorageService.updateUser({ ...user, name, goal, stage, onboardingCompleted: true });
    await StorageService.saveSettings(user.id, localSettings);
    onComplete();
  };

  const stages = [
    { id: StudyStage.HIGH_SCHOOL, label: 'Ensino Médio / Vestibular', icon: School, desc: 'Foco no ENEM e vestibulares.' },
    { id: StudyStage.COLLEGE, label: 'Faculdade / Graduação', icon: GraduationCap, desc: 'Gestão de semestre e provas.' },
    { id: StudyStage.CONTEST, label: 'Concursos Públicos', icon: BookOpen, desc: 'Longo prazo e editais.' },
    { id: StudyStage.SELF_LEARNING, label: 'Autodidata / Hobby', icon: Lightbulb, desc: 'Libre para aprender.' },
  ];

  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Bem-vindo ao Remindex</h2>
        <p className="text-slate-500">Vamos personalizar sua experiência de aprendizado.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden ring-4 ring-white shadow-lg flex items-center justify-center">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary font-bold text-3xl">
                {name[0]}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-white w-6 h-6" />
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          <p className="text-xs text-slate-400 mt-2 font-medium">Alterar foto</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input label="Como você gostaria de ser chamado?" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Qual seu momento atual?</h2>
        <p className="text-slate-500">Isso ajusta os algoritmos de revisão.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {stages.map(s => {
          const Icon = s.icon;
          const isSelected = stage === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setStage(s.id as StudyStage)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${isSelected ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className={`font-bold ${isSelected ? 'text-primary-strong' : 'text-slate-900'}`}>{s.label}</p>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      <Input label="Objetivo principal (Opcional)" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex: Passar em Medicina, Aprender Inglês..." />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Ritmo de Estudos</h2>
        <p className="text-slate-500">Defina seus limites diários.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Máximo de revisões por dia</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={localSettings.dailyLimit}
              onChange={(e) => updateSetting('dailyLimit', Number(e.target.value))}
              className="flex-1 accent-primary h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-bold text-lg text-primary w-12 text-center">{localSettings.dailyLimit}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Recomendamos entre 30 e 50 para começar.</p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Tudo Pronto!</h2>
        <p className="text-slate-500">Seu sistema de repetição espaçada foi configurado.</p>
      </div>

      <div className="bg-primary-soft/50 p-8 rounded-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
          <Check size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Você está no comando</h3>
        <p className="text-slate-600 text-sm max-w-xs">
          O Remindex vai gerenciar seus agendamentos. Apenas foque em aprender e revisar quando for notificado.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl">
        <div className="p-1.5 bg-slate-100/50 border-b border-slate-100">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1} className={step === 1 ? 'invisible' : ''}>
            Voltar
          </Button>
          <Button onClick={handleNext} className="dark py-2 px-6">
            {step === totalSteps ? 'Começar' : 'Continuar'} <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
