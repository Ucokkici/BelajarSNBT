// types.ts

export enum SubtestType {
  PenalaranUmum = 'Penalaran Umum',
  PengetahuanKuantitatif = 'Pengetahuan Kuantitatif',
  LiterasiIndo = 'Literasi Bahasa Indonesia',
  LiterasiInggris = 'Literasi Bahasa Inggris',
  PenalaranMatematika = 'Penalaran Matematika',
  PPU = 'Pengetahuan & Pemahaman Umum',
  PBM = 'Pemahaman Bacaan & Menulis'
}

export interface Question {
  id: string;
  subtest: SubtestType;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  quickTrick?: string;
  context?: string;
}

export interface QuickTrick {
  name: string;
  formula: string;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtest: SubtestType;
  summary: string;
  points: string[];
  trapPatterns: string[];
  quickTricks?: QuickTrick[];
  example?: {
    question: string;
    solution: string[];
    formulas: string[];
  };
}

// ✅ PERBAIKAN PENTING: Tambahkan solvedQuestionIds di sini
export interface Progress {
  scores: Record<SubtestType, number[]>;
  completedLessons: string[];
  history: {
    date: string;
    subtest: SubtestType;
    score: number;
  }[];
  
  // Ini wajib ada agar fitur "Soal Tidak Muncul Lagi" bekerja
  solvedQuestionIds: string[]; 
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AIAnalysis {
  complex: string;
  simple: string;
  quick: string;
  interactive: string;
  example?: {
    question: string;
    answer: string;
    stepByStep: string;
  };
}