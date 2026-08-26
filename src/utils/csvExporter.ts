import { Employee, AttendanceRecord, CompanySettings, SalarySlip } from '../types';
import { calculateMonthlySalaries, normalizeStatus } from './storage';

/**
 * Escapes a field value for CSV compliance (RFC 4180)
 */
const escapeCsvValue = (val: string | number | boolean | null | undefined): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Generates an external payroll-ready formatted CSV string for a given month.
 * Includes complete attendance counts (P, D - 2x, A), shift totals, wage rates, and net salaries.
 */
export const generateMonthlyPayrollCSV = (
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings,
  monthStr: string
): string => {
  const salarySlips = calculateMonthlySalaries(employees, attendance, settings, monthStr);
  const slipsMap = new Map<string, SalarySlip>();
  salarySlips.forEach((s) => slipsMap.set(s.employeeId, s));

  // Determine month name
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthNumStr, 10);
  const dateObj = new Date(year, monthNum - 1, 1);
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const exportTimestamp = new Date().toISOString();

  // CSV Column Headers for External Payroll Systems
  const headers = [
    'Employee ID',
    'Worker ID',
    'Full Name',
    'Work Type / Category',
    'Department',
    'Designation',
    'Mobile Number',
    'Bank Account / IFSC',
    'Payroll Month',
    'Month Name',
    'Total Month Days',
    'Working Days',
    'Present Days (P)',
    'Double Duty Days (D - 2x)',
    'Absent Days (A)',
    'Total Payable Shifts',
    `Daily Wage Rate (${settings.currencySymbol || '₹'})`,
    `Base Gross Salary (${settings.currencySymbol || '₹'})`,
    `Net Payable Salary (${settings.currencySymbol || '₹'})`,
    'Payment Status',
    'Company Name',
    'Exported At'
  ];

  const rows: string[] = [headers.map(escapeCsvValue).join(',')];

  employees.forEach((emp) => {
    const slip = slipsMap.get(emp.id);
    const presentDays = slip ? slip.presentDays : 0;
    const doubleDutyDays = slip ? slip.doubleDutyDays : 0;
    const absentDays = slip ? slip.absentDays : 0;
    const payableShifts = slip ? slip.payableDays : 0;
    const dailyRate = slip ? slip.dailyRate : (emp.dailySalary || 0);
    const baseSalary = slip ? slip.baseSalary : 0;
    const netSalary = slip ? slip.netSalary : 0;
    const totalDays = slip ? slip.totalDaysInMonth : new Date(year, monthNum, 0).getDate();
    const workingDays = slip ? slip.workingDays : (settings.standardWorkDays || 26);

    const rowData = [
      emp.id,
      emp.workerId || emp.id,
      emp.name,
      emp.workType || 'General Staff',
      emp.department || 'Operations',
      emp.designation || emp.workType || 'Worker',
      emp.mobile,
      emp.bankAccount || 'Cash / Unassigned',
      monthStr,
      monthName,
      totalDays,
      workingDays,
      presentDays,
      doubleDutyDays,
      absentDays,
      payableShifts,
      dailyRate,
      baseSalary,
      netSalary,
      slip?.paymentStatus || 'PAID',
      settings.companyName || 'Sumit Enterprises & Tech Solutions',
      exportTimestamp
    ];

    rows.push(rowData.map(escapeCsvValue).join(','));
  });

  // Include UTF-8 BOM (\uFEFF) so Excel & 3rd-party ERPs open it with perfect encoding
  return '\uFEFF' + rows.join('\r\n');
};

/**
 * Generates a comprehensive Day-by-Day (1-31) Matrix Attendance + Payroll CSV.
 */
export const generateDetailedAttendanceMatrixCSV = (
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings,
  monthStr: string
): string => {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthNumStr, 10);
  const totalDays = new Date(year, monthNum, 0).getDate();

  const salarySlips = calculateMonthlySalaries(employees, attendance, settings, monthStr);
  const slipsMap = new Map<string, SalarySlip>();
  salarySlips.forEach((s) => slipsMap.set(s.employeeId, s));

  // Build daily attendance lookup: Map<`${employeeId}_${dayStr}`, status>
  const attendanceMap = new Map<string, string>();
  attendance.forEach((r) => {
    if (r.date && r.date.startsWith(monthStr)) {
      attendanceMap.set(`${r.employeeId}_${r.date}`, normalizeStatus(r.status));
    }
  });

  // Base Headers
  const dayHeaders = Array.from({ length: totalDays }, (_, i) => `Day ${String(i + 1).padStart(2, '0')}`);
  const headers = [
    'Employee ID',
    'Worker ID',
    'Full Name',
    'Work Type',
    'Mobile',
    ...dayHeaders,
    'Present (P)',
    'Double Duty (D)',
    'Absent (A)',
    'Total Payable Shifts',
    `Daily Rate (${settings.currencySymbol || '₹'})`,
    `Net Salary (${settings.currencySymbol || '₹'})`
  ];

  const rows: string[] = [headers.map(escapeCsvValue).join(',')];

  employees.forEach((emp) => {
    const slip = slipsMap.get(emp.id);
    const dayStatuses: string[] = [];

    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${monthStr}-${String(d).padStart(2, '0')}`;
      const status = attendanceMap.get(`${emp.id}_${dateKey}`) || '-';
      dayStatuses.push(status);
    }

    const rowData = [
      emp.id,
      emp.workerId || emp.id,
      emp.name,
      emp.workType || 'Worker',
      emp.mobile,
      ...dayStatuses,
      slip?.presentDays || 0,
      slip?.doubleDutyDays || 0,
      slip?.absentDays || 0,
      slip?.payableDays || 0,
      slip?.dailyRate || 0,
      slip?.netSalary || 0
    ];

    rows.push(rowData.map(escapeCsvValue).join(','));
  });

  return '\uFEFF' + rows.join('\r\n');
};

/**
 * Triggers a browser download of the CSV content
 */
export const downloadCsvFile = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
