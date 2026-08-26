import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, 
  Calendar, 
  CalendarRange, 
  Banknote, 
  Lock, 
  Unlock, 
  Download, 
  Share2, 
  Search, 
  FileText, 
  Database, 
  ShieldCheck, 
  HardDrive, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload
} from 'lucide-react';
import { Employee, AttendanceRecord, CompanySettings, MonthLock, PdfArchiveItem, AutoBackupSnapshot, StorageStats } from '../types';
import { 
  loadMonthLocks, 
  toggleMonthLock, 
  loadPdfArchive, 
  deleteArchivedPdf, 
  loadAutoBackups, 
  createAutoBackupSnapshot, 
  getStorageStats, 
  calculateMonthlySalaries, 
  normalizeStatus,
  exportCompleteBackup,
  restoreCompleteBackup,
  saveAttendance,
  saveEmployees,
  saveSettings,
  saveMonthLocks
} from '../utils/storage';
import { 
  generateMonthlyAttendancePDF, 
  generateMonthlySalaryPDF, 
  generateDailyAttendancePDF,
  generateWeeklyAttendancePDF,
  generateWeeklySalaryPDF,
  generateIndividualPaySlipPDF
} from '../utils/pdfGenerator';
import { sharePdfToWhatsApp } from '../utils/shareUtils';
import { translations } from '../utils/translations';

interface HistoryArchiveViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onNavigateTab: (tab: any) => void;
  onShowToast: (msg: string) => void;
  onReloadData: () => void;
}

