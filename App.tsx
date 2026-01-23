import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  PenTool,
  TrendingUp,
  MessageCircle,
  Menu,
  Download,
  Settings,
  X,
  Database,
  Sparkles,
  Instagram,
  Key, // Import baru untuk icon settings
} from "lucide-react";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Practice from "./pages/Practice";
import Analysis from "./pages/Analysis";
import Tutor from "./pages/Tutor";
import SettingsPage from "./pages/Settings"; // Import Komponen Settings Baru
import { Progress, SubtestType } from "./types";
import { dbService } from "./services/dbService";
import { generateDynamicQuestions } from "./services/geminiService";

const App: React.FC = () => {
  const [progress, setProgress] = useState<Progress>(() =>
    dbService.loadProgress(),
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Simpan progress setiap berubah
  useEffect(() => {
    dbService.saveProgress(progress);
  }, [progress]);

  // PWA Install Prompt
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Fungsi Download Soal (Sudah ada di kode Anda, dibiarkan apa adanya)
  const handleBulkSync = async () => {
    if (isSyncing) return;

    // ✅ CEK TAMBAHAN: Pastikan user sudah punya API Key sebelum download
    const apiKey = localStorage.getItem("user_gemini_api_key");
    if (!apiKey) {
      alert(
        "⚠️ Anda belum mengatur API Key!\n\nSilakan buka menu 'API Settings' di sidebar bawah dan masukkan kunci akses Google Anda terlebih dahulu.",
      );
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    const subtests = Object.values(SubtestType);
    let totalAdded = 0;

    try {
      for (let i = 0; i < subtests.length; i++) {
        const subtest = subtests[i];

        const isMath =
          subtest.toLowerCase().includes("kuantitatif") ||
          subtest.toLowerCase().includes("matematika");
        const count = isMath ? 10 : 20;

        console.log(`🎯 Downloading for ${subtest} (Count: ${count})...`);

        const newQuestions = await generateDynamicQuestions(subtest, count);

        if (newQuestions && newQuestions.length > 0) {
          totalAdded += dbService.addQuestions(newQuestions);
        } else {
          console.warn(`⚠️ Gagal generate/download soal untuk: ${subtest}`);
        }

        setSyncProgress(Math.round(((i + 1) / subtests.length) * 100));
      }

      alert(
        `Sinkronisasi Selesai! Berhasil menambahkan ${totalAdded} soal baru.`,
      );
    } catch (err: any) {
      const errorMessage = err.message || String(err);

      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("429") ||
        errorMessage.includes("Too Many Requests")
      ) {
        alert(
          "⚠️ KUOTA HABIS!\n\n" +
            "API Key Anda telah mencapai batas permintaan hari ini.\n" +
            "💡 Solusi: Coba lagi besok atau gunakan API Key lain.",
        );
      } else {
        alert(
          "Terjadi kendala saat menghubungi AI. Periksa koneksi internet Anda.",
        );
      }
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "⚠️ PERINGATAN: Ini akan menghapus SELURUH bank soal, progres belajar, dan skor Anda secara permanen. Lanjutkan?",
      )
    ) {
      dbService.clearData();
    }
  };

  const updateProgress = (newProgress: Partial<Progress>) => {
    setProgress((prev) => ({ ...prev, ...newProgress }));
  };

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Overlay Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-1 rounded">L</span>{" "}
              LulusSNBT
            </h1>
            <button
              className="lg:hidden text-slate-400"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-4 px-4 space-y-1">
            <SidebarLink
              to="/"
              icon={<LayoutDashboard size={20} />}
              label="Beranda"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarLink
              to="/learn"
              icon={<BookOpen size={20} />}
              label="Modul Belajar"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarLink
              to="/practice"
              icon={<PenTool size={20} />}
              label="Latihan Soal"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarLink
              to="/analysis"
              icon={<TrendingUp size={20} />}
              label="Analisis Skor"
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarLink
              to="/tutor"
              icon={<MessageCircle size={20} />}
              label="AI Tutor"
              onClick={() => setIsSidebarOpen(false)}
            />
          </nav>

          <div className="absolute bottom-6 left-0 right-0 px-6 space-y-3">
            {/* Tombol Download Soal (Manual) */}
            <div className="relative">
              <button
                onClick={handleBulkSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-xl text-xs font-bold border border-indigo-700 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300"
              >
                <Sparkles
                  size={16}
                  className={isSyncing ? "animate-spin" : ""}
                />
                {isSyncing ? `Sync ${syncProgress}%` : "Ambil 140 Soal Baru"}
              </button>
            </div>

            {/* Tombol Install App */}
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 p-3 rounded-xl text-sm font-bold hover:bg-slate-200"
              >
                <Download size={18} /> Install App
              </button>
            )}

            {/* Info Database */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Database Lokal
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {dbService.loadQuestions().length} Soal Aktif
                </p>
              </div>
              <Database size={20} className="text-slate-300" />
            </div>

            {/* TAMBAHAN: Menu API Settings */}
            <div className="pt-2 border-t border-slate-100">
              <SidebarLink
                to="/settings"
                icon={<Key size={16} />}
                label="API Settings"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <a
                href="https://www.instagram.com/akbarsayangmamah/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-[10px] font-bold px-4 py-1 transition-colors"
              >
                <Instagram size={14} /> @akbarsayangmamah
              </a>

              <button
                onClick={handleReset}
                className="w-full flex items-center gap-2 text-slate-300 hover:text-red-500 text-[10px] font-medium px-4 py-1 transition-colors"
              >
                <Settings size={12} /> Reset Database Total
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <button
              className="lg:hidden p-2 text-slate-500"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Belajar UTBK <span className="text-indigo-600">•</span> Menuju PTN
              Impian
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
            <Routes>
              <Route
                path="/"
                element={
                  <Home progress={progress} setProgress={updateProgress} />
                }
              />
              <Route
                path="/learn"
                element={
                  <Learn progress={progress} setProgress={updateProgress} />
                }
              />
              <Route
                path="/practice"
                element={
                  <Practice progress={progress} setProgress={updateProgress} />
                }
              />
              <Route
                path="/analysis"
                element={<Analysis progress={progress} />}
              />
              <Route path="/tutor" element={<Tutor />} />

              {/* ROUTE BARU: Halaman Settings */}
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

// Komponen SidebarLink Helper
const SidebarLink = ({ to, icon, label, onClick }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-x-1"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon} {label}
    </Link>
  );
};

export default App;
