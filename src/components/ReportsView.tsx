import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Calendar, 
  CalendarRange, 
  CalendarDays, 
  Banknote, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Download, 
  Share2, 
  Users, 
  FileCheck2, 
  Printer 
} from 'lucide-react';
import { Employee, AttendanceRecord, CompanySettings } from '../types';
import { translations } from '../utils/translations';
import {
  generateDailyAttendancePDF,
  generateWeeklyAttendancePDF,
  generateMonthlyAttendancePDF,
  generateDailySalaryPDF,
  generateWeeklySalaryPDF,
  generateMonthlySalaryPDF,
  generatePresentSummaryPDF,
  generateAbsentSummaryPDF,
  generateDoubleDutySummaryPDF,
  generateEmployeeListPDF,
  generateCompleteSummaryPDF
} from '../utils/pdfGenerator';
import { sharePdfToWhatsApp, downloadPdf, viewOrPrintPdf } from '../utils/shareUtils';

interface ReportsViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onShowToast?: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  attendance,
  settings,
  onShowToast = (_msg: string) => {}
}) => {
  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  // 1. Daily Attendance Report
  const handleDailyAttendance = async (action: 'download' | 'share' | 'view') => {
    const doc = generateDailyAttendancePDF(selectedDate, employees, attendance, settings);
    const filename = `Daily_Attendance_${selectedDate}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Daily Attendance A4 PDF downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Daily Attendance PDF for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Daily Attendance (${selectedDate})`,
        reportType: 'daily_attendance',
        period: selectedDate
      });
      onShowToast(res.message);
    }
  };

  // 2. Weekly Attendance Report
  const handleWeeklyAttendance = async (action: 'download' | 'share' | 'view') => {
    const doc = generateWeeklyAttendancePDF(selectedDate, employees, attendance, settings);
    const filename = `Weekly_Attendance_${selectedDate}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Weekly Attendance A4 PDF downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Weekly Attendance PDF for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Weekly Attendance Report`,
        reportType: 'weekly_attendance',
        period: selectedDate
      });
      onShowToast(res.message);
    }
  };

  // 3. Monthly Attendance Report
  const handleMonthlyAttendance = async (action: 'download' | 'share' | 'view') => {
    const doc = generateMonthlyAttendancePDF(selectedMonth, employees, attendance, settings);
    const filename = `Monthly_Attendance_${selectedMonth}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Monthly Attendance A4 PDF downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Monthly Attendance PDF for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Monthly Attendance (${selectedMonth})`,
        reportType: 'monthly_attendance',
        period: selectedMonth
      });
      onShowToast(res.message);
    }
  };

  // 4. Daily Salary Report
  const handleDailySalary = async (action: 'download' | 'share' | 'view') => {
    const doc = generateDailySalaryPDF(selectedDate, employees, attendance, settings);
    const filename = `Daily_Salary_${selectedDate}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Daily Salary A4 PDF downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Daily Salary PDF for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Daily Salary Report (${selectedDate})`,
        reportType: 'daily_salary',
        period: selectedDate
      });
      onShowToast(res.message);
    }
  };

  // 5. Weekly Salary Report
  const handleWeeklySalary = async (action: 'download' | 'share' | 'view') => {
    const doc = generateWeeklySalaryPDF(selectedDate, employees, attendance, settings);
    const filename = `Weekly_Salary_${selectedDate}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Weekly Salary A4 PDF downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Weekly Salary PDF for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Weekly Salary Report`,
        reportType: 'weekly_salary',
        period: selectedDate
      });
      onShowToast(res.message);
    }
  };

  // 6. Monthly Salary Report
  const handleMonthlySalary = async (action: 'download' | 'share' | 'view') => {
    const doc = generateMonthlySalaryPDF(selectedMonth, employees, attendance, settings);
    const filename = `Monthly_Salary_${selectedMonth}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Monthly Salary A4 PDF downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Monthly Salary PDF for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Monthly Salary Report (${selectedMonth})`,
        reportType: 'monthly_salary',
        period: selectedMonth
      });
      onShowToast(res.message);
    }
  };

  // 7. Present Staff Report
  const handlePresentSummary = async (action: 'download' | 'share' | 'view') => {
    const doc = generatePresentSummaryPDF(selectedMonth, employees, attendance, settings);
    const filename = `Present_Staff_Report_${selectedMonth}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Present Staff A4 PDF Report downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Present Staff Report for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Present Staff Report`,
        reportType: 'present_summary',
        period: selectedMonth
      });
      onShowToast(res.message);
    }
  };

  // 8. Absent Staff Report
  const handleAbsentSummary = async (action: 'download' | 'share' | 'view') => {
    const doc = generateAbsentSummaryPDF(selectedMonth, employees, attendance, settings);
    const filename = `Absent_Staff_Report_${selectedMonth}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Absent Staff A4 PDF Report downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Absent Staff Report for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Absent Staff Report`,
        reportType: 'absent_summary',
        period: selectedMonth
      });
      onShowToast(res.message);
    }
  };

  // 9. Double Duty Report
  const handleDoubleDutySummary = async (action: 'download' | 'share' | 'view') => {
    const doc = generateDoubleDutySummaryPDF(selectedMonth, employees, attendance, settings);
    const filename = `Double_Duty_Report_${selectedMonth}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Double Duty A4 PDF Report downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Double Duty Report for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Double Duty Report (2x Shifts)`,
        reportType: 'doubleduty_summary',
        period: selectedMonth
      });
      onShowToast(res.message);
    }
  };

  // 10. Employee Master List
  const handleEmployeeList = async (action: 'download' | 'share' | 'view') => {
    const doc = generateEmployeeListPDF(employees, settings);
    const filename = `Employee_Master_List_${selectedDate}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Employee Master List A4 PDF downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Employee Master List for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Employee Master List`,
        reportType: 'employee_list',
        period: selectedDate
      });
      onShowToast(res.message);
    }
  };

  // 11. Complete Summary Report
  const handleCompleteSummary = async (action: 'download' | 'share' | 'view') => {
    const doc = generateCompleteSummaryPDF(selectedMonth, employees, attendance, settings);
    const filename = `Complete_Summary_Report_${selectedMonth}.pdf`;
    if (action === 'download') {
      downloadPdf(doc, filename);
      onShowToast('Complete Summary A4 PDF Report downloaded!');
    } else if (action === 'view') {
      viewOrPrintPdf(doc, filename);
      onShowToast('Opening Complete Summary Report for Print / Preview...');
    } else {
      const res = await sharePdfToWhatsApp({
        doc,
        filename,
        title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Complete Summary Report (${selectedMonth})`,
        reportType: 'complete_summary',
        period: selectedMonth
      });
      onShowToast(res.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto text-slate-100">
      {/* Header Bar */}
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                {t.reportsTitle}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                <Printer className="w-3 h-3 text-emerald-400" />
                <span>A4 Portrait (210×297mm)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t.reportsSubtitle}
            </p>
          </div>

          {/* Quick Date / Month Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#1E293B] border border-slate-700 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t.date}:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 p-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#1E293B] border border-slate-700 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t.month}:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 p-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY 1: ATTENDANCE REPORTS (1-3) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h2 className="text-base font-bold text-white">
            {t.attendanceReports}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Daily Attendance Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-emerald-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#1</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.dailyAttendanceReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.dailyAttendanceDesc} ({selectedDate})
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-daily-att-pdf"
                onClick={() => handleDailyAttendance('download')}
                className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-daily-att-whatsapp"
                onClick={() => handleDailyAttendance('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-daily-att-view"
                onClick={() => handleDailyAttendance('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Weekly Attendance Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-emerald-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#2</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.weeklyAttendanceReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.weeklyAttendanceDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-weekly-att-pdf"
                onClick={() => handleWeeklyAttendance('download')}
                className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-weekly-att-whatsapp"
                onClick={() => handleWeeklyAttendance('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-weekly-att-view"
                onClick={() => handleWeeklyAttendance('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Monthly Attendance Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-emerald-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#3</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.monthlyAttendanceReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.monthlyAttendanceDesc} ({selectedMonth})
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-monthly-att-pdf"
                onClick={() => handleMonthlyAttendance('download')}
                className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-monthly-att-whatsapp"
                onClick={() => handleMonthlyAttendance('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-monthly-att-view"
                onClick={() => handleMonthlyAttendance('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY 2: SALARY & PAYROLL REPORTS (4-6) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h2 className="text-base font-bold text-white">
            {t.salaryReports}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 4. Daily Salary Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-blue-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#4</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.dailySalaryReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.dailySalaryDesc} ({selectedDate})
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-daily-sal-pdf"
                onClick={() => handleDailySalary('download')}
                className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-daily-sal-whatsapp"
                onClick={() => handleDailySalary('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-blue-950/60 text-blue-300 hover:bg-blue-900/80 border border-blue-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-daily-sal-view"
                onClick={() => handleDailySalary('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5. Weekly Salary Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-blue-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#5</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.weeklySalaryReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.weeklySalaryDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-weekly-sal-pdf"
                onClick={() => handleWeeklySalary('download')}
                className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-weekly-sal-whatsapp"
                onClick={() => handleWeeklySalary('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-blue-950/60 text-blue-300 hover:bg-blue-900/80 border border-blue-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-weekly-sal-view"
                onClick={() => handleWeeklySalary('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6. Monthly Salary Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-blue-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#6</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.monthlySalaryReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.monthlySalaryDesc} ({selectedMonth})
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-monthly-sal-pdf"
                onClick={() => handleMonthlySalary('download')}
                className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-monthly-sal-whatsapp"
                onClick={() => handleMonthlySalary('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-blue-950/60 text-blue-300 hover:bg-blue-900/80 border border-blue-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-monthly-sal-view"
                onClick={() => handleMonthlySalary('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY 3: WORKFORCE & SUMMARY REPORTS (7-11) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <h2 className="text-base font-bold text-white">
            {t.summaryReports}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 7. Present Staff Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-emerald-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#7</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.presentReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.presentReportDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-present-sum-pdf"
                onClick={() => handlePresentSummary('download')}
                className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-present-sum-whatsapp"
                onClick={() => handlePresentSummary('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-present-sum-view"
                onClick={() => handlePresentSummary('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 8. Absent Staff Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-rose-800 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#8</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.absentReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.absentReportDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-absent-sum-pdf"
                onClick={() => handleAbsentSummary('download')}
                className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-absent-sum-whatsapp"
                onClick={() => handleAbsentSummary('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-absent-sum-view"
                onClick={() => handleAbsentSummary('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 9. Double Duty Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-indigo-900/60 shadow-lg flex flex-col justify-between hover:border-indigo-700 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8.5px] font-black px-2 py-0.5 rounded-bl-lg">
              2x SHIFTS
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mr-12">#9</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.doubleDutyReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.doubleDutyReportDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-doubleduty-sum-pdf"
                onClick={() => handleDoubleDutySummary('download')}
                className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-doubleduty-sum-whatsapp"
                onClick={() => handleDoubleDutySummary('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/80 border border-indigo-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-doubleduty-sum-view"
                onClick={() => handleDoubleDutySummary('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 10. Employee Master List */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#1E293B] text-slate-300 border border-slate-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">#10</span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.employeeMasterListReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.employeeMasterListDesc} ({employees.length} Staff)
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-emp-master-pdf"
                onClick={() => handleEmployeeList('download')}
                className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-colors border border-slate-700"
                title="Download A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                id="btn-emp-master-whatsapp"
                onClick={() => handleEmployeeList('share')}
                className="flex-1 px-2 py-1.5 rounded-xl bg-[#1E293B] text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Share A4 PDF on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-emp-master-view"
                onClick={() => handleEmployeeList('view')}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View A4 PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 11. Complete Summary Report */}
          <div className="bg-[#111827] p-4 rounded-2xl border border-emerald-800/80 shadow-lg flex flex-col justify-between hover:border-emerald-700 transition-all md:col-span-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Official Executive PDF #11
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">
                {t.completeSummaryReport}
              </h3>
              <p className="text-xs text-slate-400">
                {t.completeSummaryDesc} — Period: {selectedMonth}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                id="btn-complete-summary-pdf"
                onClick={() => handleCompleteSummary('download')}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                title="Download Executive A4 PDF"
              >
                <Download className="w-4 h-4" />
                <span>Download A4 PDF</span>
              </button>
              <button
                id="btn-complete-summary-whatsapp"
                onClick={() => handleCompleteSummary('share')}
                className="px-3.5 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Share Executive PDF on WhatsApp"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-complete-summary-view"
                onClick={() => handleCompleteSummary('view')}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs flex items-center justify-center transition-colors"
                title="Print / View Executive A4 PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

