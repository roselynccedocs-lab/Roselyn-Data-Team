import React, { useState } from 'react';
import { PerformanceScoreTransaction, PerformanceCategory } from '../../types/performance';
import { SEED_EMPLOYEES, PerformanceService } from '../../services/performanceService';
import { 
  FileText, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, ShieldCheck, ShieldAlert, History
} from 'lucide-react';

interface TransactionLedgerTableProps {
  transactions: PerformanceScoreTransaction[];
  onTransactionLogged: () => void;
  currentUserRole: string;
  currentUserId: string;
  currentUserName: string;
}

export function TransactionLedgerTable({
  transactions,
  onTransactionLogged,
  currentUserRole,
  currentUserId,
  currentUserName
}: TransactionLedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');

  // Manual Adjustment / Override Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(SEED_EMPLOYEES[0].id);
  const [category, setCategory] = useState<PerformanceCategory>('PRODUCTIVITY_ON_TIME');
  const [adjustmentVal, setAdjustmentVal] = useState<number>(0.10);
  const [reasonText, setReasonText] = useState('');
  const [refIdText, setRefIdText] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesEmp = employeeFilter === 'ALL' || t.employeeId === employeeFilter;

    return matchesSearch && matchesCategory && matchesEmp;
  });

  const handleLogTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = SEED_EMPLOYEES.find(e => e.id === selectedEmpId) || SEED_EMPLOYEES[0];
    
    // Find employee current latest score
    const empTxns = transactions.filter(t => t.employeeId === emp.id);
    const latestScore = empTxns.length > 0 ? empTxns[0].newScore : 94.5;

    await PerformanceService.logScoreTransaction(
      emp,
      category,
      Number(adjustmentVal),
      reasonText || 'Manual Score Adjustment Event',
      refIdText || `REF-${Date.now()}`,
      'QA/Admin Governance',
      currentUserId || 'ADMIN-01',
      currentUserName || 'System Admin',
      latestScore
    );

    setIsModalOpen(false);
    onTransactionLogged();
  };

  const getCategoryBadgeClass = (category: PerformanceCategory) => {
    if (category.startsWith('PRODUCTIVITY') || category === 'QA_TICKET_PASSED' || category === 'HR_STRENGTH_BONUS') {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    }
    if (category.startsWith('QUALITY') || category.startsWith('ATTENDANCE') || category.startsWith('DISCIPLINARY') || category === 'HR_WEAKNESS_DEDUCTION') {
      return 'bg-red-500/10 border-red-500/30 text-red-400';
    }
    return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">Continuous Performance Score Transaction Ledger</h3>
          </div>
          <p className="text-xs text-slate-400">Complete immutable audit trail of every positive/negative point adjustment across all company transactions</p>
        </div>

        {(currentUserRole === 'ADMIN' || currentUserRole === 'QA' || currentUserRole === 'HR' || currentUserRole === 'MANAGEMENT') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Score Event / Override</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search employee, reference ID, reason..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="PRODUCTIVITY_ON_TIME">Productivity On-Time</option>
            <option value="PRODUCTIVITY_AHEAD_DEADLINE">Productivity Ahead of Deadline</option>
            <option value="QUALITY_REJECTED">Quality Rejected</option>
            <option value="QUALITY_REWORK">Quality Rework Required</option>
            <option value="ATTENDANCE_LATENESS">Attendance Lateness</option>
            <option value="DISCIPLINARY_DA">Disciplinary Action</option>
            <option value="HR_STRENGTH_BONUS">HR Confirmed Strength</option>
            <option value="HR_WEAKNESS_DEDUCTION">HR Confirmed Weakness</option>
          </select>
        </div>

        <div>
          <select 
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Employees</option>
            {SEED_EMPLOYEES.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Timestamp & Ref</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Previous Score</th>
              <th className="py-3 px-4">Adjustment</th>
              <th className="py-3 px-4">New Score</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Reason / Description</th>
              <th className="py-3 px-4">Source & Authority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No performance score transactions match the current filters.
                </td>
              </tr>
            ) : (
              filteredTransactions.map(txn => {
                const isPositive = txn.adjustment > 0;
                return (
                  <tr key={txn.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      <div>{new Date(txn.timestamp).toLocaleString()}</div>
                      <div className="text-[10px] text-blue-400 font-semibold">{txn.referenceId}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">{txn.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{txn.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-400">
                      {txn.previousScore.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${
                        isPositive 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? `+${txn.adjustment.toFixed(2)}%` : `${txn.adjustment.toFixed(2)}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">
                      {txn.newScore.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${getCategoryBadgeClass(txn.category)}`}>
                        {txn.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={txn.reason}>
                      {txn.reason}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      <div>{txn.source}</div>
                      <div className="text-[10px] text-slate-500">By: {txn.createdByName}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Override Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Record Score Adjustment Event / Override</h3>
            <p className="text-xs text-slate-400 mb-4">Record a verified performance point transaction or QA/Admin override</p>

            <form onSubmit={handleLogTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Employee</label>
                <select 
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  {SEED_EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Adjustment Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  >
                    <option value="PRODUCTIVITY_ON_TIME">Productivity On-Time (+0.10%)</option>
                    <option value="PRODUCTIVITY_AHEAD_DEADLINE">Ahead of Deadline (+0.15%)</option>
                    <option value="QUALITY_REJECTED">QA Rejected (-0.10%)</option>
                    <option value="QUALITY_REWORK">QA Rework (-0.05%)</option>
                    <option value="ATTENDANCE_LATENESS">1 Hour Late (-0.01%)</option>
                    <option value="DISCIPLINARY_DA">Disciplinary Action (-15.0%)</option>
                    <option value="HR_STRENGTH_BONUS">HR Strength Bonus (+20.0%)</option>
                    <option value="HR_WEAKNESS_DEDUCTION">HR Weakness Deduction (-10.0%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Point Adjustment (%)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={adjustmentVal}
                    onChange={e => setAdjustmentVal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Transaction Reference / Ticket ID</label>
                <input 
                  type="text"
                  value={refIdText}
                  onChange={e => setRefIdText(e.target.value)}
                  placeholder="e.g. REQ-2026-00921"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Reason for Score Adjustment</label>
                <textarea 
                  rows={2}
                  value={reasonText}
                  onChange={e => setReasonText(e.target.value)}
                  placeholder="State the exact transaction event or audit justification..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
