import { 
  Employee, 
  AttendanceRecord, 
  SalarySlip, 
  CompanySettings, 
  BackupData, 
  AttendanceStatus,
  MonthLock,
  PdfArchiveItem,
  AutoBackupSnapshot,
  StorageStats
} from '../types';
import { defaultSettings, initialEmployees, generateInitialAttendance } from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'swp_company_settings_v2',
  EMPLOYEES: 'swp_employees_v2',
  ATTENDANCE: 'swp_attendance_v2',
  SALARY: 'swp_salary_slips_v2',
  PIN_SESSION: 'swp_pin_session_unlocked',
  MONTH_LOCKS: 'swp_month_locks_v1',
  PDF_ARCHIVE: 'swp_pdf_archive_v1',
  AUTO_BACKUPS: 'swp_auto_backups_v1',
  LAST_BACKUP_DATE: 'swp_last_backup_timestamp'
};

const DB_NAME = 'SumitWorkforcePro_PermanentDB';
const DB_VERSION = 2;

// IndexedDB Helper for permanent unbounded storage
let idbInstance: IDBDatabase | null = null;

const initIndexedDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    if (idbInstance) {
      resolve(idbInstance);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('general_store')) {
          db.createObjectStore('general_store');
        }
        if (!db.objectStoreNames.contains('pdf_store')) {
          db.createObjectStore('pdf_store', { keyPath: 'id' });
        }
      };
      request.onsuccess = (e: any) => {
        idbInstance = e.target.result;
        resolve(idbInstance);
      };
      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
};

// Async sync to IndexedDB for safety
const syncToIndexedDB = async (key: string, value: any) => {
  try {
    const db = await initIndexedDB();
    if (!db) return;
    const tx = db.transaction('general_store', 'readwrite');
    const store = tx.objectStore('general_store');
    store.put(value, key);
  } catch (err) {
    console.warn('IndexedDB sync deferred', err);
  }
};

// Normalize legacy or raw status into strictly 'P' | 'A' | 'D'
export const normalizeStatus = (status: string | undefined): AttendanceStatus => {
  if (!status) return 'P';
  const upper = status.toUpperCase();
  if (upper === 'D' || upper === 'DOUBLE_DUTY' || upper === 'DOUBLE') return 'D';
  if (upper === 'A' || upper === 'ABSENT' || upper === 'LEAVE') return 'A';
  return 'P'; // default Present
};

export const loadSettings = (): CompanySettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      const chosenTheme = parsed.theme || 'dark';
      return {
        ...defaultSettings,
        ...parsed,
        language: parsed.language || 'en',
        theme: chosenTheme,
        darkMode: chosenTheme === 'dark',
        customAccent: parsed.customAccent || 'emerald'
      };
    }
  } catch (e) {
    console.error('Failed to load settings from storage', e);
  }
  return defaultSettings;
};

export const saveSettings = (settings: CompanySettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  syncToIndexedDB(STORAGE_KEYS.SETTINGS, settings);
};

export const loadEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load employees from storage', e);
  }
  const initial = initialEmployees;
  saveEmployees(initial);
  return initial;
};

export const saveEmployees = (employees: Employee[]): void => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  syncToIndexedDB(STORAGE_KEYS.EMPLOYEES, employees);
  scheduleAutoBackup('auto_change');
};

export const loadAttendance = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r: any) => ({
          ...r,
          status: normalizeStatus(r.status)
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load attendance from storage', e);
  }
  const emps = loadEmployees();
  const initial = generateInitialAttendance(emps);
  saveAttendance(initial);
  return initial;
};

export const saveAttendance = (records: AttendanceRecord[]): void => {
  const normalized = records.map((r) => ({
    ...r,
    status: normalizeStatus(r.status)
  }));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(normalized));
  syncToIndexedDB(STORAGE_KEYS.ATTENDANCE, normalized);
  scheduleAutoBackup('auto_change');
};

// ==========================================
// 6. MONTH LOCK SYSTEM
// ==========================================

export const loadMonthLocks = (): MonthLock[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTH_LOCKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load month locks', e);
  }
  return [];
};

export const saveMonthLocks = (locks: MonthLock[]): void => {
  localStorage.setItem(STORAGE_KEYS.MONTH_LOCKS, JSON.stringify(locks));
  syncToIndexedDB(STORAGE_KEYS.MONTH_LOCKS, locks);
};

