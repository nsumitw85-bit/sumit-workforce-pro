import React, { useState, useEffect, useCallback } from 'react';
import { 
  Employee, 
  AttendanceRecord, 
  CompanySettings, 
  ActiveTab,
  AppLanguage,
  AppTheme
} from './types';
import { 
  loadEmployees, 
  saveEmployees, 
  loadAttendance, 
  saveAttendance, 
  loadSettings, 
  saveSettings,
  isAppLocked,
  setAppLockedState
} from './utils/storage';

// Modals and Global Elements
import { SplashScreen } from './components/SplashScreen';
import { PinLockModal } from './components/PinLockModal';
import { TopAppBar } from './components/TopAppBar';
import { BottomNav } from './components/BottomNav';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeeProfileModal } from './components/EmployeeProfileModal';
import { BulkAttendanceModal } from './components/BulkAttendanceModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AndroidSourceCodeModal } from './components/AndroidSourceCodeModal';

// Main Views
import { DashboardView } from './components/DashboardView';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { AttendanceView } from './components/AttendanceView';
import { SalaryView } from './components/SalaryView';
import { ReportsView } from './components/ReportsView';
import { HistoryArchiveView } from './components/HistoryArchiveView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // 1. Initial State Loading
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(loadSettings());
  
  // Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  }, []);

  // Theme application logic - Dark theme permanent
  const applyTheme = useCallback((_theme?: AppTheme) => {
    document.documentElement.classList.add('dark');
  }, []);

  // Initialize data and check theme / lock on mount
  useEffect(() => {
    const loadedEmps = loadEmployees();
    const loadedAtt = loadAttendance();
    const loadedSet = loadSettings();
    setEmployees(loadedEmps);
    setAttendance(loadedAtt);
    setSettings(loadedSet);

    if (loadedSet.appLockEnabled && isAppLocked()) {
      setIsLocked(true);
    }

    applyTheme('dark');

    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyTheme]);

  // Sync data refresh when backup is restored
  const reloadData = useCallback(() => {
    const loadedEmps = loadEmployees();
    const loadedAtt = loadAttendance();
    const loadedSet = loadSettings();
    setEmployees(loadedEmps);
    setAttendance(loadedAtt);
    setSettings(loadedSet);
    applyTheme(loadedSet.theme);
  }, [applyTheme]);

  // Theme Toggle (Quick cycle or Light/Dark)
  const handleToggleDarkMode = () => {
    const nextTheme: AppTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updatedSettings: CompanySettings = {
      ...settings,
      theme: nextTheme,
      darkMode: nextTheme === 'dark'
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme.toUpperCase()} theme`);
  };

  // Language Change Quick Toggle
  const handleChangeLanguage = (lang: AppLanguage) => {
    const updatedSettings: CompanySettings = {
      ...settings,
      language: lang
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    showToast(`Language: ${lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}`);
  };

  // Lock / Unlock Handlers
  const handleLockApp = () => {
    setIsLocked(true);
    setAppLockedState(true);
  };

  const handleUnlockApp = () => {
    setIsLocked(false);
    setAppLockedState(false);
  };

  // Employee CRUD
  const handleSaveEmployee = (empData: Employee) => {
    let updated: Employee[];
    const exists = employees.some((e) => e.id === empData.id);
    if (exists) {
      updated = employees.map((e) => (e.id === empData.id ? empData : e));
      showToast(`Updated profile for ${empData.name}`);
    } else {
      updated = [empData, ...employees];
      showToast(`Registered new employee: ${empData.name}`);
    }
    setEmployees(updated);
    saveEmployees(updated);

    if (selectedProfileEmployee?.id === empData.id) {
      setSelectedProfileEmployee(empData);
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    const updated = employees.filter((e) => e.id !== empId);
    setEmployees(updated);
    saveEmployees(updated);
    showToast(`Removed employee ${emp?.name || empId}`);
  };

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsFormModalOpen(true);
  };

  // Attendance Handlers
  const handleUpdateAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendance(newRecords);
    saveAttendance(newRecords);
  };

  const handleSaveBulkAttendance = (bulkRecords: AttendanceRecord[]) => {
    const existingMap = new Map<string, AttendanceRecord>();
    attendance.forEach((r) => existingMap.set(r.id, r));
    bulkRecords.forEach((r) => existingMap.set(r.id, r));
    const merged = Array.from(existingMap.values());
    setAttendance(merged);
    saveAttendance(merged);
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    applyTheme(newSettings.theme);
  };

  const isDarkMode = settings.theme === 'dark';

  return (
    <div id="sumit-workforce-app-root" className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col transition-colors duration-200">
      
      {/* 1. Splash Screen on first launch */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* 2. Security PIN Lock Modal */}
      {isLocked && (
        <PinLockModal
          settings={settings}
          onUnlock={handleUnlockApp}
          onResetPin={(newPin) => {
            const updated = { ...settings, pinCode: newPin };
            handleUpdateSettings(updated);
          }}
        />
      )}

      {/* 3. Top Navigation Bar (Header) */}
      <TopAppBar
        activeTab={activeTab}
        settings={settings}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onChangeLanguage={handleChangeLanguage}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLockApp={handleLockApp}
        onOpenAddEmployee={handleOpenAddEmployee}
        onOpenBulkAttendance={() => setIsBulkAttendanceOpen(true)}
      />

      {/* 4. Main Body Container with Adaptive Padding & Scrollability */}
      <main
        id="main-content-view"
        className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-5 overflow-y-auto"
        style={{ paddingBottom: 'calc(4.75rem + max(env(safe-area-inset-bottom, 0px), 16px))' }}
      >
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            employees={employees}
            attendance={attendance}
            settings={settings}
            onNavigateTab={setActiveTab}
            onOpenAddEmployee={handleOpenAddEmployee}
            onOpenBulkAttendance={() => setIsBulkAttendanceOpen(true)}
            onViewEmployeeProfile={(emp) => setSelectedProfileEmployee(emp)}
          />
        )}

        {/* Tab 2: Employee Roster */}
        {activeTab === 'employees' && (
          <EmployeeManagementView
            employees={employees}
            attendance={attendance}
            settings={settings}
            onAddEmployee={handleOpenAddEmployee}
            onEditEmployee={handleOpenEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onViewEmployeeProfile={(emp) => setSelectedProfileEmployee(emp)}
          />
        )}

        {/* Tab 3: Attendance */}
        {activeTab === 'attendance' && (
          <AttendanceView
            employees={employees}
            attendance={attendance}
            settings={settings}
            onUpdateAttendance={handleUpdateAttendance}
            onOpenBulkModal={() => setIsBulkAttendanceOpen(true)}
            onShowToast={showToast}
          />
        )}

        {/* Tab 4: Salary & Payroll */}
        {activeTab === 'salary' && (
          <SalaryView
            employees={employees}
            attendance={attendance}
            settings={settings}
            onShowToast={showToast}
          />
        )}

        {/* Tab 5: Reports */}
        {activeTab === 'reports' && (
          <ReportsView
            employees={employees}
            attendance={attendance}
            settings={settings}
            onShowToast={showToast}
          />
        )}

        {/* Tab 6: History & Safety Hub */}
        {activeTab === 'history' && (
          <HistoryArchiveView
            employees={employees}
            attendance={attendance}
            settings={settings}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onShowToast={showToast}
            onReloadData={reloadData}
          />
        )}

        {/* Tab 7: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onShowToast={showToast}
            employees={employees}
            attendance={attendance}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onReloadData={reloadData}
            onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          />
        )}

      </main>

      {/* 5. Material 3 Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTabChange={setActiveTab}
        settings={settings}
        language={settings?.language}
        onOpenAddEmployee={handleOpenAddEmployee}
      />

      {/* 6. Employee Add / Edit Modal */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        existingEmployees={employees}
      />

      {/* 7. Employee Profile Modal */}
      {selectedProfileEmployee && (
        <EmployeeProfileModal
          isOpen={Boolean(selectedProfileEmployee)}
          onClose={() => setSelectedProfileEmployee(null)}
          employee={selectedProfileEmployee}
          attendance={attendance}
          settings={settings}
          onEditEmployee={(emp) => {
            setSelectedProfileEmployee(null);
            handleOpenEditEmployee(emp);
          }}
          onDeleteEmployee={(empId) => {
            handleDeleteEmployee(empId);
            setSelectedProfileEmployee(null);
          }}
        />
      )}

      {/* 8. Bulk Attendance Fast Modal */}
      <BulkAttendanceModal
        isOpen={isBulkAttendanceOpen}
        onClose={() => setIsBulkAttendanceOpen(false)}
        employees={employees}
        attendance={attendance}
        settings={settings}
        onSaveBulkAttendance={handleSaveBulkAttendance}
        onShowToast={showToast}
      />

      {/* 9. Global Ctrl+K Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        employees={employees}
        attendance={attendance}
        onSelectEmployee={(emp) => setSelectedProfileEmployee(emp)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* 10. Android Studio Native Architecture Modal */}
      <AndroidSourceCodeModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* 11. Global Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-emerald-600 text-white text-xs font-bold shadow-2xl backdrop-blur-xs flex items-center gap-2 border border-slate-700 dark:border-emerald-400 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
