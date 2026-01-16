
import React from 'react';
import { Progress, SubtestType } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { TrendingUp, AlertTriangle, Target, Award } from 'lucide-react';

interface AnalysisProps {
  progress: Progress;
}

const Analysis: React.FC<AnalysisProps> = ({ progress }) => {
  const getAverage = (type: SubtestType) => {
    const scores = progress.scores[type] || [];
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getAbbreviation = (type: SubtestType) => {
    switch (type) {
      case SubtestType.PenalaranUmum: return 'PU';
      case SubtestType.PengetahuanKuantitatif: return 'PK';
      case SubtestType.LiterasiIndo: return 'LBI';
      case SubtestType.LiterasiInggris: return 'LBE';
      case SubtestType.PenalaranMatematika: return 'PM';
      case SubtestType.PPU: return 'PPU';
      case SubtestType.PBM: return 'PBM';
      default: return '';
    }
  };

  const chartData = Object.values(SubtestType).map(type => ({
    name: getAbbreviation(type),
    fullName: type,
    score: getAverage(type)
  }));

  const radarData = Object.values(SubtestType).map(type => ({
    subject: getAbbreviation(type),
    A: getAverage(type),
    fullMark: 1000,
  }));

  const lowestScoreSubject = [...chartData].sort((a, b) => a.score - b.score)[0];
  const highestScoreSubject = [...chartData].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-6 px-2">
      <header className="px-2">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Analisis Performa</h2>
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-widest">Pantau Kesiapan UTBK 2025</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart */}
          <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm md:text-base">
              <TrendingUp size={20} className="text-indigo-600" /> Rata-rata Skor (7 Subtest)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} 
                  />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 1000]} tick={{ fontSize: 9 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 24 : 45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 700 ? '#4f46e5' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend Map for Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-8 pt-6 border-t border-slate-50">
              {chartData.map(d => (
                <div key={d.fullName} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${d.score > 700 ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight truncate">{d.name}: {d.fullName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm">Prioritas Belajar</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Skor terendah: <span className="font-black text-red-600 block truncate">{lowestScoreSubject?.fullName || '-'}</span></p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm">Potensi Tertinggi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Skor tertinggi: <span className="font-black text-green-600 block truncate">{highestScoreSubject?.fullName || '-'}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="font-black text-slate-800 mb-6 text-center text-xs uppercase tracking-widest">Balanced Skill Map</h3>
             <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 1000]} axisLine={false} tick={false} />
                  <Radar
                    name="Skor"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
             <div className="relative z-10 space-y-5">
                <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Target size={18} className="text-indigo-400" /> Target Passing Grade
                </h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase">
                     <span className="text-slate-400">Total Progres</span>
                     <span className="text-indigo-400">{Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / 7)} / 1000</span>
                   </div>
                   <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                     <div 
                       className="bg-indigo-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                       style={{ width: `${(chartData.reduce((acc, curr) => acc + curr.score, 0) / 7000) * 100}%` }}
                     ></div>
                   </div>
                   <p className="text-[9px] text-slate-400 italic leading-relaxed">Terus berlatih untuk mencapai ambang batas kompetitif 700+ di setiap subtest.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
