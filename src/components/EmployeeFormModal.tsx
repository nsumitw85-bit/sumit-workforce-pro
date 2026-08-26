import React, { useState, useEffect } from 'react';
import { X, User, Phone, BadgeCheck, Briefcase, Hash, IndianRupee, Save, Calculator } from 'lucide-react';
import { Employee, WorkType } from '../types';

interface EmployeeFormModalProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  existingEmployees: Employee[];
}

const WORK_TYPES: WorkType[] = [
  'Driver',
  'Helper',
  'Nali Worker',
  'Jhadu Worker'
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave,
  existingEmployees
}) => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [workerId, setWorkerId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [workType, setWorkType] = useState<WorkType | ''>('Helper');
  const [dailyWage, setDailyWage] = useState<string>('500');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setEmployeeId(employee.id || '');
        setWorkerId(employee.workerId || `WRK-${employee.id.replace(/\D/g, '') || '101'}`);
        setName(employee.name || '');
        setMobile(employee.mobile || '');
        const matchedWorkType = WORK_TYPES.find((w) => w === employee.workType || w === employee.designation) || 'Helper';
        setWorkType(matchedWorkType);
        setDailyWage(employee.dailySalary ? employee.dailySalary.toString() : '500');
      } else {
        // Auto-generate next unique Employee ID and Worker ID
        const maxEmpNum = existingEmployees.reduce((max, e) => {
          const num = parseInt(e.id.replace(/\D/g, ''), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }, 100);
        
        const nextNum = maxEmpNum + 1;
        const autoEmpId = `EMP-${nextNum}`;
        const autoWorkerId = `WRK-${nextNum}`;

        setEmployeeId(autoEmpId);
        setWorkerId(autoWorkerId);
        setName('');
        setMobile('');
        setWorkType('Helper');
        setDailyWage('500');
      }
      setError('');
    }
  }, [employee, existingEmployees, isOpen]);

  // Set suggested default wage when workType changes on a new employee
  const handleWorkTypeChange = (newType: WorkType) => {
    setWorkType(newType);
    if (!employee) {
      if (newType === 'Driver') setDailyWage('650');
      else if (newType === 'Nali Worker') setDailyWage('550');
      else if (newType === 'Helper') setDailyWage('500');
      else if (newType === 'Jhadu Worker') setDailyWage('500');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmpId = employeeId.trim();
    const trimmedWorkerId = workerId.trim();
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const parsedDailyWage = parseFloat(dailyWage);

    // 1. Employee ID Validation
    if (!trimmedEmpId) {
      setError('Employee ID is mandatory.');
      return;
    }

    const duplicateEmpId = existingEmployees.find(
      (e) => e.id.toLowerCase() === trimmedEmpId.toLowerCase() && e.id !== employee?.id
    );
    if (duplicateEmpId) {
      setError(`Employee ID "${trimmedEmpId}" already exists. Please use a unique ID.`);
      return;
    }

    // 2. Worker ID Validation
    if (!trimmedWorkerId) {
      setError('Worker ID is mandatory.');
      return;
    }

    const duplicateWorkerId = existingEmployees.find(
      (e) => (e.workerId || '').toLowerCase() === trimmedWorkerId.toLowerCase() && e.id !== employee?.id
    );
    if (duplicateWorkerId) {
      setError(`Worker ID "${trimmedWorkerId}" already exists. Please use a unique ID.`);
      return;
    }

    // 3. Full Name Validation
    if (!trimmedName) {
      setError('Full Name is mandatory.');
      return;
    }

    // 4. Mobile Number Validation
    if (!trimmedMobile) {
      setError('Mobile Number is mandatory.');
      return;
    }
    const cleanMobileDigits = trimmedMobile.replace(/\D/g, '');
    if (cleanMobileDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // 5. Work Type Validation
    if (!workType) {
      setError('Please select a Work Type.');
      return;
    }

    // 6. Daily Wage Validation
    if (isNaN(parsedDailyWage) || parsedDailyWage <= 0) {
      setError('Please enter a valid positive Daily Wage (₹ per day).');
      return;
    }

    const wageNumber = Math.round(parsedDailyWage);
    const monthlyEstimate = wageNumber * 26;

    const savedRecord: Employee = {
      ...employee,
      id: trimmedEmpId,
      workerId: trimmedWorkerId,
      name: trimmedName,
      mobile: trimmedMobile.startsWith('+') ? trimmedMobile : `+91 ${trimmedMobile}`,
      workType: workType,
      designation: workType,
      department: workType,
      dailySalary: wageNumber,
      monthlySalary: monthlyEstimate,
      status: employee?.status || 'ACTIVE',
      joiningDate: employee?.joiningDate || new Date().toISOString().split('T')[0],
      createdAt: employee?.createdAt || new Date().toISOString()
    };

    onSave(savedRecord);
    onClose();
  };

  const wageNum = parseFloat(dailyWage) || 0;

  return (
    <div
      id="employee-form-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1E293B] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                {employee ? 'Edit Worker Details' : 'Register New Worker'}
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Simple 6-Field Fast Worker Registration
              </p>
            </div>
          </div>

          <button
            id="employee-form-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Exactly 6 Required Fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-white">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 text-rose-300 text-xs font-bold border border-rose-800 animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Row 1: Employee ID & Worker ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Employee ID */}
            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <Hash className="w-4 h-4 text-emerald-400" />
                <span>1. Employee ID *</span>
              </label>
              <input
                id="input-employee-id"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-101"
                className="w-full px-4 py-3 rounded-2xl bg-[#1E293B] border border-slate-700 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-slate-500"
                required
              />
            </div>

            {/* 2. Worker ID */}
            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <BadgeCheck className="w-4 h-4 text-blue-400" />
                <span>2. Worker ID *</span>
              </label>
              <input
                id="input-worker-id"
                type="text"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="e.g. WRK-101"
                className="w-full px-4 py-3 rounded-2xl bg-[#1E293B] border border-slate-700 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-slate-500"
                required
              />
            </div>
          </div>

          {/* 3. Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              <span>3. Full Name *</span>
            </label>
            <input
              id="input-worker-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-base font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-slate-500"
              required
            />
          </div>

          {/* 4. Mobile Number */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>4. Mobile Number *</span>
            </label>
            <input
              id="input-worker-mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-base font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-slate-500"
              required
            />
          </div>

          {/* 5. Work Type & 6. Daily Wage in Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 5. Work Category (Dropdown) */}
            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>5. Work Category *</span>
              </label>
              <select
                id="select-work-type"
                value={workType}
                onChange={(e) => handleWorkTypeChange(e.target.value as WorkType)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all"
                required
              >
                {WORK_TYPES.map((type) => (
                  <option key={type} value={type} className="py-2 font-bold bg-[#1E293B] text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Daily Salary Rate (₹ per day) */}
            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span>6. Daily Salary Rate (₹ / day) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-base text-emerald-400">
                  ₹
                </span>
                <input
                  id="input-daily-wage"
                  type="number"
                  min="1"
                  step="1"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-base font-extrabold text-white focus:border-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Automated Salary Calculation Engine */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs space-y-2.5">
            <div className="flex items-center justify-between font-extrabold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>SALARY CALCULATION ENGINE (AUTO-CALCULATED)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1 font-medium text-slate-300">
              <div className="p-2 rounded-xl bg-[#1E293B] border border-slate-700">
                <span className="block text-[10px] font-bold text-slate-400">Daily Salary (1 Shift)</span>
                <span className="font-extrabold text-sm text-emerald-400">₹{wageNum.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1E293B] border border-slate-700">
                <span className="block text-[10px] font-bold text-slate-400">Weekly (6 Days)</span>
                <span className="font-extrabold text-sm text-cyan-400">₹{(wageNum * 6).toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1E293B] border border-slate-700">
                <span className="block text-[10px] font-bold text-slate-400">Monthly (26 Days)</span>
                <span className="font-extrabold text-sm text-indigo-300">₹{(wageNum * 26).toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1E293B] border border-slate-700">
                <span className="block text-[10px] font-bold text-slate-400">Double Duty (2x Shifts)</span>
                <span className="font-extrabold text-sm text-blue-400">₹{(wageNum * 2).toLocaleString()}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center font-medium">
              * D (Double Duty) counts as 2 shifts. Salary automatically calculates as Daily Wage × 2.
            </div>
          </div>

          {/* Modal Action Buttons: One-Click Save */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#1E293B] hover:bg-slate-700 text-slate-300 text-sm font-bold transition-all text-center cursor-pointer border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="employee-form-save-btn"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-base font-extrabold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{employee ? 'Save Worker Changes' : 'Save & Register Worker'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
