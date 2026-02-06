
import { StudyContent, Review, Difficulty, ReviewStatus, Subject, User, UserSettings, ReviewIntervals, PaceMode, DayException, RetentionEventType, RetentionEvent, StudyStage, ReviewFeedback, SuggestedAction } from './types';
import { Network, Component, Scale, LayoutGrid, Sparkles, Layers, BookOpen, Calendar as CalendarIcon, FastForward, CheckCircle2 } from 'lucide-react';
import { supabase } from './utils/supabaseClient';

// --- Utils ---

export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days + 1); // fix timezone offset loosely
  return date.toISOString().split('T')[0];
};

export const getDayOfWeek = (dateStr: string): number => {
  // 0 = Sun, 6 = Sat
  // Fix timezone issue by treating string as local noon
  const parts = dateStr.split('-');
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
  return date.getDay();
};

export const getDaysDiff = (start: string, end: string): number => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- Defaults ---

const DEFAULT_INTERVALS: ReviewIntervals = {
  [Difficulty.EASY]: [14, 60],
  [Difficulty.MEDIUM]: [7, 21, 60],
  [Difficulty.HARD]: [2, 7, 15, 30]
};

const DEFAULT_THEME = {
  name: 'green' as const,
  primaryColor: '33 184 146',
  mode: 'light' as const
};

const DEFAULT_CHECKLIST = {
  hasSubjects: false,
  hasContents: false,
  checkedCalendar: false,
  adjustedCapacity: false
};

const DEFAULT_SETTINGS: UserSettings = {
  dailyLimit: 5,
  reviewIntervals: DEFAULT_INTERVALS,
  theme: DEFAULT_THEME,
  setupCompleted: false,
  paceMode: 'normal',
  heavyDays: [],
  checklist: DEFAULT_CHECKLIST
};

// --- Helper: Subject Suggestions ---

export const SubjectSuggestions = {
  getSuggestions: (goal: string = '', stage: StudyStage = StudyStage.COLLEGE): string[] => {
    const text = goal.toLowerCase();

    // 1. NON-UNIVERSITY STAGE (School, Cram School, Self-study)
    // Suggest generic High School / Entrance Exam subjects
    if (stage !== StudyStage.COLLEGE) {
      const baseSubjects = ['Matemática', 'Português', 'Redação', 'História', 'Geografia', 'Física', 'Química', 'Biologia', 'Filosofia', 'Inglês'];

      // We can create slight bias based on goal, but keep it high-school level
      if (text.includes('med') || text.includes('saúde')) {
        return ['Biologia', 'Química', 'Física', 'Redação', 'Matemática', 'Português'];
      }
      if (text.includes('eng') || text.includes('exata')) {
        return ['Matemática', 'Física', 'Química', 'Redação', 'Português'];
      }
      if (text.includes('dir') || text.includes('human')) {
        return ['História', 'Geografia', 'Português', 'Redação', 'Filosofia', 'Sociologia'];
      }

      return baseSubjects;
    }

    // 2. UNIVERSITY STAGE
    // Suggest Academic/Professional subjects
    if (text.includes('med') || text.includes('saúde') || text.includes('bio')) {
      return ['Anatomia', 'Fisiologia', 'Histologia', 'Patologia', 'Farmacologia', 'Bioquímica'];
    }
    if (text.includes('eng') || text.includes('exata') || text.includes('comput')) {
      return ['Cálculo', 'Física Geral', 'Álgebra Linear', 'Algoritmos', 'Resistência dos Materiais'];
    }
    if (text.includes('dir') || text.includes('oab') || text.includes('lei')) {
      return ['Dir. Constitucional', 'Dir. Administrativo', 'Dir. Penal', 'Dir. Civil', 'Processo Civil'];
    }
    if (text.includes('adm') || text.includes('gest') || text.includes('neg')) {
      return ['Teoria Geral da Adm', 'Contabilidade', 'Marketing', 'Finanças', 'Gestão de Pessoas'];
    }
    if (text.includes('ing') || text.includes('idioma')) {
      return ['Gramática Avançada', 'Vocabulário', 'Listening', 'Reading', 'Speaking'];
    }

    // Default University fallback
    return ['Matéria Teórica', 'Matéria Prática', 'Projeto', 'TCC', 'Estágio'];
  }
};

