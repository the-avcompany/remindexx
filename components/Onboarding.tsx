
import React, { useState } from 'react';
import { User, StudyStage, ThemeSettings } from '../types';
import { Button, Input, Select, Card } from './ui/Components';
import { ArrowRight, Check, Book } from 'lucide-react';

interface OnboardingProps {
    user: User;
    onComplete: () => void;
    onUpdateTheme: (theme: ThemeSettings) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete, onUpdateTheme }) => {
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState('');
    const [stage, setStage] = useState<StudyStage>(StudyStage.UNIVERSITY);

    const handleNext = () => {
        if (step === 1 && goal) {
            setStep(2);
        } else if (step === 2) {
            // Finalize
            // update user data usually happens in parent, but here we just animate out or call complete
            onComplete();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <Card className="w-full max-w-lg p-8 shadow-xl animate-in fade-in zoom-in-95 duration-500">

                {/* PROGRESS */}
                <div className="flex items-center gap-2 mb-8">
                    <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-100'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-100'}`} />
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Book className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {step === 1 ? 'Qual é o seu objetivo?' : 'Em que fase você está?'}
                    </h1>
                    <p className="text-slate-500">
                        {step === 1
                            ? 'Para personalizarmos a experiência para você.'
                            : 'Isso ajuda a calibrar as sugestões de estudo.'
                        }
                    </p>
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <Input
                            placeholder="Ex: Passar em Medicina, Aprender Inglês..."
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            className="text-lg py-4"
                            autoFocus
                        />
                        <Button onClick={handleNext} disabled={!goal} className="w-full h-12 text-base">
                            Continuar <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { val: StudyStage.SCHOOL, label: 'Escola', desc: 'Ensino Médio/Fund.' },
                                { val: StudyStage.UNIVERSITY, label: 'Faculdade', desc: 'Graduação/Pós' },
                                { val: StudyStage.CRAM_SCHOOL, label: 'Pré-Vestibular', desc: 'Cursinho/Concurso' },
                                { val: StudyStage.SELF_STUDY, label: 'Autodidata', desc: 'Estudos Livres' }
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => setStage(opt.val)}
                                    className={`p-4 rounded-xl border text-left transition-all ${stage === opt.val
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                >
                                    <span className={`block font-bold mb-1 ${stage === opt.val ? 'text-primary-strong' : 'text-slate-700'}`}>
                                        {opt.label}
                                    </span>
                                    <span className="text-xs text-slate-500">{opt.desc}</span>
                                </button>
                            ))}
                        </div>

                        <Button onClick={handleNext} className="w-full h-12 text-base">
                            Concluir Setup <Check className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}

            </Card>
        </div>
    );
};
