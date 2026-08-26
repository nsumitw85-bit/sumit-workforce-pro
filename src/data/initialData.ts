import { Employee, AttendanceRecord, CompanySettings } from '../types';

export const defaultSettings: CompanySettings = {
  companyName: "Sumit Enterprises & Tech Solutions",
  companyAddress: "Plot 42, Sector 18, Electronic City Phase 1, Bangalore, Karnataka - 560100",
  companyPhone: "+91 98765 43210",
  companyEmail: "admin@sumitworkforce.pro",
  currencySymbol: "₹",
  standardWorkDays: 26,
  language: "en",
  theme: "dark",
  customAccent: "emerald",
  darkMode: true,
  authorizedSignatoryName: "Sumit Sharma (Director)"
};

export const initialEmployees: Employee[] = [
  {
    id: "EMP-101",
    workerId: "WRK-101",
    name: "Rajesh Kumar Verma",
    mobile: "+91 98231 44556",
    workType: "Driver",
    department: "Driver",
    designation: "Driver",
    dailySalary: 700,
    monthlySalary: 18200,
    status: "ACTIVE",
    createdAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "EMP-102",
    workerId: "WRK-102",
    name: "Pooja Sundaram",
    mobile: "+91 97123 88990",
    workType: "Helper",
    department: "Helper",
    designation: "Helper",
    dailySalary: 500,
    monthlySalary: 13000,
    status: "ACTIVE",
    createdAt: "2024-02-01T09:00:00Z"
  },
  {
    id: "EMP-103",
    workerId: "WRK-103",
    name: "Amitabh Sen",
    mobile: "+91 98450 12345",
    workType: "Nali Worker",
    department: "Nali Worker",
    designation: "Nali Worker",
    dailySalary: 550,
    monthlySalary: 14300,
    status: "ACTIVE",
    createdAt: "2024-02-10T09:00:00Z"
  },
  {
    id: "EMP-104",
    workerId: "WRK-104",
    name: "Neha Preethi Reddy",
    mobile: "+91 99001 77665",
    workType: "Jhadu Worker",
    department: "Jhadu Worker",
    designation: "Jhadu Worker",
    dailySalary: 500,
    monthlySalary: 13000,
    status: "ACTIVE",
    createdAt: "2024-03-05T09:00:00Z"
  },
  {
    id: "EMP-105",
    workerId: "WRK-105",
    name: "Vikramaditya Chauhan",
    mobile: "+91 98711 22334",
    workType: "Driver",
    department: "Driver",
    designation: "Driver",
    dailySalary: 700,
    monthlySalary: 18200,
    status: "ACTIVE",
    createdAt: "2024-03-20T09:00:00Z"
  },
  {
    id: "EMP-106",
    workerId: "WRK-106",
    name: "Ananya Deshmukh",
    mobile: "+91 96543 21098",
    workType: "Helper",
    department: "Helper",
    designation: "Helper",
    dailySalary: 500,
    monthlySalary: 13000,
    status: "ACTIVE",
    createdAt: "2024-04-12T09:00:00Z"
  },
  {
    id: "EMP-107",
    workerId: "WRK-107",
    name: "Suresh Babu Nair",
    mobile: "+91 98860 34567",
    workType: "Nali Worker",
    department: "Nali Worker",
    designation: "Nali Worker",
    dailySalary: 550,
    monthlySalary: 14300,
    status: "ACTIVE",
    createdAt: "2024-05-01T09:00:00Z"
  },
  {
    id: "EMP-108",
    workerId: "WRK-108",
    name: "Kavita Ramesh Joshi",
    mobile: "+91 97400 65432",
    workType: "Jhadu Worker",
    department: "Jhadu Worker",
    designation: "Jhadu Worker",
    dailySalary: 500,
    monthlySalary: 13000,
    status: "ACTIVE",
    createdAt: "2024-05-15T09:00:00Z"
  }
];

export const generateInitialAttendance = (employees: Employee[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Generate attendance for the last 28 days up to today
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 is Sunday

    if (dayOfWeek === 0) {
      // Sunday off
      continue;
    }

    employees.forEach((emp, index) => {
      // Create realistic attendance pattern using only P, A, D
      let status: 'P' | 'A' | 'D' = 'P';
      let inTime = '09:00';
      let outTime = '18:00';
      let notes = '';

      const hash = (index * 7 + i * 11) % 15;

      if (i === 0) {
        // Today
        if (index === 0) {
          status = 'D'; // Double Duty
          inTime = '08:00';
          outTime = '22:00';
          notes = 'Night shift extension (Double Duty)';
        } else if (index === 1) {
          status = 'P';
        } else if (index === 2) {
          status = 'P';
        } else if (index === 3) {
          status = 'D'; // Double Duty
          notes = 'Emergency project sprint';
        } else if (index === 4) {
          status = 'A'; // Absent
          inTime = '';
          outTime = '';
        } else if (index === 5) {
          status = 'P';
        } else if (index === 6) {
          status = 'P';
        } else {
          status = 'P';
        }
      } else {
        if (hash === 2) {
          status = 'A'; // Absent
          inTime = '';
          outTime = '';
          notes = 'Personal absence';
        } else if (hash === 5 || hash === 9) {
          status = 'D'; // Double duty
          inTime = '08:30';
          outTime = '21:30';
          notes = 'Double Duty (2 shifts)';
        } else {
          status = 'P'; // Present
        }
      }

      records.push({
        id: `${emp.id}_${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        status,
        inTime,
        outTime,
        notes,
        markedAt: new Date(d.setHours(9, 30, 0, 0)).toISOString()
      });
    });
  }

  return records;
};
