import React, { useState, useRef, useEffect } from "react";
import { getTutorResponse } from "../services/geminiService";
import { ChatMessage } from "../types";
import {
  Send,
  Sparkles,
  User,
  Bot,
  Loader2,
  ChevronLeft,
  Brain,
  Terminal,
  Target,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Tutor: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage = (location.state as any)?.initialMessage;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Halo! Saya **AI Master SNBT Profesional**. \n\nSaya menguasai ke-7 subtest (PU, PK, PM, Literasi, dll). Gunakan perintah khusus ini untuk belajar lebih efektif: \n\n• **LATIHAN** untuk simulasi soal \n• **BERI TRIK SNBT** untuk cara cepat \n• **JELASKAN ULANG** untuk analogi sederhana \n• **TINGKATKAN KE LEVEL SULIT** untuk tantangan HOTS \n\nMau mulai dari materi apa hari ini? Target kita skor **750+**! 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      handleAutoSend(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAutoSend = async (text: string) => {
    const userMessage: ChatMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const response = await getTutorResponse(
      [userMessage],
      "Konteks: Diskusi Profesional Ahli Strategi",
    );
    setMessages((prev) => [
      ...prev,
      {
        role: "model",
        text: response || "Maaf, sistem sedang memproses logika lain.",
      },
    ]);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const response = await getTutorResponse(messages.concat(userMessage));

    setMessages((prev) => [
      ...prev,
      {
        role: "model",
        text:
          response ||
          "Maaf, sirkuit logika saya sedang mengalami kendala teknis.",
      },
    ]);
    setIsLoading(false);
  };

  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-black text-indigo-700">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Expanded symbol detection for all 7 subtests (Logic, Math, Sets)
      const symbolRegex = /[→¬∧∨∴↔≡√π±≠≤≥²³∩∪∑∫≈∈∉⊂]/g;
      const symbolCount = (line.match(symbolRegex) || []).length;
      const isTechnical = symbolCount >= 1;

      return (
        <p
          key={i}
          className={`mb-2 last:mb-0 ${isTechnical ? "bg-indigo-50/70 px-4 py-2.5 rounded-xl border-l-4 border-indigo-500 font-mono text-indigo-900 font-bold shadow-sm my-2" : ""}`}
        >
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 p-6 text-white flex items-center justify-between shrink-0 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="md:hidden p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold leading-tight text-lg tracking-tight flex items-center gap-2">
              AI Master Tutor
              <span className="bg-green-400 h-2 w-2 rounded-full animate-pulse"></span>
            </h2>
            <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-black opacity-80">
              Professional Omni-Specialist
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
          <Target size={14} className="text-indigo-200" />
          <span>Target Skor 750+</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth no-scrollbar"
        ref={scrollRef}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`flex gap-3 max-w-[92%] md:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm
                ${msg.role === "user" ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-indigo-600 border-slate-200"}`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none prose prose-sm max-w-none"
                }`}
              >
                {renderMessageContent(msg.text)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
              <Loader2 className="animate-spin text-indigo-600" size={18} />
              <span className="text-xs font-black text-slate-500 italic uppercase tracking-[0.2em]">
                Ahli Tutor sedang merumuskan strategi...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100 shrink-0">
        <div className="flex gap-4 items-center bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all shadow-inner">
          <input
            type="text"
            placeholder="Coba ketik 'LATIHAN' atau 'BERI TRIK SNBT'..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-slate-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`
    h-12 w-12 sm:h-11 sm:w-11
    rounded-xl sm:rounded-lg
    flex items-center justify-center
    transition-all duration-150
    touch-manipulation
    ${
      isLoading
        ? "bg-slate-200 text-slate-400"
        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95"
    }
  `}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex justify-center gap-4 mt-4 overflow-x-auto no-scrollbar pb-1">
          {["LATIHAN", "BERI TRIK SNBT", "JELASKAN ULANG", "LEVEL SULIT"].map(
            (cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setInput(cmd);
                }}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors uppercase tracking-widest whitespace-nowrap"
              >
                {cmd}
              </button>
            ),
          )}
        </div>
        <p className="text-[9px] text-slate-400 text-center mt-3 uppercase tracking-[0.2em] font-black opacity-60">
          Professional Strategy • Unicode Standard Logic • 7 Subtests Integrated
        </p>
      </div>
    </div>
  );
};

export default Tutor;
