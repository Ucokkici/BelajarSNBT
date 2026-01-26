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
  Key,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Practice from "./pages/Practice";
import Analysis from "./pages/Analysis";
import Tutor from "./pages/Tutor";
import SettingsPage from "./pages/Settings";
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
  
  const [showRegularMenu, setShowRegularMenu] = useState(false);
  const [showHOTSMenu, setShowHOTSMenu] = useState(false);

  useEffect(() => {
    dbService.saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // ✅ PERBAIKAN: Download dengan jumlah soal yang lebih kecil (10 soal per batch)
  const handleDownloadSubtest = async (subtest: SubtestType, isHOTS: boolean = false) => {
    if (isSyncing) return;

    const apiKey = localStorage.getItem("user_gemini_api_key");
    if (!apiKey) {
      alert(
        "⚠️ Anda belum mengatur API Key!\n\nSilakan buka menu 'API Settings' di sidebar bawah dan masukkan kunci akses Google Anda terlebih dahulu.",
      );
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setShowRegularMenu(false);
    setShowHOTSMenu(false);

    try {
      // ✅ PERBAIKAN: Turunkan jumlah soal per batch untuk hindari truncation
      // Buat 2 batch @ 10 soal untuk total 20 soal
      const BATCH_SIZE = 10;
      const TOTAL_BATCHES = 2;
      let totalAdded = 0;

      console.log(
        `🎯 Downloading ${isHOTS ? 'HOTS ' : ''}questions for ${subtest} in ${TOTAL_BATCHES} batches...`,
      );

      for (let batch = 1; batch <= TOTAL_BATCHES; batch++) {
        console.log(`📦 Batch ${batch}/${TOTAL_BATCHES}...`);
        
        const newQuestions = await generateDynamicQuestions(
          subtest,
          BATCH_SIZE,
          isHOTS,
        );

        if (newQuestions && newQuestions.length > 0) {
          const added = dbService.addQuestions(newQuestions);
          totalAdded += added;
          console.log(`✅ Batch ${batch}: Added ${added} questions`);
        } else {
          console.warn(`⚠️ Batch ${batch} failed`);
        }

        setSyncProgress(Math.round((batch / TOTAL_BATCHES) * 100));
        
        // Delay antar batch untuk hindari rate limit
        if (batch < TOTAL_BATCHES) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      if (totalAdded > 0) {
        alert(
          `✅ Berhasil!\n\nMenambahkan ${totalAdded} soal ${isHOTS ? 'HOTS ' : ''}baru untuk:\n${subtest}`,
        );
      } else {
        alert(`⚠️ Gagal generate soal untuk: ${subtest}\n\nCoba lagi.`);
      }
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

  // ✅ Download Semua Soal Sekaligus (bulk) dengan batching
  const handleBulkSync = async (isHOTS: boolean = false) => {
    if (isSyncing) return;

    const apiKey = localStorage.getItem("user_gemini_api_key");
    if (!apiKey) {
      alert(
        "⚠️ Anda belum mengatur API Key!\n\nSilakan buka menu 'API Settings' di sidebar bawah dan masukkan kunci akses Google Anda terlebih dahulu.",
      );
      return;
    }

    const confirmed = confirm(
      `⚠️ DOWNLOAD SEMUA SOAL ${isHOTS ? 'HOTS' : 'REGULER'}\n\n` +
      "Ini akan mengunduh ~140 soal untuk semua subtest.\n" +
      "Proses ini bisa memakan waktu 5-10 menit.\n\n" +
      "Lanjutkan?"
    );
    
    if (!confirmed) return;

    setIsSyncing(true);
    setSyncProgress(0);
    setShowRegularMenu(false);
    setShowHOTSMenu(false);

    const subtests = Object.values(SubtestType);
    const BATCH_SIZE = 10;
    const BATCHES_PER_SUBTEST = 2;
    let totalAdded = 0;
    let completed = 0;
    const totalTasks = subtests.length * BATCHES_PER_SUBTEST;

    try {
      for (const subtest of subtests) {
        console.log(`🎯 Processing ${subtest}...`);

        for (let batch = 1; batch <= BATCHES_PER_SUBTEST; batch++) {
          try {
            const newQuestions = await generateDynamicQuestions(
              subtest,
              BATCH_SIZE,
              isHOTS,
            );

            if (newQuestions && newQuestions.length > 0) {
              totalAdded += dbService.addQuestions(newQuestions);
            }

            completed++;
            setSyncProgress(Math.round((completed / totalTasks) * 100));

            // Delay antar batch
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (batchError) {
            console.error(`Failed batch ${batch} for ${subtest}:`, batchError);
            // Continue dengan batch berikutnya
          }
        }
      }

      alert(
        `✅ Sinkronisasi ${isHOTS ? 'HOTS ' : ''}Selesai!\n\nBerhasil menambahkan ${totalAdded} soal baru.`,
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

  const handleResetQuestions = () => {
    if (
      confirm(
        "⚠️ RESET BANK SOAL\n\nIni akan menghapus semua soal yang sudah di-download dan mengembalikan ke soal awal (mock data).\n\nProgres belajar dan skor Anda TIDAK akan terhapus.\n\nLanjutkan?",
      )
    ) {
      const count = dbService.resetQuestions();
      alert(`✅ Bank soal direset!\n\nSekarang ada ${count} soal (data awal).`);
      window.location.reload();
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

  // Komponen Dropdown Menu untuk Pilih Subtest
  const SubtestMenu = ({ isHOTS }: { isHOTS: boolean }) => {
    const subtests = Object.values(SubtestType);
    
    return (
      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
        {/* Header dengan tombol Ambil Semua */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 p-3">
          <button
            onClick={() => handleBulkSync(isHOTS)}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg text-xs font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            <Sparkles size={14} />
            Ambil Semua (~140 Soal)
          </button>
          <p className="text-[9px] text-slate-500 text-center mt-1">
            Proses 5-10 menit • 2 batch per subtest
          </p>
        </div>

        {/* List Subtest */}
        <div className="p-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2">
            Pilih Subtest (20 soal = 2 batch)
          </p>
          {subtests.map((subtest) => {
            return (
              <button
                key={subtest}
                onClick={() => handleDownloadSubtest(subtest, isHOTS)}
                disabled={isSyncing}
                className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">
                    {subtest}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    20 soal {isHOTS ? 'HOTS' : 'reguler'} (2 batch × 10)
                  </p>
                </div>
                <Download size={16} className="text-slate-300 group-hover:text-indigo-600" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`
          fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 flex flex-col h-full
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="p-6 flex justify-between items-center shrink-0">
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

          <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            <nav className="space-y-1 mb-6">
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
          </div>

          <div className="shrink-0 bg-slate-50/50 border-t border-slate-200 p-6 flex flex-col gap-4">
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Update Bank Soal
              </p>

              {/* Progress indicator saat syncing */}
              {isSyncing && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-700">
                      Downloading...
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      {syncProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tombol Download Soal Reguler dengan Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowRegularMenu(!showRegularMenu);
                    setShowHOTSMenu(false);
                  }}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-between bg-indigo-600 text-white p-3 rounded-xl text-xs font-bold border border-indigo-700 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className={isSyncing ? "animate-spin" : ""} />
                    Tambah Soal Reguler
                  </div>
                  {showRegularMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {showRegularMenu && !isSyncing && <SubtestMenu isHOTS={false} />}
              </div>

              {/* Tombol Download Soal HOTS dengan Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowHOTSMenu(!showHOTSMenu);
                    setShowRegularMenu(false);
                  }}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-between bg-purple-600 text-white p-3 rounded-xl text-xs font-bold border border-purple-700 hover:bg-purple-700 transition-all shadow-md shadow-purple-100 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <Brain size={16} className={isSyncing ? "animate-spin" : ""} />
                    Tambah Soal HOTS
                  </div>
                  {showHOTSMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {showHOTSMenu && !isSyncing && <SubtestMenu isHOTS={true} />}
              </div>

              {/* Tombol Reset Bank Soal */}
              <button
                onClick={handleResetQuestions}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-700 p-3 rounded-xl text-xs font-bold border border-amber-200 hover:bg-amber-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database size={16} />
                Reset Bank Soal
              </button>
            </div>

            {/* Database Info */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Database Lokal
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {dbService.loadQuestions().length} Soal Aktif
                </p>
              </div>
              <Database size={18} className="text-slate-300" />
            </div>

            {/* App Actions */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 p-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  <Download size={16} /> Install App
                </button>
              )}

              <SidebarLink
                to="/settings"
                icon={<Key size={16} />}
                label="API Settings"
                onClick={() => setIsSidebarOpen(false)}
              />

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href="https://www.instagram.com/akbarsayangmamah/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 text-[10px] font-bold px-2 py-1 transition-colors"
                >
                  <Instagram size={14} /> @akbarsayangmamah
                </a>

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 text-slate-300 hover:text-red-500 text-[10px] font-medium px-2 py-1 transition-colors"
                >
                  <Settings size={12} /> Reset Database Total
                </button>
              </div>
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

          <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50/50">
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
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

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
          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
      }`}
    >
      {icon} {label}
    </Link>
  );
};

export default App;