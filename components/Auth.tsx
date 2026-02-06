
import React, { useState } from 'react';
import { Button, Input } from './ui/Components';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { LogoRemindex } from './ui/LogoRemindex';
import { StorageService } from '../services';

interface AuthProps {
  onLogin: (email: string) => void;
  onRegister: (email: string, name: string) => void;
  error?: string;
  onClearError: () => void;
}

// Google SVG Icon
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 4.63c1.69 0 3.26.58 4.54 1.8l3.4-3.4C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, error, onClearError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email);
    } else {
      onRegister(email, name);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    // Simulate network delay for OAuth
    setTimeout(async () => {
        const mockEmail = 'usuario.google@gmail.com';
        const mockName = 'Usuário Google';
        
        // Check if user exists locally to decide flow
        const existingUser = await StorageService.login(mockEmail);
        
        if (existingUser) {
            onLogin(mockEmail);
        } else {
            onRegister(mockEmail, mockName);
        }
        setIsLoadingGoogle(false);
    }, 1200);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    onClearError();
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE: Branding & Persuasion (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 px-12 py-16 overflow-hidden items-center justify-center">
        
        {/* Abstract Background Image */}
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" 
             alt="Focus Background" 
             className="w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity"
           />
           <div className="absolute inset-0 bg-primary-strong/40 mix-blend-multiply" />
           <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full w-full max-w-lg flex flex-col justify-between">
            <div className="flex-none">
                <LogoRemindex variant="text" className="text-white scale-90 origin-left" />
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-3xl lg:text-4xl font-semibold text-white/95 leading-[1.2] tracking-tight">
                  Estudar não é decorar.<br/>
                  É revisar no tempo certo.
                </h1>
                
                <p className="text-base text-white/80 font-normal leading-relaxed mt-6 max-w-md">
                  O Remindex organiza automaticamente seus estudos para garantir constância e evolução segura.
                </p>
            </div>

            <div className="flex-none text-[11px] text-white/40 font-medium tracking-wide uppercase">
                © Remindex · Todos os direitos reservados
            </div>
        </div>
      </div>

      {/* RIGHT SIDE: Application Form */}
      <div className="flex-1 flex flex-col h-screen relative bg-white">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex-none h-12 bg-primary-strong w-full flex items-center justify-center shadow-sm z-50">
             <span className="text-[15px] font-semibold text-white tracking-tight">Remindex</span>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center w-full overflow-y-auto scroll-smooth py-6">
            
            {/* Form Wrapper (Compact) */}
            <div className="w-full max-w-[420px] px-6 sm:px-8 flex flex-col">
                
                {/* HEADINGS */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {isLogin ? (
                            'Entre para continuar seu progresso.'
                        ) : (
                            'Organize seus estudos com eficiência.'
                        )}
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-start gap-3 animate-in zoom-in-95 shadow-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold">{error}</p>
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Nome Completo</label>
                            <Input 
                                placeholder="Ex: João Silva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-slate-50 border-slate-200 focus:bg-white h-[42px] text-sm py-0 rounded-xl"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email</label>
                        <Input 
                            type="email" 
                            placeholder="nome@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-50 border-slate-200 focus:bg-white h-[42px] text-sm py-0 rounded-xl"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="text-xs font-bold text-slate-700">Senha</label>
                            {isLogin && (
                                <button type="button" tabIndex={-1} className="text-xs font-bold text-primary hover:text-primary-strong transition-colors">
                                    Esqueceu a senha?
                                </button>
                            )}
                        </div>
                        <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-slate-50 border-slate-200 focus:bg-white h-[42px] text-sm py-0 rounded-xl"
                            rightElement={
                                <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-2 mr-0.5"
                                >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        />
                    </div>

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            className="w-full h-[44px] text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all rounded-xl" 
                            size="md"
                        >
                            {isLogin ? 'Entrar na Plataforma' : 'Criar Conta Gratuita'} 
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </form>

                {/* DIVIDER */}
                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-slate-400 font-medium">ou</span>
                    </div>
                </div>

                {/* GOOGLE BUTTON */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoadingGoogle}
                    className="w-full h-[44px] bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 hover:bg-slate-50 active:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isLoadingGoogle ? (
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                        <GoogleIcon />
                    )}
                    <span>Continuar com Google</span>
                </button>

                {/* FOOTER */}
                <div className="mt-6 text-center">
                    <span className="text-slate-500 text-xs">
                        {isLogin ? 'Novo por aqui? ' : 'Já tem cadastro? '}
                    </span>
                    <button 
                        onClick={toggleMode}
                        className="text-xs font-bold text-primary-strong hover:text-primary transition-colors ml-1 hover:underline"
                    >
                        {isLogin ? 'Crie sua conta' : 'Fazer login'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
