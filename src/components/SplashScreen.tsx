import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 15;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      id="splash-screen-container"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-8 select-none overflow-hidden"
    >
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Tag */}
      <div className="w-full flex justify-between items-center pt-4 opacity-80">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Offline First • Room DB Ready</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">v2.4.0 (SDK 36)</span>
      </div>

      {/* Main Center Branding */}
      <div className="flex flex-col items-center text-center max-w-sm my-auto animate-fade-in">
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl blur opacity-30 animate-pulse" />
          <BrandLogo size="xl" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Sumit Workforce <span className="text-emerald-400">PRO</span>
        </h1>

        <p className="text-sm text-slate-300 font-medium tracking-wide mb-6">
          Smart Attendance, Salary & Workforce Management
        </p>

        {/* Progress Bar */}
        <div className="w-64 bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/50 mb-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>{progress < 100 ? 'Initializing secure local storage...' : 'Ready! Loading workspace...'}</span>
        </div>
      </div>

      {/* Bottom Footer & Skip Action */}
      <div className="w-full flex flex-col items-center gap-3 pb-4">
        <button
          id="splash-screen-enter-btn"
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <span>Enter Application</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-500 font-mono">
          com.sumitworkforcepro.app • Material 3 • Android SDK 36
        </p>
      </div>
    </div>
  );
};