// --- Contextual Service (Visuals/Text) ---

export const ContextService = {
  getContext: (goal: string = '') => {
    const text = goal.toLowerCase();

    // 1. Medicine / Health
    if (text.includes('med') || text.includes('saúde') || text.includes('bio')) {
      return {
        type: 'med',
        identity: {
          title: 'Mentalidade Clínica',
          text: 'Constância hoje constrói segurança amanhã.',
          icon: Network // Abstract organic connection
        },
        microcopy: [
          'Disciplina constrói confiança.',
          'Base sólida é parte do cuidado.',
          'Cada detalhe importa.'
        ],
        riskText: 'Atrasos acumulados enfraquecem a base de longo prazo.',
        visual: 'organic' // Rounded, soft
      };
    }

    // 2. Engineering / Exact Sciences
    if (text.includes('eng') || text.includes('exata') || text.includes('comput') || text.includes('tec')) {
      return {
        type: 'eng',
        identity: {
          title: 'Pensamento Estruturado',
          text: 'Fundamentos bem revisados evitam retrabalho.',
          icon: Component // Abstract structure/parts
        },
        microcopy: [
          'Precisão nasce da repetição.',
          'Estrutura gera eficiência.',
          'Otimize seu processo.'
        ],
        riskText: 'Pendências podem gerar impacto nos próximos temas.',
        visual: 'geometric' // Hexagons, sharp angles
      };
    }

    // 3. Law / Humanities
    if (text.includes('dir') || text.includes('oab') || text.includes('lei') || text.includes('jur')) {
      return {
        type: 'law',
        identity: {
          title: 'Raciocínio Jurídico',
          text: 'Clareza vem da revisão contínua.',
          icon: Scale // Balance
        },
        microcopy: [
          'Revisar é interpretar melhor.',
          'Consistência fortalece argumentos.',
          'Fundamente seu conhecimento.'
        ],
        riskText: 'Acúmulos dificultam a consolidação do raciocínio.',
        visual: 'balanced' // Columns, lines
      };
    }

    // 4. Administration / Business
    if (text.includes('adm') || text.includes('gest') || text.includes('neg') || text.includes('econ')) {
      return {
        type: 'adm',
        identity: {
          title: 'Visão Estratégica',
          text: 'Organização gera decisões melhores.',
          icon: LayoutGrid // Blocks/Organization
        },
        microcopy: [
          'Controle gera clareza.',
          'Boa gestão começa com organização.',
          'Planejamento é resultado.'
        ],
        riskText: 'Falta de revisão prejudica a visão geral.',
        visual: 'structured' // Grid, blocks
      };
    }

    // Fallback
    return {
      type: 'general',
      identity: {
        title: 'Jornada de Aprendizado',
        text: 'Progresso real vem da constância.',
        icon: Sparkles
      },
      microcopy: [
        'A constância vence a intensidade.',
        'Um passo de cada vez.',
        'Seu eu do futuro agradece.'
      ],
      riskText: 'Acúmulos podem desmotivar. Tente manter o ritmo.',
      visual: 'minimal'
    };
  }
};

// --- Storage Service (Refactored for Supabase) ---

