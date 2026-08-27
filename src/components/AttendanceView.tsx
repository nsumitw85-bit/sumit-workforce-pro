import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Sparkles, 
  CalendarRange, 
  Download,
  Share2,
  Filter
} from 'lucide-react';
import { Employee, AttendanceRecord, CompanySettings, AttendanceStatus } from '../types';
import { normalizeStatus, isMonthLocked, toggleMonthLock } from '../utils/storage';
import { translations } from '../utils/translations';
import { generateDailyAttendancePDF, generateMonthlyAttendancePDF } from '../utils/pdfGenerator';
import { sharePdfToWhatsApp } from '../utils/shareUtils';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';

interface AttendanceViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onOpenBulkModal: () => void;
  onShowToast?: (msg: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  employees,
  attendance,
  settings,
  onUpdateAttendance,
  onOpenBulkModal,
  onShowToast = (_msg: string) => {}
}) => {
  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'monthly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // List of unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Attendance for the selected date
  const dateRecordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance.filter((r) => r.date === selectedDate).forEach((r) => {
      map.set(r.employeeId, r);
    });
    return map;
  }, [attendance, selectedDate]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (emp.status !== 'ACTIVE') return false;
      if (selectedDept !== 'ALL' && emp.department !== selectedDept) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.mobile.includes(q)
        );
      }
      return true;
    });
  }, [employees, selectedDept, searchQuery]);

  // Attendance summary counters for selected date
  const summaryCounts = useMemo(() => {
    let p = 0;
    let a = 0;
    let d = 0;
    let unmarked = 0;

    employees.filter(e => e.status === 'ACTIVE').forEach((emp) => {
      const rec = dateRecordsMap.get(emp.id);
      if (!rec) {
        unmarked++;
      } else {
        const st = normalizeStatus(rec.status);
        if (st === 'P') p++;
        else if (st === 'A') a++;
        else if (st === 'D') d++;
      }
    });

    const totalShifts = p + (d * 2);

    return { p, a, d, unmarked, totalShifts };
  }, [employees, dateRecordsMap]);

  // Month Lock state for current selected date
  const isCurrentMonthLocked = useMemo(() => {
    return isMonthLocked(selectedDate.slice(0, 7));
  }, [selectedDate, attendance]);

  // One-tap attendance marking
  const handleMarkStatus = (employeeId: string, status: AttendanceStatus) => {
    if (isCurrentMonthLocked) {
      onShowToast(`🔒 Month ${selectedDate.slice(0, 7)} is LOCKED & Audited. Unlock it first to make changes.`);
      return;
    }

    const existingRec = dateRecordsMap.get(employeeId);
    const updatedRecord: AttendanceRecord = {
      id: `${employeeId}_${selectedDate}`,
      employeeId,
      date: selectedDate,
      status,
      inTime: status === 'A' ? '' : (existingRec?.inTime || '09:00'),
      outTime: status === 'A' ? '' : (existingRec?.outTime || (status === 'D' ? '21:00' : '18:00')),
      notes: status === 'D' ? (existingRec?.notes || 'Double Duty (2 shifts)') : existingRec?.notes,
      markedAt: new Date().toISOString()
    };

    const newAttendanceList = attendance.filter(
      (r) => !(r.employeeId === employeeId && r.date === selectedDate)
    );
    newAttendanceList.push(updatedRecord);
    onUpdateAttendance(newAttendanceList);

    // Audio/tactile feedback indicator
    const emp = employees.find((e) => e.id === employeeId);
    const label = status === 'P' ? t.statusPresent : (status === 'D' ? t.statusDoubleDuty : t.statusAbsent);
    onShowToast(`${emp?.name || employeeId}: ${label}`);
  };

  // Fast quick-mark for all visible filtered staff
  const handleQuickMarkAll = (status: AttendanceStatus) => {
    if (isCurrentMonthLocked) {
      onShowToast(`🔒 Month ${selectedDate.slice(0, 7)} is LOCKED & Audited. Unlock it first to make changes.`);
      return;
    }

    const updatedList = [...attendance];
    filteredEmployees.forEach((emp) => {
      const idx = updatedList.findIndex((r) => r.employeeId === emp.id && r.date === selectedDate);
      const newRec: AttendanceRecord = {
        id: `${emp.id}_${selectedDate}`,
        employeeId: emp.id,
        date: selectedDate,
        status,
        inTime: status === 'A' ? '' : '09:00',
        outTime: status === 'A' ? '' : (status === 'D' ? '21:00' : '18:00'),
        notes: status === 'D' ? 'Double Duty (2 shifts)' : '',
        markedAt: new Date().toISOString()
      };
      if (idx >= 0) {
        updatedList[idx] = newRec;
      } else {
        updatedList.push(newRec);
      }
    });
    onUpdateAttendance(updatedList);
    const label = status === 'P' ? t.statusPresent : (status === 'D' ? t.statusDoubleDuty : t.statusAbsent);
    onShowToast(`All ${filteredEmployees.length} marked as ${label}`);
  };

  // Change date helpers
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Download Daily PDF
  const handleDownloadDailyPDF = () => {
    const doc = generateDailyAttendancePDF(selectedDate, employees, attendance, settings);
    doc.save(`Daily_Attendance_${selectedDate}.pdf`);
    onShowToast('Daily Attendance PDF downloaded!');
  };

  // Share Daily PDF via WhatsApp
  const handleShareDailyWhatsApp = async () => {
    const doc = generateDailyAttendancePDF(selectedDate, employees, attendance, settings);
    const res = await sharePdfToWhatsApp({
      doc,
      filename: `Daily_Attendance_${selectedDate}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Daily Attendance (${selectedDate})`
    });
    onShowToast(res.message);
  };

  // Share Monthly PDF via WhatsApp
  const handleShareMonthlyWhatsApp = async () => {
    const month = selectedDate.slice(0, 7);
    const doc = generateMonthlyAttendancePDF(month, employees, attendance, settings);
    const res = await sharePdfToWhatsApp({
      doc,
      filename: `Monthly_Attendance_${month}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Monthly Attendance (${month})`
    });
    onShowToast(res.message);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-4xl mx-auto text-slate-100">
      {/* Header & Subtabs */}
      <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              {t.attendanceHub}
            </h1>
            <p className="text-xs text-slate-400">
              {t.attendanceSubtitle}
            </p>
          </div>

          {/* Subtabs: Daily Marking vs Monthly Sheet */}
          <div className="flex bg-[#1E293B] p-1 rounded-xl self-start sm:self-auto border border-slate-700">
            <button
              id="subtab-daily-marking"
              onClick={() => setActiveSubTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'daily'
                  ? 'bg-[#111827] text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.dailyMarking}
            </button>
            <button
              id="subtab-monthly-sheet"
              onClick={() => setActiveSubTab('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'monthly'
                  ? 'bg-[#111827] text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.monthlySheet}
            </button>
          </div>
        </div>

        {/* Date Selector Navigation Bar */}
        {activeSubTab === 'daily' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                id="prev-date-btn"
                onClick={() => handleShiftDate(-1)}
                className="p-2 rounded-xl bg-[#1E293B] text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <input
                id="attendance-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
              />

              <button
                id="next-date-btn"
                onClick={() => handleShiftDate(1)}
                className="p-2 rounded-xl bg-[#1E293B] text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday && (
                <button
                  id="today-date-btn"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                >
                  {t.today}
                </button>
              )}

              {/* Month Lock Indicator */}
              {isCurrentMonthLocked && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/80 text-amber-300 text-[11px] font-black border border-amber-700">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Month Locked</span>
                </div>
              )}
            </div>

            {/* Daily Export Actions */}
            <div className="flex items-center gap-1.5">
              <button
                id="daily-pdf-btn"
                onClick={handleDownloadDailyPDF}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                title="Download Daily PDF Report"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>PDF</span>
              </button>
              <button
                id="daily-whatsapp-btn"
                onClick={handleShareDailyWhatsApp}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition-all border border-emerald-800"
                title="Share WhatsApp Summary"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ATTENDANCE SUMMARY COUNTERS: Separate P, D, A Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Present (P) */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-emerald-900/60 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              {t.presentCount}
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {summaryCounts.p}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">1 Shift each</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-800/40">
            P
          </div>
        </div>

        {/* Double Duty (D) */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-blue-900/60 shadow-lg flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg">
            2 SHIFTS
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              {t.doubleDutyCount}
            </span>
            <div className="text-2xl font-black text-blue-400 mt-0.5">
              {summaryCounts.d}
            </div>
            <span className="text-[10px] text-blue-400 font-bold">
              = {summaryCounts.d * 2} Shifts
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center font-black text-sm border border-blue-800/40">
            D
          </div>
        </div>

        {/* Absent (A) */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-rose-900/60 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              {t.absentCount}
            </span>
            <div className="text-2xl font-black text-rose-400 mt-0.5">
              {summaryCounts.a}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">0 Shift</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-950/80 text-rose-400 flex items-center justify-center font-black text-sm border border-rose-800/40">
            A
          </div>
        </div>

        {/* Total Working Shifts */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Staff / Shifts
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {summaryCounts.totalShifts}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Staff: {employees.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#1E293B] text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-700">
            {employees.length}
          </div>
        </div>
      </div>

      {activeSubTab === 'daily' ? (
        /* DAILY MARKING VIEW WITH LARGE P, A, D BUTTONS */
        <div className="space-y-3">
          {/* Quick Actions & Filters Bar */}
          <div className="bg-[#111827] p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search and Dept Filter */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="attendance-search-input"
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {departments.length > 0 && (
                <select
                  id="attendance-dept-filter"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-bold text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">{t.allDepartments}</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Fast Quick Mark All Buttons */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                id="quick-all-p-btn"
                onClick={() => handleQuickMarkAll('P')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs font-black transition-colors"
                title="Mark All Present"
              >
                All P
              </button>
              <button
                id="quick-all-d-btn"
                onClick={() => handleQuickMarkAll('D')}
                className="px-2.5 py-1.5 rounded-xl bg-blue-950/80 text-blue-300 hover:bg-blue-900 border border-blue-800 text-xs font-black transition-colors"
                title="Mark All Double Duty"
              >
                All D
              </button>
              <button
                id="quick-all-a-btn"
                onClick={() => handleQuickMarkAll('A')}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs font-black transition-colors"
                title="Mark All Absent"
              >
                All A
              </button>
            </div>
          </div>

          {/* Employee Attendance Roster Cards */}
          <div className="space-y-2.5">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-10 bg-[#111827] rounded-2xl border border-slate-800 text-slate-400 text-sm font-medium">
                {t.noEmployeesFound}
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const rec = dateRecordsMap.get(emp.id);
                const currentStatus = rec ? normalizeStatus(rec.status) : undefined;
                const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round(emp.monthlySalary / 26);

                return (
                  <div
                    key={emp.id}
                    id={`att-row-${emp.id}`}
                    className={`p-3.5 rounded-2xl border transition-all bg-[#111827] ${
                      currentStatus === 'P'
                        ? 'border-emerald-800 shadow-md'
                        : currentStatus === 'D'
                        ? 'border-blue-800 shadow-md bg-[#111827]'
                        : currentStatus === 'A'
                        ? 'border-rose-800 shadow-md'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Employee Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {emp.photoUrl ? (
                          <img
                            src={emp.photoUrl}
                            alt={emp.name}
                            className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-[#1E293B] text-slate-200 font-black text-sm flex items-center justify-center shrink-0 border border-slate-700">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm truncate">
                              {emp.name}
                            </h3>
                            <span className="text-[10px] font-mono font-bold bg-[#1E293B] text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                              {emp.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{emp.department}</span>
                            <span>•</span>
                            <span>{settings.currencySymbol}{dailyRate}/day</span>
                            {currentStatus === 'D' && (
                              <span className="text-[10px] font-black text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800">
                                2 Shifts ({settings.currencySymbol}{dailyRate * 2})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* LARGE TACTILE ATTENDANCE BUTTONS: P, A, D */}
                      <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                        {/* P = PRESENT BUTTON */}
                        <button
                          id={`btn-mark-p-${emp.id}`}
                          onClick={() => handleMarkStatus(emp.id, 'P')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-black text-sm transition-all transform active:scale-95 ${
                            currentStatus === 'P'
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 ring-2 ring-emerald-400'
                              : 'bg-[#1E293B] text-slate-300 hover:bg-emerald-950/60 hover:text-emerald-400 border border-slate-700'
                          }`}
                          title="Mark Present (1 Shift)"
                        >
                          <span className="text-base font-black">P</span>
                          <span className="text-xs font-bold hidden xs:inline">{t.statusPresent.split(' ')[0]}</span>
                        </button>

                        {/* D = DOUBLE DUTY BUTTON (2 SHIFTS) */}
                        <button
                          id={`btn-mark-d-${emp.id}`}
                          onClick={() => handleMarkStatus(emp.id, 'D')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-black text-sm transition-all transform active:scale-95 relative ${
                            currentStatus === 'D'
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950 ring-2 ring-blue-400'
                              : 'bg-[#1E293B] text-slate-300 hover:bg-blue-950/60 hover:text-blue-400 border border-slate-700'
                          }`}
                          title="Mark Double Duty (Counts as 2 working shifts in salary)"
                        >
                          <span className="text-base font-black">D</span>
                          <span className="text-xs font-bold hidden xs:inline">Double</span>
                          <span className={`text-[9px] font-black px-1 rounded ${currentStatus === 'D' ? 'bg-white/20 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800'}`}>
                            2x
                          </span>
                        </button>

                        {/* A = ABSENT BUTTON */}
                        <button
                          id={`btn-mark-a-${emp.id}`}
                          onClick={() => handleMarkStatus(emp.id, 'A')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-black text-sm transition-all transform active:scale-95 ${
                            currentStatus === 'A'
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 ring-2 ring-rose-400'
                              : 'bg-[#1E293B] text-slate-300 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700'
                          }`}
                          title="Mark Absent"
                        >
                          <span className="text-base font-black">A</span>
                          <span className="text-xs font-bold hidden xs:inline">{t.statusAbsent.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* MONTHLY ATTENDANCE SHEET */
        <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white">
                {t.monthlySheet} ({selectedDate.slice(0, 7)})
              </h2>
              <p className="text-xs text-slate-400">
                Formula: Payable Shifts = Present (P) + [2 × Double Duty (D)]
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="download-monthly-att-pdf"
                onClick={() => {
                  const doc = generateMonthlyAttendancePDF(selectedDate.slice(0, 7), employees, attendance, settings);
                  doc.save(`Monthly_Attendance_${selectedDate.slice(0, 7)}.pdf`);
                  onShowToast('Monthly Attendance PDF downloaded!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadPdf}</span>
              </button>
              <button
                id="share-monthly-att-whatsapp"
                onClick={handleShareMonthlyWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800 text-xs font-bold transition-colors"
                title="Share Monthly A4 PDF to WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.shareWhatsApp}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1E293B] text-slate-200 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-2.5">Staff</th>
                  <th className="p-2.5 text-center text-emerald-400">P (1x)</th>
                  <th className="p-2.5 text-center text-blue-400">D (2x)</th>
                  <th className="p-2.5 text-center text-rose-400">A</th>
                  <th className="p-2.5 text-center font-black text-white">Payable Shifts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {employees.map((emp) => {
                  const empMonthRecs = attendance.filter(
                    (r) => r.employeeId === emp.id && r.date.startsWith(selectedDate.slice(0, 7))
                  );
                  let p = 0;
                  let d = 0;
                  let a = 0;
                  empMonthRecs.forEach((r) => {
                    const st = normalizeStatus(r.status);
                    if (st === 'P') p++;
                    else if (st === 'D') d++;
                    else if (st === 'A') a++;
                  });
                  const payableShifts = p + (d * 2);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/50">
                      <td className="p-2.5 font-bold text-white">
                        <div>{emp.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{emp.id} • {emp.department}</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-emerald-400">
                        {p}
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-400">
                        {d} <span className="text-[10px] text-slate-400">({d * 2})</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-rose-400">
                        {a}
                      </td>
                      <td className="p-2.5 text-center font-black text-white bg-[#1E293B]/60">
                        {payableShifts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