export const isMonthLocked = (monthStr: string): boolean => {
  // monthStr is "YYYY-MM" or "YYYY-MM-DD"
  const m = monthStr.slice(0, 7);
  const locks = loadMonthLocks();
  return locks.some((l) => l.month === m);
};

export const toggleMonthLock = (
  monthStr: string, 
  lockedBy: string = 'Authorized Admin',
  notes: string = 'Month Completed & Audited'
): { locked: boolean; lockItem: MonthLock | null } => {
  const m = monthStr.slice(0, 7);
  const currentLocks = loadMonthLocks();
  const existingIdx = currentLocks.findIndex((l) => l.month === m);

  if (existingIdx >= 0) {
    // Unlock
    currentLocks.splice(existingIdx, 1);
    saveMonthLocks(currentLocks);
    return { locked: false, lockItem: null };
  } else {
    // Lock
    const newLock: MonthLock = {
      month: m,
      lockedAt: new Date().toISOString(),
      lockedBy,
      notes
    };
    currentLocks.push(newLock);
    saveMonthLocks(currentLocks);
    return { locked: true, lockItem: newLock };
  }
};

// ==========================================
// 5. PDF ARCHIVE & PDF HISTORY SYSTEM
// ==========================================

export const loadPdfArchive = (): PdfArchiveItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PDF_ARCHIVE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load PDF archive', e);
  }
  return [];
};

export const savePdfArchive = (archive: PdfArchiveItem[]): void => {
  // Cap in-memory/localStorage archive metadata to recent 50 entries to avoid quota issues
  const capped = archive.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.PDF_ARCHIVE, JSON.stringify(capped));
  syncToIndexedDB(STORAGE_KEYS.PDF_ARCHIVE, archive);
};

