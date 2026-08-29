import React, { useState, useMemo } from 'react';
import { 
  Banknote, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2, 
  Search, 
  Eye, 
  Layers, 
  CheckCircle2,
  FileText,
  X
} from 'lucide-react';
import { Employee, AttendanceRecord, SalarySlip, CompanySettings } from '../types';
import { calculateMonthlySalaries, isMonthLocked } from '../utils/storage';
import { translations } from '../utils/translations';
import { generateMonthlySalaryPDF, generateIndividualPaySlipPDF } from '../utils/pdfGenerator';
import { sharePdfToWhatsApp, downloadPdf, viewOrPrintPdf } from '../utils/shareUtils';
import { Lock, Printer } from 'lucide-react';

interface SalaryViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onShowToast?: (msg: string) => void;
}

export const SalaryView: React.FC<SalaryViewProps> = ({
  employees,
  attendance,
  settings,
  onShowToast = (_msg: string) => {}
}) => {
  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;
  
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<{ slip: SalarySlip; emp: Employee } | null>(null);

  // Compute all salary slips for selected month
  const salarySlips = useMemo(() => {
    return calculateMonthlySalaries(employees, attendance, settings, selectedMonth);
  }, [employees, attendance, settings, selectedMonth]);

  // Aggregate metrics
  const totalPayroll = useMemo(() => {
    return salarySlips.reduce((sum, s) => sum + s.netSalary, 0);
  }, [salarySlips]);

  const totalPayableShifts = useMemo(() => {
    return salarySlips.reduce((sum, s) => sum + s.payableDays, 0);
  }, [salarySlips]);

  const totalDoubleDutyShifts = useMemo(() => {
    return salarySlips.reduce((sum, s) => sum + (s.doubleDutyDays * 2), 0);
  }, [salarySlips]);

  // Filter slips by search
  const filteredSlips = useMemo(() => {
    return salarySlips.filter((slip) => {
      const emp = employees.find((e) => e.id === slip.employeeId);
      if (!emp) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [salarySlips, employees, searchQuery]);

  const handleShiftMonth = (direction: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const handleDownloadMasterPDF = () => {
    const doc = generateMonthlySalaryPDF(selectedMonth, employees, attendance, settings);
    downloadPdf(doc, `Salary_Payroll_${selectedMonth}.pdf`);
    onShowToast('Monthly Salary Payroll A4 PDF downloaded!');
  };

  const handleViewMasterPDF = () => {
    const doc = generateMonthlySalaryPDF(selectedMonth, employees, attendance, settings);
    viewOrPrintPdf(doc, `Salary_Payroll_${selectedMonth}.pdf`);
    onShowToast('Opening Payroll PDF for Print / View...');
  };

  const handleShareMasterWhatsApp = async () => {
    const doc = generateMonthlySalaryPDF(selectedMonth, employees, attendance, settings);
    const res = await sharePdfToWhatsApp({
      doc,
      filename: `Salary_Payroll_${selectedMonth}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Monthly Payroll (${selectedMonth})`,
      reportType: 'monthly_salary',
      period: selectedMonth
    });
    onShowToast(res.message);
  };

  const handleShareSlipWhatsApp = async (slip: SalarySlip, emp: Employee) => {
    const doc = generateIndividualPaySlipPDF(slip, emp, settings);
    const res = await sharePdfToWhatsApp({
      doc,
      filename: `PaySlip_${emp.id}_${slip.month}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Pay Slip (${emp.name} - ${slip.month})`,
      phone: emp.mobile,
      employeeId: emp.id,
      employeeName: emp.name,
      reportType: 'individual_payslip',
      period: slip.month
    });
    onShowToast(res.message);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-4xl mx-auto text-slate-100">
      {/* Header Bar */}
      <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" />
              {t.salaryTitle}
            </h1>
            <p className="text-xs text-slate-400">
              {t.salarySubtitle}
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => handleShiftMonth(-1)}
              className="p-2 rounded-xl bg-[#1E293B] text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={() => handleShiftMonth(1)}
              className="p-2 rounded-xl bg-[#1E293B] text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {isMonthLocked(selectedMonth) && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/80 text-amber-300 text-[11px] font-black border border-amber-700">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Locked</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="salary-pdf-btn"
              onClick={handleDownloadMasterPDF}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
              title="Download Master Payroll PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Payroll PDF</span>
            </button>
            <button
              id="salary-whatsapp-btn"
              onClick={handleShareMasterWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold border border-emerald-800 transition-all"
              title="Share Master Payroll on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
            <button
              id="salary-view-btn"
              onClick={handleViewMasterPDF}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
              title="Print / View Payroll PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Automatic Salary Calculation Info Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-200">
          <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Automatic Salary Rules: Present = 1× Wage | Double Duty = 2× Wage | Absent = ₹0</span>
        </div>
        <div className="font-mono text-[11px] font-bold text-emerald-300 bg-[#111827] px-2.5 py-1 rounded-xl border border-emerald-800/60">
          Salary = (P × Wage) + (D × Wage × 2)
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Payroll */}
        <div className="bg-[#111827] p-4 rounded-2xl border border-emerald-900/60 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {t.totalPayroll}
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {settings.currencySymbol} {totalPayroll.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400">For {employees.length} Staff</span>
        </div>

        {/* Double Duty Shifts */}
        <div className="bg-[#111827] p-4 rounded-2xl border border-indigo-900/60 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            {t.totalDoubleDuty}
          </span>
          <div className="text-2xl font-black text-indigo-300 mt-1">
            {totalDoubleDutyShifts} Shifts
          </div>
          <span className="text-xs text-indigo-400 font-medium">Earned at 2x rate</span>
        </div>

        {/* Total Payable Shifts */}
        <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t.totalPayableDays}
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {totalPayableShifts} Shifts
          </div>
          <span className="text-xs text-slate-400">Present (1x) + Double Duty (2x)</span>
        </div>
      </div>

      {/* Salary Master Table / List */}
      <div className="space-y-2.5">
        {filteredSlips.map((slip) => {
          const emp = employees.find((e) => e.id === slip.employeeId);
          if (!emp) return null;

          return (
            <div
              key={slip.id}
              id={`salary-slip-row-${emp.id}`}
              className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg hover:border-emerald-800 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Employee Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#1E293B] text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 border border-slate-700">
                    {emp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm truncate">
                        {emp.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-[#1E293B] text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {emp.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {emp.department} • Rate: {settings.currencySymbol}{slip.dailyRate}/day
                    </p>
                  </div>
                </div>

                {/* Shift Breakdown Chips */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800">
                    {slip.presentDays} P
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-blue-950/80 text-blue-300 font-bold border border-blue-800" title="Double Duty (2 shifts each)">
                    {slip.doubleDutyDays} D ({slip.doubleDutyDays * 2} shifts)
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-rose-950/80 text-rose-300 font-bold border border-rose-800">
                    {slip.absentDays} A
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-white font-black border border-slate-700">
                    = {slip.payableDays} Shifts
                  </span>
                </div>

                {/* Net Salary & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.netSalary}</span>
                    <span className="text-base font-black text-emerald-400">
                      {settings.currencySymbol} {slip.netSalary.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedSlip({ slip, emp })}
                      className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
                      title={t.viewSlip}
                    >
                      <Eye className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={() => handleShareSlipWhatsApp(slip, emp)}
                      className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 transition-colors border border-emerald-800"
                      title="Share via WhatsApp"
                    >
                      <Share2 className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Payslip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#111827] rounded-3xl max-w-lg w-full p-5 border border-slate-800 shadow-2xl space-y-4 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-bold border border-emerald-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {t.payslipTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Month: {selectedSlip.slip.month} • Ref: {selectedSlip.slip.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-[#1E293B] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee Card */}
            <div className="bg-[#1E293B] p-3.5 rounded-2xl border border-slate-700/80 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-white">
                <span>{selectedSlip.emp.name}</span>
                <span className="font-mono">{selectedSlip.emp.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dept: {selectedSlip.emp.department}</span>
                <span>Role: {selectedSlip.emp.designation}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mobile: {selectedSlip.emp.mobile}</span>
                <span>Daily Wage: {settings.currencySymbol}{selectedSlip.slip.dailyRate}</span>
              </div>
            </div>

            {/* Shift Breakdown Box */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">
                {t.calculationBreakdown}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Present (P)</span>
                  <div className="text-base font-black text-emerald-400">
                    {selectedSlip.slip.presentDays} days
                  </div>
                  <span className="text-[10px] text-slate-400">{settings.currencySymbol}{selectedSlip.slip.presentDays * selectedSlip.slip.dailyRate}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-800">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Double Duty (D)</span>
                  <div className="text-base font-black text-blue-400">
                    {selectedSlip.slip.doubleDutyDays} days
                  </div>
                  <span className="text-[10px] font-bold text-blue-400">
                    {selectedSlip.slip.doubleDutyDays * 2} shifts ({settings.currencySymbol}{selectedSlip.slip.doubleDutyDays * 2 * selectedSlip.slip.dailyRate})
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800">
                  <span className="text-[10px] uppercase font-bold text-rose-400">Absent (A)</span>
                  <div className="text-base font-black text-rose-400">
                    {selectedSlip.slip.absentDays} days
                  </div>
                  <span className="text-[10px] text-slate-400">0 Shift</span>
                </div>
              </div>
            </div>

            {/* Calculation Formula Banner */}
            <div className="p-3 rounded-xl bg-[#1E293B] text-xs text-slate-200 space-y-1 border border-slate-700">
              <div className="flex justify-between font-bold">
                <span>Total Payable Shifts:</span>
                <span>{selectedSlip.slip.presentDays} + ({selectedSlip.slip.doubleDutyDays} × 2) = {selectedSlip.slip.payableDays} Shifts</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-black text-sm pt-1 border-t border-slate-700">
                <span>{t.netSalary}:</span>
                <span>{settings.currencySymbol} {selectedSlip.slip.netSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  const doc = generateIndividualPaySlipPDF(selectedSlip.slip, selectedSlip.emp, settings);
                  downloadPdf(doc, `PaySlip_${selectedSlip.emp.id}_${selectedSlip.slip.month}.pdf`);
                  onShowToast('Payslip PDF downloaded!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadPdf}</span>
              </button>

              <button
                onClick={() => {
                  const doc = generateIndividualPaySlipPDF(selectedSlip.slip, selectedSlip.emp, settings);
                  viewOrPrintPdf(doc, `PaySlip_${selectedSlip.emp.id}_${selectedSlip.slip.month}.pdf`);
                  onShowToast('Opening Payslip for Print / View...');
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Print / View Payslip"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleShareSlipWhatsApp(selectedSlip.slip, selectedSlip.emp)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>{t.shareWhatsApp}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
