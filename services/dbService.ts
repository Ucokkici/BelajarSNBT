import { Progress, SubtestType, Question, Lesson } from "../types";
// ✅ FIX: Import dari mockData.ts bukan dari index
import { MOCK_QUESTIONS, MOCK_LESSONS } from "../constants";

const DB_KEY_PROGRESS = "lulus_snbt_progress_v1";
const DB_KEY_QUESTIONS = "lulus_snbt_questions_v1";
const DB_KEY_LESSONS = "lulus_snbt_lessons_v1";

export const dbService = {
  // Progress Management
  saveProgress: (progress: Progress) => {
    localStorage.setItem(DB_KEY_PROGRESS, JSON.stringify(progress));
  },

  loadProgress: (): Progress => {
    const data = localStorage.getItem(DB_KEY_PROGRESS);
    if (!data) return {
      scores: {
        [SubtestType.PenalaranUmum]: [],
        [SubtestType.PengetahuanKuantitatif]: [],
        [SubtestType.LiterasiIndo]: [],
        [SubtestType.LiterasiInggris]: [],
        [SubtestType.PenalaranMatematika]: [],
        [SubtestType.PPU]: [],
        [SubtestType.PBM]: []
      },
      completedLessons: [],
      history: []
    };
    return JSON.parse(data);
  },

  // Dynamic Question Bank Management
  saveQuestions: (questions: Question[]) => {
    localStorage.setItem(DB_KEY_QUESTIONS, JSON.stringify(questions));
  },

  loadQuestions: (): Question[] => {
    const data = localStorage.getItem(DB_KEY_QUESTIONS);
    if (!data) {
      // Inisialisasi awal dengan Mock hanya jika data kosong
      console.log('📚 Initializing questions from MOCK_QUESTIONS:', MOCK_QUESTIONS.length);
      localStorage.setItem(DB_KEY_QUESTIONS, JSON.stringify(MOCK_QUESTIONS));
      return MOCK_QUESTIONS;
    }
    const parsed = JSON.parse(data);
    console.log('📚 Loaded questions from localStorage:', parsed.length);
    return parsed;
  },

  addQuestions: (newQuestions: Question[]) => {
    const existing = dbService.loadQuestions();
    const filteredNew = newQuestions.filter(nq => !existing.some(ex => ex.text === nq.text));
    const updated = [...existing, ...filteredNew];
    dbService.saveQuestions(updated);
    console.log(`✅ Added ${filteredNew.length} new questions. Total: ${updated.length}`);
    return updated.length;
  },

  // Dynamic Lesson Management
  saveLessons: (lessons: Lesson[]) => {
    localStorage.setItem(DB_KEY_LESSONS, JSON.stringify(lessons));
  },

  loadLessons: (): Lesson[] => {
    const data = localStorage.getItem(DB_KEY_LESSONS);
    if (!data) {
      console.log('📚 Initializing lessons from MOCK_LESSONS:', MOCK_LESSONS.length);
      
      // ✅ DEBUG: Cek struktur data
      const bySubtest: Record<string, number> = {};
      MOCK_LESSONS.forEach(lesson => {
        bySubtest[lesson.subtest] = (bySubtest[lesson.subtest] || 0) + 1;
      });
      console.log('📊 Lessons by subtest:', bySubtest);
      
      localStorage.setItem(DB_KEY_LESSONS, JSON.stringify(MOCK_LESSONS));
      return MOCK_LESSONS;
    }
    const parsed = JSON.parse(data);
    console.log('📚 Loaded lessons from localStorage:', parsed.length);
    return parsed;
  },

  addLessons: (newLessons: Lesson[]) => {
    const existing = dbService.loadLessons();
    const filteredNew = newLessons.filter(nl => !existing.some(ex => ex.title === nl.title));
    const updated = [...existing, ...filteredNew];
    dbService.saveLessons(updated);
    console.log(`✅ Added ${filteredNew.length} new lessons. Total: ${updated.length}`);
    return updated.length;
  },

  // ✅ TAMBAHAN: Helper untuk debug
  debugStats: () => {
    const lessons = dbService.loadLessons();
    const questions = dbService.loadQuestions();
    
    const lessonsBySubtest: Record<string, number> = {};
    lessons.forEach(lesson => {
      lessonsBySubtest[lesson.subtest] = (lessonsBySubtest[lesson.subtest] || 0) + 1;
    });
    
    console.log('=== DATABASE STATS ===');
    console.log('Total Lessons:', lessons.length);
    console.log('Total Questions:', questions.length);
    console.table(lessonsBySubtest);
    
    return { lessons: lessons.length, questions: questions.length, bySubtest: lessonsBySubtest };
  },

  clearData: () => {
    // Menghapus seluruh data di localStorage agar benar-benar bersih
    localStorage.clear();
    console.log('🗑️ All data cleared from localStorage');
    // Memaksa reload halaman untuk mereset state aplikasi secara total
    window.location.href = window.location.origin + window.location.pathname;
  }
};