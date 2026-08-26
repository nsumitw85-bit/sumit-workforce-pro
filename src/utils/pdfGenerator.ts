import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, AttendanceRecord, SalarySlip, CompanySettings } from '../types';
import { calculateMonthlySalaries, normalizeStatus } from './storage';

interface PDFHeaderOptions {
  title: string;
  subtitle?: string;
  doc: jsPDF;
  settings: CompanySettings;
}

const DEFAULT_COMPANY_NAME = 'Sumit Enterprises & Tech Solutions';

/**
 * Adds a standardized, professional A4 Portrait header with company branding
 */
const addA4Header = ({ title, subtitle, doc, settings }: PDFHeaderOptions) => {
  const companyName = settings.companyName || DEFAULT_COMPANY_NAME;

  // Header background bar (A4 portrait width: 210mm)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 26, 'F');

  // Emerald accent divider
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 26, 210, 2, 'F');

  // Brand Logo Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(14, 4, 18, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('STE', 23, 15, { align: 'center' });

  // Company Name
  doc.setFontSize(12.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(companyName, 36, 12);

  // Company Phone / Address
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const phone = settings.companyPhone || '+91 98765 43210';
  const addr = (settings.companyAddress || 'Bangalore, Karnataka').slice(0, 75);
  doc.text(`Phone: ${phone}  |  ${addr}`, 36, 19);

  // Report Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 37);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 43);
  }

  // Generation timestamp
  const dateStr = new Date().toLocaleString();
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr}`, 196, 43, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 46, 196, 46);
};

/**
 * Standard A4 footer with signature lines and pagination
 */
const addA4Footer = (doc: jsPDF, settings: CompanySettings) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const rightMargin = 196;
  const companyName = settings.companyName || DEFAULT_COMPANY_NAME;
  const signatory = settings.authorizedSignatoryName || 'Authorized Signatory';

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = 297; // A4 portrait height

    // Signatures on Last Page
    if (i === pageCount) {
      const sigY = pageHeight - 30;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);

      // Prepared By Signature Box
      doc.line(14, sigY, 70, sigY);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Prepared By (Supervisor / HR)', 14, sigY + 4);

      // Authorized Signatory Signature Box
      doc.line(rightMargin - 65, sigY, rightMargin, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(signatory, rightMargin - 65, sigY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Authorized Seal - ${companyName}`, rightMargin - 65, sigY + 8);
    }

    // Bottom Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 11, rightMargin, pageHeight - 11);

    // Footer Text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${companyName} | Official Record | P = Present (1 shift) | D = Double Duty (2 shifts) | A = Absent`,
      14,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${pageCount}`, rightMargin, pageHeight - 6, { align: 'right' });
  }
};

/**
 * Renders the standardized 6-block KPI Summary Section on A4
 */
const renderSummaryKpiSection = (
  doc: jsPDF,
  startY: number,
  kpis: {
    totalStaff: number;
    presentCount: number;
    absentCount: number;
    doubleDutyCount: number;
    totalShifts: number;
    totalSalary: number;
    currencySymbol: string;
  }
) => {
  const cardW = 28.5;
  const cardH = 15;
  const gap = 2.2;
  const left = 14;

  const cards = [
    { label: 'TOTAL STAFF', value: `${kpis.totalStaff}`, color: [15, 23, 42], bg: [241, 245, 249] },
    { label: 'PRESENT (P)', value: `${kpis.presentCount}`, color: [4, 120, 87], bg: [236, 253, 245] },
    { label: 'ABSENT (A)', value: `${kpis.absentCount}`, color: [185, 28, 28], bg: [254, 242, 242] },
    { label: 'DOUBLE (D - 2x)', value: `${kpis.doubleDutyCount}`, color: [67, 56, 202], bg: [238, 242, 255] },
    { label: 'TOTAL SHIFTS', value: `${kpis.totalShifts}`, color: [14, 116, 144], bg: [236, 254, 255] },
    { label: 'TOTAL SALARY', value: `${kpis.currencySymbol}${kpis.totalSalary.toLocaleString('en-IN')}`, color: [5, 150, 105], bg: [240, 253, 244] }
  ];

  cards.forEach((c, idx) => {
    const x = left + idx * (cardW + gap);
    doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
    doc.roundedRect(x, startY, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, cardW, cardH, 2, 2, 'D');

    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.label, x + 2.5, startY + 4.5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.value, x + 2.5, startY + 11.5);
  });
};

// =========================================================================
// 1. Daily Attendance Report (A4 Portrait)
// =========================================================================
export const generateDailyAttendancePDF = (
  date: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const dailyRecords = attendance.filter((r) => r.date === date);
  const recordMap = new Map<string, AttendanceRecord>();
  dailyRecords.forEach((r) => recordMap.set(r.employeeId, r));

  let pCount = 0;
  let aCount = 0;
  let dCount = 0;
  let totalDailySalary = 0;

  employees.forEach((emp) => {
    const rec = recordMap.get(emp.id);
    const st = normalizeStatus(rec?.status);
    const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round(emp.monthlySalary / 26);

    if (st === 'P') {
      pCount++;
      totalDailySalary += dailyRate * 1;
    } else if (st === 'D') {
      dCount++;
      totalDailySalary += dailyRate * 2;
    } else {
      aCount++;
    }
  });

  const totalShifts = pCount + (dCount * 2);

  addA4Header({
    title: 'Daily Attendance Report',
    subtitle: `Date: ${date} | Total Workforce: ${employees.length} Staff`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: pCount,
    absentCount: aCount,
    doubleDutyCount: dCount,
    totalShifts,
    totalSalary: totalDailySalary,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = employees.map((emp, idx) => {
    const rec = recordMap.get(emp.id);
    const st = normalizeStatus(rec?.status);
    const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round(emp.monthlySalary / 26);
    const shiftMultiplier = st === 'P' ? 1 : (st === 'D' ? 2 : 0);
    const earnedSalary = dailyRate * shiftMultiplier;

    const statusLabel = st === 'P' ? 'P (Present - 1x)' : (st === 'D' ? 'D (Double - 2x)' : 'A (Absent)');

    return [
      (idx + 1).toString(),
      emp.name,
      emp.mobile || '-',
      statusLabel,
      `${shiftMultiplier} Shift(s)`,
      `${settings.currencySymbol} ${earnedSalary.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (P/A/D)', 'Shifts', 'Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, fontStyle: 'bold' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = String(data.cell.raw);
        if (val.startsWith('P')) data.cell.styles.textColor = [4, 120, 87];
        else if (val.startsWith('D')) data.cell.styles.textColor = [67, 56, 202];
        else if (val.startsWith('A')) data.cell.styles.textColor = [185, 28, 28];
      }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 2. Weekly Attendance Report (A4 Portrait)
