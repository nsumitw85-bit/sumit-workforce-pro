import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Moon, Sun, Globe, Plus, CheckSquare, Search, Lock } from 'lucide-react';
import { CompanySettings, AppLanguage, ActiveTab } from '../types';
import { translations } from '../utils/translations';

interface TopAppBarProps {
  activeTab?: ActiveTab;
  settings?: CompanySettings;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onToggleTheme?: () => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onOpenSearch?: () => void;
  onLockApp?: () => void;
  onQuickAddEmployee?: () => void;
  onOpenAddEmployee?: () => void;
  onQuickBulkAttendance?: () => void;
  onOpenBulkAttendance?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  settings,
  isDarkMode,
  onToggleDarkMode,
  onToggleTheme,
  onChangeLanguage,
  onOpenSearch,
  onLockApp,
  onQuickAddEmployee,
  onOpenAddEmployee,
  onQuickBulkAttendance,
  onOpenBulkAttendance
}) => {
  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;
  const toggleTheme = onToggleDarkMode || onToggleTheme || (() => {});
  const addEmp = onOpenAddEmployee || onQuickAddEmployee || (() => {});
  const bulkAtt = onOpenBulkAttendance || onQuickBulkAttendance || (() => {});

  const nextLanguage: Record<AppLanguage, AppLanguage> = {
    en: 'hi',
    hi: 'mr',
    mr: 'en'
  };

  const languageLabels: Record<AppLanguage, string> = {
    en: 'EN',
    hi: 'हिं',
    mr: 'मरा'
  };

  const isDark = isDarkMode !== undefined ? isDarkMode : settings?.theme === 'dark' || settings?.darkMode;

  return (
    <header
      id="top-app-bar"
      className="sticky top-0 z-30 w-full bg-gradient-to-r from-[#111827] via-[#0F172A] to-[#1E293B] border-b border-slate-800 text-white transition-colors shadow-lg"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Branding */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <BrandLogo size="sm" showText={true} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Global Search Button */}
          {onOpenSearch && (
            <button
              id="top-bar-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-[#1E293B] text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all border border-slate-700 active:scale-95"
              title="Search Employees (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden md:inline">Search (Ctrl+K)</span>
            </button>
          )}

          {/* Quick Bulk Attendance */}
          <button
            id="top-bar-bulk-att-btn"
            onClick={bulkAtt}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 text-xs font-bold hover:bg-emerald-900/80 transition-all border border-emerald-800/60 shadow-xs active:scale-95"
            title="Bulk Attendance"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.bulkAttendance}</span>
          </button>

          {/* Quick Add Employee */}
          <button
            id="top-bar-add-emp-btn"
            onClick={addEmp}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/40 active:scale-95"
            title="Add Staff"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.addEmployee}</span>
          </button>

          {/* Language Switcher Quick Button */}
          <button
            id="top-bar-lang-toggle"
            onClick={() => onChangeLanguage(nextLanguage[currentLang])}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700 active:scale-95"
            title="Switch Language (English / Hindi / Marathi)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{languageLabels[currentLang]}</span>
          </button>

          {/* Theme Indicator / Button */}
          <button
            id="top-bar-theme-toggle"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors active:scale-95"
            title="Dark Theme Active"
          >
            <Moon className="w-4 h-4 text-indigo-400" />
          </button>

          {/* App Lock Button (if enabled) */}
          {settings?.appLockEnabled && onLockApp && (
            <button
              id="top-bar-lock-btn"
              onClick={onLockApp}
              className="p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors"
              title="Lock App"
            >
              <Lock className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
