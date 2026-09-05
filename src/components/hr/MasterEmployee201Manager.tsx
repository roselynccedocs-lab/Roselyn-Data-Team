import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Eye, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  CreditCard, 
  FileText, 
  Award,
  ChevronRight,
  X,
  Plus
} from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import { Employee, EmployeeStatus, EmploymentCategory } from '../../types';

export function MasterEmployee201Manager() {
  const { 
    employees, 
    isLoading, 
    isSyncing, 
    addEmployee, 
    updateEmployee, 
    resignEmployee, 
    deleteEmployee,
    syncDatabase 
  } = useEmployees();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [resigningEmployee, setResigningEmployee] = useState<Employee | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // New employee form initial state
  const initialNewEmpState: Partial<Employee> = {
    id: `2026-CCE0${Math.floor(100 + Math.random() * 900)}`,
    firstName: '',
    lastName: '',
    middleName: '',
    nickname: '',
    email: '',
    cceEmail: '',
    position: '',
    department: 'OPERATIONS & DELIVERY',
    category: 'RANK AND FILE',
    salary: 35000,
    hireDate: Date.now(),
    dateOfEntry: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    regularizationDate: '',
    workingYears: '0YEAR1MONTH',
    workingTime: '8:00 am-5:00 pm',
    status: 'PROBATIONARY',
    lifeCycleStage: 'PROBATION',
    contactNumber: '',
    unionBankNumber: '',
    sssNumber: '',
    philHealthNumber: '',
    pagIbigNumber: '',
    tinNumber: '',
    gender: 'MALE',
    birthDate: '',
    maritalStatus: 'SINGLE',
    residentialAddress: '',
    degreeLevel: 'BACHELOR DEGREE',
    degreeEarned: '',
    school: '',
    emergencyContactPerson: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    remarks: '',
    remainingLeave: 12.0
  };

  const [newEmpForm, setNewEmpForm] = useState<Partial<Employee>>(initialNewEmpState);

  // Resignation form state
  const [resignationForm, setResignationForm] = useState({
    departureDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    departureReason: 'RESIGNED',
    status: 'RESIGNED' as EmployeeStatus,
    remarks: ''
  });

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        searchTerm === '' ||
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.nickname && emp.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.sssNumber && emp.sssNumber.includes(searchTerm)) ||
        (emp.unionBankNumber && emp.unionBankNumber.includes(searchTerm));

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && (emp.status === 'REGULAR' || emp.status === 'ACTIVE')) ||
        (statusFilter === 'PROBATION' && emp.status === 'PROBATIONARY') ||
        (statusFilter === 'CONTRACTUAL' && emp.status === 'CONTRACTUAL') ||
        (statusFilter === 'RESIGNED' && (emp.status === 'RESIGNED' || emp.status === 'TERMINATED' || emp.status === 'END_OF_CONTRACT' || emp.status === 'AWOL'));

      const matchesDept = 
        departmentFilter === 'ALL' ||
        emp.department.toLowerCase().includes(departmentFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const activeRegular = employees.filter(e => e.status === 'REGULAR' || e.status === 'ACTIVE').length;
    const probationary = employees.filter(e => e.status === 'PROBATIONARY').length;
    const contractual = employees.filter(e => e.status === 'CONTRACTUAL').length;
    const resigned = employees.filter(e => e.status === 'RESIGNED' || e.status === 'TERMINATED' || e.status === 'END_OF_CONTRACT' || e.status === 'AWOL').length;

    return { total, activeRegular, probationary, contractual, resigned };
  }, [employees]);

  // Submit new employee
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.firstName || !newEmpForm.lastName || !newEmpForm.position) {
      alert('Please enter first name, last name, and position.');
      return;
    }

    const employeePayload: Employee = {
      ...(newEmpForm as Employee),
      id: newEmpForm.id || `2026-CCE0${Math.floor(100 + Math.random() * 900)}`,
      fullName: `${newEmpForm.lastName?.toUpperCase()}, ${newEmpForm.firstName?.toUpperCase()}${newEmpForm.middleName ? ' ' + newEmpForm.middleName?.toUpperCase() : ''}`,
      salary: Number(newEmpForm.salary) || 30000,
      hireDate: newEmpForm.hireDate || Date.now()
    };

    try {
      await addEmployee(employeePayload);
      setIsAddModalOpen(false);
      setNewEmpForm(initialNewEmpState);
      showToast(`Employee ${employeePayload.firstName} ${employeePayload.lastName} (${employeePayload.id}) added and synced to database.`);
    } catch (err) {
      alert('Failed to save employee profile. Please check connection.');
    }
  };

  // Submit edit employee
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      await updateEmployee(editingEmployee.id, editingEmployee);
      setEditingEmployee(null);
      showToast(`Profile for ${editingEmployee.id} updated successfully.`);
    } catch (err) {
      alert('Error updating profile');
    }
  };

  // Submit resignation
  const handleConfirmResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resigningEmployee) return;

    try {
      await resignEmployee(resigningEmployee.id, {
        departureDate: resignationForm.departureDate,
        departureReason: resignationForm.departureReason,
        status: resignationForm.status,
        remarks: resignationForm.remarks
      });
      setResigningEmployee(null);
      showToast(`${resigningEmployee.firstName} ${resigningEmployee.lastName} has been marked as ${resignationForm.status}.`);
    } catch (err) {
      alert('Error updating employee status');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Full Name',
      'First Name',
      'Last Name',
      'Nickname',
      'Department',
      'Position',
      'Category',
      'Status',
      'Date of Entry',
      'Regularization Date',
      'Contact Number',
      'Personal Email',
      'CCE Email',
      'Salary (PHP)',
      'UnionBank No',
      'SSS No',
      'PhilHealth No',
      'Pag-IBIG No',
      'TIN No',
      'Departure Date',
      'Departure Reason'
    ];

    const rows = filteredEmployees.map(emp => [
      emp.id,
      `"${emp.fullName || emp.lastName + ', ' + emp.firstName}"`,
      `"${emp.firstName}"`,
      `"${emp.lastName}"`,
      `"${emp.nickname || ''}"`,
      `"${emp.department}"`,
      `"${emp.position}"`,
      `"${emp.category || ''}"`,
      `"${emp.status}"`,
      `"${emp.dateOfEntry || ''}"`,
      `"${emp.regularizationDate || ''}"`,
      `"${emp.contactNumber || ''}"`,
      `"${emp.email}"`,
      `"${emp.cceEmail || ''}"`,
      emp.salary,
      `"${emp.unionBankNumber || ''}"`,
      `"${emp.sssNumber || ''}"`,
      `"${emp.philHealthNumber || ''}"`,
      `"${emp.pagIbigNumber || ''}"`,
      `"${emp.tinNumber || ''}"`,
      `"${emp.departureDate || ''}"`,
      `"${emp.departureReason || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Centaur_Chem_Master_Employee_201_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Master employee records exported to CSV.');
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case 'REGULAR':
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">REGULAR</span>;
      case 'PROBATIONARY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">PROBATIONARY</span>;
      case 'CONTRACTUAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">CONTRACTUAL</span>;
      case 'RESIGNED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">RESIGNED</span>;
      case 'TERMINATED':
      case 'AWOL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">{status}</span>;
      case 'END_OF_CONTRACT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">END OF CONTRACT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* KPI Cards / Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ALL'
              ? 'bg-blue-50/80 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400">Centaur Chem Masterfile</span>
        </div>

        <div 
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active Regular</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.activeRegular}</p>
          <span className="text-[10px] text-slate-400">Regularized Personnel</span>
        </div>

        <div 
          onClick={() => setStatusFilter('PROBATION')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'PROBATION'
              ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Probationary</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.probationary}</p>
          <span className="text-[10px] text-slate-400">Tenure Under 6 Mo</span>
        </div>

        <div 
          onClick={() => setStatusFilter('CONTRACTUAL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'CONTRACTUAL'
              ? 'bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Utility / Special</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.contractual}</p>
          <span className="text-[10px] text-slate-400">Contractual Staff</span>
        </div>

        <div 
          onClick={() => setStatusFilter('RESIGNED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'RESIGNED'
              ? 'bg-slate-100 border-slate-400 dark:bg-slate-800 dark:border-slate-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Separated / Resigned</span>
            <UserMinus className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{stats.resigned}</p>
          <span className="text-[10px] text-slate-400">Past & Resigned</span>
        </div>
      </div>

      {/* Action Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, position, TIN, SSS, or account..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Statuses ({employees.length})</option>
              <option value="ACTIVE">Active Regular ({stats.activeRegular})</option>
              <option value="PROBATION">Probationary ({stats.probationary})</option>
              <option value="CONTRACTUAL">Contractual ({stats.contractual})</option>
              <option value="RESIGNED">Resigned / Separated ({stats.resigned})</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="MANAGEMENT">Management</option>
              <option value="HUMAN RESOURCE">Human Resource & Admin</option>
              <option value="FINANCE">Finance & Accounting</option>
              <option value="OPERATIONS">Operations & Delivery</option>
              <option value="PURCHASING">Purchasing & Logistics</option>
              <option value="SALES">Sales & Marketing</option>
              <option value="DATA & IT">Data & IT</option>
              <option value="HSSE">HSSE & Utility</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => syncDatabase()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="Sync with Firestore Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Main Employee Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Full Legal Name</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date of Entry</th>
                <th className="py-3.5 px-4">UnionBank Account</th>
                <th className="py-3.5 px-4">Govt IDs (SSS / TIN)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No employee records found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {emp.id}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {emp.fullName || `${emp.lastName}, ${emp.firstName}`}
                          {emp.nickname && (
                            <span className="text-[10px] font-normal px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                              "{emp.nickname}"
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {emp.cceEmail || emp.email}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{emp.position}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{emp.department}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                        {emp.category || 'RANK AND FILE'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(emp.status)}
                      {emp.departureDate && (
                        <p className="text-[9px] text-rose-500 mt-0.5">
                          Exit: {emp.departureDate}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <p>{emp.dateOfEntry || new Date(emp.hireDate).toLocaleDateString()}</p>
                      {emp.workingYears && (
                        <p className="text-[10px] text-slate-400">{emp.workingYears}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {emp.unionBankNumber || <span className="text-slate-400 italic">Not set</span>}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      <div>SSS: {emp.sssNumber || 'N/A'}</div>
                      <div>TIN: {emp.tinNumber || 'N/A'}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          title="View 201 File Master Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditingEmployee({ ...emp })}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="Edit Employee Information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {(emp.status === 'REGULAR' || emp.status === 'PROBATIONARY' || emp.status === 'ACTIVE' || emp.status === 'CONTRACTUAL') ? (
                          <button
                            onClick={() => {
                              setResigningEmployee(emp);
                              setResignationForm({
                                departureDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                                departureReason: 'Voluntary Resignation',
                                status: 'RESIGNED',
                                remarks: ''
                              });
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Process Resignation / Separation"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (confirm(`Restore ${emp.firstName} ${emp.lastName} back to Active Regular status?`)) {
                                await updateEmployee(emp.id, { status: 'REGULAR', lifeCycleStage: 'REGULARIZED' });
                                showToast(`${emp.firstName} restored to Active Regular status.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors text-[10px] font-bold"
                            title="Rehire / Restore to Active"
                          >
                            Rehire
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredEmployees.length} of {employees.length} personnel</span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">Centaur Chem Enterprise Inc. • Live Synchronized 201 Registry</span>
        </div>
      </div>

      {/* MODAL 1: ADD NEW EMPLOYEE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">New Employee 201 Enrollment</h3>
                  <p className="text-xs text-slate-400">Enter complete profile, statutory numbers, bank account, and work assignment</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-6">
              {/* Section 1: Identification & Names */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> 1. Personal & Identification
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Employee ID *</label>
                    <input 
                      type="text" 
                      required
                      value={newEmpForm.id}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">First Name *</label>
                    <input 
                      type="text" 
                      required
                      value={newEmpForm.firstName}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, firstName: e.target.value })}
                      placeholder="e.g. Juan"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Last Name *</label>
                    <input 
                      type="text" 
                      required
                      value={newEmpForm.lastName}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, lastName: e.target.value })}
                      placeholder="e.g. Dela Cruz"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Middle Name</label>
                    <input 
                      type="text" 
                      value={newEmpForm.middleName}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, middleName: e.target.value })}
                      placeholder="e.g. Santos"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Nickname</label>
                    <input 
                      type="text" 
                      value={newEmpForm.nickname}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, nickname: e.target.value })}
                      placeholder="e.g. JON"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Gender & Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={newEmpForm.gender}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, gender: e.target.value })}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                      <select 
                        value={newEmpForm.maritalStatus}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, maritalStatus: e.target.value })}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Work & Assignment */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 2. Position, Department & Compensation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Department *</label>
                    <select 
                      value={newEmpForm.department}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value="OPERATIONS & DELIVERY">Operations & Delivery</option>
                      <option value="FINANCE">Finance & Accounting</option>
                      <option value="HUMAN RESOURCE AND ADMIN">Human Resource and Admin</option>
                      <option value="PURCHASING & LOGISTICS">Purchasing & Logistics</option>
                      <option value="SALES & MARKETING">Sales & Marketing</option>
                      <option value="DATA & IT">Data & IT</option>
                      <option value="HSSE, MAINTENANCE & UTILITY">HSSE, Maintenance & Utility</option>
                      <option value="MANAGEMENT">Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Position / Designation *</label>
                    <input 
                      type="text" 
                      required
                      value={newEmpForm.position}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, position: e.target.value })}
                      placeholder="e.g. Operations Delivery Specialist"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Category</label>
                    <select 
                      value={newEmpForm.category}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, category: e.target.value as EmploymentCategory })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value="RANK AND FILE">Rank and File</option>
                      <option value="SUPERVISORY">Supervisory</option>
                      <option value="MANAGERIAL">Managerial</option>
                      <option value="CONTRACTOR">Contractor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Monthly Salary (PHP) *</label>
                    <input 
                      type="number" 
                      required
                      value={newEmpForm.salary}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Date of Entry / Hire Date</label>
                    <input 
                      type="text" 
                      value={newEmpForm.dateOfEntry}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, dateOfEntry: e.target.value })}
                      placeholder="e.g. August 15, 2026"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Status</label>
                    <select 
                      value={newEmpForm.status}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, status: e.target.value as EmployeeStatus })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value="PROBATIONARY">Probationary</option>
                      <option value="REGULAR">Regular</option>
                      <option value="CONTRACTUAL">Contractual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Bank Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> 3. Contact, Banking & Government IDs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={newEmpForm.contactNumber}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, contactNumber: e.target.value })}
                      placeholder="09XXXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Personal Email</label>
                    <input 
                      type="email" 
                      value={newEmpForm.email}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                      placeholder="personal@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Company CCE Email</label>
                    <input 
                      type="email" 
                      value={newEmpForm.cceEmail}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, cceEmail: e.target.value })}
                      placeholder="name.cce.docs@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">UnionBank Account No.</label>
                    <input 
                      type="text" 
                      value={newEmpForm.unionBankNumber}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, unionBankNumber: e.target.value })}
                      placeholder="1096XXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">SSS Number</label>
                    <input 
                      type="text" 
                      value={newEmpForm.sssNumber}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, sssNumber: e.target.value })}
                      placeholder="XX-XXXXXXX-X"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">BIR TIN</label>
                    <input 
                      type="text" 
                      value={newEmpForm.tinNumber}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, tinNumber: e.target.value })}
                      placeholder="XXX-XXX-XXX-000"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Residential Address</label>
                  <input 
                    type="text" 
                    value={newEmpForm.residentialAddress}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, residentialAddress: e.target.value })}
                    placeholder="Complete residential address"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROCESS RESIGNATION / SEPARATION */}
      {resigningEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <UserMinus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Process Resignation / Separation</h3>
                <p className="text-xs text-slate-400">{resigningEmployee.firstName} {resigningEmployee.lastName} ({resigningEmployee.id})</p>
              </div>
            </div>

            <form onSubmit={handleConfirmResignation} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Separation Type</label>
                <select
                  value={resignationForm.status}
                  onChange={(e) => setResignationForm({ ...resignationForm, status: e.target.value as EmployeeStatus, departureReason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="RESIGNED">Voluntary Resignation</option>
                  <option value="END_OF_CONTRACT">End of Contract</option>
                  <option value="TERMINATED">Involuntary Termination</option>
                  <option value="AWOL">AWOL (Absence Without Official Leave)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Effective Departure Date</label>
                <input 
                  type="text"
                  required
                  value={resignationForm.departureDate}
                  onChange={(e) => setResignationForm({ ...resignationForm, departureDate: e.target.value })}
                  placeholder="e.g. August 31, 2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Reason / Clearance Notes</label>
                <textarea 
                  rows={3}
                  value={resignationForm.remarks}
                  onChange={(e) => setResignationForm({ ...resignationForm, remarks: e.target.value })}
                  placeholder="Provide details on turnover, exit interview, or clearance status..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResigningEmployee(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm Separation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW COMPREHENSIVE 201 PROFILE DRAWER */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {viewingEmployee.firstName[0]}{viewingEmployee.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {viewingEmployee.fullName || `${viewingEmployee.lastName}, ${viewingEmployee.firstName}`}
                    </h3>
                    {getStatusBadge(viewingEmployee.status)}
                  </div>
                  <p className="text-xs text-slate-500">{viewingEmployee.position} • {viewingEmployee.department}</p>
                  <p className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">ID: {viewingEmployee.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingEmployee(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Data Sections */}
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-2.5 text-blue-600">
                  Employment & Compensation
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Monthly Base Salary</span>
                    <span className="font-bold font-mono text-emerald-600">₱{viewingEmployee.salary.toLocaleString()} / mo</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Date of Entry</span>
                    <span className="font-semibold">{viewingEmployee.dateOfEntry || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Regularization</span>
                    <span className="font-semibold">{viewingEmployee.regularizationDate || 'Standard 6-Mo'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Working Shift</span>
                    <span className="font-semibold">{viewingEmployee.workingTime || '8:00 am - 5:00 pm'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Tenure / Service</span>
                    <span className="font-semibold">{viewingEmployee.workingYears || 'Active'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Leave Credits</span>
                    <span className="font-bold text-blue-600">{viewingEmployee.remainingLeave || 12.0} Days Available</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-2.5 text-blue-600">
                  Government Statutory Numbers & UnionBank
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">UnionBank Account</span>
                    <span className="font-bold">{viewingEmployee.unionBankNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">SSS Number</span>
                    <span>{viewingEmployee.sssNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">BIR TIN</span>
                    <span>{viewingEmployee.tinNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">PhilHealth ID</span>
                    <span>{viewingEmployee.philHealthNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Pag-IBIG HDMF</span>
                    <span>{viewingEmployee.pagIbigNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">HMO Provider No.</span>
                    <span>{viewingEmployee.mediCardNo || viewingEmployee.philCareNo || 'Enrolled'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-2.5 text-blue-600">
                  Personal, Address & Emergency Contact
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Contact Number</span>
                      <span className="font-semibold">{viewingEmployee.contactNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Birth Date / Age</span>
                      <span className="font-semibold">{viewingEmployee.birthDate || 'N/A'} {viewingEmployee.age ? `(${viewingEmployee.age} y/o)` : ''}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Residential Address</span>
                    <span className="font-semibold">{viewingEmployee.residentialAddress || 'On file'}</span>
                  </div>
                  {viewingEmployee.emergencyContactPerson && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Emergency Contact Person & Phone</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {viewingEmployee.emergencyContactPerson} ({viewingEmployee.emergencyContactRelationship || 'Relative'}) — {viewingEmployee.emergencyContactNumber}
                      </span>
                    </div>
                  )}
                  {viewingEmployee.remarks && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Remarks / Notes</span>
                      <span className="text-slate-700 dark:text-slate-300">{viewingEmployee.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl"
              >
                Close Masterfile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT EMPLOYEE PROFILE */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Employee 201 Record</h3>
                  <p className="text-xs text-slate-400">{editingEmployee.id} • {editingEmployee.firstName} {editingEmployee.lastName}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingEmployee(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Position</label>
                  <input 
                    type="text"
                    required
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Monthly Salary (PHP)</label>
                  <input 
                    type="number"
                    required
                    value={editingEmployee.salary}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Department</label>
                  <select 
                    value={editingEmployee.department}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="OPERATIONS & DELIVERY">Operations & Delivery</option>
                    <option value="FINANCE">Finance & Accounting</option>
                    <option value="HUMAN RESOURCE AND ADMIN">Human Resource and Admin</option>
                    <option value="PURCHASING & LOGISTICS">Purchasing & Logistics</option>
                    <option value="SALES & MARKETING">Sales & Marketing</option>
                    <option value="DATA & IT">Data & IT</option>
                    <option value="HSSE, MAINTENANCE & UTILITY">HSSE, Maintenance & Utility</option>
                    <option value="MANAGEMENT">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Status</label>
                  <select 
                    value={editingEmployee.status}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="PROBATIONARY">Probationary</option>
                    <option value="CONTRACTUAL">Contractual</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="TERMINATED">Terminated</option>
                    <option value="END_OF_CONTRACT">End of Contract</option>
                    <option value="AWOL">AWOL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">UnionBank Account No.</label>
                  <input 
                    type="text"
                    value={editingEmployee.unionBankNumber || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, unionBankNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input 
                    type="text"
                    value={editingEmployee.contactNumber || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Residential Address</label>
                <input 
                  type="text"
                  value={editingEmployee.residentialAddress || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, residentialAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