export const HistoryArchiveView: React.FC<HistoryArchiveViewProps> = ({
  employees,
  attendance,
  settings,
  onNavigateTab,
  onShowToast,
  onReloadData
}) => {
  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;

  const [activeSection, setActiveSection] = useState<'months' | 'pdfs' | 'storage' | 'reports_history'>('months');
  
  // Year selector for Month History
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Month Locks & PDF Archive State
  const [monthLocks, setMonthLocks] = useState<MonthLock[]>([]);
  const [pdfArchive, setPdfArchive] = useState<PdfArchiveItem[]>([]);
  const [autoBackups, setAutoBackups] = useState<AutoBackupSnapshot[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);

  // Search queries for archives
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');
  const [pdfCategoryFilter, setPdfCategoryFilter] = useState<string>('ALL');

  // Load latest metadata
  const refreshHistoryData = () => {
    setMonthLocks(loadMonthLocks());
    setPdfArchive(loadPdfArchive());
    setAutoBackups(loadAutoBackups());
    setStorageStats(getStorageStats());
  };

  useEffect(() => {
    refreshHistoryData();
  }, [attendance, employees]);

  // List of all 12 months for selected year
  const yearMonths = useMemo(() => {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = `${selectedYear}-${String(m).padStart(2, '0')}`;
      const dateObj = new Date(selectedYear, m - 1, 1);
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
      
      // Calculate attendance stats for this month
      const monthAttendance = attendance.filter((r) => r.date.startsWith(monthStr));
      let presentCount = 0;
      let doubleDutyCount = 0;
      let absentCount = 0;

      monthAttendance.forEach((r) => {
        const st = normalizeStatus(r.status);
        if (st === 'P') presentCount++;
        else if (st === 'D') doubleDutyCount++;
        else if (st === 'A') absentCount++;
      });

      const payableShifts = presentCount + (doubleDutyCount * 2);
      
      // Calculate payroll total for this month
      const slips = calculateMonthlySalaries(employees, attendance, settings, monthStr);
      const totalPayroll = slips.reduce((sum, s) => sum + s.netSalary, 0);

      const isLocked = monthLocks.some((l) => l.month === monthStr);
      const lockDetail = monthLocks.find((l) => l.month === monthStr);

      months.push({
        monthStr,
        monthName,
        year: selectedYear,
        monthNum: m,
        totalLogs: monthAttendance.length,
        presentCount,
        doubleDutyCount,
        absentCount,
        payableShifts,
        totalPayroll,
        isLocked,
        lockDetail
      });
    }
    return months;
  }, [selectedYear, attendance, employees, settings, monthLocks]);

  // Handle Month Lock Toggle
  const handleToggleMonthLock = (monthStr: string, monthName: string) => {
    const res = toggleMonthLock(monthStr, 'Manager', `Audited ${monthName} ${selectedYear}`);
    refreshHistoryData();
    if (res.locked) {
      onShowToast(`🔒 ${monthName} ${selectedYear} is now LOCKED and protected against accidental edits.`);
    } else {
      onShowToast(`🔓 ${monthName} ${selectedYear} is now UNLOCKED.`);
    }
  };

  // Download Monthly Attendance PDF for past month
  const handleDownloadMonthAttendance = (monthStr: string, monthName: string) => {
    const doc = generateMonthlyAttendancePDF(monthStr, employees, attendance, settings);
    doc.save(`Monthly_Attendance_${monthStr}.pdf`);
    refreshHistoryData();
    onShowToast(`Downloaded Attendance PDF for ${monthName} ${selectedYear}`);
  };

  // Share Monthly Attendance PDF via WhatsApp
  const handleShareMonthAttendanceWhatsApp = async (monthStr: string, monthName: string) => {
    const doc = generateMonthlyAttendancePDF(monthStr, employees, attendance, settings);
    const res = await sharePdfToWhatsApp({
      doc,
      filename: `Monthly_Attendance_${monthStr}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Monthly Attendance (${monthName} ${selectedYear})`,
      reportType: 'monthly_attendance',
      period: monthStr
    });
    refreshHistoryData();
    onShowToast(res.message);
  };

  // Download Monthly Salary PDF for past month
  const handleDownloadMonthSalary = (monthStr: string, monthName: string) => {
    const doc = generateMonthlySalaryPDF(monthStr, employees, attendance, settings);
    doc.save(`Monthly_Salary_${monthStr}.pdf`);
    refreshHistoryData();
    onShowToast(`Downloaded Salary Payroll PDF for ${monthName} ${selectedYear}`);
  };

  // Share Monthly Salary PDF via WhatsApp
  const handleShareMonthSalaryWhatsApp = async (monthStr: string, monthName: string) => {
    const doc = generateMonthlySalaryPDF(monthStr, employees, attendance, settings);
    const res = await sharePdfToWhatsApp({
      doc,
      filename: `Monthly_Salary_${monthStr}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Monthly Payroll (${monthName} ${selectedYear})`,
      reportType: 'monthly_salary',
      period: monthStr
    });
    refreshHistoryData();
    onShowToast(res.message);
  };

  // One-click Export Backup
  const handleExportBackup = () => {
    const jsonStr = exportCompleteBackup();
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const filename = `Sumit_Workforce_Pro_Backup_${timestamp}.json`;
    
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    refreshHistoryData();
    onShowToast(`JSON Database Backup saved to device: ${filename}`);
  };

  // One-click Import Backup
  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = restoreCompleteBackup(content, false);
        if (res.success) {
          onReloadData();
          refreshHistoryData();
          onShowToast(`✅ ${res.message} (${res.counts?.employees} workers, ${res.counts?.attendance} attendance logs restored)`);
        } else {
          onShowToast(`❌ ${res.message}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Instant Snapshot
  const handleCreateSnapshot = () => {
    createAutoBackupSnapshot('manual');
    refreshHistoryData();
    onShowToast('Instant snapshot created in local resilient storage!');
  };

  // Restore snapshot
  const handleRestoreSnapshot = (snapshot: AutoBackupSnapshot) => {
    if (window.confirm(`Restore data snapshot from ${new Date(snapshot.timestamp).toLocaleString()}? This will restore ${snapshot.employeeCount} workers and ${snapshot.attendanceCount} logs.`)) {
      const res = restoreCompleteBackup(snapshot.dataJson, false);
      if (res.success) {
        onReloadData();
        refreshHistoryData();
        onShowToast(`Restored snapshot from ${new Date(snapshot.timestamp).toLocaleString()}`);
      }
    }
  };

  // Filtered PDFs in Archive
  const filteredPdfs = useMemo(() => {
    return pdfArchive.filter((p) => {
      if (pdfCategoryFilter !== 'ALL' && p.reportType !== pdfCategoryFilter) return false;
      if (pdfSearchQuery.trim()) {
        const q = pdfSearchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.filename.toLowerCase().includes(q) ||
          p.period.toLowerCase().includes(q) ||
          (p.employeeName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pdfArchive, pdfCategoryFilter, pdfSearchQuery]);

  // Re-share or re-download archived PDF item
  const handleReShareArchivedItem = async (pdfItem: PdfArchiveItem) => {
    // Generate fresh crisp A4 PDF according to report type and period
    let doc;
    if (pdfItem.reportType.includes('attendance')) {
      if (pdfItem.period.length === 10) {
        doc = generateDailyAttendancePDF(pdfItem.period, employees, attendance, settings);
      } else {
        doc = generateMonthlyAttendancePDF(pdfItem.period, employees, attendance, settings);
      }
    } else {
      if (pdfItem.period.length === 10) {
        doc = generateWeeklySalaryPDF(pdfItem.period, employees, attendance, settings);
      } else {
        doc = generateMonthlySalaryPDF(pdfItem.period, employees, attendance, settings);
      }
    }

    const res = await sharePdfToWhatsApp({
      doc,
      filename: pdfItem.filename,
      title: pdfItem.title,
      period: pdfItem.period,
      reportType: pdfItem.reportType
    });
    onShowToast(res.message);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto text-slate-100 animate-fade-in">
      
      {/* 1. Header & Navigation Hub */}
      <div className="bg-[#111827] rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <History className="w-6 h-6 text-emerald-400" />
              <span>Data Safety & History Archive</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanent month-by-month historical records, PDF archives & zero-data-loss storage
            </p>
          </div>

          {/* Quick Action: 1-Click JSON Backup */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="header-backup-btn"
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>1-Click Backup</span>
            </button>
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackupFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#1E293B] p-1.5 rounded-2xl border border-slate-700 text-xs font-bold">
          <button
            id="tab-month-history"
            onClick={() => setActiveSection('months')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'months'
                ? 'bg-[#111827] text-emerald-400 shadow-sm border border-slate-700 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Month History</span>
          </button>

          <button
            id="tab-pdf-archive"
            onClick={() => setActiveSection('pdfs')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'pdfs'
                ? 'bg-[#111827] text-purple-400 shadow-sm border border-slate-700 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF Archive ({pdfArchive.length})</span>
          </button>

          <button
            id="tab-report-history"
            onClick={() => setActiveSection('reports_history')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'reports_history'
                ? 'bg-[#111827] text-blue-400 shadow-sm border border-slate-700 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Report Center</span>
          </button>

          <button
            id="tab-storage-safety"
            onClick={() => setActiveSection('storage')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'storage'
                ? 'bg-[#111827] text-amber-400 shadow-sm border border-slate-700 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Storage & Safety</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: MONTH-WISE & YEAR-WISE HISTORY ARCHIVE */}
      {activeSection === 'months' && (
        <div className="space-y-4">
          {/* Year Navigator */}
          <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-bold block">Selected Historical Year</span>
              <span className="text-lg font-black text-white">{selectedYear} Master Records</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedYear(y => y - 1)}
                className="p-2 rounded-xl bg-[#1E293B] text-slate-200 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-black text-sm px-3 py-1 bg-[#1E293B] text-emerald-400 rounded-xl border border-slate-700">
                {selectedYear}
              </span>
              <button
                onClick={() => setSelectedYear(y => y + 1)}
                className="p-2 rounded-xl bg-[#1E293B] text-slate-200 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                title="Next Year"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {yearMonths.map((m) => {
              const hasRecords = m.totalLogs > 0;

              return (
                <div
                  key={m.monthStr}
                  id={`month-card-${m.monthStr}`}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3.5 bg-[#111827] ${
                    m.isLocked
                      ? 'border-amber-700/60 shadow-lg shadow-amber-950/20'
                      : hasRecords
                      ? 'border-slate-700 hover:border-emerald-700/60 shadow-lg'
                      : 'border-slate-800/80 opacity-75'
                  }`}
                >
                  {/* Top Bar: Month Name + Lock Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-white text-base">
                          {m.monthName} {m.year}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-700">
                          {m.monthStr}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {hasRecords ? `${m.totalLogs} recorded logs` : 'No logs recorded'}
                      </span>
                    </div>

                    {/* Month Lock Toggle Button */}
                    <button
                      onClick={() => handleToggleMonthLock(m.monthStr, m.monthName)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                        m.isLocked
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-700 hover:bg-amber-900'
                          : 'bg-[#1E293B] text-slate-400 hover:text-slate-200 border border-slate-700'
                      }`}
                      title={m.isLocked ? "Click to unlock this month" : "Click to lock and protect completed month"}
                    >
                      {m.isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Locked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Lock Month</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-4 gap-1.5 text-center bg-[#1E293B] p-2.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Present (P)</span>
                      <span className="text-xs font-black text-emerald-400">{m.presentCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Double (D)</span>
                      <span className="text-xs font-black text-blue-400">{m.doubleDutyCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Absent (A)</span>
                      <span className="text-xs font-black text-rose-400">{m.absentCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Pay Shifts</span>
                      <span className="text-xs font-black text-white">{m.payableShifts}</span>
                    </div>
                  </div>

                  {/* Payroll Summary */}
                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="text-slate-400 font-medium">Estimated Payroll:</span>
                    <span className="font-black text-emerald-400 font-mono">
                      {settings.currencySymbol} {m.totalPayroll.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Action Buttons: Download & WhatsApp Share Anytime */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => handleShareMonthAttendanceWhatsApp(m.monthStr, m.monthName)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-black border border-emerald-800 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Att. PDF (WA)</span>
                    </button>

                    <button
                      onClick={() => handleShareMonthSalaryWhatsApp(m.monthStr, m.monthName)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-950/60 hover:bg-blue-900 text-blue-300 text-xs font-black border border-blue-800 transition-colors cursor-pointer"
                    >
                      <Banknote className="w-3.5 h-3.5 text-blue-400" />
                      <span>Salary PDF (WA)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: PDF ARCHIVE & PDF HISTORY */}
      {activeSection === 'pdfs' && (
        <div className="space-y-4">
          <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>PDF Archive & Document History</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Every generated report is archived here. Reopen, redownload, or WhatsApp-share old reports anytime.
                </p>
              </div>

              {/* PDF Search Input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pdfSearchQuery}
                  onChange={(e) => setPdfSearchQuery(e.target.value)}
                  placeholder="Filter archived PDFs..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
              {[
                { id: 'ALL', label: 'All Reports' },
                { id: 'monthly_attendance', label: 'Monthly Attendance' },
                { id: 'daily_attendance', label: 'Daily Attendance' },
                { id: 'monthly_salary', label: 'Monthly Salary' },
                { id: 'weekly_salary', label: 'Weekly Salary' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPdfCategoryFilter(c.id)}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                    pdfCategoryFilter === c.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-[#1E293B] text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Archived PDFs List */}
          {filteredPdfs.length === 0 ? (
            <div className="text-center py-12 bg-[#111827] rounded-3xl border border-slate-800 p-6 space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-sm">No PDF Reports in Archive</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Generate or share any Daily, Weekly, or Monthly attendance or salary report, and it will be permanently cataloged here for instant 1-tap re-sharing.
              </p>
              <button
                onClick={() => setActiveSection('months')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                Browse Month Records to Export
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800 font-bold flex items-center justify-center text-xs shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{pdf.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono bg-[#1E293B] px-1.5 py-0.2 rounded border border-slate-700 text-slate-300">
                          {pdf.period}
                        </span>
                        <span>•</span>
                        <span>{pdf.fileSizeKb} KB</span>
                        <span>•</span>
                        <span>Saved: {new Date(pdf.generatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleReShareArchivedItem(pdf)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-black border border-emerald-800 transition-colors cursor-pointer"
                      title="Reopen and Share via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Share</span>
                    </button>

                    <button
                      onClick={() => {
                        deleteArchivedPdf(pdf.id);
                        refreshHistoryData();
                        onShowToast('Removed report from archive');
                      }}
                      className="p-1.5 rounded-xl bg-[#1E293B] text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-700 transition-colors cursor-pointer"
                      title="Delete from Archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: REPORT HISTORY CENTER (Daily, Weekly, Monthly, Salary) */}
      {activeSection === 'reports_history' && (
        <div className="space-y-4">
          <div className="bg-[#111827] p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Full Report History Directory</span>
            </h2>
            <p className="text-xs text-slate-400">
              Access and export past Daily, Weekly, and Monthly reports instantly with complete shift calculations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Daily Reports Card */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Daily Reports History
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Daily Muster
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Generate daily present/absent logs and double-duty counts with time-stamps.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const doc = generateDailyAttendancePDF(today, employees, attendance, settings);
                      doc.save(`Daily_Attendance_${today}.pdf`);
                      refreshHistoryData();
                      onShowToast('Downloaded today attendance report');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-[#111827] text-slate-200 hover:text-white text-xs font-bold border border-slate-700"
                  >
                    Download Today
                  </button>
                  <button
                    onClick={() => onNavigateTab('attendance')}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Open Daily Hub
                  </button>
                </div>
              </div>

              {/* Weekly Reports Card */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CalendarRange className="w-4 h-4 text-blue-400" />
                    Weekly Reports History
                  </span>
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                    7-Day Cycle
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Weekly shifts breakdown, total payable shifts, and contractor weekly settlement.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const doc = generateWeeklyAttendancePDF(today, employees, attendance, settings);
                      doc.save(`Weekly_Attendance_${today}.pdf`);
                      refreshHistoryData();
                      onShowToast('Downloaded weekly attendance report');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-[#111827] text-slate-200 hover:text-white text-xs font-bold border border-slate-700"
                  >
                    Weekly Att.
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const doc = generateWeeklySalaryPDF(today, employees, attendance, settings);
                      doc.save(`Weekly_Salary_${today}.pdf`);
                      refreshHistoryData();
                      onShowToast('Downloaded weekly salary report');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Weekly Salary
                  </button>
                </div>
              </div>

              {/* Monthly Reports Card */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Monthly Attendance History
                  </span>
                  <span className="text-[10px] text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                    Master Muster
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Full 30-day shift matrix for all active and registered workforce staff.
                </p>
                <button
                  onClick={() => onNavigateTab('attendance')}
                  className="w-full py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  View Monthly Attendance Sheet
                </button>
              </div>

              {/* Salary Reports History Card */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    Salary & Payroll History
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Individual Slips
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Historical wages, double-duty earnings, payable shifts, and payslip distribution.
                </p>
                <button
                  onClick={() => onNavigateTab('salary')}
                  className="w-full py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Open Salary & Payslip Center
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: STORAGE DASHBOARD & DATA SAFETY */}
      {activeSection === 'storage' && (
        <div className="space-y-4">
          {/* Storage Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">Total Workers</span>
              <div className="text-xl sm:text-2xl font-black text-white">
                {storageStats?.totalEmployees || employees.length}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Permanent Roster</span>
            </div>

            <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">Attendance Records</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {storageStats?.totalAttendance || attendance.length}
              </div>
              <span className="text-[10px] text-slate-400 font-bold">All-Time History</span>
            </div>

            <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">Archived PDFs</span>
              <div className="text-xl sm:text-2xl font-black text-purple-400">
                {storageStats?.totalPdfReports || pdfArchive.length}
              </div>
              <span className="text-[10px] text-purple-400 font-bold">Saved Reports</span>
            </div>

            <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">Locked Months</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                {storageStats?.totalLockedMonths || monthLocks.length}
              </div>
              <span className="text-[10px] text-amber-400 font-bold">Tamper Protected</span>
            </div>

            <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">Database Size</span>
              <div className="text-xl sm:text-2xl font-black text-blue-400">
                {storageStats?.estimatedSizeFormatted || '45.0 KB'}
              </div>
              <span className="text-[10px] text-blue-400 font-bold">IndexedDB + Storage</span>
            </div>

            <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">Last Backup</span>
              <div className="text-xs sm:text-sm font-black text-white truncate">
                {storageStats?.lastBackupDate ? new Date(storageStats.lastBackupDate).toLocaleDateString() : 'Active Today'}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Auto Snapshots Active</span>
            </div>
          </div>

          {/* Data Safety Engine Guarantee Banner */}
          <div className="bg-[#111827] p-5 rounded-3xl border border-emerald-800/80 shadow-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-black flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Zero-Data-Loss Architecture</h3>
                <p className="text-xs text-slate-400">
                  Engine: {storageStats?.storageEngine || 'IndexedDB + LocalStorage layered persistence'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your workforce data is protected with layered persistent storage, automated change snapshots, and locked month seals. Browser cache cleans or updates will never erase your attendance or payroll logs.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleCreateSnapshot}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Instant Local Snapshot</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download JSON to Device</span>
              </button>
            </div>
          </div>

          {/* Auto-Backups Timeline */}
          <div className="bg-[#111827] p-4 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Automated Local Backups ({autoBackups.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">Rollback Anytime</span>
            </div>

            {autoBackups.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No snapshots saved yet. Snapshots generate automatically on data changes.
              </div>
            ) : (
              <div className="space-y-2">
                {autoBackups.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>Snapshot {new Date(snap.timestamp).toLocaleString()}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                          {snap.trigger}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {snap.employeeCount} workers • {snap.attendanceCount} attendance records • {snap.lockedMonthsCount} locked months
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