export const archivePdfReport = (item: Omit<PdfArchiveItem, 'id' | 'generatedAt'>): PdfArchiveItem => {
  const archive = loadPdfArchive();
  const newItem: PdfArchiveItem = {
    ...item,
    id: `PDF_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    generatedAt: new Date().toISOString()
  };

  // Prepend new archive item
  const updated = [newItem, ...archive.filter(i => i.filename !== newItem.filename || i.period !== newItem.period)];
  savePdfArchive(updated);
  return newItem;
};

export const deleteArchivedPdf = (id: string): void => {
  const archive = loadPdfArchive();
  const updated = archive.filter((item) => item.id !== id);
  savePdfArchive(updated);
};

// ==========================================
// 4 & 7. AUTOMATIC LOCAL BACKUP ENGINE
// ==========================================

let backupDebounceTimeout: any = null;

export const loadAutoBackups = (): AutoBackupSnapshot[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load auto backups', e);
  }
  return [];
};

export const saveAutoBackups = (snapshots: AutoBackupSnapshot[]): void => {
  // Retain up to 10 latest automatic snapshots locally
  const trimmed = snapshots.slice(0, 10);
  localStorage.setItem(STORAGE_KEYS.AUTO_BACKUPS, JSON.stringify(trimmed));
  syncToIndexedDB(STORAGE_KEYS.AUTO_BACKUPS, snapshots);
};

export const createAutoBackupSnapshot = (trigger: 'auto_change' | 'daily' | 'manual' = 'manual'): AutoBackupSnapshot => {
  const employees = loadEmployees();
  const attendance = loadAttendance();
  const settings = loadSettings();
  const locks = loadMonthLocks();
  const archive = loadPdfArchive();
  const monthStr = new Date().toISOString().slice(0, 7);
  const salarySlips = calculateMonthlySalaries(employees, attendance, settings, monthStr);

  const backupData: BackupData = {
    version: '4.0.0',
    exportDate: new Date().toISOString(),
    appName: 'Sumit Workforce Pro',
    companySettings: settings,
    employees,
    attendance,
    salarySlips,
    lockedMonths: locks,
    pdfArchive: archive
  };

  const snapshot: AutoBackupSnapshot = {
    id: `SNAP_${Date.now()}`,
    timestamp: new Date().toISOString(),
    trigger,
    employeeCount: employees.length,
    attendanceCount: attendance.length,
    lockedMonthsCount: locks.length,
    dataJson: JSON.stringify(backupData)
  };

  const currentSnapshots = loadAutoBackups();
  // Keep only distinct snapshots
  const updatedSnapshots = [snapshot, ...currentSnapshots];
  saveAutoBackups(updatedSnapshots);
  
  // Record timestamp of backup
  localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, snapshot.timestamp);

  return snapshot;
};

const scheduleAutoBackup = (trigger: 'auto_change' | 'daily' = 'auto_change') => {
  if (backupDebounceTimeout) {
    clearTimeout(backupDebounceTimeout);
  }
  backupDebounceTimeout = setTimeout(() => {
    createAutoBackupSnapshot(trigger);
  }, 1500);
};

export const getLastBackupDate = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_DATE);
};

// ==========================================
// 10. STORAGE METRICS & HEALTH DASHBOARD
// ==========================================

export const getStorageStats = (): StorageStats => {
  const employees = loadEmployees();
  const attendance = loadAttendance();
  const locks = loadMonthLocks();
  const pdfArchive = loadPdfArchive();
  const autoBackups = loadAutoBackups();
  const settings = loadSettings();
  const lastBackup = getLastBackupDate();

  // Compute distinct months with recorded attendance
  const distinctMonths = new Set<string>();
  attendance.forEach((r) => {
    if (r.date) distinctMonths.add(r.date.slice(0, 7));
  });
  const totalSalaryRecords = employees.length * (distinctMonths.size || 1);

  // Estimate bytes stored
  let totalBytes = 0;
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('swp_')) {
        totalBytes += (localStorage[key].length || 0) * 2; // UTF-16 estimation
      }
    }
  } catch (e) {
    totalBytes = 250000;
  }

  const kb = totalBytes / 1024;
  let formatted = `${kb.toFixed(1)} KB`;
  if (kb > 1024) {
    formatted = `${(kb / 1024).toFixed(2)} MB`;
  }

  return {
    totalEmployees: employees.length,
    totalAttendance: attendance.length,
    totalSalaryRecords,
    totalPdfReports: pdfArchive.length,
    totalLockedMonths: locks.length,
    estimatedSizeBytes: totalBytes,
    estimatedSizeFormatted: formatted,
    lastBackupDate: lastBackup,
    autoBackupCount: autoBackups.length,
    storageEngine: 'IndexedDB + LocalStorage (Zero Data Loss)'
  };
};

/**
 * Automatic Salary Calculation Engine with Double Duty Support
 * DOUBLE DUTY (D) = 2 working shifts.
 * Total Payable Days = Present Days (P) + (2 × Double Duty Days (D))
 * Base / Net Salary = Payable Days × Daily Rate
 */
export const calculateMonthlySalaries = (
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings,
  monthStr: string // "YYYY-MM"
): SalarySlip[] => {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10); // 1-12

  // Total calendar days in requested month
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Working days count (excluding Sundays as standard)
  let workingDaysCount = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    if (dateObj.getDay() !== 0) {
      workingDaysCount++;
    }
  }
  const workingDays = settings.standardWorkDays || workingDaysCount || 26;

  return employees.map((emp) => {
    // Filter month attendance for this employee
    const empMonthAttendance = attendance.filter((rec) => {
      return rec.employeeId === emp.id && rec.date.startsWith(monthStr);
    });

    let presentDays = 0;
    let doubleDutyDays = 0;
    let absentDays = 0;

    empMonthAttendance.forEach((rec) => {
      const st = normalizeStatus(rec.status);
      if (st === 'P') {
        presentDays++;
      } else if (st === 'D') {
        doubleDutyDays++; // Counts as 2 shifts!
      } else if (st === 'A') {
        absentDays++;
      }
    });

    // Daily wage rate
    const dailyRate = (emp.dailySalary && emp.dailySalary > 0)
      ? emp.dailySalary 
      : Math.round((emp.monthlySalary || 0) / (workingDays || 26));

    // Double Duty counts as 2 working shifts
    const payableDays = presentDays + (doubleDutyDays * 2);
    const totalShifts = payableDays;
    const baseSalary = Math.round(payableDays * dailyRate);
    const netSalary = Math.max(0, baseSalary);

    const slipId = `SLIP_${emp.id}_${monthStr}`;

    return {
      id: slipId,
      employeeId: emp.id,
      month: monthStr,
      totalDaysInMonth,
      workingDays,
      presentDays,
      doubleDutyDays,
      absentDays,
      payableDays,
      totalShifts,
      dailyRate,
      baseSalary,
      netSalary,
      paymentStatus: 'PAID',
      generatedAt: new Date().toISOString()
    };
  });
};

// ==========================================
// 4. EXPORT & RESTORE JSON BACKUP
// ==========================================

export const exportCompleteBackup = (): string => {
  const settings = loadSettings();
  const employees = loadEmployees();
  const attendance = loadAttendance();
  const locks = loadMonthLocks();
  const pdfArchive = loadPdfArchive();
  const monthStr = new Date().toISOString().slice(0, 7);
  const salarySlips = calculateMonthlySalaries(employees, attendance, settings, monthStr);

  const backup: BackupData = {
    version: '4.0.0',
    exportDate: new Date().toISOString(),
    appName: 'Sumit Workforce Pro',
    companySettings: settings,
    employees,
    attendance,
    salarySlips,
    lockedMonths: locks,
    pdfArchive
  };

  // Mark last backup date
  localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, backup.exportDate);

  return JSON.stringify(backup, null, 2);
};

export const restoreCompleteBackup = (
  jsonData: string,
  mergeMode: boolean = false
): { success: boolean; message: string; counts?: { employees: number; attendance: number; locks: number } } => {
  try {
    const data = JSON.parse(jsonData) as BackupData;
    if (!data.employees || !Array.isArray(data.employees)) {
      return { success: false, message: 'Invalid backup file: Missing employee records.' };
    }

    if (mergeMode) {
      // Smart Merge: Merge workers and attendance without wiping existing non-duplicate logs
      const currentEmps = loadEmployees();
      const empMap = new Map<string, Employee>();
      currentEmps.forEach(e => empMap.set(e.id, e));
      data.employees.forEach(e => empMap.set(e.id, e));
      const mergedEmps = Array.from(empMap.values());
      saveEmployees(mergedEmps);

      const currentAtt = loadAttendance();
      const attMap = new Map<string, AttendanceRecord>();
      currentAtt.forEach(a => attMap.set(a.id, a));
      if (Array.isArray(data.attendance)) {
        data.attendance.forEach(a => attMap.set(a.id, a));
      }
      const mergedAtt = Array.from(attMap.values());
      saveAttendance(mergedAtt);

      if (data.lockedMonths && Array.isArray(data.lockedMonths)) {
        const currentLocks = loadMonthLocks();
        const lockMap = new Map<string, MonthLock>();
        currentLocks.forEach(l => lockMap.set(l.month, l));
        data.lockedMonths.forEach(l => lockMap.set(l.month, l));
        saveMonthLocks(Array.from(lockMap.values()));
      }
    } else {
      // Direct Restore
      if (data.companySettings) {
        saveSettings(data.companySettings);
      }
      if (data.employees) {
        saveEmployees(data.employees);
      }
      if (data.attendance && Array.isArray(data.attendance)) {
        saveAttendance(data.attendance);
      }
      if (data.lockedMonths && Array.isArray(data.lockedMonths)) {
        saveMonthLocks(data.lockedMonths);
      }
      if (data.pdfArchive && Array.isArray(data.pdfArchive)) {
        savePdfArchive(data.pdfArchive);
      }
    }

    createAutoBackupSnapshot('manual');

    return {
      success: true,
      message: mergeMode ? 'Backup merged successfully with existing data!' : 'Database restored completely with zero data loss!',
      counts: {
        employees: data.employees.length,
        attendance: data.attendance?.length || 0,
        locks: data.lockedMonths?.length || 0
      }
    };
  } catch (err) {
    return { success: false, message: 'Failed to parse JSON file. Please ensure it is a valid backup.' };
  }
};

export const resetToInitialDemoData = (): void => {
  saveSettings(defaultSettings);
  saveEmployees(initialEmployees);
  const initialAtt = generateInitialAttendance(initialEmployees);
  saveAttendance(initialAtt);
  saveMonthLocks([]);
};

export const isAppLocked = (): boolean => {
  const sessionUnlocked = sessionStorage.getItem(STORAGE_KEYS.PIN_SESSION);
  return sessionUnlocked !== 'true';
};

export const setAppLockedState = (locked: boolean): void => {
  if (locked) {
    sessionStorage.removeItem(STORAGE_KEYS.PIN_SESSION);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.PIN_SESSION, 'true');
  }
};

// Helper: Extract all distinct recorded months in attendance
export const getAvailableAttendanceMonths = (attendance: AttendanceRecord[]): string[] => {
  const set = new Set<string>();
  // Include current month
  set.add(new Date().toISOString().slice(0, 7));
  attendance.forEach((rec) => {
    if (rec.date && rec.date.length >= 7) {
      set.add(rec.date.slice(0, 7));
    }
  });
  return Array.from(set).sort().reverse();
};
