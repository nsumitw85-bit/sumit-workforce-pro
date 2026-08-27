import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, Banknote, FileSpreadsheet, History, Settings } from 'lucide-react';
import { ActiveTab, CompanySettings, AppLanguage } from '../types';
import { translations } from '../utils/translations';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  onTabChange?: (tab: ActiveTab) => void;
  settings?: CompanySettings;
  language?: AppLanguage;
  onOpenAddEmployee?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onSelectTab, 
  onTabChange, 
  settings, 
  language 
}) => {
  const handleTabChange = onSelectTab || onTabChange || (() => {});
  const currentLang = settings?.language || language || 'en';
  const t = translations[currentLang] || translations.en;

  const tabs = [
    { id: 'dashboard' as ActiveTab, label: t.dashboard || 'Dashboard', icon: LayoutDashboard },
    { id: 'employees' as ActiveTab, label: t.navEmployees || 'Staff', icon: Users },
    { id: 'attendance' as ActiveTab, label: t.navAttendance || 'Attendance', icon: CalendarCheck },
    { id: 'salary' as ActiveTab, label: t.navSalary || 'Salary', icon: Banknote },
    { id: 'reports' as ActiveTab, label: t.navReports || 'Reports', icon: FileSpreadsheet },
    { id: 'history' as ActiveTab, label: 'History & Safety', icon: History },
    { id: 'settings' as ActiveTab, label: t.navSettings || 'Settings', icon: Settings }
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-lg border-t border-slate-800/90 text-white transition-colors shadow-2xl"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
    >
      <div className="max-w-2xl mx-auto px-1 sm:px-2 flex justify-between items-center h-14 sm:h-15">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 px-0.5 transition-all duration-200 group relative active:scale-95 cursor-pointer select-none ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Material 3 Active Pill */}
              <div
                className={`w-9 sm:w-11 h-6.5 sm:h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-xs'
                    : 'group-hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[9px] sm:text-[10px] tracking-tight mt-0.5 whitespace-nowrap leading-none ${isActive ? 'font-bold text-emerald-300' : 'font-medium text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
