

export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

export enum StudyStage {
  HIGH_SCHOOL = 'high_school', // Ensino Médio
  COLLEGE = 'college', // Faculdade
  CONTEST = 'contest', // Concursos
  SELF_LEARNING = 'self_learning' // Autodidata
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  goal?: string; // Target Course
  stage?: StudyStage; // Educational Phase
  onboardingCompleted: boolean;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface StudyContent {
  id: string;
  subjectId: string;
  userId: string;
  topic: string;
  dateStudied: string; // ISO Date String YYYY-MM-DD
  difficulty: Difficulty;
}

export enum ReviewStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export enum ReviewFeedback {
  REMEMBERED = 'remembered',
  SOMEWHAT = 'somewhat',
  FORGOT = 'forgot',
}

export interface Review {
  id: string;
  contentId: string;
  userId: string;
  date: string; // The currently scheduled date (due_date)
  status: ReviewStatus;
  feedback?: ReviewFeedback;

  // Planner Fields
  windowStart: string; // Earliest allowed date
  windowEnd: string;   // Latest allowed date without penalty
  effort: number;      // Cost of the review (1.0, 1.3, 1.7)
  originalDate: string; // To track drift
}

export interface ReviewIntervals {
  [Difficulty.EASY]: number[];
  [Difficulty.MEDIUM]: number[];
  [Difficulty.HARD]: number[];
}

export interface ThemeSettings {
  name: 'green' | 'blue' | 'pink' | 'dark';
  primaryColor: string;
  mode: 'light' | 'dark';
}

export type PaceMode = 'normal' | 'faster' | 'slower';

export interface UserChecklist {
  hasSubjects: boolean;
  hasContents: boolean;
  checkedCalendar: boolean;
  adjustedCapacity: boolean;
}

export interface UserSettings {
  dailyLimit: number;
  reviewIntervals: ReviewIntervals;
  theme: ThemeSettings;
  setupCompleted: boolean;

  // Planner Settings
  paceMode: PaceMode;
  heavyDays: number[]; // 0=Sun, 1=Mon...
  checklist: UserChecklist;
}

export interface DayException {
  id: string;
  userId: string;
  date: string;
  type: 'heavy' | 'unavailable' | 'exam';
  capacityMultiplier: number;
}

export type RetentionEventType = 'remembered' | 'forgot';

export interface RetentionEvent {
  id: string;
  userId: string;
  contentId: string;
  type: RetentionEventType;
  createdAt: string;
}

export interface AppState {
  user: User | null;
  subjects: Subject[];
  contents: StudyContent[];
  reviews: Review[];
  settings: UserSettings;
}

// Navigation Context
export interface NavigationParams {
  action?: 'focus_add_subject' | 'focus_add_content' | 'open_day' | 'trigger_redistribute' | 'open_tomorrow';
  date?: string;
}

export interface SuggestedAction {
  key: string;
  headline: string;
  subtext: string;
  cta: string;
  icon: any;
  route: string;
  navParams?: NavigationParams;
  priority: number;
}