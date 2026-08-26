import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Sun, 
  Moon, 
  Palette, 
  FileSpreadsheet, 
  Building2, 
  Save, 
  Check, 
  RotateCcw,
  Calendar,
  CalendarRange,
  CalendarDays,
  Banknote,
  CheckCircle2,
  XCircle,
  Layers,
  Download,
  Share2,
  Database,
  Upload,
  FileCode,
  AlertTriangle,
  Copy,
  FileCheck,
  HardDrive,
  ShieldCheck,
  X,
  FileUp,
  Table,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  ArrowDownToLine,
  Smartphone,
  PackageCheck,
  Code
} from 'lucide-react';
import { CompanySettings, AppLanguage, AppTheme, CustomThemeAccent, Employee, AttendanceRecord, ActiveTab, BackupData } from '../types';
import { translations } from '../utils/translations';
import { 
  resetToInitialDemoData, 
  exportCompleteBackup, 
  restoreCompleteBackup,
  calculateMonthlySalaries
} from '../utils/storage';
import {
  generateDailyAttendancePDF,
  generateWeeklyAttendancePDF,
  generateMonthlyAttendancePDF,
  generateDailySalaryPDF,
  generateWeeklySalaryPDF,
  generateMonthlySalaryPDF,
  generatePresentSummaryPDF,
  generateAbsentSummaryPDF,
  generateDoubleDutySummaryPDF
} from '../utils/pdfGenerator';
import { sharePdfToWhatsApp } from '../utils/shareUtils';
import {
  generateMonthlyPayrollCSV,
  generateDetailedAttendanceMatrixCSV,
  downloadCsvFile
} from '../utils/csvExporter';

