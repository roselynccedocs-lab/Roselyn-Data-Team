import React, { useMemo, useState, useEffect } from 'react';
import { MasterRecordDocument, MasterRequestDocument, AuditLogEntry } from '../../types/masterData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Activity, Users, CheckCircle, Target, Clock, Star, ArrowUpRight, ArrowDownRight, BookOpen, Shield,
  Award, Lock, Settings, FileText, Zap, AlertTriangle, Plus, RefreshCw, UserCheck, Eye
} from 'lucide-react';

import { 
  PerformanceUserRole, 
  PerformanceScoreTransaction, 
  Evaluation360, 
  StrengthWeaknessItem, 
  DisciplinaryRecord, 
  AwardRecommendation, 
  QuarterLockState,
  EmployeePerformanceProfile,
  EndUserAccessPermissions
} from '../../types/performance';

import { 
  PerformanceService, 
  SEED_EMPLOYEES,
  DEFAULT_END_USER_PERMISSIONS
} from '../../services/performanceService';

import { Evaluation360Modal } from '../performance/Evaluation360Modal';
import { TransactionLedgerTable } from '../performance/TransactionLedgerTable';
import { DisciplinaryAndAttendanceModal } from '../performance/DisciplinaryAndAttendanceModal';
import { StrengthsWeaknessesPanel } from '../performance/StrengthsWeaknessesPanel';
import { AwardsEngineView } from '../performance/AwardsEngineView';
import { AdminRulesConfigModal } from '../performance/AdminRulesConfigModal';
import { QuarterLockModal } from '../performance/QuarterLockModal';
import { AnnualReportModal } from '../performance/AnnualReportModal';
import { AccessControlModal } from '../performance/AccessControlModal';
import { DisputeAppealModal } from '../performance/DisputeAppealModal';
import { ExplainScoreModal } from '../performance/ExplainScoreModal';

interface EmployeeKPIDashboardProps {
  requests: MasterRequestDocument[];
  masterRecords: MasterRecordDocument[];
}

const QUARTERS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Full Year 2026'];
const DEPT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

