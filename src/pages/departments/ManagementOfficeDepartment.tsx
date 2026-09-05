import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Printer, 
  Download, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Layers, 
  Send, 
  X, 
  Check, 
  XCircle, 
  FileCheck, 
  Crown,
  ChevronRight,
  Filter
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

interface ExecutiveDirective {
  id: string;
  refNo: string;
  title: string;
  category: 'Financial Approval' | 'Capital Expenditure' | 'Policy Change' | 'Strategic Partnership' | 'HR & Personnel';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  targetDept: string;
  signatory: string;
  status: 'PENDING APPROVAL' | 'APPROVED & ISSUED' | 'UNDER BOARD REVIEW' | 'EXECUTION IN PROGRESS' | 'REJECTED';
  dateIssued: string;
  deadline: string;
  description: string;
}

interface BoardResolution {
  id: string;
  resNo: string;
  title: string;
  category: string;
  effectiveDate: string;
  status: 'RATIFIED' | 'DRAFT' | 'IN_EFFECT';
  signatories: string[];
  summary: string;
}

export function ManagementOfficeDepartment() {
  const [activeSubTab, setActiveTab] = useState<'directives' | 'resolutions' | 'roster' | 'kpis'>('directives');

  // Search & Filters
  const [directiveSearch, setDirectiveSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Sample Executive Directives State
  const [directives, setDirectives] = useState<ExecutiveDirective[]>([
    {
      id: 'ED-2026-001',
      refNo: 'CCE-DIR-2026-01',
      title: 'FY2027 Capital Outlay Allocation for Laguna Plant Expansion',
      category: 'Capital Expenditure',
      priority: 'CRITICAL',
      targetDept: 'OPERATIONS & DELIVERY',
      signatory: 'Apolo Perez Jr. (Owner & Executive Director)',
      status: 'APPROVED & ISSUED',
      dateIssued: 'Aug 15, 2026',
      deadline: 'Sep 30, 2026',
      description: 'Authorization of ₱15,000,000 budget for automated chemical reactor vessels and high-capacity storage drums at the Laguna plant facility.'
    },
    {
      id: 'ED-2026-002',
      refNo: 'CCE-DIR-2026-02',
      title: 'Executive Approval of Q3 Corporate Performance KPIs & Incentive Pool',
      category: 'HR & Personnel',
      priority: 'HIGH',
      targetDept: 'HUMAN RESOURCE AND ADMIN',
      signatory: 'Vanessa Perez (Finance & Admin Manager)',
      status: 'APPROVED & ISSUED',
      dateIssued: 'Aug 20, 2026',
      deadline: 'Sep 15, 2026',
      description: 'Formal sign-off on Q3 employee bonus distribution formula, performance matrix weights, and 201 roster regularization adjustments.'
    },
    {
      id: 'ED-2026-003',
      refNo: 'CCE-DIR-2026-03',
      title: 'Regional Chemical Distribution Agreement with Apex Distributors',
      category: 'Strategic Partnership',
      priority: 'HIGH',
      targetDept: 'SALES & MARKETING',
      signatory: 'Apolo Perez Jr. & Jovelyn Abainza',
      status: 'PENDING APPROVAL',
      dateIssued: 'Sep 01, 2026',
      deadline: 'Sep 20, 2026',
      description: 'Exclusive 3-year distribution agreement for Visayas and Mindanao chemical supply contracts valued at ₱48,000,000 annually.'
    },
    {
      id: 'ED-2026-004',
      refNo: 'CCE-DIR-2026-04',
      title: 'Implementation of ISO 9001:2015 & Chemical Safety Auditing Standard',
      category: 'Policy Change',
      priority: 'MEDIUM',
      targetDept: 'HSSE, MAINTENANCE & UTILITY',
      signatory: 'Ma. Katrina Paula Ilagan (Executive Assistant)',
      status: 'EXECUTION IN PROGRESS',
      dateIssued: 'Aug 28, 2026',
      deadline: 'Oct 15, 2026',
      description: 'Mandatory quarterly audit of hazard material handling, MSDS digital logs, and warehouse biometric access protocols.'
    }
  ]);

  // Board Resolutions State
  const [resolutions] = useState<BoardResolution[]>([
    {
      id: 'BR-01',
      resNo: 'BR-2026-089',
      title: 'Resolution Authorizing Corporate Treasury Bank Accounts at BPI & BDO',
      category: 'Corporate Finance',
      effectiveDate: 'Jan 10, 2026',
      status: 'RATIFIED',
      signatories: ['Apolo Perez Jr.', 'Vanessa Perez', 'Ma. Katrina Paula Ilagan'],
      summary: 'Re-authorization of official signatories for corporate banking operations, multi-currency credit lines, and payroll disbursement accounts.'
    },
    {
      id: 'BR-02',
      resNo: 'BR-2026-090',
      title: 'Resolution Adopting Enterprise Asset Management & Biometric Systems',
      category: 'IT & Infrastructure',
      effectiveDate: 'Mar 15, 2026',
      status: 'RATIFIED',
      signatories: ['Apolo Perez Jr.', 'Arnold Cortina'],
      summary: 'Mandating centralized QR code asset tagging, real-time inventory threshold alerts, and biometric attendance logs across all depots.'
    },
    {
      id: 'BR-03',
      resNo: 'BR-2026-091',
      title: 'Resolution Establishing Management Office Directives & Task Monitoring',
      category: 'Governance',
      effectiveDate: 'Jun 01, 2026',
      status: 'IN_EFFECT',
      signatories: ['Apolo Perez Jr.', 'Vanessa Perez', 'Roxane Pamittan'],
      summary: 'Establishment of real-time task monitoring pipelines, schedule approval deadlines, and department performance grading matrix.'
    }
  ]);

  // Modals state
  const [showDirectiveModal, setShowDirectiveModal] = useState(false);
  const [newDirective, setNewDirective] = useState<Partial<ExecutiveDirective>>({
    title: '',
    category: 'Financial Approval',
    priority: 'HIGH',
    targetDept: 'OPERATIONS & DELIVERY',
    signatory: 'Apolo Perez Jr. (Owner & Executive Director)',
    deadline: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    description: ''
  });

  // Handle Directive Creation
  const handleCreateDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirective.title || !newDirective.description) return;

    const count = directives.length + 1;
    const item: ExecutiveDirective = {
      id: `ED-2026-00${count}`,
      refNo: `CCE-DIR-2026-0${count}`,
      title: newDirective.title || '',
      category: newDirective.category || 'Financial Approval',
      priority: newDirective.priority || 'HIGH',
      targetDept: newDirective.targetDept || 'OPERATIONS & DELIVERY',
      signatory: newDirective.signatory || 'Ma. Katrina Paula Ilagan (Executive Assistant)',
      status: 'PENDING APPROVAL',
      dateIssued: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      deadline: newDirective.deadline || '',
      description: newDirective.description || ''
    };

    setDirectives([item, ...directives]);
    setShowDirectiveModal(false);
    setNewDirective({
      title: '',
      category: 'Financial Approval',
      priority: 'HIGH',
      targetDept: 'OPERATIONS & DELIVERY',
      signatory: 'Apolo Perez Jr. (Owner & Executive Director)',
      deadline: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      description: ''
    });
  };

  // Status badge style helper
  const getStatusBadge = (status: ExecutiveDirective['status']) => {
    switch (status) {
      case 'APPROVED & ISSUED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'PENDING APPROVAL':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'EXECUTION IN PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
      case 'UNDER BOARD REVIEW':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
    }
  };

  // Filtered directives
  const filteredDirectives = directives.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(directiveSearch.toLowerCase()) ||
                          d.refNo.toLowerCase().includes(directiveSearch.toLowerCase()) ||
                          d.targetDept.toLowerCase().includes(directiveSearch.toLowerCase()) ||
                          d.signatory.toLowerCase().includes(directiveSearch.toLowerCase());
    const matchesCat = categoryFilter === 'All Categories' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Primary Department Header with Top-Level Sub-Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 p-1 bg-blue-600/10 text-blue-600 rounded-lg" /> Management Office
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Executive Suite, Board Governance, Policy Directives & Cross-Departmental Oversight.</p>
          </div>

          <div className="flex items-center gap-3">
            <SubmitSupportButton departmentName="Management Office" />
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('directives')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'directives'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" /> Executive Directives
            </button>

            <button
              onClick={() => setActiveTab('resolutions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'resolutions'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Board Resolutions
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'roster'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Executive Office Roster
            </button>

            <button
              onClick={() => setActiveTab('kpis')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'kpis'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" /> Executive Scorecard
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* SUB-TAB 1: EXECUTIVE DIRECTIVES */}
      {activeSubTab === 'directives' && (
        <div className="space-y-6">
          {/* KPI Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE DIRECTIVES</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{directives.length}</p>
                <span className="text-[10px] text-blue-600 font-semibold">Across 8 Departments</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PENDING SIGN-OFF</span>
                <p className="text-2xl font-black text-amber-600 font-mono mt-1">
                  {directives.filter(d => d.status === 'PENDING APPROVAL').length}
                </p>
                <span className="text-[10px] text-amber-600 font-semibold">Requires Executive Review</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RATIFIED RESOLUTIONS</span>
                <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{resolutions.length}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Board Approved</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">COMPLIANCE RATE</span>
                <p className="text-2xl font-black text-indigo-600 font-mono mt-1">98.5%</p>
                <span className="text-[10px] text-indigo-600 font-semibold">On-time Completion</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Directives Table Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search directives, ref numbers, department..."
                    value={directiveSearch}
                    onChange={(e) => setDirectiveSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option>All Categories</option>
                  <option>Financial Approval</option>
                  <option>Capital Expenditure</option>
                  <option>Policy Change</option>
                  <option>Strategic Partnership</option>
                  <option>HR & Personnel</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" /> Print Table
                </button>
                <button
                  onClick={() => setShowDirectiveModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Issue Directive
                </button>
              </div>
            </div>

            {/* Directives List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDirectives.map((directive) => (
                <div key={directive.id} className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                        {directive.refNo}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(directive.status)}`}>
                        {directive.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        directive.priority === 'CRITICAL' 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' 
                          : directive.priority === 'HIGH' 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/50' 
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {directive.priority} PRIORITY
                      </span>
                      <span className="text-xs text-slate-400">• Category: <strong className="text-slate-700 dark:text-slate-300">{directive.category}</strong></span>
                    </div>

                    <div className="text-xs text-slate-400 font-medium">
                      Issued: <strong className="text-slate-700 dark:text-slate-300">{directive.dateIssued}</strong> | Deadline: <strong className="text-rose-600">{directive.deadline}</strong>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {directive.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {directive.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-4 text-slate-500">
                      <span>Target Department: <strong className="text-slate-800 dark:text-slate-200">{directive.targetDept}</strong></span>
                      <span>Signatory: <strong className="text-slate-800 dark:text-slate-200">{directive.signatory}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {directive.status === 'PENDING APPROVAL' && (
                        <button
                          onClick={() => {
                            setDirectives(directives.map(d => d.id === directive.id ? { ...d, status: 'APPROVED & ISSUED' } : d));
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Sign
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Viewing complete dossier for ${directive.refNo}...`)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BOARD RESOLUTIONS & POLICIES */}
      {activeSubTab === 'resolutions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" /> Official Board of Directors Resolutions Repository
              </h2>
              <p className="text-xs text-slate-500 mt-1">Ratified corporate resolutions, banking authority minutes, and binding policy frameworks.</p>
            </div>
            <button
              onClick={() => alert('Resolution Drafting Tool initialized.')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Draft Board Resolution
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resolutions.map((res) => (
              <div key={res.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg">
                      {res.resNo}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-[10px] rounded-full">
                      {res.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {res.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Board Signatories</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {res.signatories.join(' • ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-slate-400">
                    <span>Effective: <strong className="text-slate-700 dark:text-slate-300">{res.effectiveDate}</strong></span>
                    <button 
                      onClick={() => alert(`Downloading Certified Copy of ${res.resNo}...`)}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXECUTIVE OFFICE ROSTER */}
      {activeSubTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Management Office Executive Directory
            </h2>
            <p className="text-xs text-slate-500 mt-1">Executive Officers, Directors, and Administrative Assistants for Centaur Chem Corporation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Officer 1: Apolo Perez Jr. */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                  AP
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Apolo Perez Jr.</h3>
                  <p className="text-xs font-bold text-blue-600">Owner & Executive Director</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Emp ID: 2016-CCE001</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Tenure / Service:</span>
                  <strong className="text-slate-900 dark:text-white">10 Years, 4 Months</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Email:</span>
                  <a href="mailto:acpjr29@gmail.com" className="text-blue-600 font-semibold hover:underline">acpjr29@gmail.com</a>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Contact No:</span>
                  <strong className="text-slate-900 dark:text-white">09989985884</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Executive HMO:</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded">MANAGERS & UP</span>
                </div>
              </div>
            </div>

            {/* Officer 2: Vanessa Perez */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                  VP
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Vanessa Perez</h3>
                  <p className="text-xs font-bold text-purple-600">Finance & Admin Manager</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Emp ID: 2016-CCE002</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Tenure / Service:</span>
                  <strong className="text-slate-900 dark:text-white">10 Years, 4 Months</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Email:</span>
                  <a href="mailto:perezvanessat@gmail.com" className="text-blue-600 font-semibold hover:underline">perezvanessat@gmail.com</a>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Contact No:</span>
                  <strong className="text-slate-900 dark:text-white">09989718258</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Executive HMO:</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold text-[10px] rounded">MANAGERS & UP</span>
                </div>
              </div>
            </div>

            {/* Officer 3: Ma. Katrina Paula Ilagan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                  KI
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Ma. Katrina Paula Ilagan</h3>
                  <p className="text-xs font-bold text-emerald-600">Executive Assistant</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Emp ID: 2025-CCE084</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Status:</span>
                  <strong className="text-emerald-600 font-bold">REGULAR</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Email:</span>
                  <a href="mailto:ilagankatrina.cce.docs@gmail.com" className="text-blue-600 font-semibold hover:underline">ilagankatrina.cce.docs@gmail.com</a>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Contact No:</span>
                  <strong className="text-slate-900 dark:text-white">09658422492</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Person In Charge:</span>
                  <strong className="text-slate-900 dark:text-white">Roxane Pamittan</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INTER-DEPARTMENTAL EXECUTIVE SCORECARD */}
      {activeSubTab === 'kpis' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Executive Scorecard & Cross-Department Health
              </h2>
              <p className="text-xs text-slate-500 mt-1">Real-time SLA completion rates, operational metrics, and executive grades for all 8 departments.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-indigo-400" /> Print Executive Scorecard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { dept: 'Management Office', grade: 'A+', pass: 98, fail: 2, tasks: 48, status: 'EXCELLENT' },
              { dept: 'Human Resources', grade: 'A', pass: 94, fail: 6, tasks: 124, status: 'HIGH PERFORMANCE' },
              { dept: 'Operations & Delivery', grade: 'A', pass: 92, fail: 8, tasks: 310, status: 'HIGH PERFORMANCE' },
              { dept: 'Sales & Marketing', grade: 'B+', pass: 88, fail: 12, tasks: 215, status: 'GOOD' },
              { dept: 'Asset & Data', grade: 'A+', pass: 99, fail: 1, tasks: 258, status: 'EXCELLENT' },
              { dept: 'Purchasing & Logistics', grade: 'A', pass: 95, fail: 5, tasks: 180, status: 'HIGH PERFORMANCE' },
              { dept: 'IT Department', grade: 'A+', pass: 97, fail: 3, tasks: 92, status: 'EXCELLENT' },
              { dept: 'Finance & Treasury', grade: 'A+', pass: 98, fail: 2, tasks: 165, status: 'EXCELLENT' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{item.dept}</span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs rounded-lg font-mono">
                    Grade {item.grade}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>SLA On-time Rate:</span>
                    <strong className="text-emerald-600">{item.pass}%</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${item.pass}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{item.tasks} total tasks logged</span>
                  <span className="font-bold text-indigo-600">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ISSUE DIRECTIVE MODAL */}
      {showDirectiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" /> Issue Executive Directive
              </h3>
              <button 
                onClick={() => setShowDirectiveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirective} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Directive Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Chemical Waste Inventory Audit for Q3"
                  value={newDirective.title}
                  onChange={(e) => setNewDirective({ ...newDirective, title: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newDirective.category}
                    onChange={(e) => setNewDirective({ ...newDirective, category: e.target.value as any })}
                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    <option>Financial Approval</option>
                    <option>Capital Expenditure</option>
                    <option>Policy Change</option>
                    <option>Strategic Partnership</option>
                    <option>HR & Personnel</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                  <select
                    value={newDirective.priority}
                    onChange={(e) => setNewDirective({ ...newDirective, priority: e.target.value as any })}
                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Department</label>
                  <select
                    value={newDirective.targetDept}
                    onChange={(e) => setNewDirective({ ...newDirective, targetDept: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    <option>OPERATIONS & DELIVERY</option>
                    <option>HUMAN RESOURCE AND ADMIN</option>
                    <option>PURCHASING & LOGISTICS</option>
                    <option>SALES & MARKETING</option>
                    <option>FINANCE</option>
                    <option>DATA & IT</option>
                    <option>HSSE, MAINTENANCE & UTILITY</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Execution Deadline</label>
                  <input
                    type="date"
                    value={newDirective.deadline}
                    onChange={(e) => setNewDirective({ ...newDirective, deadline: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Detailed Instructions / Directives *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide explicit operational parameters, milestone checkpoints, and sign-off requirements..."
                  value={newDirective.description}
                  onChange={(e) => setNewDirective({ ...newDirective, description: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDirectiveModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Issue Executive Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagementOfficeDepartment;