interface SettingsViewProps {
  settings: CompanySettings;
  onUpdateSettings: (settings: CompanySettings) => void;
  onShowToast?: (msg: string) => void;
  employees?: Employee[];
  attendance?: AttendanceRecord[];
  onNavigateTab?: (tab: ActiveTab) => void;
  onReloadData?: () => void;
  onOpenAndroidModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onShowToast = (_msg: string) => {},
  employees = [],
  attendance = [],
  onNavigateTab,
  onReloadData,
  onOpenAndroidModal
}) => {
  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;

  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7);

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [backupRawJson, setBackupRawJson] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<BackupData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);

  // CSV Export & External Payroll Integration State
  const [csvMonth, setCsvMonth] = useState<string>(currentMonthStr);
  const [showCsvPreview, setShowCsvPreview] = useState<boolean>(false);
  const [csvPreviewType, setCsvPreviewType] = useState<'payroll' | 'matrix'>('payroll');
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false);

  // Selected Month Payroll & Attendance Analytics
  const selectedMonthSlips = calculateMonthlySalaries(employees, attendance, formData, csvMonth);
  const totalPayableShiftsMonth = selectedMonthSlips.reduce((acc, s) => acc + s.payableDays, 0);
  const totalPayrollMonth = selectedMonthSlips.reduce((acc, s) => acc + s.netSalary, 0);
  const totalPresentMonth = selectedMonthSlips.reduce((acc, s) => acc + s.presentDays, 0);
  const totalDoubleDutyMonth = selectedMonthSlips.reduce((acc, s) => acc + s.doubleDutyDays, 0);
  const totalAbsentMonth = selectedMonthSlips.reduce((acc, s) => acc + s.absentDays, 0);
  const monthAttendanceCount = attendance.filter((a) => a.date && a.date.startsWith(csvMonth)).length;

  const handleShiftCsvMonth = (offset: number) => {
    const [y, m] = csvMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    const newMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCsvMonth(newMonthStr);
  };

  const handleExportCurrentMonthPayrollCsv = () => {
    try {
      const csv = generateMonthlyPayrollCSV(employees, attendance, formData, csvMonth);
      const safeCompany = (formData.companyName || 'Sumit_Workforce').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Payroll_Export_${csvMonth}_${safeCompany}.csv`;
      downloadCsvFile(csv, filename);
      onShowToast(`CSV Exported: Payroll & Attendance for ${csvMonth}`);
    } catch (e) {
      console.error('CSV Export error:', e);
      onShowToast('Failed to export payroll CSV');
    }
  };

  const handleExportDetailedMatrixCsv = () => {
    try {
      const csv = generateDetailedAttendanceMatrixCSV(employees, attendance, formData, csvMonth);
      const safeCompany = (formData.companyName || 'Sumit_Workforce').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Attendance_Matrix_${csvMonth}_${safeCompany}.csv`;
      downloadCsvFile(csv, filename);
      onShowToast(`CSV Exported: Attendance Matrix for ${csvMonth}`);
    } catch (e) {
      console.error('Matrix CSV Export error:', e);
      onShowToast('Failed to export attendance matrix CSV');
    }
  };

  const handleCopyCsvContent = (type: 'payroll' | 'matrix') => {
    try {
      const csv = type === 'payroll'
        ? generateMonthlyPayrollCSV(employees, attendance, formData, csvMonth)
        : generateDetailedAttendanceMatrixCSV(employees, attendance, formData, csvMonth);
      navigator.clipboard.writeText(csv);
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2500);
      onShowToast(`${type === 'payroll' ? 'Payroll Summary' : 'Attendance Matrix'} CSV copied to clipboard!`);
    } catch (e) {
      onShowToast('Failed to copy CSV data');
    }
  };

  // 1. Language Handler (Marathi, Hindi, English)
  const handleLanguageChange = (lang: AppLanguage) => {
    const updated = { ...formData, language: lang };
    setFormData(updated);
    onUpdateSettings(updated);
    onShowToast(
      lang === 'mr'
        ? 'मराठी भाषा सेट केली आहे'
        : lang === 'hi'
        ? 'हिंदी भाषा सेट कर दी गई है'
        : 'Language switched to English'
    );
  };

  // 2. Theme Handler (Dark, Light, Custom)
  const handleThemeChange = (theme: AppTheme) => {
    const isDark = theme === 'dark' || theme === 'custom';
    const updated = { ...formData, theme, darkMode: isDark };
    setFormData(updated);
    onUpdateSettings(updated);
    onShowToast(`Theme: ${theme.toUpperCase()}`);
  };

  // Custom Accent Selector
  const handleAccentChange = (accent: CustomThemeAccent) => {
    const updated = { ...formData, theme: 'custom' as AppTheme, customAccent: accent, darkMode: true };
    setFormData(updated);
    onUpdateSettings(updated);
    onShowToast(`Accent changed to ${accent}`);
  };

  // 3. Quick Action for 9 PDF Reports inside Settings
  const handleReportAction = async (reportKey: string, action: 'download' | 'share') => {
    let doc;
    let filename = '';
    let title = '';

    switch (reportKey) {
      case 'daily_attendance':
        doc = generateDailyAttendancePDF(todayStr, employees, attendance, formData);
        filename = `Daily_Attendance_${todayStr}.pdf`;
        title = `${formData.companyName} - Daily Attendance (${todayStr})`;
        break;
      case 'weekly_attendance':
        doc = generateWeeklyAttendancePDF(todayStr, employees, attendance, formData);
        filename = `Weekly_Attendance_${todayStr}.pdf`;
        title = `${formData.companyName} - Weekly Attendance Report`;
        break;
      case 'monthly_attendance':
        doc = generateMonthlyAttendancePDF(currentMonthStr, employees, attendance, formData);
        filename = `Monthly_Attendance_${currentMonthStr}.pdf`;
        title = `${formData.companyName} - Monthly Attendance (${currentMonthStr})`;
        break;
      case 'daily_salary':
        doc = generateDailySalaryPDF(todayStr, employees, attendance, formData);
        filename = `Daily_Salary_${todayStr}.pdf`;
        title = `${formData.companyName} - Daily Salary Report (${todayStr})`;
        break;
      case 'weekly_salary':
        doc = generateWeeklySalaryPDF(todayStr, employees, attendance, formData);
        filename = `Weekly_Salary_${todayStr}.pdf`;
        title = `${formData.companyName} - Weekly Salary Report`;
        break;
      case 'monthly_salary':
        doc = generateMonthlySalaryPDF(currentMonthStr, employees, attendance, formData);
        filename = `Monthly_Salary_${currentMonthStr}.pdf`;
        title = `${formData.companyName} - Monthly Salary Report (${currentMonthStr})`;
        break;
      case 'present_report':
        doc = generatePresentSummaryPDF(currentMonthStr, employees, attendance, formData);
        filename = `Present_Workers_Report_${currentMonthStr}.pdf`;
        title = `${formData.companyName} - Present Workers Report (P)`;
        break;
      case 'absent_report':
        doc = generateAbsentSummaryPDF(currentMonthStr, employees, attendance, formData);
        filename = `Absent_Workers_Report_${currentMonthStr}.pdf`;
        title = `${formData.companyName} - Absent Workers Report (A)`;
        break;
      case 'double_duty_report':
        doc = generateDoubleDutySummaryPDF(currentMonthStr, employees, attendance, formData);
        filename = `Double_Duty_Report_${currentMonthStr}.pdf`;
        title = `${formData.companyName} - Double Duty Report (D - 2x)`;
        break;
      default:
        return;
    }

    if (action === 'download') {
      doc.save(filename);
      onShowToast(`A4 PDF Downloaded: ${filename}`);
    } else {
      const res = await sharePdfToWhatsApp({ doc, filename, title });
      onShowToast(res.message);
    }
  };

  // 4. Data Backup & Export Feature (JSON)
  const handleExportBackup = () => {
    try {
      const jsonString = exportCompleteBackup();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `Sumit_Workforce_Pro_Backup_${todayStr}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast(`Backup downloaded: ${filename}`);
    } catch (err) {
      console.error('Export failed:', err);
      onShowToast('Failed to generate database backup');
    }
  };

  const handleCopyJsonToClipboard = () => {
    try {
      const jsonString = exportCompleteBackup();
      navigator.clipboard.writeText(jsonString);
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2500);
      onShowToast('Database JSON copied to clipboard!');
    } catch (err) {
      onShowToast('Unable to copy JSON');
    }
  };

  // 5. Data Restore & Import Handler (JSON)
  const processJsonFile = (file: File) => {
    setImportError(null);
    setParsedPreview(null);
    setBackupRawJson(null);

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setImportError('Please upload a valid .json backup file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setImportError('The selected backup file is empty.');
          return;
        }

        const parsed = JSON.parse(text) as BackupData;
        if (!parsed.employees || !Array.isArray(parsed.employees)) {
          setImportError('Invalid backup structure: Missing employee roster.');
          return;
        }

        setBackupRawJson(text);
        setParsedPreview(parsed);
      } catch (err) {
        setImportError('Failed to parse JSON file. Please ensure the file is not corrupted.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processJsonFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processJsonFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmRestore = () => {
    if (!backupRawJson) return;

    const result = restoreCompleteBackup(backupRawJson);
    if (result.success) {
      if (parsedPreview?.companySettings) {
        setFormData(parsedPreview.companySettings);
        onUpdateSettings(parsedPreview.companySettings);
      }
      if (onReloadData) {
        onReloadData();
      }
      onShowToast(`Database restored: ${result.counts?.employees || 0} workers synced!`);
      setBackupRawJson(null);
      setParsedPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setImportError(result.message);
    }
  };

  const handleCancelRestore = () => {
    setBackupRawJson(null);
    setParsedPreview(null);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveCompanyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    onShowToast(t.settingsSaved);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all workers and attendance data to factory defaults?')) {
      resetToInitialDemoData();
      if (onReloadData) {
        onReloadData();
      }
      onShowToast('Factory demo data reset successfully');
    }
  };

  const reportList = [
    {
      id: 'daily_attendance',
      name: '1. Daily Attendance Report',
      desc: 'Complete daily roster with P, D, A presence counts',
      icon: Calendar,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'weekly_attendance',
      name: '2. Weekly Attendance Report',
      desc: '7-day continuous workforce presence grid',
      icon: CalendarRange,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
    },
    {
      id: 'monthly_attendance',
      name: '3. Monthly Attendance Report',
      desc: 'Full month 1-31 master matrix with shift counts',
      icon: CalendarDays,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60'
    },
    {
      id: 'daily_salary',
      name: '4. Daily Salary Report',
      desc: 'Today wage disbursement based on shifts (1x/2x)',
      icon: Banknote,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
    },
    {
      id: 'weekly_salary',
      name: '5. Weekly Salary Report',
      desc: 'Weekly accrued salary breakdown per worker',
      icon: Banknote,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
    },
    {
      id: 'monthly_salary',
      name: '6. Monthly Salary Report',
      desc: 'Official monthly payroll sheet with net totals',
      icon: Banknote,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'present_report',
      name: '7. Present Report (P)',
      desc: 'Workers marked present with standard 1x wage',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'absent_report',
      name: '8. Absent Report (A)',
      desc: 'Absence log and leave tracking summary',
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
    },
    {
      id: 'double_duty_report',
      name: '9. Double Duty Report (D - 2x)',
      desc: 'Double duty overtime shifts with 2x salary calculations',
      icon: Layers,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
    }
  ];

  return (
    <div id="settings-view-container" className="space-y-6 pb-20 max-w-4xl mx-auto animate-fade-in text-white">
      
      {/* Header Bar */}
      <div className="bg-[#111827] rounded-3xl p-5 border border-slate-800 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            <span>Sumit Workforce Pro Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure language, theme, JSON backup/restore, and instant A4 PDF reporting
          </p>
        </div>
      </div>

      {/* 1. LANGUAGE SETTINGS (Marathi, Hindi, English) */}
      <div className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              LANGUAGE
            </h2>
            <p className="text-xs text-slate-400">
              Select your preferred language (मराठी • हिंदी • English)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Marathi (मराठी) */}
          <button
            type="button"
            id="lang-option-mr"
            onClick={() => handleLanguageChange('mr')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              formData.language === 'mr'
                ? 'bg-[#1E293B] border-emerald-500 ring-2 ring-emerald-400/50 shadow-md'
                : 'bg-[#1E293B]/60 border-slate-700/60 hover:bg-[#1E293B]'
            }`}
          >
            <div>
              <div className="text-sm font-extrabold text-white">मराठी (Marathi)</div>
              <div className="text-xs text-slate-400">महाराष्ट्र अधिकृत भाषा</div>
            </div>
            {formData.language === 'mr' && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

          {/* Hindi (हिंदी) */}
          <button
            type="button"
            id="lang-option-hi"
            onClick={() => handleLanguageChange('hi')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              formData.language === 'hi'
                ? 'bg-[#1E293B] border-emerald-500 ring-2 ring-emerald-400/50 shadow-md'
                : 'bg-[#1E293B]/60 border-slate-700/60 hover:bg-[#1E293B]'
            }`}
          >
            <div>
              <div className="text-sm font-extrabold text-white">हिंदी (Hindi)</div>
              <div className="text-xs text-slate-400">सरल हिंदी भाषा</div>
            </div>
            {formData.language === 'hi' && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

          {/* English */}
          <button
            type="button"
            id="lang-option-en"
            onClick={() => handleLanguageChange('en')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              formData.language === 'en'
                ? 'bg-[#1E293B] border-emerald-500 ring-2 ring-emerald-400/50 shadow-md'
                : 'bg-[#1E293B]/60 border-slate-700/60 hover:bg-[#1E293B]'
            }`}
          >
            <div>
              <div className="text-sm font-extrabold text-white">English</div>
              <div className="text-xs text-slate-400">Default International</div>
            </div>
            {formData.language === 'en' && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 2. THEME SETTINGS (Dark, Light, Custom) */}
      <div className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-2xl bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              THEME
            </h2>
            <p className="text-xs text-slate-400">
              Modern dark workforce interface with light & custom palettes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dark Theme (Default) */}
          <button
            type="button"
            id="theme-option-dark"
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              formData.theme === 'dark'
                ? 'bg-[#1E293B] border-indigo-500 ring-2 ring-indigo-400/50 shadow-md text-white'
                : 'bg-[#1E293B]/60 border-slate-700/60 text-slate-300 hover:bg-[#1E293B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-indigo-400 flex items-center justify-center border border-slate-700">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{t.darkTheme} (Default)</div>
                <div className="text-xs text-slate-400">High-contrast dark</div>
              </div>
            </div>
            {formData.theme === 'dark' && (
              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

          {/* Light Theme */}
          <button
            type="button"
            id="theme-option-light"
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              formData.theme === 'light'
                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-400/50 shadow-md text-white'
                : 'bg-[#1E293B]/60 border-slate-700/60 text-slate-300 hover:bg-[#1E293B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{t.lightTheme}</div>
                <div className="text-xs text-slate-400">Daytime clarity</div>
              </div>
            </div>
            {formData.theme === 'light' && (
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

          {/* Custom Theme */}
          <button
            type="button"
            id="theme-option-custom"
            onClick={() => handleThemeChange('custom')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              formData.theme === 'custom'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-400/50 shadow-md text-white'
                : 'bg-[#1E293B]/60 border-slate-700/60 text-slate-300 hover:bg-[#1E293B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{t.customTheme}</div>
                <div className="text-xs text-slate-400">Custom Accent</div>
              </div>
            </div>
            {formData.theme === 'custom' && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </div>

        {/* Custom Accent Palette */}
        {formData.theme === 'custom' && (
          <div className="p-3.5 bg-[#1E293B] rounded-2xl border border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-200">
              {t.selectAccent}
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {[
                { id: 'emerald' as CustomThemeAccent, name: 'Emerald', bg: 'bg-emerald-500' },
                { id: 'blue' as CustomThemeAccent, name: 'Royal Blue', bg: 'bg-blue-600' },
                { id: 'indigo' as CustomThemeAccent, name: 'Indigo Purple', bg: 'bg-indigo-600' },
                { id: 'purple' as CustomThemeAccent, name: 'Violet', bg: 'bg-purple-600' },
                { id: 'amber' as CustomThemeAccent, name: 'Amber Gold', bg: 'bg-amber-500' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleAccentChange(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.customAccent === c.id
                      ? 'bg-[#111827] border-white text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. EXPORT DATA & EXTERNAL PAYROLL INTEGRATION (CSV) */}
      <div id="export-data-csv-payroll-section" className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 flex-wrap">
                <span>EXPORT DATA (CSV PAYROLL INTEGRATION)</span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                  EXCEL • TALLY • ERP READY
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically package all attendance records and calculated salary disbursements into formatted CSV for external payroll software
              </p>
            </div>
          </div>

          {/* Month Selector Bar */}
          <div className="flex items-center gap-1.5 bg-[#1E293B] p-1.5 rounded-2xl border border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleShiftCsvMonth(-1)}
              className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="month"
              value={csvMonth}
              onChange={(e) => e.target.value && setCsvMonth(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-white px-2 py-1 focus:outline-none cursor-pointer"
            />

            <button
              type="button"
              onClick={() => handleShiftCsvMonth(1)}
              className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {csvMonth !== currentMonthStr && (
              <button
                type="button"
                onClick={() => setCsvMonth(currentMonthStr)}
                className="px-2 py-1 rounded-xl bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50 text-[10px] font-bold transition-all ml-1 cursor-pointer"
              >
                Current
              </button>
            )}
          </div>
        </div>

        {/* Selected Month Live Analytics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Staff in Export</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-white">{employees.length}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Workers</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Payable Shifts</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-emerald-400">{totalPayableShiftsMonth}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                {totalPresentMonth}P + {totalDoubleDutyMonth}D (2x)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Net Payroll Payout</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-white">
                {formData.currencySymbol || '₹'}{totalPayrollMonth.toLocaleString()}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">Calculated</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Attendance Logs</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-cyan-400">{monthAttendanceCount}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">{csvMonth}</span>
            </div>
          </div>
        </div>

        {/* Dual Formatted CSV Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Formatted Monthly Payroll & Shift Summary CSV */}
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    1. Monthly Payroll & Shifts CSV
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Full wage calculations, shift multipliers, and net pay
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Packages complete employee roster with Worker ID, bank details, standard working days, Present count (P), Double Duty (D - 2x shifts), Absent count (A), payable shifts, daily wage rate, and net payable salary for <span className="font-bold text-white">{csvMonth}</span>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-export-payroll-csv"
                  onClick={handleExportCurrentMonthPayrollCsv}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Payroll CSV</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-payroll-csv"
                  onClick={() => handleCopyCsvContent('payroll')}
                  className="p-2.5 rounded-xl bg-[#111827] border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  title="Copy Payroll CSV to Clipboard"
                >
                  {copiedCsv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCsvPreviewType('payroll');
                    setShowCsvPreview(!showCsvPreview || csvPreviewType !== 'payroll');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    showCsvPreview && csvPreviewType === 'payroll'
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-[#111827] border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Toggle Preview Table"
                >
                  {showCsvPreview && csvPreviewType === 'payroll' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono text-center">
                File format: Payroll_Export_{csvMonth}.csv (UTF-8 BOM)
              </div>
            </div>
          </div>

          {/* Card 2: 31-Day Attendance Matrix CSV */}
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    2. Daily Attendance Matrix CSV (1-31 Days)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Day-by-day continuous workforce attendance matrix
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates a granular Day 01 through Day 31 master presence matrix (P, D, A) across all workers with totals and daily rates for <span className="font-bold text-white">{csvMonth}</span>. Ideal for attendance time-tracking imports.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-export-matrix-csv"
                  onClick={handleExportDetailedMatrixCsv}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white text-xs font-extrabold shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Matrix CSV</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-matrix-csv"
                  onClick={() => handleCopyCsvContent('matrix')}
                  className="p-2.5 rounded-xl bg-[#111827] border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  title="Copy Matrix CSV to Clipboard"
                >
                  {copiedCsv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCsvPreviewType('matrix');
                    setShowCsvPreview(!showCsvPreview || csvPreviewType !== 'matrix');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    showCsvPreview && csvPreviewType === 'matrix'
                      ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50'
                      : 'bg-[#111827] border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Toggle Preview Matrix"
                >
                  {showCsvPreview && csvPreviewType === 'matrix' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono text-center">
                File format: Attendance_Matrix_{csvMonth}.csv (UTF-8 BOM)
              </div>
            </div>
          </div>
        </div>

        {/* Live CSV Preview Box */}
        {showCsvPreview && (
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-extrabold text-white">
                    Live CSV Data Preview ({csvPreviewType === 'payroll' ? 'Monthly Payroll Summary' : '31-Day Matrix'})
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Period: {csvMonth} • {employees.length} Workers Included • Ready for External Payroll Import
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCsvPreviewType('payroll')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    csvPreviewType === 'payroll'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#111827] text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Payroll Summary
                </button>
                <button
                  type="button"
                  onClick={() => setCsvPreviewType('matrix')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    csvPreviewType === 'matrix'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-[#111827] text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Daily Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setShowCsvPreview(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Data Table Preview */}
            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-800 rounded-xl bg-[#111827]">
              {csvPreviewType === 'payroll' ? (
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-[#1E293B] text-slate-300 font-bold sticky top-0 border-b border-slate-700">
                    <tr>
                      <th className="p-2.5 whitespace-nowrap">ID</th>
                      <th className="p-2.5 whitespace-nowrap">Worker Name</th>
                      <th className="p-2.5 whitespace-nowrap">Category</th>
                      <th className="p-2.5 whitespace-nowrap text-center">P</th>
                      <th className="p-2.5 whitespace-nowrap text-center">D (2x)</th>
                      <th className="p-2.5 whitespace-nowrap text-center">A</th>
                      <th className="p-2.5 whitespace-nowrap text-center">Payable Shifts</th>
                      <th className="p-2.5 whitespace-nowrap text-right">Daily Rate</th>
                      <th className="p-2.5 whitespace-nowrap text-right">Net Salary</th>
                      <th className="p-2.5 whitespace-nowrap text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {selectedMonthSlips.map((slip) => {
                      const emp = employees.find((e) => e.id === slip.employeeId);
                      return (
                        <tr key={slip.id} className="hover:bg-slate-800/60">
                          <td className="p-2.5 font-mono text-[10px] text-indigo-300">{emp?.workerId || slip.employeeId}</td>
                          <td className="p-2.5 font-bold text-white whitespace-nowrap">{emp?.name || 'Worker'}</td>
                          <td className="p-2.5 text-slate-400 whitespace-nowrap">{emp?.workType || 'General'}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-400">{slip.presentDays}</td>
                          <td className="p-2.5 text-center font-bold text-blue-400">{slip.doubleDutyDays}</td>
                          <td className="p-2.5 text-center font-bold text-rose-400">{slip.absentDays}</td>
                          <td className="p-2.5 text-center font-black text-emerald-300 bg-emerald-950/40">
                            {slip.payableDays}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-300">
                            {formData.currencySymbol || '₹'}{slip.dailyRate}
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-400">
                            {formData.currencySymbol || '₹'}{slip.netSalary.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              PAID
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-[#1E293B] text-slate-300 font-bold sticky top-0 border-b border-slate-700">
                    <tr>
                      <th className="p-2.5 whitespace-nowrap">ID</th>
                      <th className="p-2.5 whitespace-nowrap">Worker Name</th>
                      <th className="p-2.5 whitespace-nowrap">Work Type</th>
                      <th className="p-2.5 whitespace-nowrap text-center">Days 1-31 (Matrix)</th>
                      <th className="p-2.5 whitespace-nowrap text-center">Total Shifts</th>
                      <th className="p-2.5 whitespace-nowrap text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {selectedMonthSlips.map((slip) => {
                      const emp = employees.find((e) => e.id === slip.employeeId);
                      return (
                        <tr key={`matrix-${slip.id}`} className="hover:bg-slate-800/60">
                          <td className="p-2.5 font-mono text-[10px] text-cyan-300">{emp?.workerId || slip.employeeId}</td>
                          <td className="p-2.5 font-bold text-white whitespace-nowrap">{emp?.name || 'Worker'}</td>
                          <td className="p-2.5 text-slate-400 whitespace-nowrap">{emp?.workType || 'General'}</td>
                          <td className="p-2.5 text-center text-[10px] text-slate-300 font-mono">
                            <span className="text-emerald-400 font-bold">{slip.presentDays}P</span> • <span className="text-blue-400 font-bold">{slip.doubleDutyDays}D</span> • <span className="text-rose-400 font-bold">{slip.absentDays}A</span>
                          </td>
                          <td className="p-2.5 text-center font-black text-cyan-300">{slip.payableDays} Shifts</td>
                          <td className="p-2.5 text-right font-bold text-emerald-400">
                            {formData.currencySymbol || '₹'}{slip.netSalary.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Integration Compatibility Footnote */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Includes RFC 4180 standard quoting, comma escaping & UTF-8 BOM encoding.</span>
              <span className="text-emerald-400 font-semibold">Tally ERP / Prime • QuickBooks • MS Excel • Zoho Compatible</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. DATA BACKUP & RESTORE (JSON Export / Import) */}
      <div id="data-backup-restore-section" className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>DATABASE BACKUP & RESTORE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  JSON Portability
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Export and import your entire workforce roster, attendance logs, and company settings
              </p>
            </div>
          </div>
        </div>

        {/* Database Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 block">Total Workers</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-white">{employees.length}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold font-mono">Active</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 block">Attendance History</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-white">{attendance.length}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 font-bold font-mono">Records</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 block">Storage Architecture</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Offline Local</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">v3.0.0</span>
            </div>
          </div>
        </div>

        {/* Dual Actions: Export & Import */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card A: Export Database */}
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Export Database Backup</h3>
                  <p className="text-[11px] text-slate-400">Download complete database as a portable JSON file</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Exports all registered workers, wage categories, daily/monthly attendance records, and custom configurations into a single standardized JSON file.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                id="btn-export-database-json"
                onClick={handleExportBackup}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white text-xs font-extrabold shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .JSON Backup</span>
              </button>

              <button
                type="button"
                id="btn-copy-database-json"
                onClick={handleCopyJsonToClipboard}
                className="p-2.5 rounded-xl bg-[#111827] border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                title="Copy JSON to Clipboard"
              >
                {copiedBackup ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Card B: Restore Database */}
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Restore Database from JSON</h3>
                  <p className="text-[11px] text-slate-400">Import and restore previously saved JSON data</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Upload or drag-and-drop a <span className="font-mono font-bold text-indigo-400">.json</span> backup file to sync and restore your workforce records.
              </p>
            </div>

            {/* Hidden File Input & Upload Trigger */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
                id="database-file-import-input"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/20 scale-[1.01]'
                    : 'border-slate-700 bg-[#111827]/80 hover:bg-[#111827]'
                }`}
              >
                <FileUp className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  Choose or Drop .JSON Backup
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert if Import Fails */}
        {importError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center justify-between animate-shake">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{importError}</span>
            </div>
            <button
              type="button"
              onClick={() => setImportError(null)}
              className="p-1 hover:bg-rose-900 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Restore Confirmation Preview Box */}
        {parsedPreview && (
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-indigo-500/40 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-extrabold text-indigo-200">
                    Backup File Verified & Ready to Restore
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Exported on: {new Date(parsedPreview.exportDate || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-600 text-white">
                v{parsedPreview.version || '3.0.0'}
              </span>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#111827] border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Workers</span>
                <span className="font-extrabold text-indigo-400 text-sm">
                  {parsedPreview.employees?.length || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#111827] border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Attendance Records</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {parsedPreview.attendance?.length || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#111827] border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Company Name</span>
                <span className="font-bold text-white text-xs truncate block">
                  {parsedPreview.companySettings?.companyName || 'Default'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#111827] border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Theme & Lang</span>
                <span className="font-bold text-white text-xs uppercase">
                  {parsedPreview.companySettings?.language || 'en'} • {parsedPreview.companySettings?.theme || 'dark'}
                </span>
              </div>
            </div>

            {/* Warning and Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Restoring will update your active workforce database.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancelRestore}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#111827] text-slate-300 text-xs font-bold hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-restore-database"
                  onClick={handleConfirmRestore}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Restore Database</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. ANDROID RELEASE APK & NATIVE CAPACITOR CENTER */}
      <div className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                ANDROID RELEASE APK & NATIVE PACKAGE
              </h2>
              <p className="text-xs text-slate-400">
                Production-ready signed APK, Android Studio source code & 100% offline packaging
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            SDK 36 • Android 16 Ready
          </span>
        </div>

        {/* APK Release Info Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">App ID / Package</span>
            <span className="font-mono text-xs text-emerald-400 font-bold block truncate mt-1">
              com.sumitworkforcepro.app
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Output</span>
            <span className="font-mono text-xs text-cyan-300 font-bold block mt-1">
              Signed APK & AAB Bundle
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Offline Engine</span>
            <span className="font-mono text-xs text-indigo-300 font-bold block mt-1">
              Room DB + IndexedDB
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Release Version</span>
            <span className="font-mono text-xs text-amber-300 font-bold block mt-1">
              v2.4.0 (Build 1)
            </span>
          </div>
        </div>

        {/* APK Actions & Instructions */}
        <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Standalone Android Release Build Package</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Complete Kotlin MVVM source, AndroidManifest.xml, build.gradle.kts, and automated release script.
              </p>
            </div>

            {onOpenAndroidModal && (
              <button
                type="button"
                id="btn-open-android-studio-source"
                onClick={onOpenAndroidModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Code className="w-4 h-4" />
                <span>View Android Studio Source & Build Script</span>
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 font-sans">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Android Device Installation (APK):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
              <li>Open this web application in Chrome on any Android smartphone.</li>
              <li>Tap the browser menu (⋮) and select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
              <li>Android will automatically generate and install the native standalone WebAPK with custom SWP 3D icon.</li>
              <li>The installed APK launches in standalone fullscreen mode and functions <strong className="text-emerald-400">100% offline</strong> with permanent local database storage.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 6. REPORT SETTINGS (All 9 Required PDF Reports) */}
      <div className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-950/80 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                REPORT SETTINGS
              </h2>
              <p className="text-xs text-slate-400">
                Instant 1-Click A4 PDF Generation & WhatsApp PDF Sharing
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Reports Hub</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* 9 Standard Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportList.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-700 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${report.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-xs text-white leading-tight">
                      {report.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-0.5">
                    {report.desc}
                  </p>
                </div>

                {/* Instant Action Buttons: Download A4 PDF & Share to WhatsApp */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReportAction(report.id, 'download')}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#111827] hover:bg-slate-800 text-white text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Download A4 PDF"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>A4 PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReportAction(report.id, 'share')}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                    title="Share PDF to WhatsApp"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. COMPANY HEADER INFO & DATA MANAGEMENT */}
      <form onSubmit={handleSaveCompanyInfo} className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              COMPANY DETAILS & SIGNATORY
            </h2>
            <p className="text-xs text-slate-400">
              Configures company name, address, and signature on all A4 PDF reports
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200">
              Company Name (Printed on Header)
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200">
              Authorized Signatory Name
            </label>
            <input
              type="text"
              value={formData.authorizedSignatoryName || ''}
              onChange={(e) => setFormData({ ...formData, authorizedSignatoryName: e.target.value })}
              placeholder="e.g. Sumit Sharma (Director)"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

    </div>
  );
};
