import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Building2, 
  Briefcase, 
  CreditCard, 
  Banknote, 
  Share2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UserX, 
  Layers,
  Edit2,
  Trash2,
  Download
} from 'lucide-react';
import { Employee, AttendanceRecord, CompanySettings } from '../types';
import { calculateMonthlySalaries } from '../utils/storage';
import { generateIndividualPaySlipPDF } from '../utils/pdfGenerator';
import { sharePdfToWhatsApp } from '../utils/shareUtils';
import { translations } from '../utils/translations';

interface EmployeeProfileModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  isOpen,
  onClose,
  attendance,
  settings,
  onEditEmployee,
  onDeleteEmployee
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'attendance' | 'payslip'>('profile');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  if (!isOpen || !employee) return null;

  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;

  // Filter attendance records for this employee
  const empRecords = attendance
    .filter((r) => r.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Current Month calculations
  const slips = calculateMonthlySalaries([employee], attendance, settings, selectedMonth);
  const currentSlip = slips[0];

  const handleSharePayslipWhatsApp = async () => {
    if (!currentSlip) return;
    const doc = generateIndividualPaySlipPDF(currentSlip, employee, settings);
    await sharePdfToWhatsApp({
      doc,
      filename: `PaySlip_${employee.id}_${selectedMonth}.pdf`,
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Pay Slip (${employee.name} - ${selectedMonth})`,
      phone: employee.mobile,
      employeeId: employee.id,
      employeeName: employee.name,
      reportType: 'individual_payslip',
      period: selectedMonth
    });
  };

  const handleDownloadPayslipPDF = () => {
    if (!currentSlip) return;
    const doc = generateIndividualPaySlipPDF(currentSlip, employee, settings);
    doc.save(`PaySlip_${employee.id}_${selectedMonth}.pdf`);
  };

  const handleCall = () => {
    window.open(`tel:${employee.mobile}`, '_self');
  };

  const handleWhatsApp = () => {
    let cleanPhone = employee.mobile.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    const msg = encodeURIComponent(`Hello ${employee.name}, regarding your work at ${settings.companyName || 'Sumit Workforce Pro'}`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div
      id="employee-profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Hero Banner */}
        <div className="p-6 bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] text-white relative border-b border-slate-800">
          <button
            id="employee-profile-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-[#1E293B] border border-slate-700 overflow-hidden ring-4 ring-emerald-500/30 flex-shrink-0 flex items-center justify-center font-bold text-2xl text-white">
              {employee.photoUrl ? (
                <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                employee.name.charAt(0)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {employee.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  employee.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {employee.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate text-white">
                {employee.name}
              </h2>
              <p className="text-xs text-slate-300">
                {employee.designation} • {employee.department}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Open WhatsApp Chat"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCall}
                className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-white text-xs transition-all border border-slate-700"
                title="Direct Phone Call"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 mt-6 border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                activeSubTab === 'profile'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                activeSubTab === 'attendance'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Attendance History ({empRecords.length})
            </button>
            <button
              onClick={() => setActiveSubTab('payslip')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                activeSubTab === 'payslip'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Pay Slip & Wages
            </button>
          </div>
        </div>

        {/* Modal Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-white bg-[#111827]">
          
          {/* TAB 1: PROFILE */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-800">
                  <span className="text-slate-400 block mb-1">Employee ID</span>
                  <span className="font-mono font-bold text-sm text-white">{employee.id}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-800">
                  <span className="text-slate-400 block mb-1">Worker ID</span>
                  <span className="font-mono font-bold text-sm text-blue-400">{employee.workerId || 'N/A'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-800">
                  <span className="text-slate-400 block mb-1">Work Type (Category)</span>
                  <span className="font-bold text-sm text-indigo-400">{employee.workType || employee.designation || 'Worker'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-800">
                  <span className="text-slate-400 block mb-1">Mobile Number</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{employee.mobile}</span>
                    <button onClick={handleCall} className="text-emerald-400 font-bold hover:underline">Call</button>
                  </div>
                </div>

              </div>

              {/* Live Month Attendance & Automatic Salary Calculation Box */}
              {currentSlip && (
                <div className="p-4 rounded-3xl bg-[#1E293B] border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        Monthly Salary Calculation ({selectedMonth})
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Auto-calculated from live attendance
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Daily Wage: {settings.currencySymbol}{employee.dailySalary || 500}/day
                    </span>
                  </div>

                  {/* 4 Attendance KPI Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-[#111827] border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400 block">Present (P)</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        {currentSlip.presentDays} <span className="text-[10px] font-normal">days</span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#111827] border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400 block">Double Duty (D)</span>
                      <span className="text-base font-extrabold text-blue-400">
                        {currentSlip.doubleDutyDays} <span className="text-[10px] font-normal">(2x)</span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#111827] border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400 block">Absent (A)</span>
                      <span className="text-base font-extrabold text-rose-400">
                        {currentSlip.absentDays} <span className="text-[10px] font-normal">days</span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#111827] border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400 block">Payable Shifts</span>
                      <span className="text-base font-black text-white">
                        {currentSlip.payableDays}
                      </span>
                    </div>
                  </div>

                  {/* Salary Total & Mathematical Formula Display */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-200">
                        Current Month Salary ({selectedMonth})
                      </span>
                      <span className="text-xl font-black text-emerald-400">
                        {settings.currencySymbol} {currentSlip.netSalary.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-300 pt-1 border-t border-emerald-800/60 flex items-center justify-between flex-wrap gap-1">
                      <span>Formula: (Present × Wage) + (Double Duty × Wage × 2)</span>
                      <span className="font-mono font-bold">
                        ({currentSlip.presentDays} × {settings.currencySymbol}{employee.dailySalary || 500}) + ({currentSlip.doubleDutyDays} × {settings.currencySymbol}{employee.dailySalary || 500} × 2) = {settings.currencySymbol}{currentSlip.netSalary.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit / Delete Footer Controls */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    onEditEmployee(employee);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1E293B] text-slate-200 hover:bg-slate-700 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Worker</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove worker ${employee.name}?`)) {
                      onDeleteEmployee(employee.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-950/50 text-rose-400 hover:bg-rose-900/50 text-xs font-bold border border-rose-800 flex items-center gap-1.5 cursor-pointer"
                  title="Delete Worker"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY */}
          {activeSubTab === 'attendance' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Recent Marked Logs ({empRecords.length} records)</span>
                <span>Date & Status</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {empRecords.map((rec) => {
                  let badge = 'bg-emerald-950/50 text-emerald-400 border border-emerald-800';
                  let label = 'Present (P)';

                  if (rec.status === 'A') {
                    badge = 'bg-rose-950/50 text-rose-400 border border-rose-800';
                    label = 'Absent (A)';
                  } else if (rec.status === 'D') {
                    badge = 'bg-blue-950/50 text-blue-400 font-black border border-blue-800';
                    label = 'Double Duty (D - 2x)';
                  }

                  return (
                    <div
                      key={rec.id}
                      className="p-3 rounded-2xl bg-[#1E293B] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${badge}`}>
                          {label}
                        </span>
                        <span className="font-bold text-slate-200">{rec.date}</span>
                      </div>

                      <div className="text-right text-slate-400">
                        {rec.inTime ? `${rec.inTime} - ${rec.outTime || 'Running'}` : (rec.status === 'A' ? 'Absent' : 'Marked')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PAY SLIP */}
          {activeSubTab === 'payslip' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Select Month:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-bold text-white"
                />
              </div>

              {currentSlip && (
                <div className="p-5 rounded-3xl bg-[#1E293B] border border-slate-700 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <div>
                      <span className="text-xs text-slate-400">Period</span>
                      <h4 className="font-bold text-sm text-white">{selectedMonth}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Status</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-xs block border border-emerald-800">
                        {currentSlip.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#111827] border border-slate-700">
                      <span className="text-slate-400">Present (P)</span>
                      <div className="font-bold text-sm text-emerald-400">{currentSlip.presentDays} days</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#111827] border border-slate-700">
                      <span className="text-slate-400">Double Duty (D)</span>
                      <div className="font-bold text-sm text-blue-400">{currentSlip.doubleDutyDays} days ({currentSlip.doubleDutyDays * 2} shifts)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#111827] border border-slate-700">
                      <span className="text-slate-400">Absent (A)</span>
                      <div className="font-bold text-sm text-rose-400">{currentSlip.absentDays} days</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#111827] border border-slate-700">
                      <span className="text-slate-400">Total Shifts</span>
                      <div className="font-bold text-sm text-white font-black">{currentSlip.payableDays}</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div>
                      <span className="text-xs text-emerald-300 font-semibold block">Net Payable Amount</span>
                      <div className="text-xl font-black text-emerald-400">
                        {settings.currencySymbol} {currentSlip.netSalary.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadPayslipPDF}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={handleSharePayslipWhatsApp}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
