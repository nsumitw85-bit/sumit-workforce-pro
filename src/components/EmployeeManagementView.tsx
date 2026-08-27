import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  Share2, 
  FileSpreadsheet, 
  Building2, 
  Briefcase,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Employee, AttendanceRecord, CompanySettings } from '../types';
import { generateEmployeeListPDF } from '../utils/pdfGenerator';
import { sharePdfToWhatsApp } from '../utils/shareUtils';

interface EmployeeManagementViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: CompanySettings;
  onAddEmployee: () => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onViewEmployeeProfile: (emp: Employee) => void;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  attendance,
  settings,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployeeProfile
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract Unique Departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.workerId && emp.workerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.workType && emp.workType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.mobile.includes(searchTerm) ||
        (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDept = selectedDepartment === 'ALL' || 
        emp.department === selectedDepartment || 
        emp.workType === selectedDepartment;
      const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedDepartment, selectedStatus]);

  const handleExportPDF = () => {
    const doc = generateEmployeeListPDF(filteredEmployees, settings);
    doc.save(`Employee_Directory_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleShareOnWhatsApp = async () => {
    const doc = generateEmployeeListPDF(filteredEmployees, settings);
    await sharePdfToWhatsApp({
      title: `${settings.companyName || 'Sumit Enterprises & Tech Solutions'} - Employee Master Directory`,
      doc,
      filename: `Employee_Directory_${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  return (
    <div id="employee-management-container" className="space-y-4 sm:space-y-5 animate-fade-in text-slate-100">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Staff & Workforce Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Total {employees.length} registered employees ({employees.filter((e) => e.status === 'ACTIVE').length} active)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="emp-export-pdf-btn"
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-2xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
            title="Download Master Employee PDF"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Export PDF</span>
          </button>

          <button
            id="emp-share-whatsapp-btn"
            onClick={handleShareOnWhatsApp}
            className="px-3.5 py-2 rounded-2xl bg-emerald-950/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-800 hover:bg-emerald-900/80 transition-all"
            title="Share Staff List via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp List</span>
          </button>

          <button
            id="emp-add-new-btn"
            onClick={onAddEmployee}
            className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, mobile, designation..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#1E293B] border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="INACTIVE">Inactive Staff</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#1E293B] rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#111827] text-emerald-400 font-bold shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#111827] text-emerald-400 font-bold shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Employee List Render */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#111827] border border-dashed border-slate-800 text-slate-400">
          <Users className="w-12 h-12 mx-auto text-slate-500 mb-3 opacity-50" />
          <h3 className="font-bold text-base text-slate-200">No employees match your search</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search keywords or filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="rounded-3xl bg-[#111827] border border-slate-800 shadow-lg hover:border-slate-700 transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Card Top Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#1E293B] overflow-hidden ring-2 ring-emerald-500/30 flex-shrink-0 flex items-center justify-center font-bold text-base text-slate-200 border border-slate-700">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      emp.name.charAt(0)
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {emp.workerId && (
                        <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800">
                          {emp.workerId}
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-slate-300 bg-[#1E293B] px-2 py-0.5 rounded-md border border-slate-700">
                        {emp.id}
                      </span>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                      emp.status === 'ACTIVE' 
                        ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800' 
                        : 'text-slate-400 bg-[#1E293B] border-slate-700'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                </div>

                {/* Name & Title */}
                <h3 className="font-extrabold text-sm text-white truncate">
                  {emp.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 mb-2">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 text-xs font-bold border border-indigo-800/80">
                    {emp.workType || emp.designation || 'Worker'}
                  </span>
                </div>

                {/* Contact & Wage Details */}
                <div className="space-y-1.5 py-2 border-t border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{emp.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1">
                    <span className="text-slate-400">Wage:</span>
                    <span className="font-bold text-emerald-400">
                      {settings.currencySymbol}{emp.dailySalary}/day ({settings.currencySymbol}{emp.monthlySalary.toLocaleString('en-IN')}/mo)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                <button
                  onClick={() => onViewEmployeeProfile(emp)}
                  className="px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all border border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditEmployee(emp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[#1E293B] transition-colors border border-transparent hover:border-slate-700"
                    title="Edit Record"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${emp.name} from records?`)) {
                        onDeleteEmployee(emp.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1E293B] transition-colors border border-transparent hover:border-slate-700"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E293B] text-slate-200 font-bold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Worker & ID</th>
                  <th className="py-3 px-4">Work Type</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Daily Wage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#1E293B] overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-white border border-slate-700">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{emp.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {emp.workerId && (
                              <span className="text-[9px] text-blue-300 bg-blue-950 font-mono font-bold px-1 rounded border border-blue-800">
                                {emp.workerId}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">{emp.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 font-bold text-[11px] border border-indigo-800">
                        {emp.workType || emp.designation || 'Worker'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{emp.mobile}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {settings.currencySymbol}{emp.dailySalary || 500} / day
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        emp.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-[#1E293B] text-slate-400 border-slate-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewEmployeeProfile(emp)}
                          className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1E293B] hover:text-white"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditEmployee(emp)}
                          className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1E293B]"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${emp.name}?`)) onDeleteEmployee(emp.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1E293B]"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