export const StorageService = {
  // Auth (Handled by Auth.tsx mostly, but helper here)
  // Auth
  login: async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) return StorageService.getCurrentUser();
    return null;
  },

  register: async (email: string, password: string, name: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) throw error;

    // We need to wait for the trigger or create profile manually if trigger fails/is slow
    // For now assuming trigger works. Return user info.
    if (data.user) {
      // Create profile explicitly (optional, if trigger exists)
      // But let's verify if profile exists or wait for it?
      // Optimistic return:
      return {
        id: data.user.id,
        email: data.user.email!,
        name,
        onboardingCompleted: false
      };
    }
    return null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email!,
      name: profile.name,
      photoUrl: profile.photo_url,
      goal: profile.goal,
      stage: profile.stage,
      onboardingCompleted: profile.onboarding_completed
    };
  },

  updateUser: async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        photo_url: user.photoUrl,
        goal: user.goal,
        stage: user.stage,
        onboarding_completed: user.onboardingCompleted
      })
      .eq('id', user.id);

    if (error) console.error('Error updating user:', error);
  },

  // Data Management
  exportData: async (userId: string): Promise<string> => {
    const [settings, subjects, contents, reviews] = await Promise.all([
      StorageService.getSettings(userId),
      StorageService.getSubjects(userId),
      StorageService.getContents(userId),
      StorageService.getReviews(userId)
    ]);
    return JSON.stringify({ settings, subjects, contents, reviews }, null, 2);
  },

  importData: async (userId: string, json: string) => {
    try {
      const data = JSON.parse(json);
      // This is a complex operation in Supabase because of IDs and Keys.
      // For now, simpler implementation: Update settings and Add subjects/contents if not exist.
      // Full restore is risky without cleaning first.

      if (data.settings) await StorageService.saveSettings(userId, data.settings);

      // Implementation of full import is complex and might time out on serverless defaults if large.
      // Leaving simplified for safety.
      console.log("Importing data...", data);
    } catch (e) {
      console.error("Import failed", e);
    }
  },

  // Settings
  getSettings: async (userId: string): Promise<UserSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return DEFAULT_SETTINGS;

    return {
      dailyLimit: data.daily_limit ?? DEFAULT_SETTINGS.dailyLimit,
      reviewIntervals: data.review_intervals ?? DEFAULT_SETTINGS.reviewIntervals,
      theme: data.theme ?? DEFAULT_SETTINGS.theme,
      setupCompleted: data.setup_completed ?? DEFAULT_SETTINGS.setupCompleted,
      paceMode: data.pace_mode ?? DEFAULT_SETTINGS.paceMode,
      heavyDays: data.heavy_days ?? DEFAULT_SETTINGS.heavyDays,
      checklist: { ...DEFAULT_CHECKLIST, ...(data.checklist || {}) }
    };
  },

  saveSettings: async (userId: string, settings: UserSettings) => {
    await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        daily_limit: settings.dailyLimit,
        review_intervals: settings.reviewIntervals,
        theme: settings.theme,
        setup_completed: settings.setupCompleted,
        pace_mode: settings.paceMode,
        heavy_days: settings.heavyDays,
        checklist: settings.checklist,
        updated_at: new Date().toISOString()
      });
  },

  updateChecklist: async (userId: string, key: keyof import('./types').UserChecklist) => {
    // 1. Get current settings
    const settings = await StorageService.getSettings(userId);
    // 2. Check if already true
    if (!settings.checklist[key]) {
      settings.checklist[key] = true;
      await StorageService.saveSettings(userId, settings);
    }
  },

  // Subjects
  getSubjects: async (userId: string): Promise<Subject[]> => {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  },

  addSubject: async (userId: string, name: string): Promise<Subject> => {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: userId,
        name,
        color: '#21B892'
      })
      .select()
      .single();

    if (error) throw error;
    await StorageService.updateChecklist(userId, 'hasSubjects');
    return data;
  },

  deleteSubject: async (subjectId: string) => {
    // Cascading delete handles related contents and reviews in Supabase
    await supabase.from('subjects').delete().eq('id', subjectId);
  },

  // Contents & Reviews
  getContents: async (userId: string): Promise<StudyContent[]> => {
    const { data } = await supabase
      .from('contents')
      .select('*')
      .eq('user_id', userId);

    // Map keys from snake_case to camelCase
    return (data || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      subjectId: c.subject_id,
      topic: c.topic,
      dateStudied: c.date_studied,
      difficulty: c.difficulty
    }));
  },

  getReviews: async (userId: string): Promise<Review[]> => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId);

    return (data || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      contentId: r.content_id,
      date: r.date,
      status: r.status,
      feedback: r.feedback,
      windowStart: r.window_start,
      windowEnd: r.window_end,
      effort: r.effort,
      originalDate: r.original_date
    }));
  },

  addContentWithReviews: async (userId: string, subjectId: string, topic: string, dateStudied: string, difficulty: Difficulty) => {
    // 1. Insert Content
    const { data: content, error } = await supabase
      .from('contents')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        topic,
        date_studied: dateStudied,
        difficulty
      })
      .select()
      .single();

    if (error || !content) throw error;

    const userSettings = await StorageService.getSettings(userId);
    const contentId = content.id;

    // COST LOGIC
    const effortMap = { [Difficulty.EASY]: 1.0, [Difficulty.MEDIUM]: 1.3, [Difficulty.HARD]: 1.7 };
    const effort = effortMap[difficulty];
    const schedule = SchedulerService.calculateSchedule(difficulty, userSettings.reviewIntervals);

    const newReviews = schedule.map(days => {
      const targetDate = addDays(dateStudied, days);
      return {
        user_id: userId,
        content_id: contentId,
        date: targetDate,
        status: ReviewStatus.PENDING,
        window_start: addDays(targetDate, -1),
        window_end: addDays(targetDate, 2),
        effort: effort,
        original_date: targetDate
      };
    });

    await supabase.from('reviews').insert(newReviews);
    await StorageService.updateChecklist(userId, 'hasContents');
    await PlannerService.rebalanceSchedule(userId);
  },

  updateContent: async (userId: string, contentId: string, updates: Partial<StudyContent>) => {
    // 1. Fetch current content to compare
    const { data: oldContent } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single();

    if (!oldContent) return;

    // 2. Update Content
    const dbUpdates: any = {};
    if (updates.topic) dbUpdates.topic = updates.topic;
    if (updates.dateStudied) dbUpdates.date_studied = updates.dateStudied;
    if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;

    await supabase.from('contents').update(dbUpdates).eq('id', contentId);

    const difficultyChanged = updates.difficulty && updates.difficulty !== oldContent.difficulty;
    const dateChanged = updates.dateStudied && updates.dateStudied !== oldContent.date_studied;

    if (difficultyChanged || dateChanged) {
      // Remove pending reviews
      await supabase
        .from('reviews')
        .delete()
        .eq('content_id', contentId)
        .eq('status', ReviewStatus.PENDING);

      const newDifficulty = updates.difficulty || oldContent.difficulty;
      const newDateStudied = updates.dateStudied || oldContent.date_studied;

      const userSettings = await StorageService.getSettings(userId);
      const schedule = SchedulerService.calculateSchedule(newDifficulty, userSettings.reviewIntervals);
      const effortMap = { [Difficulty.EASY]: 1.0, [Difficulty.MEDIUM]: 1.3, [Difficulty.HARD]: 1.7 };
      const effort = effortMap[newDifficulty];
      const today = formatDate(new Date());

      const newReviews = schedule.map(days => {
        const targetDate = addDays(newDateStudied, days);
        return {
          user_id: userId,
          content_id: contentId,
          date: targetDate,
          status: ReviewStatus.PENDING,
          window_start: addDays(targetDate, -1),
          window_end: addDays(targetDate, 2),
          effort: effort,
          original_date: targetDate
        };
      }).filter(r => r.date >= today); // Only future/today

      if (newReviews.length === 0) {
        const fallbackDate = addDays(today, 1);
        newReviews.push({
          user_id: userId,
          content_id: contentId,
          date: fallbackDate,
          status: ReviewStatus.PENDING,
          window_start: today,
          window_end: addDays(fallbackDate, 2),
          effort: effort,
          original_date: fallbackDate
        });
      }
      await supabase.from('reviews').insert(newReviews);
    }
    await PlannerService.rebalanceSchedule(userId);
  },

  updateReviewStatus: async (reviewId: string, status: ReviewStatus, feedback?: any) => {
    const updates: any = { status };
    if (feedback) updates.feedback = feedback;

    await supabase.from('reviews').update(updates).eq('id', reviewId);
  },

  deleteContent: async (contentId: string) => {
    await supabase.from('contents').delete().eq('id', contentId);
  },

  adjustSchedule: async (userId: string, contentId: string, type: RetentionEventType, reviewId?: string) => {
    const today = formatDate(new Date());
    const tomorrow = addDays(today, 1);

    // 1. Mark review as done
    if (reviewId) {
      await StorageService.updateReviewStatus(
        reviewId,
        ReviewStatus.COMPLETED,
        type === 'forgot' ? ReviewFeedback.FORGOT : ReviewFeedback.REMEMBERED
      );
    }

    // 2. Log Retention Event
    await supabase.from('retention_events').insert({
      user_id: userId,
      content_id: contentId,
      type
    });

    // 3. Get pending reviews
    const { data: pendingReviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('content_id', contentId)
      .eq('status', ReviewStatus.PENDING)
      .order('date', { ascending: true });

    if (!pendingReviews) return;

    if (type === 'forgot') {
      const hasImmediate = pendingReviews.some(r => r.date <= tomorrow);
      if (!hasImmediate) {
        const effort = 1.7;
        await supabase.from('reviews').insert({
          user_id: userId,
          content_id: contentId,
          date: tomorrow,
          status: ReviewStatus.PENDING,
          window_start: today,
          window_end: addDays(tomorrow, 1),
          effort,
          original_date: tomorrow
        });
      }
    } else if (type === 'remembered') {
      // Update logic loop
      for (const r of pendingReviews) {
        const diff = getDaysDiff(today, r.date);
        const addedBuffer = Math.max(2, Math.ceil(diff * 0.2));
        const newDate = addDays(r.date, addedBuffer);

        await supabase.from('reviews').update({
          date: newDate,
          original_date: newDate,
          window_start: addDays(newDate, -1),
          window_end: addDays(newDate, 3)
        }).eq('id', r.id);
      }
    }

    // 3. Rebalance everything
    await PlannerService.rebalanceSchedule(userId);
  },

  getExceptions: async (userId: string): Promise<DayException[]> => {
    const { data } = await supabase
      .from('exceptions')
      .select('*')
      .eq('user_id', userId);

    return (data || []).map(e => ({
      id: e.id,
      userId: e.user_id,
      date: e.date,
      type: e.type as any,
      capacityMultiplier: e.capacity_multiplier
    }));
  },

  addException: async (exception: DayException) => {
    // Remove existing for that day to avoid dupes logic (naive)
    await supabase
      .from('exceptions')
      .delete()
      .eq('user_id', exception.userId)
      .eq('date', exception.date);

    await supabase.from('exceptions').insert({
      user_id: exception.userId,
      date: exception.date,
      type: exception.type,
      capacity_multiplier: exception.capacityMultiplier
    });
  },

  saveReviewsBulk: async (reviews: Review[]) => {
    // Supabase upsert requires mapping back to DB col names
    const dbReviews = reviews.map(r => ({
      id: r.id,
      user_id: r.userId,
      content_id: r.contentId,
      date: r.date,
      status: r.status,
      feedback: r.feedback,
      window_start: r.windowStart,
      window_end: r.windowEnd,
      effort: r.effort,
      original_date: r.originalDate,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('reviews').upsert(dbReviews);
    if (error) console.error("Error bulk saving:", error);
  }
};

export const SchedulerService = {
  calculateSchedule: (difficulty: Difficulty, intervals: ReviewIntervals): number[] => {
    return intervals[difficulty] || [1, 7];
  }
};

export const SuggestionService = {
  getNextAction: async (userId: string): Promise<SuggestedAction> => {
    const subjects = await StorageService.getSubjects(userId);
    const contents = await StorageService.getContents(userId);
    const reviews = await StorageService.getReviews(userId);
    const today = formatDate(new Date());
    const tomorrow = addDays(today, 1);

    const pendingToday = reviews.filter(r => r.status === ReviewStatus.PENDING && r.date <= today).length;
    const tomorrowCount = reviews.filter(r => r.status === ReviewStatus.PENDING && r.date === tomorrow).length;

    if (subjects.length === 0) {
      return {
        key: 'add_subject',
        headline: 'Cadastre sua primeira matéria',
        subtext: 'Isso organiza seus conteúdos e revisões automaticamente.',
        cta: 'Adicionar matéria',
        icon: Layers,
        route: 'dashboard',
        navParams: { action: 'focus_add_subject' },
        priority: 1
      };
    }

    if (contents.length === 0) {
      return {
        key: 'add_content',
        headline: 'Registre seu primeiro conteúdo',
        subtext: 'Diga o que estudou hoje e a dificuldade.',
        cta: 'Registrar conteúdo',
        icon: BookOpen,
        route: 'dashboard',
        navParams: { action: 'focus_add_content' },
        priority: 2
      };
    }

    if (pendingToday > 0) {
      return {
        key: 'do_reviews',
        headline: 'Revisões pendentes para hoje',
        subtext: `Você tem ${pendingToday} revisão(ões) para concluir agora.`,
        cta: 'Ver revisões de hoje',
        icon: CalendarIcon,
        route: 'calendar',
        navParams: { action: 'open_day', date: today },
        priority: 3
      };
    }

    if (tomorrowCount > 7) {
      return {
        key: 'plan_tomorrow',
        headline: 'Amanhã está pesado',
        subtext: `Você tem ${tomorrowCount} revisões agendadas.`,
        cta: 'Ajustar carga',
        icon: FastForward,
        route: 'calendar',
        navParams: { action: 'open_day', date: tomorrow },
        priority: 4
      };
    }

    return {
      key: 'all_good',
      headline: 'Tudo em dia ✅',
      subtext: 'Quer adiantar algo ou reforçar um tema?',
      cta: 'Adicionar conteúdo',
      icon: CheckCircle2,
      route: 'dashboard',
      navParams: { action: 'focus_add_content' },
      priority: 99
    };
  }
};

export const PlannerService = {
  getDailyCapacity: (dateStr: string, settings: UserSettings, exceptions: DayException[]): number => {
    const base = settings.dailyLimit;
    const dayOfWeek = getDayOfWeek(dateStr);

    let multiplier = 1.0;
    if (settings.heavyDays.includes(dayOfWeek)) {
      multiplier *= 0.6;
    }

    if (settings.paceMode === 'faster') multiplier *= 1.2;
    if (settings.paceMode === 'slower') multiplier *= 0.8;

    const exception = exceptions.find(e => e.date === dateStr);
    if (exception) {
      multiplier *= exception.capacityMultiplier;
    }

    return Math.max(0, base * multiplier);
  },

  rebalanceSchedule: async (userId: string, horizonDays: number = 14) => {
    const settings = await StorageService.getSettings(userId);
    const exceptions = await StorageService.getExceptions(userId);

    const { data: pendingReviewsDB } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('status', ReviewStatus.PENDING);

    if (!pendingReviewsDB || pendingReviewsDB.length === 0) return;

    // Convert back to frontend model (CamelCase)
    const pendingReviews: Review[] = pendingReviewsDB.map(r => ({
      id: r.id,
      userId: r.user_id,
      contentId: r.content_id,
      date: r.date,
      status: r.status,
      feedback: r.feedback,
      windowStart: r.window_start,
      windowEnd: r.window_end,
      effort: r.effort,
      originalDate: r.original_date
    }));

    const today = formatDate(new Date());

    const scoredReviews = pendingReviews.map(r => {
      const overdueDays = Math.max(0, getDaysDiff(r.windowEnd, today));
      const daysUntilDue = getDaysDiff(today, r.date);

      let score = 0;
      score += overdueDays * 100;
      score += (r.effort * 10);
      if (daysUntilDue <= 0) score += 50;

      return { review: r, score };
    });

    scoredReviews.sort((a, b) => b.score - a.score);

    const dailyLoad: Record<string, number> = {};
    const getLoad = (d: string) => dailyLoad[d] || 0;
    const addLoad = (d: string, effort: number) => dailyLoad[d] = (dailyLoad[d] || 0) + effort;

    // Pre-calculate existing load from non-pending items if needed? 
    // For now assuming rebalancer owns the future pending state.

    const updatedReviews: Review[] = [];
    const queue = scoredReviews.map(sr => sr.review);

    for (const r of queue) {
      let bestDate = r.date;
      let placed = false;

      const effectiveWindowStart = r.windowStart < today ? today : r.windowStart;
      const effectiveWindowEnd = r.windowEnd < today ? today : r.windowEnd;

      for (let i = 0; i <= getDaysDiff(effectiveWindowStart, effectiveWindowEnd); i++) {
        const candidateDate = addDays(effectiveWindowStart, i);
        const capacity = PlannerService.getDailyCapacity(candidateDate, settings, exceptions);
        const capacityPoints = capacity * 1.3;

        if (getLoad(candidateDate) + r.effort <= capacityPoints) {
          bestDate = candidateDate;
          addLoad(bestDate, r.effort);
          placed = true;
          break;
        }
      }

      if (!placed) {
        let minLoadRatio = Infinity;
        let selectedDate = r.date < today ? today : r.date;

        const scanStart = effectiveWindowStart;
        const scanEnd = addDays(effectiveWindowEnd, 2);

        for (let i = 0; i <= getDaysDiff(scanStart, scanEnd); i++) {
          const candidateDate = addDays(scanStart, i);
          const capacity = PlannerService.getDailyCapacity(candidateDate, settings, exceptions);
          const capacityPoints = Math.max(0.1, capacity * 1.3);
          const ratio = getLoad(candidateDate) / capacityPoints;

          if (ratio < minLoadRatio) {
            minLoadRatio = ratio;
            selectedDate = candidateDate;
          }
        }
        bestDate = selectedDate;
        addLoad(bestDate, r.effort);
      }

      if (r.date !== bestDate) {
        updatedReviews.push({ ...r, date: bestDate });
      }
    }

    if (updatedReviews.length > 0) {
      await StorageService.saveReviewsBulk(updatedReviews);
    }
  },

  setTomorrowHeavy: async (userId: string) => {
    const tomorrow = addDays(formatDate(new Date()), 1);
    const exception: DayException = {
      id: generateId(), // Will be ignored by DB auto-gen or overwrite
      userId,
      date: tomorrow,
      type: 'heavy',
      capacityMultiplier: 0.4
    };
    await StorageService.addException(exception);
    await PlannerService.rebalanceSchedule(userId);
  },

  setPace: async (userId: string, mode: PaceMode) => {
    const settings = await StorageService.getSettings(userId);
    settings.paceMode = mode;
    await StorageService.saveSettings(userId, settings);
    await PlannerService.rebalanceSchedule(userId);
  },

  handleOverdueRecovery: async (userId: string) => {
    await PlannerService.rebalanceSchedule(userId);
  }
};