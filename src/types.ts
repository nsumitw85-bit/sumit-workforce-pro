export type AttendanceStatus = 'P' | 'A' | 'D'; // P = Present, A = Absent, D = Double Duty

export type AppLanguage = 'en' | 'hi' | 'mr';
export type AppTheme = 'light' | 'dark' | 'custom';
export type CustomThemeAccent = 'emerald' | 'blue' | 'indigo' | 'purple' | 'amber';

export type WorkType = 'Driver' | 'Helper' | 'Nali Worker' | 'Jhadu Worker';

export interface Employee {
  id: string; // e.g. "EMP-101" or "SWP-101"
  workerId?: string; // e.g. "WRK-101" (Unique)
  name: string;
  mobile: string;
  workType?: WorkType | string;
  email?: string;
  department?: string;
  designation?: string;
  address?: string;
  joiningDate?: string; // YYYY-MM-DD
  dailySalary?: number;
  monthlySalary?: number;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  bankAccount?: string;
  notes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string; // `${employeeId}_${date}`
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus; // 'P' | 'A' | 'D'
  inTime?: string; // HH:mm
  outTime?: string; // HH:mm
  notes?: string;
  markedAt: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  totalDaysInMonth: number;
  workingDays: number;
  presentDays: number; // Count of 'P'
  doubleDutyDays: number; // Count of 'D' (2 shifts each)
  absentDays: number; // Count of 'A'
  payableDays: number; // presentDays + (2 * doubleDutyDays)
  totalShifts: number; // same as payableDays
  dailyRate: number;
  baseSalary: number; // payableDays * dailyRate
  netSalary: number;
  paymentStatus: 'PAID' | 'PENDING';
  generatedAt: string;
}

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail?: string;
  currencySymbol: string; // ₹, $, €, £
  standardWorkDays: number; // e.g. 26 or 30
  language: AppLanguage; // 'en' | 'hi' | 'mr'
  theme: AppTheme; // 'light' | 'dark' | 'custom'
  customAccent: CustomThemeAccent; // 'emerald' | 'blue' | 'indigo' | 'purple' | 'amber'
  darkMode: boolean;
  authorizedSignatoryName: string;
  appLockEnabled?: boolean;
  pinCode?: string;
}

export interface MonthLock {
  month: string; // YYYY-MM
  lockedAt: string; // ISO date string
  lockedBy?: string;
  notes?: string;
}

export interface PdfArchiveItem {
  id: string;
  title: string;
  reportType: 'daily_attendance' | 'weekly_attendance' | 'monthly_attendance' | 'daily_salary' | 'weekly_salary' | 'monthly_salary' | 'present_summary' | 'absent_summary' | 'double_duty' | 'payslip' | 'employee_list' | 'master_summary';
  period: string; // Date (YYYY-MM-DD) or Month (YYYY-MM)
  filename: string;
  generatedAt: string;
  fileSizeKb: number;
  pdfDataUri?: string;
  employeeId?: string;
  employeeName?: string;
}

export interface AutoBackupSnapshot {
  id: string;
  timestamp: string;
  trigger: 'auto_change' | 'daily' | 'manual';
  employeeCount: number;
  attendanceCount: number;
  lockedMonthsCount: number;
  dataJson: string;
}

export interface StorageStats {
  totalEmployees: number;
  totalAttendance: number;
  totalSalaryRecords: number;
  totalPdfReports: number;
  totalLockedMonths: number;
  estimatedSizeBytes: number;
  estimatedSizeFormatted: string;
  lastBackupDate: string | null;
  autoBackupCount: number;
  storageEngine: string;
}

export interface BackupData {
  version: string;
  exportDate: string;
  appName: string;
  companySettings: CompanySettings;
  employees: Employee[];
  attendance: AttendanceRecord[];
  salarySlips: SalarySlip[];
  lockedMonths?: MonthLock[];
  pdfArchive?: PdfArchiveItem[];
}

export type ActiveTab = 'dashboard' | 'employees' | 'attendance' | 'salary' | 'reports' | 'history' | 'settings';

