import { AppLanguage } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  // Navigation
  navEmployees: string;
  navAttendance: string;
  navSalary: string;
  navReports: string;
  navSettings: string;
  
  // Statuses
  statusP: string;
  statusA: string;
  statusD: string;
  statusPresent: string;
  statusAbsent: string;
  statusDoubleDuty: string;
  doubleDutyNote: string;
  doubleDutyBadge: string;
  
  // Common Actions
  search: string;
  searchPlaceholder: string;
  filter: string;
  all: string;
  allDepartments: string;
  addEmployee: string;
  editEmployee: string;
  deleteEmployee: string;
  save: string;
  cancel: string;
  apply: string;
  downloadPdf: string;
  shareWhatsApp: string;
  today: string;
  yesterday: string;
  date: string;
  month: string;
  selectDate: string;
  selectMonth: string;
  viewDetails: string;
  close: string;
  actions: string;
  total: string;
  active: string;
  inactive: string;
  confirmDelete: string;
  
  // Employees Tab
  employeeRoster: string;
  totalEmployees: string;
  fullName: string;
  mobileNumber: string;
  department: string;
  designation: string;
  dailySalary: string;
  monthlySalary: string;
  joiningDate: string;
  address: string;
  bankAccount: string;
  noEmployeesFound: string;
  call: string;
  
  // Attendance Tab
  attendanceHub: string;
  attendanceSubtitle: string;
  oneTapAttendance: string;
  bulkAttendance: string;
  markAllP: string;
  markAllA: string;
  markAllD: string;
  dailyMarking: string;
  monthlySheet: string;
  weeklyView: string;
  presentCount: string;
  absentCount: string;
  doubleDutyCount: string;
  unmarked: string;
  attendanceSummary: string;
  doubleDutyInfo: string;
  
  // Salary Tab
  salaryTitle: string;
  salarySubtitle: string;
  totalPayroll: string;
  totalPayableDays: string;
  totalDoubleDuty: string;
  dailyRate: string;
  payableDays: string;
  netSalary: string;
  viewSlip: string;
  payslipTitle: string;
  calculationBreakdown: string;
  ratePerDay: string;
  formulaNote: string;
  
  // Reports Tab
  reportsTitle: string;
  reportsSubtitle: string;
  attendanceReports: string;
  salaryReports: string;
  summaryReports: string;
  dailyAttendanceReport: string;
  dailyAttendanceDesc: string;
  weeklyAttendanceReport: string;
  weeklyAttendanceDesc: string;
  monthlyAttendanceReport: string;
  monthlyAttendanceDesc: string;
  dailySalaryReport: string;
  dailySalaryDesc: string;
  weeklySalaryReport: string;
  weeklySalaryDesc: string;
  monthlySalaryReport: string;
  monthlySalaryDesc: string;
  presentReport: string;
  presentReportDesc: string;
  absentReport: string;
  absentReportDesc: string;
  doubleDutyReport: string;
  doubleDutyReportDesc: string;
  employeeMasterListReport: string;
  employeeMasterListDesc: string;
  completeSummaryReport: string;
  completeSummaryDesc: string;
  pdfOnlyBadge: string;
  
  // Settings Tab
  settingsTitle: string;
  settingsSubtitle: string;
  languageSettings: string;
  languageDesc: string;
  themeSettings: string;
  themeDesc: string;
  lightTheme: string;
  darkTheme: string;
  customTheme: string;
  selectAccent: string;
  reportsSettings: string;
  reportsSettingsDesc: string;
  companyInfo: string;
  companyName: string;
  companyPhone: string;
  currencySymbol: string;
  standardWorkDays: string;
  saveSettings: string;
  settingsSaved: string;
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    appName: "Sumit Enterprises & Tech Solutions",
    tagline: "Simple Attendance, Salary & Reports System",
    
    // Nav
    navEmployees: "Employees",
    navAttendance: "Attendance",
    navSalary: "Salary",
    navReports: "Reports",
    navSettings: "Settings",
    
    // Statuses
    statusP: "P",
    statusA: "A",
    statusD: "D",
    statusPresent: "Present (P)",
    statusAbsent: "Absent (A)",
    statusDoubleDuty: "Double Duty (D)",
    doubleDutyNote: "Counts as 2 working shifts",
    doubleDutyBadge: "2 Shifts",
    
    // Common Actions
    search: "Search",
    searchPlaceholder: "Search by name, ID or mobile...",
    filter: "Filter",
    all: "All",
    allDepartments: "All Departments",
    addEmployee: "Add Employee",
    editEmployee: "Edit Employee",
    deleteEmployee: "Delete Employee",
    save: "Save",
    cancel: "Cancel",
    apply: "Apply",
    downloadPdf: "Download PDF",
    shareWhatsApp: "WhatsApp PDF",
    today: "Today",
    yesterday: "Yesterday",
    date: "Date",
    month: "Month",
    selectDate: "Select Date",
    selectMonth: "Select Month",
    viewDetails: "View Details",
    close: "Close",
    actions: "Actions",
    total: "Total",
    active: "Active",
    inactive: "Inactive",
    confirmDelete: "Are you sure you want to delete this employee?",
    
    // Employees Tab
    employeeRoster: "Employee Management",
    totalEmployees: "Total Staff",
    fullName: "Full Name",
    mobileNumber: "Mobile Number",
    department: "Department",
    designation: "Designation / Role",
    dailySalary: "Daily Wage (₹)",
    monthlySalary: "Monthly Salary (₹)",
    joiningDate: "Joining Date",
    address: "Address",
    bankAccount: "Bank Account / UPI",
    noEmployeesFound: "No employees found",
    call: "Call",
    
    // Attendance Tab
    attendanceHub: "Daily Attendance System",
    attendanceSubtitle: "Fast 1-tap attendance marking with P, A and D statuses",
    oneTapAttendance: "One-Tap Attendance",
    bulkAttendance: "Fast Bulk Attendance",
    markAllP: "Mark All Present (P)",
    markAllA: "Mark All Absent (A)",
    markAllD: "Mark All Double Duty (D)",
    dailyMarking: "Daily Marking",
    monthlySheet: "Monthly Sheet",
    weeklyView: "Weekly Summary",
    presentCount: "Present (P)",
    absentCount: "Absent (A)",
    doubleDutyCount: "Double Duty (D)",
    unmarked: "Unmarked",
    attendanceSummary: "Attendance Summary",
    doubleDutyInfo: "Double Duty (D) gives 2 shifts in salary",
    
    // Salary Tab
    salaryTitle: "Salary & Payroll Management",
    salarySubtitle: "Automated calculations for regular shifts (P) & 2x double duty (D)",
    totalPayroll: "Total Net Disbursement",
    totalPayableDays: "Total Payable Days / Shifts",
    totalDoubleDuty: "Double Duty Shifts (2x)",
    dailyRate: "Daily Rate",
    payableDays: "Payable Days",
    netSalary: "Net Salary",
    viewSlip: "View Pay Slip",
    payslipTitle: "Employee Pay Slip",
    calculationBreakdown: "Shift & Salary Breakdown",
    ratePerDay: "Rate / Day",
    formulaNote: "Formula: Payable Days = Present (P) + [2 × Double Duty (D)]",
    
    // Reports Tab
    reportsTitle: "Official A4 PDF Reports Center",
    reportsSubtitle: "All 11 official reports formatted exclusively as professional A4 printable documents",
    attendanceReports: "1. Attendance Reports",
    salaryReports: "2. Salary & Payroll Reports",
    summaryReports: "3. Executive & Workforce Summary Reports",
    dailyAttendanceReport: "1. Daily Attendance Report",
    dailyAttendanceDesc: "A4 printable list of all staff with P/A/D status & daily wages",
    weeklyAttendanceReport: "2. Weekly Attendance Report",
    weeklyAttendanceDesc: "7-day comprehensive attendance sheet with shift counts",
    monthlyAttendanceReport: "3. Monthly Attendance Report",
    monthlyAttendanceDesc: "Full monthly attendance record with 2x double duty multiplier",
    dailySalaryReport: "4. Daily Salary Report",
    dailySalaryDesc: "Daily wages earned per staff member for the selected date",
    weeklySalaryReport: "5. Weekly Salary Report",
    weeklySalaryDesc: "7-day salary disbursement calculation breakdown per employee",
    monthlySalaryReport: "6. Monthly Salary Report",
    monthlySalaryDesc: "Complete monthly master payroll and bank disbursement sheet",
    presentReport: "7. Present Staff Report",
    presentReportDesc: "Staff marked Present (P) with percentage & regular earnings",
    absentReport: "8. Absent Staff Report",
    absentReportDesc: "Absences, unpaid days and deduction impact log",
    doubleDutyReport: "9. Double Duty Report",
    doubleDutyReportDesc: "2-shift double duties log with doubled shift earnings",
    employeeMasterListReport: "10. Employee Master List",
    employeeMasterListDesc: "Complete directory of registered employees with rates & roles",
    completeSummaryReport: "11. Complete Summary Report",
    completeSummaryDesc: "Executive executive workforce & financial overview for printing",
    pdfOnlyBadge: "A4 PDF Document",
    
    // Settings Tab
    settingsTitle: "Settings & Company Profile",
    settingsSubtitle: "Configure company details, branding, language and theme",
    languageSettings: "1. Language Settings",
    languageDesc: "Choose your preferred language for the application interface.",
    themeSettings: "2. Theme Settings",
    themeDesc: "Choose between light, dark or custom theme accent.",
    lightTheme: "Light Theme",
    darkTheme: "Dark Theme",
    customTheme: "Custom Theme",
    selectAccent: "Select Custom Accent",
    reportsSettings: "3. Reports Configuration",
    reportsSettingsDesc: "All reports are produced exclusively in standardized A4 portrait format.",
    companyInfo: "Company Profile",
    companyName: "Company Name",
    companyPhone: "Company Phone",
    currencySymbol: "Currency Symbol",
    standardWorkDays: "Standard Work Days / Month",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully!"
  },
  
  hi: {
    appName: "Sumit Enterprises & Tech Solutions",
    tagline: "सरल उपस्थिति, वेतन और A4 PDF रिपोर्ट प्रणाली",
    
    // Nav
    navEmployees: "कर्मचारी",
    navAttendance: "उपस्थिति",
    navSalary: "वेतन (सैलरी)",
    navReports: "रिपोर्ट्स (PDF)",
    navSettings: "सेटिंग्स",
    
    // Statuses
    statusP: "P",
    statusA: "A",
    statusD: "D",
    statusPresent: "उपस्थित (P)",
    statusAbsent: "अनुपस्थित (A)",
    statusDoubleDuty: "डबल ड्यूटी (D)",
    doubleDutyNote: "2 कार्य शिफ्ट के रूप में गिना जाता है",
    doubleDutyBadge: "2 शिफ्ट",
    
    // Common Actions
    search: "खोजें",
    searchPlaceholder: "नाम, आईडी या मोबाइल नंबर से खोजें...",
    filter: "फ़िल्टर",
    all: "सभी",
    allDepartments: "सभी विभाग",
    addEmployee: "कर्मचारी जोड़ें",
    editEmployee: "कर्मचारी संपादित करें",
    deleteEmployee: "कर्मचारी हटाएं",
    save: "सुरक्षित करें",
    cancel: "रद्द करें",
    apply: "लागू करें",
    downloadPdf: "PDF डाउनलोड करें",
    shareWhatsApp: "WhatsApp PDF",
    today: "आज",
    yesterday: "कल",
    date: "दिनांक",
    month: "महीना",
    selectDate: "दिनांक चुनें",
    selectMonth: "महीना चुनें",
    viewDetails: "विवरण देखें",
    close: "बंद करें",
    actions: "कार्रवाई",
    total: "कुल",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    confirmDelete: "क्या आप वाकई इस कर्मचारी को हटाना चाहते हैं?",
    
    // Employees Tab
    employeeRoster: "कर्मचारी प्रबंधन",
    totalEmployees: "कुल कर्मचारी",
    fullName: "पूरा नाम",
    mobileNumber: "मोबाइल नंबर",
    department: "विभाग",
    designation: "पद / पदनाम",
    dailySalary: "दैनिक वेतन (₹)",
    monthlySalary: "मासिक वेतन (₹)",
    joiningDate: "शामिल होने की तिथि",
    address: "पता",
    bankAccount: "बैंक खाता / UPI",
    noEmployeesFound: "कोई कर्मचारी नहीं मिला",
    call: "कॉल करें",
    
    // Attendance Tab
    attendanceHub: "दैनिक उपस्थिति प्रणाली",
    attendanceSubtitle: "P, A और D स्थिति के साथ 1-टैप फास्ट हाजिरी",
    oneTapAttendance: "एक टैप हाजिरी",
    bulkAttendance: "त्वरित बल्क हाजिरी",
    markAllP: "सभी को उपस्थित (P) करें",
    markAllA: "सभी को अनुपस्थित (A) करें",
    markAllD: "सभी को डबल ड्यूटी (D) करें",
    dailyMarking: "दैनिक हाजिरी",
    monthlySheet: "मासिक शीट",
    weeklyView: "साप्ताहिक सारांश",
    presentCount: "उपस्थित (P)",
    absentCount: "अनुपस्थित (A)",
    doubleDutyCount: "डबल ड्यूटी (D)",
    unmarked: "अचिह्नित",
    attendanceSummary: "उपस्थिति सारांश",
    doubleDutyInfo: "डबल ड्यूटी (D) से वेतन में 2 शिफ्ट की गिनती होती है",
    
    // Salary Tab
    salaryTitle: "वेतन और पेरोल प्रबंधन",
    salarySubtitle: "P (1x) और डबल ड्यूटी D (2x) के साथ स्वचालित वेतन गणना",
    totalPayroll: "कुल शुद्ध वितरण वेतन",
    totalPayableDays: "कुल देय दिन / शिफ्ट",
    totalDoubleDuty: "डबल ड्यूटी शिफ्ट (2x)",
    dailyRate: "दैनिक दर",
    payableDays: "देय दिन",
    netSalary: "शुद्ध वेतन",
    viewSlip: "वेतन पर्ची देखें",
    payslipTitle: "वेतन पर्ची (Pay Slip)",
    calculationBreakdown: "शिफ्ट और वेतन विवरण",
    ratePerDay: "दर / दिन",
    formulaNote: "सूत्र: देय दिन = उपस्थित (P) + [2 × डबल ड्यूटी (D)]",
    
    // Reports Tab
    reportsTitle: "आधिकारिक A4 PDF रिपोर्ट केंद्र",
    reportsSubtitle: "सभी 11 आधिकारिक रिपोर्ट केवल पेशेवर A4 प्रिंट योग्य PDF में तैयार होती हैं",
    attendanceReports: "1. उपस्थिति रिपोर्ट (Attendance Reports)",
    salaryReports: "2. वेतन रिपोर्ट (Salary Reports)",
    summaryReports: "3. सारांश रिपोर्ट (Executive Summary)",
    dailyAttendanceReport: "1. दैनिक उपस्थिति रिपोर्ट",
    dailyAttendanceDesc: "कर्मचारी नाम, मोबाइल, P/A/D स्थिति और दैनिक वेतन की सूची",
    weeklyAttendanceReport: "2. साप्ताहिक उपस्थिति रिपोर्ट",
    weeklyAttendanceDesc: "डबल ड्यूटी के साथ 7 दिनों की उपस्थिति और शिफ्ट सारांश",
    monthlyAttendanceReport: "3. मासिक उपस्थिति रिपोर्ट",
    monthlyAttendanceDesc: "उपस्थित, अनुपस्थित और 2x डबल ड्यूटी का मासिक पत्रक",
    dailySalaryReport: "4. दैनिक वेतन रिपोर्ट",
    dailySalaryDesc: "दैनिक P और D शिफ्ट के आधार पर अर्जित दैनिक वेतन",
    weeklySalaryReport: "5. साप्ताहिक वेतन रिपोर्ट",
    weeklySalaryDesc: "प्रति कर्मचारी 7 दिनों की वेतन संचय रिपोर्ट",
    monthlySalaryReport: "6. मासिक वेतन रिपोर्ट",
    monthlySalaryDesc: "देय दिनों के साथ संपूर्ण मासिक मास्टर पेरोल शीट",
    presentReport: "7. उपस्थित स्टाफ रिपोर्ट",
    presentReportDesc: "उपस्थित (P) स्टाफ की सूची, प्रतिशत और वेतन गणना",
    absentReport: "8. अनुपस्थित स्टाफ रिपोर्ट",
    absentReportDesc: "अनुपस्थिति, बिना वेतन के दिन और कटौती रिकॉर्ड",
    doubleDutyReport: "9. डबल ड्यूटी रिपोर्ट",
    doubleDutyReportDesc: "2-शिफ्ट डबल ड्यूटी और 2x वेतन का पूरा ब्योरा",
    employeeMasterListReport: "10. कर्मचारी मास्टर सूची",
    employeeMasterListDesc: "पंजीकृत कर्मचारियों की पूरी मास्टर डायरेक्टरी",
    completeSummaryReport: "11. संपूर्ण सारांश रिपोर्ट",
    completeSummaryDesc: "प्रिंट हेतु संपूर्ण कार्यबल और वित्तीय सारांश",
    pdfOnlyBadge: "A4 PDF दस्तावेज़",
    
    // Settings Tab
    settingsTitle: "सेटिंग्स",
    settingsSubtitle: "सरल और पेशेवर सिस्टम प्राथमिकताएं",
    languageSettings: "1. भाषा सेटिंग्स (Language)",
    languageDesc: "अपनी पसंदीदा भाषा चुनें। ऐप तुरंत चुनी गई भाषा में बदल जाएगा।",
    themeSettings: "2. थीम सेटिंग्स (Theme)",
    themeDesc: "लाइट, डार्क या कस्टम थीम में से चुनें।",
    lightTheme: "लाइट थीम (Light)",
    darkTheme: "डार्क थीम (Dark)",
    customTheme: "कस्टम थीम (Custom)",
    selectAccent: "कस्टम रंग थीम चुनें",
    reportsSettings: "3. रिपोर्ट सेटिंग्स (Reports)",
    reportsSettingsDesc: "सभी रिपोर्ट विशेष रूप से मानकीकृत A4 पोर्ट्रेट प्रारूप में तैयार की जाती हैं।",
    companyInfo: "कंपनी प्रोफ़ाइल",
    companyName: "कंपनी का नाम",
    companyPhone: "कंपनी फोन",
    currencySymbol: "मुद्रा प्रतीक",
    standardWorkDays: "मानक कार्य दिवस / माह",
    saveSettings: "सेटिंग्स सहेजें",
    settingsSaved: "सेटिंग्स सफलतापूर्वक सहेजी गईं!"
  },
  
  mr: {
    appName: "Sumit Enterprises & Tech Solutions",
    tagline: "सोपी हजेरी, पगार आणि A4 PDF अहवाल प्रणाली",
    
    // Nav
    navEmployees: "कर्मचारी",
    navAttendance: "हजेरी",
    navSalary: "पगार (सॅलरी)",
    navReports: "अहवाल (PDF)",
    navSettings: "सेटिंग्ज",
    
    // Statuses
    statusP: "P",
    statusA: "A",
    statusD: "D",
    statusPresent: "हजर (P)",
    statusAbsent: "गैरहजर (A)",
    statusDoubleDuty: "डबल ड्युटी (D)",
    doubleDutyNote: "२ कामाच्या शिफ्ट म्हणून मोजले जाते",
    doubleDutyBadge: "२ शिफ्ट",
    
    // Common Actions
    search: "शोधा",
    searchPlaceholder: "नाव, आयडी किंवा मोबाईलने शोधा...",
    filter: "फिल्टर",
    all: "सर्व",
    allDepartments: "सर्व विभाग",
    addEmployee: "नवीन कर्मचारी जोडा",
    editEmployee: "कर्मचारी माहिती बदला",
    deleteEmployee: "कर्मचारी हटवा",
    save: "जतन करा",
    cancel: "रद्द करा",
    apply: "लागू करा",
    downloadPdf: "PDF डाउनलोड करा",
    shareWhatsApp: "WhatsApp PDF",
    today: "आज",
    yesterday: "काल",
    date: "तारीख",
    month: "महिना",
    selectDate: "तारीख निवडा",
    selectMonth: "महिना निवडा",
    viewDetails: "तपशील पहा",
    close: "बंद करा",
    actions: "कृती",
    total: "एकूण",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    confirmDelete: "तुम्हाला नक्की हा कर्मचारी हटवायचा आहे का?",
    
    // Employees Tab
    employeeRoster: "कर्मचारी व्यवस्थापन",
    totalEmployees: "एकूण कर्मचारी",
    fullName: "पूर्ण नाव",
    mobileNumber: "मोबाईल नंबर",
    department: "विभाग",
    designation: "पद / हुद्दा",
    dailySalary: "दैनिक रोज (₹)",
    monthlySalary: "मासिक पगार (₹)",
    joiningDate: "रुजू झाल्याची तारीख",
    address: "पत्ता",
    bankAccount: "बँक खाते / UPI",
    noEmployeesFound: "कोणताही कर्मचारी सापडला नाही",
    call: "कॉल करा",
    
    // Attendance Tab
    attendanceHub: "दैनंदिन हजेरी प्रणाली",
    attendanceSubtitle: "P, A आणि D स्थितीसह १-टॅप जलद हजेरी नोंदणी",
    oneTapAttendance: "एक टॅप हजेरी",
    bulkAttendance: "जलद बल्क हजेरी",
    markAllP: "सर्वांना हजर (P) करा",
    markAllA: "सर्वांना गैरहजर (A) करा",
    markAllD: "सर्वांना डबल ड्युटी (D) करा",
    dailyMarking: "दैनंदिन हजेरी",
    monthlySheet: "मासिक पत्रक",
    weeklyView: "साप्ताहिक सारांश",
    presentCount: "हजर (P)",
    absentCount: "गैरहजर (A)",
    doubleDutyCount: "डबल ड्युटी (D)",
    unmarked: "अनोंदणीकृत",
    attendanceSummary: "हजेरी सारांश",
    doubleDutyInfo: "डबल ड्युटी (D) मुळे पगारात २ शिफ्ट मोजल्या जातात",
    
    // Salary Tab
    salaryTitle: "पगार आणि पेरोल व्यवस्थापन",
    salarySubtitle: "P (1x) आणि डबल ड्युटी D (2x) सह स्वयंचलित पगार गणना",
    totalPayroll: "एकूण निव्वळ पगार वाटप",
    totalPayableDays: "एकूण देय दिवस / शिफ्ट",
    totalDoubleDuty: "डबल ड्युटी शिफ्ट (2x)",
    dailyRate: "दैनिक दर",
    payableDays: "देय दिवस",
    netSalary: "निव्वळ पगार",
    viewSlip: "पगार पावती पहा",
    payslipTitle: "पगार पावती (Pay Slip)",
    calculationBreakdown: "शिफ्ट आणि पगार तपशील",
    ratePerDay: "दर / दिवस",
    formulaNote: "सूत्र: देय दिवस = हजर (P) + [२ × डबल ड्युटी (D)]",
    
    // Reports Tab
    reportsTitle: "अधिकृत A4 PDF अहवाल केंद्र",
    reportsSubtitle: "सर्व ११ अधिकृत अहवाल केवळ व्यावसायिक A4 प्रिंटयोग्य PDF मध्ये तयार होतात",
    attendanceReports: "१. हजेरी अहवाल (Attendance Reports)",
    salaryReports: "२. पगार अहवाल (Salary Reports)",
    summaryReports: "३. सारांश अहवाल (Executive Summary)",
    dailyAttendanceReport: "१. दैनंदिन हजेरी अहवाल",
    dailyAttendanceDesc: "कर्मचारी नाव, मोबाईल, P/A/D स्थिती आणि रोज पगार",
    weeklyAttendanceReport: "२. साप्ताहिक हजेरी अहवाल",
    weeklyAttendanceDesc: "डबल ड्युटीसह ७ दिवसांच्या हजेरीचा तपशील व शिफ्ट गणना",
    monthlyAttendanceReport: "३. मासिक हजेरी अहवाल",
    monthlyAttendanceDesc: "हजर, गैरहजर आणि २x डबल ड्युटीचा संपूर्ण मासिक गोषवारा",
    dailySalaryReport: "४. दैनंदिन पगार अहवाल",
    dailySalaryDesc: "दैनंदिन P आणि D शिफ्टनुसार मिळणारा रोज पगार",
    weeklySalaryReport: "५. साप्ताहिक पगार अहवाल",
    weeklySalaryDesc: "प्रति कर्मचारी ७ दिवसांचा पगार संचय अहवाल",
    monthlySalaryReport: "६. मासिक पगार अहवाल",
    monthlySalaryDesc: "देय दिवसांसह संपूर्ण मासिक मास्टर पेरोल पत्रक",
    presentReport: "७. हजर स्टाफ अहवाल",
    presentReportDesc: "हजर (P) नोंदवलेल्या कर्मचाऱ्यांची सविस्तर यादी व वेतन",
    absentReport: "८. गैरहजर स्टाफ अहवाल",
    absentReportDesc: "गैरहजेरी, बिनपगारी दिवस आणि कपातीची सविस्तर नोंद",
    doubleDutyReport: "९. डबल ड्युटी अहवाल",
    doubleDutyReportDesc: "२-शिफ्ट डबल ड्युटी केलेल्या कामांची संपूर्ण नोंद",
    employeeMasterListReport: "१०. कर्मचारी मास्टर यादी",
    employeeMasterListDesc: "नोंदणीकृत कर्मचाऱ्यांची संपूर्ण मास्टर डिरेक्टरी",
    completeSummaryReport: "११. संपूर्ण सारांश अहवाल",
    completeSummaryDesc: "प्रिंटसाठी संपूर्ण कार्यबल आणि आर्थिक गोषवारा",
    pdfOnlyBadge: "A4 PDF दस्तऐवज",
    
    // Settings Tab
    settingsTitle: "सेटिंग्ज",
    settingsSubtitle: "सोपी आणि व्यावसायिक प्रणाली प्राधान्ये",
    languageSettings: "१. भाषा सेटिंग्ज (Language)",
    languageDesc: "तुमची पसंतीची भाषा निवडा. संपूर्ण ॲप त्वरित बदलेल.",
    themeSettings: "२. थीम सेटिंग्ज (Theme)",
    themeDesc: "लाईट, डार्क किंवा सानुकूल (Custom) थीम निवडा.",
    lightTheme: "लाईट थीम (Light)",
    darkTheme: "डार्क थीम (Dark)",
    customTheme: "सानुकूल थीम (Custom)",
    selectAccent: "सानुकूल रंग निवडा",
    reportsSettings: "३. अहवाल सेटिंग्ज (Reports)",
    reportsSettingsDesc: "सर्व अहवाल केवळ प्रमाणित A4 पोर्ट्रेट स्वरूपात तयार केले जातात.",
    companyInfo: "कंपनी माहिती",
    companyName: "कंपनीचे नाव",
    companyPhone: "कंपनी फोन",
    currencySymbol: "चलन चिन्ह",
    standardWorkDays: "मानक कामाचे दिवस / महिना",
    saveSettings: "सेटिंग्ज जतन करा",
    settingsSaved: "सेटिंग्ज यशस्वीरित्या जतन केल्या!"
  }
};
