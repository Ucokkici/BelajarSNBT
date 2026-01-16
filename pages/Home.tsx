
import React from 'react';
import { Progress, SubtestType } from '../types';
import { ArrowRight, Trophy, Zap, Clock, Calendar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeProps {
  progress: Progress;
}

const Home: React.FC<HomeProps> = ({ progress }) => {
  const getAverageScore = (type: SubtestType) => {
    const scores = progress.scores[type] || [];
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const recentHistory = progress.history.slice(-3).reverse();

  // SNPMB 2026 Schedule Logic
  const officialSchedule = [
    { label: "Registrasi Akun SNPMB Siswa", date: "12 Januari – 7 April 2026", icon: <Bell size={14} /> },
    { label: "Pendaftaran UTBK-SNBT", date: "25 Maret – 7 April 2026", icon: <Calendar size={14} /> },
    { label: "Pelaksanaan UTBK (Ujian)", date: "21 – 30 April 2026", icon: <Zap size={14} />, isMain: true },
    { label: "Pengumuman Hasil SNBT", date: "25 Mei 2026", icon: <Trophy size={14} /> },
    { label: "Masa Unduh Sertifikat UTBK", date: "2 Juni – 31 Juli 2026", icon: <Clock size={14} /> },
  ];

  const targetDate = new Date('2026-04-21');
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const countdownLabel = diffDays > 0 ? `${diffDays} Hari Lagi` : 'Sedang Berlangsung';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 md:pb-8">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="md:flex justify-between items-center relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight">Siap Tembus PTN 2026?</h2>
            <p className="text-indigo-100 max-w-md font-medium">Tingkatkan skor Anda dengan AI Tutor cerdas dan bank soal Master yang diperbarui setiap hari.</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/learn" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all active:scale-95">
                Mulai Belajar
              </Link>
              <Link to="/practice" className="bg-indigo-500/30 border border-white/20 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500/40 transition-all active:scale-95">
                Simulasi Latihan
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Latihan</p>
                <p className="text-5xl font-black">{progress.history.length}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase">
                  <span className="bg-green-400 text-slate-900 px-2 py-0.5 rounded-full">Progres Aktif</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-slate-800 px-2 flex items-center gap-3">
             <div className="h-5 w-1.5 bg-indigo-600 rounded-full"></div> Rata-rata Skor Subtest
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.values(SubtestType).map((type) => (
              <div key={type} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-indigo-300 group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{type}</p>
                <p className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{getAverageScore(type)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Zap size={18} className="text-indigo-600" /> Riwayat Latihan Terakhir
              </h3>
              <Link to="/analysis" className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Detail Analisis</Link>
            </div>
            {recentHistory.length > 0 ? (
              <div className="space-y-3">
                {recentHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                        <Zap size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">{item.subtest}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-indigo-600">{item.score}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Belum ada riwayat latihan</p>
                <Link to="/practice" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-3 inline-block bg-white px-4 py-2 rounded-lg border border-indigo-100 shadow-sm">Mulai Sekarang</Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 px-2">Agenda Resmi SNPMB 2026</h3>
          
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                   <Clock size={16} className="text-indigo-400" /> Hari H Ujian
                </h4>
                <span className="bg-indigo-600 text-[10px] font-black px-2 py-1 rounded uppercase">{countdownLabel}</span>
              </div>
              
              <div className="text-center py-4">
                 <p className="text-5xl font-black tracking-tighter text-indigo-400">{diffDays > 0 ? diffDays : '0'}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Menuju 21 April 2026</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                {officialSchedule.map((item, idx) => (
                  <div key={idx} className={`flex items-start gap-3 ${item.isMain ? 'bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30' : ''}`}>
                    <div className={`mt-0.5 ${item.isMain ? 'text-indigo-400' : 'text-slate-500'}`}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-tight ${item.isMain ? 'text-white' : 'text-slate-400'}`}>{item.label}</p>
                      <p className={`text-[11px] font-bold ${item.isMain ? 'text-indigo-200' : 'text-slate-300'}`}>{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-1000" 
                  style={{ width: `${Math.max(0, Math.min(100, (1 - diffDays / 120) * 100))}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-slate-500 text-center italic font-bold">*Sumber: Portal Resmi SNPMB 2026</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
               <Trophy size={18} className="text-amber-500" /> Tips Strategi Hari Ini
            </h4>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
               <p className="text-xs font-bold text-amber-900 leading-relaxed italic">
                 "Fokus pada penguasaan <strong>Penalaran Umum</strong> dan <strong>Literasi</strong>, karena kedua subtest ini memiliki bobot IRT yang cukup signifikan untuk mendongkrak skor total."
               </p>
            </div>
            <Link to="/learn" className="flex items-center justify-between text-[10px] font-black text-indigo-600 uppercase tracking-widest group">
               Pelajari Materi <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
