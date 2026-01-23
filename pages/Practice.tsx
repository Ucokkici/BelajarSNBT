import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Progress,
  SubtestType,
  Question,
  ChatMessage,
  AIAnalysis,
} from "../types";
import { dbService } from "../services/dbService";
import { getDeepAnalysis, getTutorResponse } from "../services/geminiService";
import {
  Clock,
  ChevronRight,
  RotateCcw,
  Zap,
  Sparkles,
  ArrowRight,
  Bot,
  Loader2,
  X,
  Lightbulb,
  Microscope,
  Repeat,
  Brain,
  Calculator,
  Languages,
  PenTool,
  FileText,
  Search,
  Timer,
  CheckCircle,
  XCircle,
  Trophy,
  MessageSquare,
} from "lucide-react";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface PracticeProps {
  progress: Progress;
  setProgress: (p: Partial<Progress>) => void;
}

const Practice: React.FC<PracticeProps> = ({ progress, setProgress }) => {
  const navigate = useNavigate();
  const [selectedSubtest, setSelectedSubtest] = useState<SubtestType | null>(
    null,
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Timer States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubtest, setPendingSubtest] = useState<SubtestType | null>(
    null,
  );
  const [useTimer, setUseTimer] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const [explanationMode, setExplanationMode] = useState<
    "quick" | "complex" | "simple" | "interactive"
  >("quick");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [showDeepChat, setShowDeepChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: any;
    if (selectedSubtest && useTimer && !isFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishPractice();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedSubtest, useTimer, isFinished, timeLeft]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSubtestClick = (type: SubtestType) => {
    setPendingSubtest(type);
    setShowConfirmModal(true);
  };

  const startSession = (withTimer: boolean) => {
    if (!pendingSubtest) return;

    let allQ = dbService.loadQuestions();
    const filtered = allQ.filter((q) => q.subtest === pendingSubtest);

    if (filtered.length === 0) {
      alert(
        `Maaf, soal untuk ${pendingSubtest} belum tersedia. Silakan klik 'Ambil 210 Soal Master' di sidebar.`,
      );
      setShowConfirmModal(false);
      return;
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 20);
    setQuestions(shuffled);
    setSelectedSubtest(pendingSubtest);
    setUseTimer(withTimer);
    setTimeLeft(shuffled.length * 60); // 1 menit per soal
    setActiveQuestionIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setAiAnalysis(null);
    setShowConfirmModal(false);
    setExplanationMode("quick");
  };

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    if (idx === questions[activeQuestionIndex].correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }
    fetchAiAnalysis();
  };

  const fetchAiAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const result = await getDeepAnalysis(questions[activeQuestionIndex]);
      setAiAnalysis(result);
    } catch (e) {
      console.error("AI Analysis Error", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeepChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg: ChatMessage = { role: "user", text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);
    const context = `Soal: ${questions[activeQuestionIndex].text}. Siswa menjawab: ${questions[activeQuestionIndex].options[selectedAnswer!]}. Jawaban benar: ${questions[activeQuestionIndex].options[questions[activeQuestionIndex].correctAnswer]}.`;
    const response = await getTutorResponse(
      [...chatMessages, userMsg],
      context,
    );
    setChatMessages((prev) => [
      ...prev,
      { role: "model", text: response || "Maaf, ada kendala koneksi." },
    ]);
    setIsChatLoading(false);
  };

  const nextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setAiAnalysis(null);
      setExplanationMode("quick");
      setChatMessages([]);
    } else {
      finishPractice();
    }
  };

  const finishPractice = () => {
    if (isFinished) return;
    setIsFinished(true);
    const score = Math.round((correctCount / questions.length) * 1000);
    const newHistory = [
      ...progress.history,
      {
        date: new Date().toLocaleDateString(),
        subtest: selectedSubtest!,
        score,
      },
    ];
    const subtestScores = [...(progress.scores[selectedSubtest!] || []), score];
    setProgress({
      history: newHistory,
      scores: { ...progress.scores, [selectedSubtest!]: subtestScores },
    });
  };

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl mb-6">
          <Trophy size={48} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            Latihan Selesai!
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
            {selectedSubtest}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Skor Akhir
            </p>
            <p className="text-4xl font-black text-indigo-600">
              {Math.round((correctCount / questions.length) * 1000)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Benar
            </p>
            <p className="text-4xl font-black text-emerald-600">
              {correctCount} / {questions.length}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  if (!selectedSubtest) {
    const subtests = [
      {
        type: SubtestType.PenalaranUmum,
        icon: <Brain />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        type: SubtestType.PengetahuanKuantitatif,
        icon: <Calculator />,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        type: SubtestType.LiterasiIndo,
        icon: <Languages />,
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        type: SubtestType.LiterasiInggris,
        icon: <Languages />,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      },
      {
        type: SubtestType.PenalaranMatematika,
        icon: <PenTool />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        type: SubtestType.PPU,
        icon: <Search />,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        type: SubtestType.PBM,
        icon: <FileText />,
        color: "text-pink-600",
        bg: "bg-pink-50",
      },
    ];
    return (
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-24 px-4">
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 text-center">
              <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Timer size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                Konfirmasi Latihan
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Anda akan mengerjakan 20 soal untuk subtest{" "}
                <span className="text-indigo-600 font-bold">
                  {pendingSubtest}
                </span>
                . Pilih mode pengerjaan:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => startSession(true)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={16} /> Mode Simulasi (20 Menit)
                </button>
                <button
                  onClick={() => startSession(false)}
                  className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Mode Santai (Tanpa Timer)
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
            <Zap className="w-3 h-3" /> Professional Strategy AI
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
            Pilih Subtest
          </h2>
          <p className="text-slate-500 max-w-sm mx-auto text-xs font-medium">
            Latihan simulasi standar SNPMB 2025.
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {subtests.map((st) => (
            <button
              key={st.type}
              onClick={() => handleSubtestClick(st.type)}
              className="group bg-white border border-slate-200 p-5 md:p-6 rounded-[1.5rem] text-left transition-all hover:border-indigo-400 hover:shadow-xl active:scale-95"
            >
              <div
                className={`${st.bg} ${st.color} w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform`}
              >
                {st.icon}
              </div>
              <h3 className="font-black text-slate-800 text-sm md:text-base mb-2">
                {st.type}
              </h3>
              <div className="flex items-center justify-between text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                Mulai Latihan <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeQuestion = questions[activeQuestionIndex];
  if (!activeQuestion) return null;

  // Analysis Component for reuse in Mobile and Desktop
  const AnalysisContent = () => (
    <div
      className={`bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden transition-all duration-500 h-full flex flex-col ${isAnswered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95 pointer-events-none"}`}
    >
      <div className="bg-indigo-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
          <Sparkles size={18} className="text-indigo-300" /> Analisis Master AI
        </div>
        <button
          onClick={() => setShowDeepChat(true)}
          className="text-[9px] bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/20 font-black uppercase transition-colors tracking-widest"
        >
          Konsultasi
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          {(["quick", "simple", "complex", "interactive"] as const).map(
            (mode) => (
              <button
                key={mode}
                onClick={() => setExplanationMode(mode)}
                className={`shrink-0 flex-1 px-1 py-2 text-[8px] sm:text-[9px] font-black rounded-lg transition-all uppercase tracking-tight ${explanationMode === mode ? "bg-white shadow-md text-indigo-600" : "text-slate-400"}`}
              >
                {mode === "quick"
                  ? "STRATEGI"
                  : mode === "simple"
                    ? "INTUITIF"
                    : mode === "complex"
                      ? "AKADEMIK"
                      : "TANYA"}
              </button>
            ),
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3 text-slate-400">
              <Loader2 className="animate-spin text-indigo-600" />
              <p className="text-[9px] font-black uppercase tracking-widest italic text-center">
                AI Master sedang merumuskan bedah soal...
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-100 pb-2">
                {explanationMode === "quick" && (
                  <>
                    <Zap size={14} className="fill-indigo-600" /> Trik & Cara
                    Cepat
                  </>
                )}
                {explanationMode === "simple" && (
                  <>
                    <Lightbulb size={14} className="fill-indigo-600" />{" "}
                    Penjelasan Intuitif
                  </>
                )}
                {explanationMode === "complex" && (
                  <>
                    <Microscope size={14} className="fill-indigo-600" /> Logika
                    Formal
                  </>
                )}
                {explanationMode === "interactive" && (
                  <>
                    <Repeat size={14} className="fill-indigo-600" /> Mode
                    Refleksi Kritis
                  </>
                )}
              </div>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px] whitespace-pre-wrap">
                {aiAnalysis?.[explanationMode] || "Merumuskan strategi..."}
              </div>
              {activeQuestion.quickTrick && explanationMode === "quick" && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] sm:text-xs font-bold text-amber-900 italic">
                  💡 Trik Master: {activeQuestion.quickTrick}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={nextQuestion}
          className="w-full p-4 rounded-2xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 group shrink-0"
        >
          LANJUT KE SOAL{" "}
          <ChevronRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full gap-4 pb-28 md:pb-6 relative px-2 animate-in fade-in duration-500">
      {/* HUD Header */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setSelectedSubtest(null)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <X size={18} />
          </button>
          <div className="text-xs font-black text-slate-700">
            {activeQuestionIndex + 1} / {questions.length}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">
            <Zap size={10} /> {selectedSubtest}
          </div>
        </div>
        <div
          className={`font-mono font-black px-4 py-1.5 rounded-full text-xs md:text-sm transition-colors ${useTimer ? (timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-indigo-50 text-indigo-600") : "bg-slate-50 text-slate-400"}`}
        >
          {useTimer ? (
            <div className="flex items-center gap-2">
              <Clock size={16} /> {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RotateCcw size={16} /> Tanpa Batas
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="bg-white p-6 md:p-12 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 md:space-y-10 shrink-0">
            <div className="space-y-4">
              <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                Konteks Soal
              </span>
              <h3 className="text-base md:text-2xl font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                {activeQuestion.text}
              </h3>
            </div>

            <div className="space-y-2.5 md:space-y-4">
              {activeQuestion.options.map((opt, idx) => {
                const isCorrect = idx === activeQuestion.correctAnswer;
                const isSelected = idx === selectedAnswer;
                let btnClass =
                  "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm";
                if (isAnswered) {
                  if (isCorrect)
                    btnClass =
                      "border-green-500 bg-green-50 text-green-900 ring-4 ring-green-100";
                  else if (isSelected)
                    btnClass =
                      "border-red-500 bg-red-50 text-red-900 ring-4 ring-red-100";
                  else
                    btnClass =
                      "opacity-40 border-slate-50 bg-slate-50 grayscale";
                }
                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-4 md:p-6 rounded-[1.25rem] border-2 transition-all flex gap-3 md:gap-5 items-start group active:scale-[0.98] ${btnClass}`}
                  >
                    <span
                      className={`h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center font-black shrink-0 text-xs md:text-base transition-all ${isSelected ? "bg-indigo-600 text-white scale-110" : "bg-slate-100 text-slate-500"}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-bold pt-1.5 md:pt-2 text-xs md:text-lg leading-tight">
                      {opt}
                    </span>
                    {isAnswered && isCorrect && (
                      <CheckCircle
                        size={24}
                        className="ml-auto text-green-500"
                      />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle size={24} className="ml-auto text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Analysis Panel (only visible on small screens when answered) */}
          {isAnswered && (
            <div className="lg:hidden animate-in slide-in-from-bottom-6 duration-500 mb-6 px-1">
              <AnalysisContent />
            </div>
          )}
        </div>

        {/* Desktop Sidebar Analysis */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <AnalysisContent />
        </div>
      </div>

      {showDeepChat && (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-end sm:items-center justify-center p-2 md:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[75vh] md:h-[80vh] animate-in slide-in-from-bottom-10">
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center border border-white/20">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="font-black text-xs md:text-sm tracking-tight">
                    Konsultasi Master
                  </p>
                  <p className="text-[9px] text-indigo-100 opacity-80 font-bold uppercase tracking-widest">
                    Active Specialist
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeepChat(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 no-scrollbar"
              ref={chatScrollRef}
            >
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-xs md:text-sm font-bold leading-relaxed text-slate-800">
                  Tanyakan apa pun tentang soal ini! Saya akan bantu bedah
                  sampai kamu paham 100%. 🚀
                </div>
              </div>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm font-bold leading-relaxed shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-xl rounded-tl-none shadow-sm animate-pulse flex items-center gap-2">
                    <Loader2
                      size={14}
                      className="animate-spin text-indigo-600"
                    />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      AI Master...
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t shrink-0">
              <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
                <input
                  className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-slate-700"
                  placeholder="Ketik pertanyaan..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeepChat()}
                />
                <button
                  onClick={handleDeepChat}
                  disabled={isChatLoading}
                  className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
