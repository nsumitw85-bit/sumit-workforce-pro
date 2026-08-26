import React, { useState } from 'react';
import { X, CheckSquare, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Employee, AttendanceRecord, AttendanceStatus, CompanySettings } from '../types';
import { translations } from '../utils/translations';

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onSaveBulkAttendance: (records: AttendanceRecord[]) => void;
  onShowToast?: (msg: string) => void;
}

export const BulkAttendanceModal: React.FC<BulkAttendanceModalProps> = ({
  isOpen,
  onClose,
  employees,
  attendance,
  settings,
  onSaveBulkAttendance,
  onShowToast = (_msg: string) => {}
}) => {
  if (!isOpen) return null;

  const currentLang = settings?.language || 'en';
  const t = translations[currentLang] || translations.en;
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('P');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const departments = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);

  const activeEmployees = employees.filter((e) => {
    if (e.status !== 'ACTIVE') return false;
    if (selectedDept !== 'ALL' && e.department !== selectedDept) return false;
    return true;
  });

  const handleApplyBulk = () => {
    const updated = [...attendance];
    activeEmployees.forEach((emp) => {
      const idx = updated.findIndex((r) => r.employeeId === emp.id && r.date === targetDate);
      const newRec: AttendanceRecord = {
        id: `${emp.id}_${targetDate}`,
        employeeId: emp.id,
        date: targetDate,
        status: selectedStatus,
        inTime: selectedStatus === 'A' ? '' : '09:00',
        outTime: selectedStatus === 'A' ? '' : (selectedStatus === 'D' ? '21:00' : '18:00'),
        notes: selectedStatus === 'D' ? 'Bulk Marked: Double Duty (2 shifts)' : 'Bulk Attendance',
        markedAt: new Date().toISOString()
      };

      if (idx >= 0) {
        updated[idx] = newRec;
      } else {
        updated.push(newRec);
      }
    });

    onSaveBulkAttendance(updated);
    const statusLabel = selectedStatus === 'P' ? t.statusPresent : (selectedStatus === 'D' ? t.statusDoubleDuty : t.statusAbsent);
    onShowToast(`Marked ${activeEmployees.length} staff as ${statusLabel} for ${targetDate}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#111827] rounded-3xl max-w-md w-full p-5 border border-slate-800 shadow-2xl space-y-4 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.bulkAttendance}
              </h3>
              <p className="text-xs text-slate-400">
                1-tap fast batch attendance marking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-200">
            {t.selectDate}
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Department Filter */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-200">
            {t.department}
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL" className="bg-[#1E293B] text-white">{t.allDepartments} ({employees.length} Staff)</option>
            {departments.map((d) => (
              <option key={d} value={d} className="bg-[#1E293B] text-white">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Large Status Selection Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200">
            Choose Status to Apply
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Present (P) */}
            <button
              type="button"
              onClick={() => setSelectedStatus('P')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedStatus === 'P'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400'
                  : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span className="text-xl font-black">P</span>
              <span className="text-[11px] font-bold">{t.statusPresent.split(' ')[0]}</span>
              <span className={`text-[9px] ${selectedStatus === 'P' ? 'text-emerald-100' : 'text-slate-400'}`}>1 Shift</span>
            </button>

            {/* Double Duty (D) */}
            <button
              type="button"
              onClick={() => setSelectedStatus('D')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative cursor-pointer ${
                selectedStatus === 'D'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400'
                  : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span className="text-xl font-black">D</span>
              <span className="text-[11px] font-bold">Double</span>
              <span className={`text-[9px] font-black px-1 rounded ${selectedStatus === 'D' ? 'bg-white/20 text-white' : 'bg-blue-950 text-blue-300'}`}>2 Shifts</span>
            </button>

            {/* Absent (A) */}
            <button
              type="button"
              onClick={() => setSelectedStatus('A')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedStatus === 'A'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-400'
                  : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span className="text-xl font-black">A</span>
              <span className="text-[11px] font-bold">{t.statusAbsent.split(' ')[0]}</span>
              <span className={`text-[9px] ${selectedStatus === 'A' ? 'text-rose-100' : 'text-slate-400'}`}>0 Shift</span>
            </button>
          </div>
        </div>

        {/* Affected Staff Note */}
        <div className="bg-[#1E293B] p-3 rounded-xl text-xs text-slate-300 flex items-center gap-2 border border-slate-700">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Will update <strong>{activeEmployees.length} staff</strong> members for <strong>{targetDate}</strong>.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#1E293B] text-slate-300 font-bold text-xs hover:bg-slate-700 border border-slate-700 cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleApplyBulk}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {t.apply}
          </button>
        </div>
      </div>
    </div>
  );
};
