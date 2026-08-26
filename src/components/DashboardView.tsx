import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Banknote, 
  TrendingUp, 
  ArrowRight, 
  Share2, 
  Plus, 
  Calendar, 
  Building2,
  Sparkles,
  History,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Employee, AttendanceRecord, CompanySettings, ActiveTab } from '../types';
import { calculateMonthlySalaries, normalizeStatus } from '../utils/storage';
import { generateDailyAttendancePDF } from '../utils/pdfGenerator';
import { sharePdfToWhatsApp } from '../utils/shareUtils';
import { translations } from '../utils/translations';

interface DashboardViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddEmployee: () => void;
  onOpenBulkAttendance: () => void;
  onViewEmployeeProfile: (emp: Employee) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  attendance,
  settings,
  onNavigateTab,
  onOpenAddEmployee,
  onOpenBulkAttendance,
  onViewEmployeeProfile
}) => {
  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  // Filter today's attendance
  const todayRecords = attendance.filter((r) => r.date === todayStr);
  const todayRecordMap = new Map<string, AttendanceRecord>();
  todayRecords.forEach((r) => todayRecordMap.set(r.employeeId, r));

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE');
  const totalCount = activeEmployees.length;

  let presentToday = 0;
  let doubleDutyToday = 0;
  let absentToday = 0;
  let notMarkedToday = 0;

  activeEmployees.forEach((emp) => {
    const rec = todayRecordMap.get(emp.id);
    if (!rec) {
      notMarkedToday++;
    } else {
      const status = normalizeStatus(rec.status);
      if (status === 'P') presentToday++;
      else if (status === 'D') doubleDutyToday++;
      else if (status === 'A') absentToday++;
    }
  });

  // Today's Salary Cost Calculation
  let todaySalaryCost = 0;
  activeEmployees.forEach((emp) => {
    const rec = todayRecordMap.get(emp.id);
    if (rec) {
      const status = normalizeStatus(rec.status);
      const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round(emp.monthlySalary / 26);
      if (status === 'P') {
        todaySalaryCost += dailyRate;
      } else if (status === 'D') {
        todaySalaryCost += (dailyRate * 2);
      }
    }
  });

  const totalShiftsToday = presentToday + (doubleDutyToday * 2);
  const attendanceRate = totalCount > 0 
    ? Math.round(((presentToday + doubleDutyToday) / totalCount) * 100) 
    : 0;

  // Monthly Attendance & Salary Snapshot
  const currentMonthRecords = attendance.filter((r) => r.date.startsWith(currentMonthStr));
  let monthPCount = 0;
  let monthDCount = 0;
  let monthACount = 0;
  currentMonthRecords.forEach((r) => {
    const st = normalizeStatus(r.status);
    if (st === 'P') monthPCount++;
    else if (st === 'D') monthDCount++;
    else if (st === 'A') monthACount++;
  });
  const monthTotalPayableShifts = monthPCount + (monthDCount * 2);

  const currentMonthSlips = calculateMonthlySalaries(activeEmployees, attendance, settings, currentMonthStr);
  const totalEstimatedPayroll = currentMonthSlips.reduce((sum, s) => sum + s.netSalary, 0);
  const totalPayableDaysMonth = currentMonthSlips.reduce((sum, s) => sum + s.payableDays, 0);
  const paidCount = currentMonthSlips.filter((s) => s.paymentStatus === 'PAID').length;
  const pendingCount = currentMonthSlips.length - paidCount;

  // Department Breakdown
  const deptCounts: { [key: string]: { total: number; present: number; double: number } } = {};
  activeEmployees.forEach((emp) => {
    const dept = emp.department || 'General';
    if (!deptCounts[dept]) {
      deptCounts[dept] = { total: 0, present: 0, double: 0 };
    }
    deptCounts[dept].total++;
    const rec = todayRecordMap.get(emp.id);
    if (rec) {
      const st = normalizeStatus(rec.status);
      if (st === 'P') deptCounts[dept].present++;
      if (st === 'D') deptCounts[dept].double++;
    }
  });

  const handleShareTodayWhatsApp = async () => {
    const doc = generateDailyAttendancePDF(todayStr, activeEmployees, attendance, settings);
    await sharePdfToWhatsApp({
      doc,
      filename: `Daily_Attendance_${todayStr}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Daily Attendance (${todayStr})`
    });
  };

  const formattedDate = new Date().toLocaleDateString(
    currentLang === 'hi' ? 'hi-IN' : currentLang === 'mr' ? 'mr-IN' : 'en-US',
    {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  );

  return (
    <div id="dashboard-view-container" className="space-y-6 pb-20 animate-fade-in max-w-7xl mx-auto text-slate-100">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {settings.companyName}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {t.appTagline} • Smart P, A, D Attendance & 2x Double Duty Payroll
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dashboard-mark-today-btn"
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.markAttendanceBtn}</span>
            </button>

            <button
              id="dashboard-share-whatsapp-btn"
              onClick={handleShareTodayWhatsApp}
              className="px-4 py-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all active:scale-95 shadow-xs"
              title="Share Today's Summary via WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{t.shareWhatsApp}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid: 5 Status & Cost Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        
        {/* Total Employees */}
        <div
          onClick={() => onNavigateTab('employees')}
          className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">{t.totalStaff}</span>
            <div className="w-7 h-7 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-800/40">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {employees.length - activeEmployees.length} inactive
          </div>
        </div>

        {/* Present Today (P) */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-2xl bg-[#111827] border border-emerald-900/60 shadow-lg hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400">{t.present} (P)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {presentToday}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">
            1 Shift each ({presentToday} shifts)
          </div>
        </div>

        {/* Double Duty Today (D) */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-2xl bg-[#111827] border border-blue-900/60 shadow-lg hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-bl">
            2x
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-400">{t.doubleDuty} (D)</span>
            <div className="w-7 h-7 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-800/40">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-400">
            {doubleDutyToday}
          </div>
          <div className="text-[10px] text-blue-400 mt-0.5 font-bold">
            = {doubleDutyToday * 2} Shifts
          </div>
        </div>

        {/* Absent Today (A) */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-2xl bg-[#111827] border border-rose-900/60 shadow-lg hover:border-rose-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400">{t.absent} (A)</span>
            <div className="w-7 h-7 rounded-xl bg-rose-950/80 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-rose-800/40">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400">
            {absentToday}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5 font-medium">
            {notMarkedToday > 0 ? `${notMarkedToday} unmarked` : '0 shifts'}
          </div>
        </div>

        {/* Today's Salary Cost */}
        <div
          onClick={() => onNavigateTab('salary')}
          className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#111827] border border-purple-900/60 shadow-lg hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-400">Today's Cost</span>
            <div className="w-7 h-7 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-800/40">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300">
            {settings.currencySymbol}{todaySalaryCost.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-purple-400/80 mt-0.5 font-bold">
            {totalShiftsToday} shifts payable
          </div>
        </div>

      </div>

      {/* Data Safety & Month History Quick Action Hub */}
      <div className="bg-[#111827] rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>Month History, PDF Archive & Zero-Data-Loss Safety</span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse previous months (e.g. August 2026), reopen saved PDF reports & manage month locks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('history')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950 cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Open History Archive</span>
          </button>
        </div>
      </div>

      {/* Attendance Visual Ratio & Monthly Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Visual Ratio */}
        <div className="lg:col-span-2 rounded-3xl bg-[#111827] p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                {t.todayOverview}
              </h3>
              <p className="text-xs text-slate-400">
                P (1 Shift) • D (2 Shifts) • A (0 Shift)
              </p>
            </div>
            <button
              onClick={onOpenBulkAttendance}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>{t.bulkAttendance}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-4 bg-[#1E293B] rounded-full overflow-hidden flex p-0.5 shadow-inner border border-slate-800">
            <div
              style={{ width: `${(presentToday / (totalCount || 1)) * 100}%` }}
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
              title={`Present: ${presentToday}`}
            />
            <div
              style={{ width: `${(doubleDutyToday / (totalCount || 1)) * 100}%` }}
              className="bg-blue-600 h-full transition-all duration-500"
              title={`Double Duty: ${doubleDutyToday}`}
            />
            <div
              style={{ width: `${(absentToday / (totalCount || 1)) * 100}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`Absent: ${absentToday}`}
            />
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1E293B] text-emerald-300 border border-emerald-900/40">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>P: <b>{presentToday}</b></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1E293B] text-blue-300 border border-blue-900/40">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>D (2x): <b>{doubleDutyToday}</b></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1E293B] text-rose-300 border border-rose-900/40">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>A: <b>{absentToday}</b></span>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              {t.department} Presence
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(deptCounts).map(([dept, counts]) => (
                <div
                  key={dept}
                  className="px-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700/60 text-xs flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-200">{dept}:</span>
                  <span className="text-emerald-400 font-bold">
                    {counts.present + counts.double}/{counts.total} ({counts.double > 0 ? `+${counts.double}D` : ''})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Summary Card (Attendance & Salary Combined) */}
        <div className="rounded-3xl bg-[#111827] p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Banknote className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wider">{t.totalPayroll}</span>
              </div>
              <span className="text-xs font-mono font-bold bg-[#1E293B] px-2 py-0.5 rounded text-slate-300 border border-slate-700">{currentMonthStr}</span>
            </div>

            <div className="mt-3">
              <span className="text-xs text-slate-400 font-medium">Estimated Net Disbursement</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {settings.currencySymbol} {totalEstimatedPayroll.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Monthly Attendance Summary Metrics */}
            <div className="mt-4 p-3 bg-[#1E293B] rounded-2xl space-y-1.5 border border-slate-800 text-xs">
              <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
                Monthly Attendance Summary
              </span>
              <div className="grid grid-cols-3 gap-1 text-center pt-1">
                <div className="p-1.5 rounded bg-[#111827] border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold block">P (1x)</span>
                  <span className="font-black text-white">{monthPCount}</span>
                </div>
                <div className="p-1.5 rounded bg-[#111827] border border-slate-800">
                  <span className="text-[10px] text-blue-400 font-bold block">D (2x)</span>
                  <span className="font-black text-white">{monthDCount}</span>
                </div>
                <div className="p-1.5 rounded bg-[#111827] border border-slate-800">
                  <span className="text-[10px] text-rose-400 font-bold block">A (0x)</span>
                  <span className="font-black text-white">{monthACount}</span>
                </div>
              </div>
            </div>

            {/* Monthly Salary Summary Details */}
            <div className="mt-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Total Payable Shifts:</span>
                <span className="font-black text-white">{monthTotalPayableShifts} Shifts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-400">{paidCount} Paid • {pendingCount} Pending</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Calculation Rule:</span>
                <span className="font-bold text-blue-400">P = 1x | D = 2x Wage</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('salary')}
            className="w-full py-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <span>{t.salaryTitle}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Launchpad & Roster Section */}
      <div className="rounded-3xl bg-[#111827] p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">
              Today's Quick Roster
            </h3>
            <p className="text-xs text-slate-400">
              Attendance status for {todayStr}
            </p>
          </div>

          <button
            onClick={onOpenAddEmployee}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addEmployee}</span>
          </button>
        </div>

        {/* Employee Roster List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeEmployees.slice(0, 8).map((emp) => {
            const rec = todayRecordMap.get(emp.id);
            const status = rec ? normalizeStatus(rec.status) : 'UNMARKED';

            let badgeBg = 'bg-slate-800 text-slate-300 border border-slate-700';
            let badgeText = 'Unmarked';

            if (status === 'P') {
              badgeBg = 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold';
              badgeText = 'Present (P)';
            } else if (status === 'D') {
              badgeBg = 'bg-blue-950/80 text-blue-400 border border-blue-800/80 font-bold';
              badgeText = 'Double Duty (D - 2x)';
            } else if (status === 'A') {
              badgeBg = 'bg-rose-950/80 text-rose-400 border border-rose-800/80 font-bold';
              badgeText = 'Absent (A)';
            }

            return (
              <div
                key={emp.id}
                onClick={() => onViewEmployeeProfile(emp)}
                className="p-3 rounded-2xl bg-[#1E293B] border border-slate-700/60 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-600">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      emp.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {emp.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {emp.designation}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${badgeBg}`}>
                  {badgeText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
