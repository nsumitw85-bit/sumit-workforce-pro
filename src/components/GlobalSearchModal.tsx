import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Users, 
  CalendarCheck, 
  Banknote, 
  ArrowRight, 
  Phone, 
  FileText, 
  Calendar,
  Lock,
  Filter,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Employee, AttendanceRecord, ActiveTab, PdfArchiveItem } from '../types';
import { loadPdfArchive, isMonthLocked } from '../utils/storage';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  attendance: AttendanceRecord[];
  onSelectEmployee: (emp: Employee) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

type SearchCategory = 'ALL' | 'WORKERS' | 'MONTHS' | 'ATTENDANCE' | 'PDFS';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  employees,
  attendance,
  onSelectEmployee,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);
  const [pdfArchive, setPdfArchive] = useState<PdfArchiveItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPdfArchive(loadPdfArchive());
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
      setCategory('ALL');
    }
  }, [isOpen]);

  // Distinct recorded months
  const recordedMonths = useMemo(() => {
    const map = new Map<string, { present: number; doubleDuty: number; absent: number; records: number }>();
    attendance.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        const m = r.date.slice(0, 7);
        const curr = map.get(m) || { present: 0, doubleDuty: 0, absent: 0, records: 0 };
        curr.records++;
        if (r.status === 'P') curr.present++;
        else if (r.status === 'D') curr.doubleDuty++;
        else if (r.status === 'A') curr.absent++;
        map.set(m, curr);
      }
    });
    return Array.from(map.entries()).map(([month, stats]) => ({
      month,
      ...stats,
      isLocked: isMonthLocked(month)
    })).sort((a, b) => b.month.localeCompare(a.month));
  }, [attendance]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Advanced multi-criteria search filtering
  const matchedEmployees = trimmed
    ? employees.filter((e) => {
        const nameMatch = e.name.toLowerCase().includes(trimmed);
        const empIdMatch = e.id.toLowerCase().includes(trimmed);
        const workerIdMatch = (e.workerId || '').toLowerCase().includes(trimmed);
        const mobileMatch = e.mobile.replace(/[^0-9]/g, '').includes(trimmed.replace(/[^0-9]/g, '')) || e.mobile.includes(trimmed);
        const deptMatch = (e.department || '').toLowerCase().includes(trimmed);
        const designationMatch = (e.designation || '').toLowerCase().includes(trimmed);
        const workTypeMatch = (e.workType || '').toLowerCase().includes(trimmed);
        return nameMatch || empIdMatch || workerIdMatch || mobileMatch || deptMatch || designationMatch || workTypeMatch;
      })
    : [];

  const matchedMonths = trimmed
    ? recordedMonths.filter((m) => {
        const rawMonth = m.month.toLowerCase(); // e.g. "2026-08"
        const dateObj = new Date(`${m.month}-01`);
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase(); // "august 2026"
        const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(); // "aug"
        return rawMonth.includes(trimmed) || monthName.includes(trimmed) || monthShort.includes(trimmed);
      })
    : [];

  const matchedAttendance = trimmed
    ? attendance
        .filter((a) => {
          const dateMatch = a.date.includes(trimmed);
          const empMatch = a.employeeId.toLowerCase().includes(trimmed);
          const notesMatch = (a.notes || '').toLowerCase().includes(trimmed);
          const statusMatch = trimmed === 'present' ? a.status === 'P' : trimmed === 'double duty' ? a.status === 'D' : trimmed === 'absent' ? a.status === 'A' : false;
          return dateMatch || empMatch || notesMatch || statusMatch;
        })
        .slice(0, 8)
    : [];

  const matchedPdfs = trimmed
    ? pdfArchive.filter((p) => {
        return (
          p.title.toLowerCase().includes(trimmed) ||
          p.period.toLowerCase().includes(trimmed) ||
          p.filename.toLowerCase().includes(trimmed) ||
          (p.employeeName || '').toLowerCase().includes(trimmed)
        );
      })
    : [];

  const totalResults = matchedEmployees.length + matchedMonths.length + matchedAttendance.length + matchedPdfs.length;

  return (
    <div
      id="global-search-modal-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center gap-3 bg-[#1E293B]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Worker Name, Employee ID, Mobile, Month, Year (e.g. August 2026)..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Categories */}
        <div className="px-3.5 py-2 bg-[#111827] border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Results' },
            { id: 'WORKERS', label: `Workers (${matchedEmployees.length})` },
            { id: 'MONTHS', label: `Month History (${matchedMonths.length})` },
            { id: 'ATTENDANCE', label: `Attendance (${matchedAttendance.length})` },
            { id: 'PDFS', label: `PDF Archive (${matchedPdfs.length})` }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as SearchCategory)}
              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#1E293B] text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs bg-[#111827]">
          {!trimmed ? (
            <div className="text-center py-8 text-slate-400 space-y-3">
              <p className="text-slate-300 font-medium">Search the entire permanent workforce database:</p>
              <div className="flex flex-wrap justify-center gap-2 text-[11px]">
                <button onClick={() => setQuery('Ramesh')} className="px-2.5 py-1 rounded-xl bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700">
                  Name: Ramesh
                </button>
                <button onClick={() => setQuery('EMP-101')} className="px-2.5 py-1 rounded-xl bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700">
                  ID: EMP-101
                </button>
                <button onClick={() => setQuery('2026-08')} className="px-2.5 py-1 rounded-xl bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700">
                  Month: 2026-08
                </button>
                <button onClick={() => setQuery('98765')} className="px-2.5 py-1 rounded-xl bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700">
                  Mobile Number
                </button>
                <button onClick={() => setQuery('Driver')} className="px-2.5 py-1 rounded-xl bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700">
                  Driver / Helper
                </button>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-[#1E293B]/40 rounded-2xl border border-slate-800">
              <p className="font-bold text-white">No records matched "{query}"</p>
              <p className="text-[11px] text-slate-400 mt-1">Try searching by Worker Name, Employee ID (e.g. EMP-101), Mobile digits, or Year/Month (e.g. 2026-08).</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* 1. Worker Matches */}
              {(category === 'ALL' || category === 'WORKERS') && matchedEmployees.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Workers & Staff ({matchedEmployees.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-3 rounded-2xl bg-[#1E293B] hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center justify-between gap-3"
                      >
                        <div 
                          className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                          onClick={() => {
                            onSelectEmployee(emp);
                            onClose();
                          }}
                        >
                          <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-black flex items-center justify-center text-xs shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs truncate flex items-center gap-2">
                              <span>{emp.name}</span>
                              <span className="text-[10px] font-mono font-bold bg-[#111827] text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                                {emp.id}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{emp.workType || emp.designation || emp.department}</span>
                              <span>•</span>
                              <span>Mob: {emp.mobile}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {emp.mobile && (
                            <a
                              href={`tel:${emp.mobile}`}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 border border-slate-700"
                              title="Call Worker"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              onSelectEmployee(emp);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Month-Wise History Matches */}
              {(category === 'ALL' || category === 'MONTHS') && matchedMonths.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      Month History Records ({matchedMonths.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedMonths.map((m) => {
                      const dateObj = new Date(`${m.month}-01`);
                      const monthTitle = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      return (
                        <div
                          key={m.month}
                          onClick={() => {
                            onNavigateTab('history');
                            onClose();
                          }}
                          className="p-3 rounded-2xl bg-[#1E293B] hover:bg-slate-700/80 border border-slate-700 transition-all cursor-pointer flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{monthTitle}</span>
                            {m.isLocked ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400">{m.month}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="text-emerald-400 font-bold">P: {m.present}</span>
                            <span className="text-blue-400 font-bold">D: {m.doubleDuty}</span>
                            <span className="text-rose-400 font-bold">A: {m.absent}</span>
                            <span>({m.records} logs)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. PDF Archive Matches */}
              {(category === 'ALL' || category === 'PDFS') && matchedPdfs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      Archived PDF Reports ({matchedPdfs.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedPdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        onClick={() => {
                          onNavigateTab('history');
                          onClose();
                        }}
                        className="p-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-700/80 border border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white">{pdf.title}</div>
                          <div className="text-[10px] text-slate-400">Period: {pdf.period} • {pdf.fileSizeKb} KB • {new Date(pdf.generatedAt).toLocaleDateString()}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Attendance Matches */}
              {(category === 'ALL' || category === 'ATTENDANCE') && matchedAttendance.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Attendance Logs ({matchedAttendance.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedAttendance.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => {
                          onNavigateTab('attendance');
                          onClose();
                        }}
                        className="p-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-700/80 border border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>Date: {rec.date}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              rec.status === 'P' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              rec.status === 'D' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              Status: {rec.status === 'P' ? 'Present' : rec.status === 'D' ? 'Double Duty (2x)' : 'Absent'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Worker ID: {rec.employeeId} {rec.notes ? `• ${rec.notes}` : ''}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
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