// =========================================================================
export const generateWeeklyAttendancePDF = (
  startDateStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const start = new Date(startDateStr);
  const dateList: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dateList.push(d.toISOString().split('T')[0]);
  }
  const endDateStr = dateList[6];

  let totalWeeklyPresent = 0;
  let totalWeeklyAbsent = 0;
  let totalWeeklyDouble = 0;
  let totalWeeklyShifts = 0;
  let totalWeeklySalary = 0;

  const tableRows = employees.map((emp, idx) => {
    let p = 0;
    let d = 0;
    let a = 0;

    dateList.forEach((dStr) => {
      const rec = attendance.find((r) => r.employeeId === emp.id && r.date === dStr);
      const st = normalizeStatus(rec?.status);
      if (st === 'P') p++;
      else if (st === 'D') d++;
      else if (st === 'A') a++;
    });

    const shifts = p + (d * 2);
    const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round(emp.monthlySalary / 26);
    const wage = shifts * dailyRate;

    totalWeeklyPresent += p;
    totalWeeklyAbsent += a;
    totalWeeklyDouble += d;
    totalWeeklyShifts += shifts;
    totalWeeklySalary += wage;

    return [
      (idx + 1).toString(),
      emp.name,
      emp.mobile || '-',
      `${p}P / ${d}D / ${a}A`,
      `${shifts} Shifts`,
      `${settings.currencySymbol} ${wage.toLocaleString('en-IN')}`
    ];
  });

  addA4Header({
    title: 'Weekly Attendance Report',
    subtitle: `7-Day Period: ${startDateStr} to ${endDateStr} | Total Staff: ${employees.length}`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalWeeklyPresent,
    absentCount: totalWeeklyAbsent,
    doubleDutyCount: totalWeeklyDouble,
    totalShifts: totalWeeklyShifts,
    totalSalary: totalWeeklySalary,
    currencySymbol: settings.currencySymbol || '₹'
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (P / D / A)', 'Total Shifts', 'Weekly Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 3. Monthly Attendance Report (A4 Portrait)
// =========================================================================
export const generateMonthlyAttendancePDF = (
  monthStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const slips = calculateMonthlySalaries(employees, attendance, settings, monthStr);

  const totalPresent = slips.reduce((sum, s) => sum + s.presentDays, 0);
  const totalAbsent = slips.reduce((sum, s) => sum + s.absentDays, 0);
  const totalDouble = slips.reduce((sum, s) => sum + s.doubleDutyDays, 0);
  const totalShifts = slips.reduce((sum, s) => sum + s.payableDays, 0);
  const totalSalary = slips.reduce((sum, s) => sum + s.netSalary, 0);

  addA4Header({
    title: 'Monthly Attendance Report',
    subtitle: `Month: ${monthStr} | Standard Days: ${settings.standardWorkDays} | D = 2x Shifts`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalPresent,
    absentCount: totalAbsent,
    doubleDutyCount: totalDouble,
    totalShifts,
    totalSalary,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = slips.map((slip, idx) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    return [
      (idx + 1).toString(),
      emp?.name || slip.employeeId,
      emp?.mobile || '-',
      `${slip.presentDays}P / ${slip.doubleDutyDays}D / ${slip.absentDays}A`,
      `${slip.payableDays} Shifts`,
      `${settings.currencySymbol} ${slip.netSalary.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status Breakdown (P/D/A)', 'Payable Shifts', 'Month Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 4. Daily Salary Report (A4 Portrait)
// =========================================================================
export const generateDailySalaryPDF = (
  date: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const dailyRecords = attendance.filter((r) => r.date === date);
  const recordMap = new Map<string, AttendanceRecord>();
  dailyRecords.forEach((r) => recordMap.set(r.employeeId, r));

  let pCount = 0;
  let aCount = 0;
  let dCount = 0;
  let totalDailyWagePayout = 0;

  const tableRows = employees.map((emp, idx) => {
    const rec = recordMap.get(emp.id);
    const st = normalizeStatus(rec?.status);
    const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round(emp.monthlySalary / 26);
    const shiftMultiplier = st === 'P' ? 1 : (st === 'D' ? 2 : 0);
    const earnedWage = dailyRate * shiftMultiplier;
    
    if (st === 'P') pCount++;
    else if (st === 'D') dCount++;
    else aCount++;

    totalDailyWagePayout += earnedWage;

    return [
      (idx + 1).toString(),
      emp.name,
      emp.mobile || '-',
      st === 'P' ? 'Present (P)' : (st === 'D' ? 'Double (D)' : 'Absent (A)'),
      `${settings.currencySymbol}${dailyRate} (${shiftMultiplier}x)`,
      `${settings.currencySymbol} ${earnedWage.toLocaleString('en-IN')}`
    ];
  });

  const totalShifts = pCount + (dCount * 2);

  addA4Header({
    title: 'Daily Salary Report',
    subtitle: `Date: ${date} | Total Daily Payout: ${settings.currencySymbol} ${totalDailyWagePayout.toLocaleString('en-IN')}`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: pCount,
    absentCount: aCount,
    doubleDutyCount: dCount,
    totalShifts,
    totalSalary: totalDailyWagePayout,
    currencySymbol: settings.currencySymbol || '₹'
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (P/A/D)', 'Daily Rate (Shifts)', 'Earned Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, fontStyle: 'bold' },
      4: { cellWidth: 27, halign: 'center' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 5. Weekly Salary Report (A4 Portrait)
// =========================================================================
export const generateWeeklySalaryPDF = (
  startDateStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const start = new Date(startDateStr);
  const dateList: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dateList.push(d.toISOString().split('T')[0]);
  }
  const endDateStr = dateList[6];

  let totalWeeklyPayout = 0;
  let totalP = 0;
  let totalD = 0;
  let totalA = 0;
  let totalShifts = 0;

  const tableRows = employees.map((emp, idx) => {
    let pCount = 0;
    let dCount = 0;
    let aCount = 0;

    dateList.forEach((dStr) => {
      const rec = attendance.find((r) => r.employeeId === emp.id && r.date === dStr);
      const st = normalizeStatus(rec?.status);
      if (st === 'P') pCount++;
      else if (st === 'D') dCount++;
      else if (st === 'A') aCount++;
    });

    const payableDays = pCount + (dCount * 2);
    const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round(emp.monthlySalary / 26);
    const weeklySalary = payableDays * dailyRate;

    totalWeeklyPayout += weeklySalary;
    totalP += pCount;
    totalD += dCount;
    totalA += aCount;
    totalShifts += payableDays;

    return [
      (idx + 1).toString(),
      emp.name,
      emp.mobile || '-',
      `${pCount}P / ${dCount}D / ${aCount}A`,
      `${payableDays} Shifts`,
      `${settings.currencySymbol} ${weeklySalary.toLocaleString('en-IN')}`
    ];
  });

  addA4Header({
    title: 'Weekly Salary Report',
    subtitle: `7-Day Period: ${startDateStr} to ${endDateStr} | Total Payout: ${settings.currencySymbol} ${totalWeeklyPayout.toLocaleString('en-IN')}`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalP,
    absentCount: totalA,
    doubleDutyCount: totalD,
    totalShifts,
    totalSalary: totalWeeklyPayout,
    currencySymbol: settings.currencySymbol || '₹'
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (P/D/A)', 'Payable Shifts', '7-Day Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 6. Monthly Salary Report (A4 Portrait)
// =========================================================================
export const generateMonthlySalaryPDF = (
  monthStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const slips = calculateMonthlySalaries(employees, attendance, settings, monthStr);
  const totalPayroll = slips.reduce((acc, s) => acc + s.netSalary, 0);

  const totalP = slips.reduce((acc, s) => acc + s.presentDays, 0);
  const totalD = slips.reduce((acc, s) => acc + s.doubleDutyDays, 0);
  const totalA = slips.reduce((acc, s) => acc + s.absentDays, 0);
  const totalShifts = slips.reduce((acc, s) => acc + s.payableDays, 0);

  addA4Header({
    title: 'Monthly Salary Report',
    subtitle: `Month: ${monthStr} | Total Payroll: ${settings.currencySymbol} ${totalPayroll.toLocaleString('en-IN')}`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalP,
    absentCount: totalA,
    doubleDutyCount: totalD,
    totalShifts,
    totalSalary: totalPayroll,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = slips.map((slip, idx) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    return [
      (idx + 1).toString(),
      emp?.name || slip.employeeId,
      emp?.mobile || '-',
      `${slip.presentDays}P / ${slip.doubleDutyDays}D / ${slip.absentDays}A`,
      `${slip.payableDays} Shifts`,
      `${settings.currencySymbol} ${slip.netSalary.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (P/D/A)', 'Payable Shifts', 'Net Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 7. Present Staff Report (A4 Portrait)
// =========================================================================
export const generatePresentSummaryPDF = (
  monthStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const slips = calculateMonthlySalaries(employees, attendance, settings, monthStr);
  const totalPresent = slips.reduce((sum, s) => sum + s.presentDays, 0);
  const totalAbsent = slips.reduce((sum, s) => sum + s.absentDays, 0);
  const totalDouble = slips.reduce((sum, s) => sum + s.doubleDutyDays, 0);
  const totalShifts = slips.reduce((sum, s) => sum + s.payableDays, 0);
  const totalSalary = slips.reduce((sum, s) => sum + (s.presentDays * s.dailyRate), 0);

  addA4Header({
    title: 'Present Staff Report',
    subtitle: `Month: ${monthStr} | Total Regular Present Days: ${totalPresent} days`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalPresent,
    absentCount: totalAbsent,
    doubleDutyCount: totalDouble,
    totalShifts,
    totalSalary,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = slips.map((slip, idx) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    const presentPay = slip.presentDays * slip.dailyRate;
    const presentPct = Math.min(100, Math.round((slip.presentDays / (slip.workingDays || 26)) * 100));

    return [
      (idx + 1).toString(),
      emp?.name || slip.employeeId,
      emp?.mobile || '-',
      `P - ${slip.presentDays} Days (${presentPct}%)`,
      `${slip.presentDays} Shifts`,
      `${settings.currencySymbol} ${presentPay.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (Present Days)', 'Present Shifts', 'Present Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center', fontStyle: 'bold', textColor: [4, 120, 87] },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 8. Absent Staff Report (A4 Portrait)
// =========================================================================
export const generateAbsentSummaryPDF = (
  monthStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const slips = calculateMonthlySalaries(employees, attendance, settings, monthStr);
  const totalAbsent = slips.reduce((sum, s) => sum + s.absentDays, 0);
  const totalPresent = slips.reduce((sum, s) => sum + s.presentDays, 0);
  const totalDouble = slips.reduce((sum, s) => sum + s.doubleDutyDays, 0);
  const totalShifts = slips.reduce((sum, s) => sum + s.payableDays, 0);
  const totalDeductions = slips.reduce((sum, s) => sum + (s.absentDays * s.dailyRate), 0);

  addA4Header({
    title: 'Absent Staff Report',
    subtitle: `Month: ${monthStr} | Total Absences Recorded: ${totalAbsent} days`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalPresent,
    absentCount: totalAbsent,
    doubleDutyCount: totalDouble,
    totalShifts,
    totalSalary: totalDeductions,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = slips.map((slip, idx) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    const absentCost = slip.absentDays * slip.dailyRate;
    const absentRate = Math.min(100, Math.round((slip.absentDays / (slip.workingDays || 26)) * 100));

    return [
      (idx + 1).toString(),
      emp?.name || slip.employeeId,
      emp?.mobile || '-',
      `A - ${slip.absentDays} Days (${absentRate}%)`,
      `0 Shifts`,
      `-${settings.currencySymbol} ${absentCost.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (Absent Days)', 'Earned Shifts', 'Absent Deduction']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center', fontStyle: 'bold', textColor: [185, 28, 28] },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 9. Double Duty Report (A4 Portrait)
// =========================================================================
export const generateDoubleDutySummaryPDF = (
  monthStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const slips = calculateMonthlySalaries(employees, attendance, settings, monthStr);
  const totalDoubleDuties = slips.reduce((sum, s) => sum + s.doubleDutyDays, 0);
  const totalDoubleShifts = totalDoubleDuties * 2;
  const totalDoubleDutyPayout = slips.reduce((sum, s) => sum + (s.doubleDutyDays * 2 * s.dailyRate), 0);

  const totalPresent = slips.reduce((sum, s) => sum + s.presentDays, 0);
  const totalAbsent = slips.reduce((sum, s) => sum + s.absentDays, 0);
  const totalShifts = slips.reduce((sum, s) => sum + s.payableDays, 0);

  addA4Header({
    title: 'Double Duty Report',
    subtitle: `Month: ${monthStr} | Total Double Duty: ${totalDoubleDuties} Days (${totalDoubleShifts} Paid Shifts)`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalPresent,
    absentCount: totalAbsent,
    doubleDutyCount: totalDoubleDuties,
    totalShifts,
    totalSalary: totalDoubleDutyPayout,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = slips.map((slip, idx) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    const doubleShifts = slip.doubleDutyDays * 2;
    const doubleDutyPay = doubleShifts * slip.dailyRate;

    return [
      (idx + 1).toString(),
      emp?.name || slip.employeeId,
      emp?.mobile || '-',
      `D - ${slip.doubleDutyDays} Days (2x)`,
      `${doubleShifts} Shifts`,
      `${settings.currencySymbol} ${doubleDutyPay.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (Double Duty)', 'Extra Shifts (2x)', 'Double Duty Pay']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center', fontStyle: 'bold', textColor: [67, 56, 202] },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: [67, 56, 202] },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 10. Employee Master List (A4 Portrait)
// =========================================================================
export const generateEmployeeListPDF = (
  employees: Employee[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  addA4Header({
    title: 'Employee Master List',
    subtitle: `Total Registered Workforce: ${employees.length} Staff Members`,
    doc,
    settings
  });

  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const totalBaseSalary = employees.reduce((sum, e) => sum + (e.dailySalary || Math.round(e.monthlySalary / 26)), 0);

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: activeCount,
    absentCount: employees.length - activeCount,
    doubleDutyCount: 0,
    totalShifts: activeCount,
    totalSalary: totalBaseSalary,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = employees.map((emp, index) => {
    const dailyRate = emp.dailySalary > 0 ? emp.dailySalary : Math.round((emp.monthlySalary || 13000) / 26);
    const workerIdStr = emp.workerId ? ` (${emp.workerId})` : '';
    return [
      (index + 1).toString(),
      `${emp.name}\n[${emp.id}${workerIdStr}]`,
      emp.mobile || '-',
      emp.status,
      emp.workType || emp.department || emp.designation || 'Worker',
      `${settings.currencySymbol} ${dailyRate}/day`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Worker Name & IDs', 'Mobile No', 'Status', 'Work Type', 'Daily Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
      4: { cellWidth: 33, fontStyle: 'bold', textColor: [67, 56, 202] },
      5: { halign: 'right', cellWidth: 27, fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// 11. Complete Summary Report (A4 Portrait)
// =========================================================================
export const generateCompleteSummaryPDF = (
  monthStr: string,
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const slips = calculateMonthlySalaries(employees, attendance, settings, monthStr);

  const totalPresent = slips.reduce((sum, s) => sum + s.presentDays, 0);
  const totalAbsent = slips.reduce((sum, s) => sum + s.absentDays, 0);
  const totalDouble = slips.reduce((sum, s) => sum + s.doubleDutyDays, 0);
  const totalShifts = slips.reduce((sum, s) => sum + s.payableDays, 0);
  const totalSalary = slips.reduce((sum, s) => sum + s.netSalary, 0);

  addA4Header({
    title: 'Complete Summary Report',
    subtitle: `Period: ${monthStr} | Executive Workforce & Financial Summary`,
    doc,
    settings
  });

  renderSummaryKpiSection(doc, 50, {
    totalStaff: employees.length,
    presentCount: totalPresent,
    absentCount: totalAbsent,
    doubleDutyCount: totalDouble,
    totalShifts,
    totalSalary,
    currencySymbol: settings.currencySymbol || '₹'
  });

  const tableRows = slips.map((slip, idx) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    return [
      (idx + 1).toString(),
      emp?.name || slip.employeeId,
      emp?.mobile || '-',
      `${slip.presentDays}P / ${slip.doubleDutyDays}D / ${slip.absentDays}A`,
      `${slip.payableDays} Shifts`,
      `${settings.currencySymbol} ${slip.netSalary.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Employee Name', 'Mobile No', 'Status (P/A/D)', 'Total Shifts', 'Total Salary']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [4, 120, 87] }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });

  addA4Footer(doc, settings);
  return doc;
};

// =========================================================================
// Individual Pay Slip PDF (A4 Portrait)
// =========================================================================
export const generateIndividualPaySlipPDF = (
  slip: SalarySlip,
  employee: Employee,
  settings: CompanySettings
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const [year, month] = slip.month.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  addA4Header({
    title: 'Employee Salary Pay Slip',
    subtitle: `Month: ${monthName} | Ref ID: ${slip.id}`,
    doc,
    settings
  });

  let curY = 52;

  // Profile box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, 182, 30, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, curY, 182, 30, 2, 2, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Employee Name: ${employee.name}`, 18, curY + 7);
  doc.text(`Employee ID: ${employee.id}`, 110, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Department: ${employee.department} | Designation: ${employee.designation}`, 18, curY + 15);
  doc.text(`Mobile: ${employee.mobile} | Joining Date: ${employee.joiningDate}`, 18, curY + 23);

  curY += 36;

  // Breakdown Table
  autoTable(doc, {
    startY: curY,
    head: [['Working Days', 'Present (P) [1x]', 'Double Duty (D) [2x]', 'Absent (A)', 'Total Payable Shifts', 'Daily Rate']],
    body: [[
      slip.workingDays.toString(),
      `${slip.presentDays} days`,
      `${slip.doubleDutyDays} days (${slip.doubleDutyDays * 2} shifts)`,
      `${slip.absentDays} days`,
      `${slip.payableDays} shifts`,
      `${settings.currencySymbol} ${slip.dailyRate}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 8.5, halign: 'center', fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  curY = (doc as any).lastAutoTable.finalY + 8;

  // Calculations
  const presentPay = slip.presentDays * slip.dailyRate;
  const doubleDutyPay = slip.doubleDutyDays * 2 * slip.dailyRate;

  autoTable(doc, {
    startY: curY,
    head: [['Salary Component', 'Calculation Details', 'Amount']],
    body: [
      ['Regular Shifts Pay (P)', `${slip.presentDays} days × ${settings.currencySymbol}${slip.dailyRate}`, `${settings.currencySymbol} ${presentPay.toLocaleString('en-IN')}`],
      ['Double Duty Pay (D - 2x)', `${slip.doubleDutyDays} days × 2 shifts × ${settings.currencySymbol}${slip.dailyRate}`, `${settings.currencySymbol} ${doubleDutyPay.toLocaleString('en-IN')}`],
      ['Total Payable Shifts', `${slip.presentDays} + (${slip.doubleDutyDays} × 2) = ${slip.payableDays} shifts`, `${settings.currencySymbol} ${slip.netSalary.toLocaleString('en-IN')}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  curY = (doc as any).lastAutoTable.finalY + 8;

  // Net Pay Banner
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, curY, 182, 16, 2, 2, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, curY, 182, 16, 2, 2, 'D');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text('TOTAL NET SALARY PAYABLE:', 20, curY + 10);
  doc.setFontSize(14);
  doc.text(`${settings.currencySymbol} ${slip.netSalary.toLocaleString('en-IN')}`, 174, curY + 11, { align: 'right' });

  addA4Footer(doc, settings);
  return doc;
};
