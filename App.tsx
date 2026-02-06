
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ContentManager } from './components/ContentManager';
import { CalendarView } from './components/CalendarView';
import { RightPanel } from './components/RightPanel';
import { Onboarding } from './components/Onboarding';
import { SettingsView } from './components/SettingsView';
import { StorageService, PlannerService } from './services';
import { AppState, User, ReviewStatus, ReviewFeedback, ThemeSettings, UserSettings, NavigationParams } from './types';
import { Card, Button } from './components/ui/Components';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [data, setData] = useState<Omit<AppState, 'user'>>({
    subjects: [],
    contents: [],
    reviews: [],
    settings: StorageService.getSettings('temp') // Placeholder
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navParams, setNavParams] = useState<NavigationParams | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Apply Theme Function - Monochromatic System
  const applyTheme = (theme: ThemeSettings) => {
    const root = document.documentElement;

    // 1. Set Base Primary
    root.style.setProperty('--color-primary', theme.primaryColor);

    try {
      const [r, g, b] = theme.primaryColor.split(' ').map(Number);

      // 2. Strong: Darker, more saturated (for main buttons)
      // Darken by 15%
      const rS = Math.max(0, r - 40);
      const gS = Math.max(0, g - 40);
      const bS = Math.max(0, b - 40);
      root.style.setProperty('--color-primary-strong', `${rS} ${gS} ${bS}`);

      // 3. Muted: Desaturated or slightly lighter (for icons, secondary accents)
      // Mix with 30% gray
      const rM = Math.round(r * 0.7 + 128 * 0.3);
      const gM = Math.round(g * 0.7 + 128 * 0.3);
      const bM = Math.round(b * 0.7 + 128 * 0.3);
      root.style.setProperty('--color-primary-muted', `${rM} ${gM} ${bM}`);

      // 4. Soft: Very light tint (for backgrounds)
      // Mix with 92% white
      const rL = Math.round(r + (255 - r) * 0.92);
      const gL = Math.round(g + (255 - g) * 0.92);
      const bL = Math.round(b + (255 - b) * 0.92);
      root.style.setProperty('--color-primary-soft', `${rL} ${gL} ${bL}`);

    } catch (e) {
      // Fallback
      root.style.setProperty('--color-primary-strong', theme.primaryColor);
      root.style.setProperty('--color-primary-muted', theme.primaryColor);
      root.style.setProperty('--color-primary-soft', '245 247 250');
    }

    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Initial Data Load
  useEffect(() => {
    const checkUser = async () => {
      // In a real app, check session token. Here just stop loading.
      setLoading(false);
    };
    checkUser();
  }, []);

  const refreshData = () => {
    if (!user) return;
    const settings = StorageService.getSettings(user.id);
    setData({
      subjects: StorageService.getSubjects(user.id),
      contents: StorageService.getContents(user.id),
      reviews: StorageService.getReviews(user.id),
      settings: settings
    });
    applyTheme(settings.theme);
  };

  const handleLogin = async (email: string) => {
    setAuthError('');
    const loggedUser = await StorageService.login(email);
    if (loggedUser) {
      setUser(loggedUser);
      const settings = StorageService.getSettings(loggedUser.id);
      applyTheme(settings.theme);

      setData(prev => ({
        ...prev,
        subjects: StorageService.getSubjects(loggedUser.id),
        contents: StorageService.getContents(loggedUser.id),
        reviews: StorageService.getReviews(loggedUser.id),
        settings: settings
      }));
    } else {
      setAuthError('Conta não encontrada. Verifique o e-mail ou crie uma nova conta abaixo.');
    }
  };

  const handleRegister = async (email: string, name: string) => {
    setAuthError('');
    try {
      const newUser = await StorageService.register(email, name);
      setUser(newUser);
      // New user default theme
      const settings = StorageService.getSettings(newUser.id);
      applyTheme(settings.theme);
      refreshData();
      setActiveTab('settings'); // DIRECT TO SETTINGS
    } catch (e) {
      setAuthError('Este e-mail já está cadastrado. Tente fazer login.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthError('');
    setData({ subjects: [], contents: [], reviews: [], settings: data.settings });
    document.documentElement.classList.remove('dark');
  };

  const handleReviewUpdate = (id: string, status: ReviewStatus, feedback?: ReviewFeedback) => {
    StorageService.updateReviewStatus(id, status, feedback);
    refreshData();
  };

  const handleOnboardingComplete = async () => {
    if (user) {
      const updatedUser = await StorageService.login(user.email);
      if (updatedUser) {
        const finalUser = { ...updatedUser, onboardingCompleted: true };
        if (!updatedUser.onboardingCompleted) {
          StorageService.updateUser(finalUser);
        }
        setUser(finalUser);
        refreshData();
      }
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    StorageService.updateUser(updatedUser);
    setUser(updatedUser);
  };

  const handleUpdateSettings = (updatedSettings: UserSettings) => {
    if (!user) return;
    StorageService.saveSettings(user.id, updatedSettings);
    applyTheme(updatedSettings.theme);
    PlannerService.rebalanceSchedule(user.id);
    setData(prev => ({ ...prev, settings: updatedSettings }));
    refreshData();
  };

  const handleResetData = () => {
    if (confirm("ATENÇÃO: Isso apagará permanentemente todo o seu histórico e progresso. Continuar?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleNavigation = (tab: string, params?: NavigationParams) => {
    setActiveTab(tab);
    setNavParams(params);
    // Clear params after a short delay so effects trigger only once per click
    setTimeout(() => setNavParams(undefined), 500);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-primary font-medium animate-pulse">Carregando Remindex...</div>;

  if (!user) {
    return (
      <Auth
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
        onClearError={() => setAuthError('')}
      />
    );
  }

  if (!user.onboardingCompleted) {
    return (
      <Onboarding
        user={user}
        onComplete={handleOnboardingComplete}
        onUpdateTheme={applyTheme}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            reviews={data.reviews}
            contents={data.contents}
            subjects={data.subjects}
            user={user}
            onReviewUpdate={handleReviewUpdate}
            onDataChange={refreshData}
            onNavigate={handleNavigation}
            navParams={navParams}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            reviews={data.reviews}
            contents={data.contents}
            subjects={data.subjects}
            navParams={navParams}
            onDataChange={refreshData}
          />
        );
      case 'contents':
        return (
          <ContentManager
            userId={user.id}
            subjects={data.subjects}
            contents={data.contents}
            onDataChange={refreshData}
          />
        );
      case 'settings':
        return (
          <SettingsView
            user={user}
            settings={data.settings}
            onUpdateUser={handleUpdateUser}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
          />
        );
      default:
        return <Dashboard reviews={data.reviews} contents={data.contents} subjects={data.subjects} onReviewUpdate={handleReviewUpdate} user={user} onDataChange={refreshData} onNavigate={handleNavigation} navParams={navParams} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleNavigation}
      user={user}
      onLogout={handleLogout}
      rightPanel={
        <RightPanel
          user={user}
          reviews={data.reviews}
          contents={data.contents}
          onDataChange={refreshData}
          onNavigate={handleNavigation}
        />
      }
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
