

import { StudyContent, Review, Difficulty, ReviewStatus, Subject, User, UserSettings, ReviewIntervals, PaceMode, DayException, RetentionEventType, RetentionEvent, StudyStage, NavigationParams, ReviewFeedback, SuggestedAction } from './types';
import { Network, Component, Scale, LayoutGrid, Sparkles, Layers, BookOpen, Calendar as CalendarIcon, FastForward, CheckCircle2 } from 'lucide-react';

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
  getSuggestions: (goal: string = '', stage: StudyStage = StudyStage.UNIVERSITY): string[] => {
    const text = goal.toLowerCase();
    
    // 1. NON-UNIVERSITY STAGE (School, Cram School, Self-study)
    // Suggest generic High School / Entrance Exam subjects
    if (stage !== StudyStage.UNIVERSITY) {
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

// --- Storage Service ---

const STORAGE_KEY = 'foco_ai_db_v3'; // Bumped version for new schema

interface DB {
  users: User[];
  subjects: Subject[];
  contents: StudyContent[];
  reviews: Review[];
  settings: Record<string, UserSettings>; 
  exceptions: DayException[];
  retentionEvents: RetentionEvent[];
}

const getDB = (): DB => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { users: [], subjects: [], contents: [], reviews: [], settings: {}, exceptions: [], retentionEvents: [] };
  }
  const parsed = JSON.parse(data);
  if (!parsed.retentionEvents) parsed.retentionEvents = [];
  return parsed;
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const StorageService = {
  // Auth
  login: async (email: string): Promise<User | null> => {
    const db = getDB();
    const user = db.users.find(u => u.email === email);
    return user || null;
  },
  
  register: async (email: string, name: string): Promise<User> => {
    const db = getDB();
    if (db.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const newUser: User = { 
      id: generateId(), 
      email, 
      name, 
      onboardingCompleted: false,
      stage: StudyStage.UNIVERSITY
    };
    db.users.push(newUser);
    db.settings[newUser.id] = { ...DEFAULT_SETTINGS };
    saveDB(db);
    return newUser;
  },

  updateUser: (user: User) => {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      db.users[index] = user;
      saveDB(db);
    }
  },

  // Settings
  getSettings: (userId: string): UserSettings => {
    const db = getDB();
    const saved = db.settings[userId];
    if (!saved) return { ...DEFAULT_SETTINGS };
    return { 
      ...DEFAULT_SETTINGS, 
      ...saved,
      checklist: { ...DEFAULT_CHECKLIST, ...(saved.checklist || {}) }
    };
  },

  saveSettings: (userId: string, settings: UserSettings) => {
    const db = getDB();
    db.settings[userId] = settings;
    saveDB(db);
  },

  updateChecklist: (userId: string, key: keyof import('./types').UserChecklist) => {
    const settings = StorageService.getSettings(userId);
    if (!settings.checklist[key]) {
      settings.checklist[key] = true;
      StorageService.saveSettings(userId, settings);
    }
  },

  // Subjects
  getSubjects: (userId: string): Subject[] => {
    return getDB().subjects.filter(s => s.userId === userId);
  },

  addSubject: (userId: string, name: string): Subject => {
    const db = getDB();
    const newSubject: Subject = {
      id: generateId(),
      userId,
      name,
      color: '#21B892'
    };
    db.subjects.push(newSubject);
    saveDB(db);
    StorageService.updateChecklist(userId, 'hasSubjects');
    return newSubject;
  },

  deleteSubject: (subjectId: string) => {
    const db = getDB();
    const contentIds = db.contents.filter(c => c.subjectId === subjectId).map(c => c.id);
    db.reviews = db.reviews.filter(r => !contentIds.includes(r.contentId));
    db.contents = db.contents.filter(c => c.subjectId !== subjectId);
    db.subjects = db.subjects.filter(s => s.id !== subjectId);
    saveDB(db);
  },

  // Contents & Reviews
  getContents: (userId: string): StudyContent[] => {
    return getDB().contents.filter(c => c.userId === userId);
  },

  getReviews: (userId: string): Review[] => {
    return getDB().reviews.filter(r => r.userId === userId);
  },

  addContentWithReviews: (userId: string, subjectId: string, topic: string, dateStudied: string, difficulty: Difficulty) => {
    const db = getDB();
    const userSettings = db.settings[userId] || DEFAULT_SETTINGS;
    const contentId = generateId();
    
    const newContent: StudyContent = {
      id: contentId,
      userId,
      subjectId,
      topic,
      dateStudied,
      difficulty
    };

    db.contents.push(newContent);

    // COST LOGIC
    const effortMap = { [Difficulty.EASY]: 1.0, [Difficulty.MEDIUM]: 1.3, [Difficulty.HARD]: 1.7 };
    const effort = effortMap[difficulty];

    const schedule = SchedulerService.calculateSchedule(difficulty, userSettings.reviewIntervals);
    
    const newReviews: Review[] = schedule.map(days => {
      const targetDate = addDays(dateStudied, days);
      return {
        id: generateId(),
        userId,
        contentId,
        date: targetDate,
        status: ReviewStatus.PENDING,
        windowStart: addDays(targetDate, -1),
        windowEnd: addDays(targetDate, 2),
        effort: effort,
        originalDate: targetDate
      };
    });

    db.reviews.push(...newReviews);
    saveDB(db);
    StorageService.updateChecklist(userId, 'hasContents');
    PlannerService.rebalanceSchedule(userId);
  },

  updateContent: (userId: string, contentId: string, updates: Partial<StudyContent>) => {
    const db = getDB();
    const index = db.contents.findIndex(c => c.id === contentId);
    
    if (index !== -1) return;

    const oldContent = db.contents[index];
    const newContent = { ...oldContent, ...updates };
    db.contents[index] = newContent;

    const difficultyChanged = oldContent.difficulty !== newContent.difficulty;
    const dateChanged = oldContent.dateStudied !== newContent.dateStudied;

    if (difficultyChanged || dateChanged) {
        db.reviews = db.reviews.filter(r => !(r.contentId === contentId && r.status === ReviewStatus.PENDING));
        const userSettings = db.settings[userId] || DEFAULT_SETTINGS;
        const schedule = SchedulerService.calculateSchedule(newContent.difficulty, userSettings.reviewIntervals);
        const effortMap = { [Difficulty.EASY]: 1.0, [Difficulty.MEDIUM]: 1.3, [Difficulty.HARD]: 1.7 };
        const effort = effortMap[newContent.difficulty];
        const today = formatDate(new Date());

        const newReviews: Review[] = schedule.map(days => {
            const targetDate = addDays(newContent.dateStudied, days);
            return {
                id: generateId(),
                userId,
                contentId,
                date: targetDate,
                status: ReviewStatus.PENDING,
                windowStart: addDays(targetDate, -1),
                windowEnd: addDays(targetDate, 2),
                effort: effort,
                originalDate: targetDate
            };
        }).filter(r => {
            return r.date >= today;
        });
        
        if (newReviews.length === 0) {
             const fallbackDate = addDays(today, 1);
             newReviews.push({
                id: generateId(),
                userId,
                contentId,
                date: fallbackDate,
                status: ReviewStatus.PENDING,
                windowStart: today,
                windowEnd: addDays(fallbackDate, 2),
                effort: effort,
                originalDate: fallbackDate
             });
        }
        db.reviews.push(...newReviews);
    }
    saveDB(db);
    PlannerService.rebalanceSchedule(userId);
  },

  updateReviewStatus: (reviewId: string, status: ReviewStatus, feedback?: any) => {
    const db = getDB();
    const index = db.reviews.findIndex(r => r.id === reviewId);
    if (index !== -1) {
      db.reviews[index].status = status;
      if (feedback) db.reviews[index].feedback = feedback;
      saveDB(db);
    }
  },

  deleteContent: (contentId: string) => {
    const db = getDB();
    db.reviews = db.reviews.filter(r => r.contentId !== contentId);
    db.contents = db.contents.filter(c => c.id !== contentId);
    saveDB(db);
  },

  adjustSchedule: (userId: string, contentId: string, type: RetentionEventType, reviewId?: string) => {
    const db = getDB();
    const today = formatDate(new Date());
    const tomorrow = addDays(today, 1);
    
    // 1. Mark the review as done (if a specific review ID was passed)
    if (reviewId) {
        const rIdx = db.reviews.findIndex(r => r.id === reviewId);
        if (rIdx !== -1) {
            db.reviews[rIdx].status = ReviewStatus.COMPLETED;
            db.reviews[rIdx].feedback = type === 'forgot' ? ReviewFeedback.FORGOT : ReviewFeedback.REMEMBERED;
        }
    }

    // 2. Log Retention Event
    db.retentionEvents.push({
      id: generateId(),
      userId,
      contentId,
      type,
      createdAt: new Date().toISOString()
    });

    const pendingReviews = db.reviews.filter(r => r.contentId === contentId && r.status === ReviewStatus.PENDING);
    pendingReviews.sort((a, b) => a.date.localeCompare(b.date));

    if (type === 'forgot') {
      // FORGOT: Needs reinforcement.
      // Insert a new review for TOMORROW (or next available).
      // Logic: If there is no review scheduled for tomorrow, create one.
      const hasImmediate = pendingReviews.some(r => r.date <= tomorrow);
      
      if (!hasImmediate) {
        const effort = 1.7; // Harder because forgot
        const newReview: Review = {
          id: generateId(),
          contentId,
          userId,
          date: tomorrow,
          status: ReviewStatus.PENDING,
          windowStart: today,
          windowEnd: addDays(tomorrow, 1),
          effort,
          originalDate: tomorrow
        };
        db.reviews.push(newReview);
      }
      // Compress future reviews? (Optional advanced logic, for now inserting reinforcement is enough)

    } else if (type === 'remembered') {
      // REMEMBERED: Can space out future reviews.
      // Logic: Push pending reviews out by ~1.5x days or simply add a few days buffer.
      pendingReviews.forEach(r => {
        // Simple heuristic: Add 3 days or 20% delay, whichever is more, to push them forward
        const diff = getDaysDiff(today, r.date);
        const addedBuffer = Math.max(2, Math.ceil(diff * 0.2));
        const newDate = addDays(r.date, addedBuffer);
        
        r.date = newDate;
        r.originalDate = newDate;
        r.windowStart = addDays(newDate, -1);
        r.windowEnd = addDays(newDate, 3);
      });
    }

    saveDB(db);
    
    // 3. Rebalance everything to fit capacity
    PlannerService.rebalanceSchedule(userId);
  },

  getExceptions: (userId: string): DayException[] => {
    return getDB().exceptions.filter(e => e.userId === userId);
  },

  addException: (exception: DayException) => {
    const db = getDB();
    db.exceptions = db.exceptions.filter(e => !(e.userId === exception.userId && e.date === exception.date));
    db.exceptions.push(exception);
    saveDB(db);
  },
  
  saveReviewsBulk: (reviews: Review[]) => {
    const db = getDB();
    reviews.forEach(updated => {
      const idx = db.reviews.findIndex(r => r.id === updated.id);
      if (idx !== -1) db.reviews[idx] = updated;
    });
    saveDB(db);
  }
};

export const SchedulerService = {
  calculateSchedule: (difficulty: Difficulty, intervals: ReviewIntervals): number[] => {
    return intervals[difficulty] || [1, 7];
  }
};

export const SuggestionService = {
  getNextAction: (userId: string): SuggestedAction => {
    const subjects = StorageService.getSubjects(userId);
    const contents = StorageService.getContents(userId);
    const reviews = StorageService.getReviews(userId);
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

  rebalanceSchedule: (userId: string, horizonDays: number = 14) => {
    const db = getDB();
    const settings = StorageService.getSettings(userId);
    const exceptions = StorageService.getExceptions(userId);
    
    const pendingReviews = db.reviews.filter(r => r.userId === userId && r.status === ReviewStatus.PENDING);
    
    if (pendingReviews.length === 0) return;

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
      StorageService.saveReviewsBulk(updatedReviews);
    }
  },

  setTomorrowHeavy: (userId: string) => {
    const tomorrow = addDays(formatDate(new Date()), 1);
    const exception: DayException = {
      id: generateId(),
      userId,
      date: tomorrow,
      type: 'heavy',
      capacityMultiplier: 0.4
    };
    StorageService.addException(exception);
    PlannerService.rebalanceSchedule(userId);
  },

  setPace: (userId: string, mode: PaceMode) => {
    const settings = StorageService.getSettings(userId);
    settings.paceMode = mode;
    StorageService.saveSettings(userId, settings);
    PlannerService.rebalanceSchedule(userId);
  },

  handleOverdueRecovery: (userId: string) => {
    PlannerService.rebalanceSchedule(userId);
  }
};