export function EmployeeKPIDashboard({ requests, masterRecords }: EmployeeKPIDashboardProps) {
  // Navigation & Role State
  const [userRole, setUserRole] = useState<PerformanceUserRole>('HR');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('EMP-1001'); // Default Juan Dela Cruz
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3 2026');
  const [activeSubTab, setActiveSubTab] = useState<'DASHBOARD' | 'LEDGER' | 'EVALUATIONS_360' | 'STRENGTHS_WEAKNESSES' | 'AWARDS'>('DASHBOARD');

  // Modal Visibility States
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);
  const [isDiscModalOpen, setIsDiscModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isQuarterLockModalOpen, setIsQuarterLockModalOpen] = useState(false);
  const [isAnnualReportModalOpen, setIsAnnualReportModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  // Async Loaded Data from PerformanceService
  const [transactions, setTransactions] = useState<PerformanceScoreTransaction[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation360[]>([]);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState<StrengthWeaknessItem[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([]);
  const [quarterLocks, setQuarterLocks] = useState<QuarterLockState[]>([]);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeePerformanceProfile | null>(null);
  const [endUserPermissions, setEndUserPermissions] = useState<EndUserAccessPermissions>(DEFAULT_END_USER_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data
  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      const [txns, evals, sw, disc, locks, prof, perms] = await Promise.all([
        PerformanceService.getTransactions(),
        PerformanceService.get360Evaluations(),
        PerformanceService.getStrengthsAndWeaknesses(),
        PerformanceService.getDisciplinaryRecords(),
        PerformanceService.getQuarterLocks(),
        PerformanceService.getEmployeePerformanceProfile(selectedEmployeeId, selectedQuarter),
        PerformanceService.getEndUserPermissions()
      ]);

      setTransactions(txns);
      setEvaluations(evals);
      setStrengthsWeaknesses(sw);
      setDisciplinaryRecords(disc);
      setQuarterLocks(locks);
      setEmployeeProfile(prof);
      setEndUserPermissions(perms);
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, [selectedEmployeeId, selectedQuarter]);

  // Handle Employee Selection changes
  const activeEmployee = SEED_EMPLOYEES.find(e => e.id === selectedEmployeeId) || SEED_EMPLOYEES[0];

  // Department Distribution data for Donut Chart
  const departmentData = useMemo(() => {
    return [
      { name: 'Operations', value: 93.8 },
      { name: 'Quality Assurance', value: 96.2 },
      { name: 'Master Data', value: 92.5 },
      { name: 'Compliance & Audit', value: 94.0 },
      { name: 'Finance & Supply Chain', value: 90.1 }
    ];
  }, []);

  // Multi-Quarter Trend Data
  const trendData = useMemo(() => {
    if (!employeeProfile) return [];
    return [
      { name: 'Q1', employee: employeeProfile.quarterlyScores.Q1, average: 88.5 },
      { name: 'Q2', employee: employeeProfile.quarterlyScores.Q2, average: 90.0 },
      { name: 'Q3', employee: employeeProfile.quarterlyScores.Q3, average: 91.2 },
      { name: 'Q4', employee: 0, average: 0 }
    ];
  }, [employeeProfile]);

  const handleApproveAward = (awardId: string) => {
    if (!employeeProfile) return;
    const updated = employeeProfile.awardEligibility.map(a => {
      if (a.id === awardId) return { ...a, approvedByHR: true };
      return a;
    });
    setEmployeeProfile({ ...employeeProfile, awardEligibility: updated });
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 p-3 md:p-6 bg-[#030712] rounded-3xl min-h-screen text-slate-100">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                AUTOMATED EMPLOYEE PERFORMANCE & 360° EVALUATION SYSTEM
              </h2>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-0.5">
                Continuous Transaction Score Calculations • Audit Ledger • 180°/360° Appraisals
              </p>
            </div>
          </div>
        </div>

        {/* Role & Selection Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* RBAC Role Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-bold mr-2 uppercase text-[10px]">Role View:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as PerformanceUserRole)}
              className="bg-transparent text-slate-100 font-bold outline-none cursor-pointer"
            >
              <option value="HR" className="bg-slate-900">HR Director / Admin</option>
              <option value="EMPLOYEE" className="bg-slate-900">Employee Self-View</option>
              <option value="MANAGER" className="bg-slate-900">Department Manager</option>
              <option value="TEAM_LEAD" className="bg-slate-900">Team Lead</option>
              <option value="QA" className="bg-slate-900">QA Reviewer</option>
              <option value="MANAGEMENT" className="bg-slate-900">Executive Management</option>
            </select>
          </div>

          {/* Employee Selector (Hidden if Employee self-view) */}
          {userRole !== 'EMPLOYEE' && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-bold mr-2 uppercase text-[10px]">Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-transparent text-slate-100 font-bold outline-none cursor-pointer"
              >
                {SEED_EMPLOYEES.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900">
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quarter Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-transparent text-slate-100 font-bold outline-none cursor-pointer"
            >
              {QUARTERS.map(q => (
                <option key={q} value={q} className="bg-slate-900">{q}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={loadPerformanceData}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
            title="Refresh Performance Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* End-User Self-Service Welcome Banner */}
      {userRole === 'EMPLOYEE' && (
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Welcome, {activeEmployee.name}! (Employee Self-Service Portal)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Here is your Q3 2026 continuous performance evaluation, SLA score calculation, and 360° feedback card.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
              ✓ QA Verified
            </span>
            {endUserPermissions.allowSubmit360Evaluations && (
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg">
                ★ 360° Appraisals Open
              </span>
            )}
            {endUserPermissions.allowViewLedgerHistory && (
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg">
                📋 Audit Ledger Active
              </span>
            )}
            {endUserPermissions.allowSubmitReworkDispute && (
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 rounded-lg flex items-center gap-1 font-bold transition"
              >
                <Shield className="w-3 h-3" />
                <span>Submit Score Dispute ⚖️</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button 
            onClick={() => setActiveSubTab('DASHBOARD')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'DASHBOARD' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Overview & Analytics
          </button>
          <button 
            onClick={() => setActiveSubTab('LEDGER')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'LEDGER' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ledger Audit Trail ({transactions.length})
          </button>
          <button 
            onClick={() => setActiveSubTab('STRENGTHS_WEAKNESSES')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'STRENGTHS_WEAKNESSES' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Strengths & Weaknesses
          </button>
          <button 
            onClick={() => setActiveSubTab('AWARDS')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'AWARDS' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Award Recommendations 🏆
          </button>
        </div>

        {/* Quick Action Trigger Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {(endUserPermissions.allowSubmit360Evaluations || userRole !== 'EMPLOYEE') && (
            <button 
              onClick={() => setIs360ModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium flex items-center gap-1.5 transition"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Submit 360° Eval</span>
            </button>
          )}

          {/* Access Control Settings (QA & Admin ONLY) */}
          {(userRole === 'QA' || userRole === 'ADMIN') && (
            <button 
              onClick={() => setIsAccessModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl flex items-center gap-1.5 transition"
              title="Configure permissions for end users (QA & Admin only)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Access Permissions 🔐</span>
            </button>
          )}

          {(userRole === 'HR' || userRole === 'ADMIN' || userRole === 'QA' || userRole === 'MANAGEMENT') && (
            <>
              <button 
                onClick={() => setIsDiscModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Disciplinary / Attendance</span>
              </button>

              <button 
                onClick={() => setIsQuarterLockModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium flex items-center gap-1.5 transition"
              >
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Lock Quarter 🔒</span>
              </button>

              <button 
                onClick={() => setIsRulesModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium flex items-center gap-1.5 transition"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Scoring Rules</span>
              </button>
            </>
          )}

          <button 
            onClick={() => setIsExplainModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold rounded-xl flex items-center gap-1.5 transition"
            title="View mathematical breakdown of your calculated score"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Explain My Performance Score 🔍</span>
          </button>

          {(endUserPermissions.allowExportReportCard || userRole !== 'EMPLOYEE') && (
            <button 
              onClick={() => setIsAnnualReportModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Annual Report Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content Display */}
      {activeSubTab === 'LEDGER' ? (
        <TransactionLedgerTable 
          transactions={transactions}
          onTransactionLogged={loadPerformanceData}
          currentUserRole={userRole}
          currentUserId="EMP-1002"
          currentUserName="Maria Santos"
        />
      ) : activeSubTab === 'STRENGTHS_WEAKNESSES' ? (
        <StrengthsWeaknessesPanel 
          items={strengthsWeaknesses.filter(sw => sw.employeeId === selectedEmployeeId)}
          employeeName={activeEmployee.name}
          onUpdated={loadPerformanceData}
          currentUserRole={userRole}
          currentUserId="EMP-1002"
          currentUserName="Maria Santos"
        />
      ) : activeSubTab === 'AWARDS' ? (
        <AwardsEngineView 
          awards={employeeProfile?.awardEligibility || []}
          onApproveAward={handleApproveAward}
          currentUserRole={userRole}
        />
      ) : (
        /* Overview & Analytics Dashboard */
        <div className="space-y-6">
          {/* Executive KPI Metric Cards */}
          {employeeProfile && (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Performance</span>
                <div className="text-3xl font-black text-white font-mono mt-1">{employeeProfile.overallScore}%</div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mt-2">{employeeProfile.level}</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Productivity (30%)</span>
                <div className="text-3xl font-black text-blue-400 font-mono mt-1">{employeeProfile.scores.productivity}%</div>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">On-Time SLA Completion</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quality & Accuracy (20%)</span>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1">{employeeProfile.scores.quality}%</div>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Rework Rate: {employeeProfile.reworkRate}%</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance (10%)</span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{employeeProfile.scores.attendance}%</div>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Biometric Verified</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Behavior & Teamwork</span>
                <div className="text-3xl font-black text-indigo-400 font-mono mt-1">{employeeProfile.scores.behavior}%</div>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Manager & Peer Ratings</span>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HR Development (5%)</span>
                <div className="text-3xl font-black text-purple-400 font-mono mt-1">{employeeProfile.scores.hrDevelopment}%</div>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">HR Confirmed Milestones</span>
              </div>
            </div>
          )}

          {/* Split Layout: 7 Dimensions Breakdown + Trend & Department Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Col: 7 Dimension Breakdown */}
            <div className="xl:col-span-1 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>7-Dimension Performance Score Breakdown</span>
              </h3>

              {employeeProfile && (
                <div className="space-y-4 text-xs">
                  <ProgressRow label="Productivity & Task Completion (30%)" value={employeeProfile.scores.productivity} color="bg-blue-500" />
                  <ProgressRow label="Quality & Accuracy Rate (20%)" value={employeeProfile.scores.quality} color="bg-amber-500" />
                  <ProgressRow label="Attendance & Punctuality (10%)" value={employeeProfile.scores.attendance} color="bg-emerald-500" />
                  <ProgressRow label="Behavior & Teamwork (15%)" value={employeeProfile.scores.behavior} color="bg-indigo-500" />
                  <ProgressRow label="Manager Evaluation (10%)" value={employeeProfile.scores.managerEvaluation} color="bg-purple-500" />
                  <ProgressRow label="Peer 360° Evaluation (10%)" value={employeeProfile.scores.peerEvaluation} color="bg-pink-500" />
                  <ProgressRow label="HR Professional Development (5%)" value={employeeProfile.scores.hrDevelopment} color="bg-teal-500" />
                </div>
              )}
            </div>

            {/* Right Col: Charts Grid */}
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart: Department Performance */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
                  <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-4 w-full text-center">
                    Department Performance Score Comparison
                  </h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Area Chart: Multi-Quarter Trend */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-4">
                    Multi-Quarter Performance Trend
                  </h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} domain={[70, 100]} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="employee" name="Employee Score" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorEmp)" />
                        <Line type="monotone" dataKey="average" name="Dept Average" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Award Recommendation Cards preview */}
              {employeeProfile && employeeProfile.awardEligibility.length > 0 && (
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span>System Generated Award Candidate Highlights</span>
                    </h3>
                    <button 
                      onClick={() => setActiveSubTab('AWARDS')}
                      className="text-xs text-blue-400 hover:underline font-semibold"
                    >
                      View All Recommendations →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeeProfile.awardEligibility.slice(0, 2).map(award => (
                      <div key={award.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-slate-100">{award.awardTitle}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {award.eligibilityStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{award.awardDescription}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Evaluation360Modal 
        isOpen={is360ModalOpen}
        onClose={() => setIs360ModalOpen(false)}
        currentUserRole={userRole}
        currentUserId="EMP-1002"
        currentUserName="Maria Santos"
        onSubmitted={loadPerformanceData}
      />

      <DisciplinaryAndAttendanceModal 
        isOpen={isDiscModalOpen}
        onClose={() => setIsDiscModalOpen(false)}
        disciplinaryRecords={disciplinaryRecords}
        transactions={transactions}
        onUpdated={loadPerformanceData}
        currentUserId="EMP-1002"
        currentUserName="Maria Santos"
      />

      <AdminRulesConfigModal 
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onSaved={loadPerformanceData}
      />

      <QuarterLockModal 
        isOpen={isQuarterLockModalOpen}
        onClose={() => setIsQuarterLockModalOpen(false)}
        quarterLocks={quarterLocks}
        onLocked={loadPerformanceData}
        currentUserName="Maria Santos"
      />

      <AccessControlModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onSaved={loadPerformanceData}
        currentUserName="QA / Admin"
      />

      <DisputeAppealModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        transactions={transactions}
        currentUserId={activeEmployee.id}
        currentUserName={activeEmployee.name}
        onSubmitted={loadPerformanceData}
      />

      {employeeProfile && (
        <>
          <AnnualReportModal 
            isOpen={isAnnualReportModalOpen}
            onClose={() => setIsAnnualReportModalOpen(false)}
            profile={employeeProfile}
          />
          <ExplainScoreModal
            isOpen={isExplainModalOpen}
            onClose={() => setIsExplainModalOpen(false)}
            profile={employeeProfile}
            transactions={transactions}
          />
        </>
      )}
    </div>
  );
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-[11px]">
        <span className="font-semibold text-slate-400">{label}</span>
        <span className="font-mono font-bold text-slate-100">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
