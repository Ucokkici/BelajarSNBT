import React, { useState, useEffect } from "react";
import { BookOpen, TrendingUp, Award, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Fade out before completing
          setOpacity(0);
          setTimeout(() => onComplete?.(), 600);
          return 100;
        }
        return prev + 0.5;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center overflow-hidden z-50 transition-opacity duration-500"
      style={{ opacity }}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-md w-full">
        {/* Elegant logo */}
        <div className="mb-12">
          <div className="flex items-center gap-3 justify-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <span className="text-3xl font-bold text-white">L</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LulusSNBT
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 tracking-wide">
                Persiapan UTBK Terbaik
              </p>
            </div>
          </div>
        </div>

        {/* Minimalist icon display */}
        <div className="mb-8 flex items-center justify-center gap-6">
          {[
            { icon: BookOpen, delay: 0 },
            { icon: Sparkles, delay: 200 },
            { icon: TrendingUp, delay: 400 },
            { icon: Award, delay: 600 },
          ].map((item, idx) => (
            <div
              key={idx}
              className="animate-fade-in-up"
              style={{ animationDelay: `${item.delay}ms` }}
            >
              <item.icon
                size={20}
                className="text-slate-300 transition-all duration-700"
                style={{
                  color: progress >= (idx + 1) * 25 ? "#6366f1" : "#cbd5e1",
                  opacity: progress >= (idx + 1) * 25 ? 1 : 0.3,
                }}
              />
            </div>
          ))}
        </div>

        {/* Refined progress bar */}
        <div className="w-full mb-4">
          <div className="relative h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Elegant status text */}
        <div className="text-center">
          <p className="text-sm text-slate-600 font-medium">
            {progress < 25 && "Website belajar SNBT"}
            {progress >= 25 && progress < 50 && "Berbasis AI"}
            {progress >= 50 && progress < 75 && "Interaktif Website"}
            {progress >= 75 && progress < 100 && "Untuk PTN Impian"}
            {progress >= 100 && "Siap dimulai"}
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Refined tagline */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          Belajar UTBK · Menuju PTN Impian
        </p>
        <br />
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          Website Designed by Ahmad Akbar
        </p>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
