import React, { useState, useEffect } from "react";
import { Progress, SubtestType, Lesson, AIAnalysis } from "../types";
import { dbService } from "../services/dbService";
import { getTopicExplanation } from "../services/geminiService";
import {
  CheckCircle,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  MessageSquare,
  Loader2,
  Lightbulb,
  Microscope,
  Repeat,
  Info,
  Brain,
  Filter,
  Eye,
  EyeOff,
  HelpCircle,
  FileText,
  Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LearnProps {
  progress: Progress;
  setProgress: (p: Partial<Progress>) => void;
}

const Learn: React.FC<LearnProps> = ({ progress, setProgress }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeSubtest, setActiveSubtest] = useState<SubtestType>(
    SubtestType.PenalaranUmum
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<"quick" | "ai">("quick");
  const [aiTab, setAiTab] = useState<
    "complex" | "simple" | "quick" | "interactive"
  >("quick");
  const [showExampleAnswer, setShowExampleAnswer] = useState(false);
  const [showStaticExample, setShowStaticExample] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadedLessons = dbService.loadLessons();
    setLessons(loadedLessons);

    const initialSubtestLessons = loadedLessons.filter(
      (l) => l.subtest === activeSubtest
    );
    if (initialSubtestLessons.length > 0) {
      setSelectedLesson(initialSubtestLessons[0]);
    }
  }, []);

  useEffect(() => {
    setAiAnalysis(null);
    setViewMode("quick");
    setAiTab("quick");
    setShowExampleAnswer(false);
    setShowStaticExample(false);
  }, [selectedLesson]);

  const handleSubtestChange = (subtest: SubtestType) => {
    setActiveSubtest(subtest);
    const subtestLessons = lessons.filter((l) => l.subtest === subtest);
    if (subtestLessons.length > 0) {
      setSelectedLesson(subtestLessons[0]);
    } else {
      setSelectedLesson(null);
    }
  };

  const filteredLessons = lessons.filter(
    (l) =>
      l.subtest === activeSubtest &&
      (l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleLessonComplete = (id: string) => {
    const isCompleted = progress.completedLessons.includes(id);
    const newCompleted = isCompleted
      ? progress.completedLessons.filter((l) => l !== id)
      : [...progress.completedLessons, id];
    setProgress({ completedLessons: newCompleted });
  };

  const handleDeepAnalysis = async () => {
    if (!selectedLesson || isAiLoading) return;
    setViewMode("ai");
    if (aiAnalysis) return;

    setIsAiLoading(true);
    try {
      const result = await getTopicExplanation(
        selectedLesson.title,
        selectedLesson.subtest
      );
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAskAI = (topic: string) => {
    navigate("/tutor", {
      state: {
        initialMessage: `Halo Tutor! Saya ingin diskusi lebih dalam tentang materi "${topic}". Bisa kita mulai dengan satu contoh soal HOTS?`,
      },
    });
  };

  const getSubtestStyles = (st: SubtestType, isActive: boolean) => {
    const colors: Record<string, { active: string; shadow: string }> = {
      [SubtestType.PenalaranUmum]: {
        active: "bg-indigo-600",
        shadow: "shadow-indigo-100",
      },
      [SubtestType.PengetahuanKuantitatif]: {
        active: "bg-amber-600",
        shadow: "shadow-amber-100",
      },
      [SubtestType.LiterasiIndo]: {
        active: "bg-red-600",
        shadow: "shadow-red-100",
      },
      [SubtestType.LiterasiInggris]: {
        active: "bg-blue-600",
        shadow: "shadow-blue-100",
      },
      [SubtestType.PenalaranMatematika]: {
        active: "bg-emerald-600",
        shadow: "shadow-emerald-100",
      },
      [SubtestType.PPU]: {
        active: "bg-purple-600",
        shadow: "shadow-purple-100",
      },
      [SubtestType.PBM]: { active: "bg-pink-600", shadow: "shadow-pink-100" },
    };
    const style = colors[st] || colors[SubtestType.PenalaranUmum];
    return isActive
      ? `${style.active} text-white shadow-lg ${style.shadow} translate-y-[-2px]`
      : "text-slate-500 hover:bg-slate-50";
  };

  // ✅ FIX #1: Render as inline elements instead of block <p>
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n").filter((line) => line.trim() !== ""); // ✅ FIX #2: Filter empty lines
    const symbolRegex = /[→¬∧∨∴↔≡√π±≠≤≥²³∩∪∑∫≈∈∉⊂]/g;

    return lines.map((line, i) => {
      const isTechnical = symbolRegex.test(line);
      return (
        <p
          key={i}
          className={`mb-3 ${
            isTechnical
              ? "bg-indigo-50 px-4 py-2.5 rounded-xl border-l-4 border-indigo-400 font-bold font-mono text-indigo-900 shadow-sm"
              : ""
          }`}
        >
          {line}
        </p>
      );
    });
  };

  // ✅ FIX #3: Safe inline text renderer (untuk di dalam <span>)
  const renderInlineText = (text: string) => {
    if (!text) return null;
    return text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join(" • ");
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-20 md:pb-0">
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar shadow-sm shrink-0">
        {Object.values(SubtestType).map((st) => (
          <button
            key={st}
            onClick={() => handleSubtestChange(st)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${getSubtestStyles(
              st,
              activeSubtest === st
            )}`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder={`Cari di ${activeSubtest}...`}
              className="w-full outline-none text-sm bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Filter size={16} className="text-slate-400" /> Topik Tersedia
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                {filteredLessons.length} Materi
              </span>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto no-scrollbar pb-10">
              {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`
                      w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 group
                      ${
                        selectedLesson?.id === lesson.id
                          ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 translate-x-2"
                          : "bg-white border-slate-200 hover:border-indigo-300"
                      }
                    `}
                  >
                    <div
                      className={`
                      h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${
                        selectedLesson?.id === lesson.id
                          ? "bg-white/20 text-white"
                          : progress.completedLessons.includes(lesson.id)
                          ? "bg-green-100 text-green-600"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                    >
                      <BookOpen size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`font-bold text-sm truncate ${
                          selectedLesson?.id === lesson.id
                            ? "text-white"
                            : "text-slate-800"
                        }`}
                      >
                        {lesson.title}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`mt-1 shrink-0 ${
                        selectedLesson?.id === lesson.id
                          ? "text-white"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Belum ada materi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {selectedLesson ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[70vh] flex flex-col">
              <div className="bg-slate-900 p-8 text-white relative shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-indigo-500 text-[9px] font-black rounded uppercase tracking-tighter">
                        Professional Master AI
                      </span>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
                        {selectedLesson.subtest}
                      </p>
                    </div>
                    <h2 className="text-3xl font-black leading-tight tracking-tight">
                      {selectedLesson.title}
                    </h2>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAskAI(selectedLesson.title)}
                      className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold border border-white/10"
                    >
                      <MessageSquare size={20} />{" "}
                      <span className="hidden sm:inline">Diskusi</span>
                    </button>
                    <button
                      onClick={handleDeepAnalysis}
                      className={`p-4 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold border ${
                        viewMode === "ai"
                          ? "bg-indigo-600 border-indigo-400 text-white"
                          : "bg-white text-slate-900 border-white hover:bg-indigo-50"
                      }`}
                    >
                      <Sparkles size={20} />{" "}
                      <span className="hidden sm:inline">Bedah AI</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col">
                {viewMode === "quick" ? (
                  <div className="space-y-10 animate-in fade-in duration-300">
                    <section className="space-y-4">
                      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        <div className="h-4 w-1 bg-indigo-600 rounded-full"></div>{" "}
                        Intisari Materi
                      </h3>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-400 font-medium">
                        {selectedLesson.summary}
                      </p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                          <CheckCircle size={20} className="text-green-500" />{" "}
                          Poin Penting
                        </h3>
                        <div className="space-y-3">
                          {selectedLesson.points.map((pt, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm"
                            >
                              <div className="h-5 w-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              {/* ✅ FIX #4: Use div wrapper instead of span for block content */}
                              <div className="text-sm text-slate-700 font-medium flex-1">
                                {renderFormattedText(pt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-red-600 flex items-center gap-2 uppercase tracking-tight">
                          <AlertCircle size={20} /> Waspada Jebakan
                        </h3>
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-4">
                          {selectedLesson.trapPatterns.map((tp, i) => (
                            <div
                              key={i}
                              className="flex gap-3 text-sm text-red-800 font-bold italic leading-snug"
                            >
                              <span className="shrink-0">⚠️</span>
                              <span>{tp}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {/* Static Example from Lesson Data */}
                    {selectedLesson.example && (
                      <section className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-indigo-800 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <HelpCircle size={18} /> Contoh Konsep & Latihan
                          </h3>
                          <button
                            onClick={() =>
                              setShowStaticExample(!showStaticExample)
                            }
                            className="text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 px-4 py-2 rounded-xl border border-indigo-200 shadow-sm flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                          >
                            {showStaticExample ? (
                              <>
                                <EyeOff size={14} /> Sembunyikan Pembahasan
                              </>
                            ) : (
                              <>
                                <Eye size={14} /> Lihat Pembahasan
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-slate-800 font-bold text-lg leading-relaxed bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                          {selectedLesson.example.question}
                        </div>

                        {showStaticExample && (
                          <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                                <FileText size={14} /> Langkah Penyelesaian
                              </h4>
                              <div className="space-y-2">
                                {selectedLesson.example.solution.map(
                                  (step, i) => (
                                    <div
                                      key={i}
                                      className="flex gap-3 text-sm text-slate-600 font-medium bg-white/50 p-3 rounded-xl border border-indigo-50/50"
                                    >
                                      <span className="text-indigo-400 font-black">
                                        {i + 1}.
                                      </span>
                                      <div className="flex-1">
                                        {renderFormattedText(step)}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                                <Calculator size={14} /> Rumus / Kaidah Kunci
                              </h4>
                              <div className="space-y-2">
                                {selectedLesson.example.formulas.map(
                                  (formula, i) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900 font-mono text-xs font-bold shadow-sm"
                                    >
                                      {formula}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-8 animate-in zoom-in-95 duration-300">
                    {/* AI Generated Example Question Section */}
                    {aiAnalysis?.example && (
                      <section className="bg-amber-50 rounded-3xl border border-amber-100 p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-amber-800 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={18} /> Simulasi HOTS Real-time
                          </h3>
                          <button
                            onClick={() =>
                              setShowExampleAnswer(!showExampleAnswer)
                            }
                            className="text-[10px] font-black uppercase tracking-widest bg-white text-amber-600 px-4 py-2 rounded-xl border border-amber-200 shadow-sm flex items-center gap-2 hover:bg-amber-100 transition-colors"
                          >
                            {showExampleAnswer ? (
                              <>
                                <EyeOff size={14} /> Sembunyikan Kunci
                              </>
                            ) : (
                              <>
                                <Eye size={14} /> Lihat Jawaban
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-slate-800 font-bold text-sm md:text-base leading-relaxed whitespace-pre-wrap italic bg-white p-6 rounded-2xl border border-amber-200">
                          "{aiAnalysis.example.question}"
                        </div>

                        {showExampleAnswer && (
                          <div className="animate-in slide-in-from-top-4 duration-300 space-y-4 pt-4 border-t border-amber-200/50">
                            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase">
                              <CheckCircle size={14} /> Jawaban Benar:{" "}
                              <span className="bg-green-100 px-2 py-0.5 rounded">
                                {aiAnalysis.example.answer}
                              </span>
                            </div>
                            <div className="bg-white/60 p-5 rounded-2xl text-slate-700 text-sm leading-relaxed border border-white">
                              <p className="font-bold text-amber-700 mb-2 uppercase text-[9px] tracking-widest">
                                Analisis Ahli:
                              </p>
                              {renderFormattedText(
                                aiAnalysis.example.stepByStep
                              )}
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                    {/* AI Analysis Tabs */}
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar shrink-0">
                        <button
                          onClick={() => setAiTab("quick")}
                          className={`flex-1 min-w-[100px] px-3 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${
                            aiTab === "quick"
                              ? "bg-white shadow-md text-indigo-600"
                              : "text-slate-400"
                          }`}
                        >
                          Strategi Cepat
                        </button>
                        <button
                          onClick={() => setAiTab("simple")}
                          className={`flex-1 min-w-[100px] px-3 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${
                            aiTab === "simple"
                              ? "bg-white shadow-md text-indigo-600"
                              : "text-slate-400"
                          }`}
                        >
                          Intuitif
                        </button>
                        <button
                          onClick={() => setAiTab("complex")}
                          className={`flex-1 min-w-[100px] px-3 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${
                            aiTab === "complex"
                              ? "bg-white shadow-md text-indigo-600"
                              : "text-slate-400"
                          }`}
                        >
                          Akademik
                        </button>
                        <button
                          onClick={() => setAiTab("interactive")}
                          className={`flex-1 min-w-[100px] px-3 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${
                            aiTab === "interactive"
                              ? "bg-white shadow-md text-indigo-600"
                              : "text-slate-400"
                          }`}
                        >
                          Tanya Balik
                        </button>
                      </div>

                      <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-100 p-8 min-h-[300px]">
                        {isAiLoading ? (
                          <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Loader2
                              className="animate-spin text-indigo-600"
                              size={32}
                            />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-center">
                              Ahli Tutor sedang merumuskan bedah materi...
                            </p>
                          </div>
                        ) : aiAnalysis ? (
                          <div className="animate-in fade-in duration-500 h-full flex flex-col">
                            <div className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest mb-6 border-b border-indigo-100 pb-4 shrink-0">
                              {aiTab === "quick" && (
                                <>
                                  <Zap size={20} className="fill-indigo-600" />{" "}
                                  Strategi & Taktik Cepat
                                </>
                              )}
                              {aiTab === "simple" && (
                                <>
                                  <Lightbulb
                                    size={20}
                                    className="fill-indigo-600"
                                  />{" "}
                                  Analogi Dunia Nyata
                                </>
                              )}
                              {aiTab === "complex" && (
                                <>
                                  <Microscope
                                    size={20}
                                    className="fill-indigo-600"
                                  />{" "}
                                  Logika Akademik Unicode
                                </>
                              )}
                              {aiTab === "interactive" && (
                                <>
                                  <Repeat
                                    size={20}
                                    className="fill-indigo-600"
                                  />{" "}
                                  Refleksi Pemahaman
                                </>
                              )}
                            </div>

                            <div className="text-slate-700 leading-relaxed font-medium flex-1 overflow-y-auto no-scrollbar pr-2 text-sm sm:text-base">
                              {aiTab === "quick" &&
                                renderFormattedText(aiAnalysis.quick)}
                              {aiTab === "simple" &&
                                renderFormattedText(aiAnalysis.simple)}
                              {aiTab === "complex" &&
                                renderFormattedText(aiAnalysis.complex)}
                              {aiTab === "interactive" && (
                                <div className="space-y-6">
                                  <div className="italic text-indigo-600 font-bold border-l-4 border-indigo-200 pl-4 py-2">
                                    {renderFormattedText(
                                      aiAnalysis.interactive
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleAskAI(selectedLesson.title)
                                    }
                                    className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
                                  >
                                    Diskusikan dengan Tutor{" "}
                                    <ChevronRight size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Sparkles size={40} className="opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">
                              Klik "Bedah AI" untuk analisis mendalam
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8 mt-auto flex flex-col sm:flex-row gap-4 border-t border-slate-100 mt-8">
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "quick" ? "ai" : "quick")
                    }
                    className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    {viewMode === "quick" ? (
                      <>
                        <Sparkles size={18} /> Beralih ke Bedah AI
                      </>
                    ) : (
                      <>
                        <Info size={18} /> Kembali ke Ringkasan
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => toggleLessonComplete(selectedLesson.id)}
                    className={`flex-[1.5] flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      progress.completedLessons.includes(selectedLesson.id)
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                    }`}
                  >
                    <CheckCircle size={20} />
                    {progress.completedLessons.includes(selectedLesson.id)
                      ? "Sudah Dikuasai"
                      : "Tandai Selesai Belajar"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 shadow-inner">
              <div className="h-24 w-24 bg-indigo-50 text-indigo-200 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                <Brain size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                Siap Membedah Logika?
              </h3>
              <p className="text-slate-500 max-w-sm mt-3 leading-relaxed text-sm font-medium">
                Pilih salah satu materi di samping untuk mulai belajar dengan
                bantuan AI Master.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learn;
