import React, { useState } from 'react';
import { DollarSign, CheckCircle2, FileText, X } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface LoanDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoanDeductionModal({ isOpen, onClose }: LoanDeductionModalProps) {
  const [loanType, setLoanType] = useState('SSS Salary Loan');
  const [amount, setAmount] = useState('25000');
  const [termMonths, setTermMonths] = useState('12');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const monthlyAmortization = (parseFloat(amount) || 0) / (parseInt(termMonths) || 12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Loans & Recurring Salary Deductions</h3>
              <p className="text-xs text-slate-500">Manage SSS, Pag-IBIG housing loans and company advances</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Employee</label>
            <select className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none">
              <option>Dr. Arnold Cortina (EMP-001)</option>
              <option>Maria Santos (EMP-002)</option>
              <option>Juan Dela Cruz (EMP-003)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Deduction / Loan Type</label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
            >
              <option>SSS Salary Loan</option>
              <option>Pag-IBIG Multi-Purpose Loan (MPL)</option>
              <option>Pag-IBIG Housing Loan</option>
              <option>Company Emergency Cash Advance</option>
              <option>HMO Dependent Premium Surcharge</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Principal Amount (PHP)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amortization Term (Months)</label>
              <select
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Computed Semi-Monthly Deduction:</span>
            <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(monthlyAmortization / 2)} / period</span>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Loan deduction successfully scheduled in payroll run.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Save & Schedule Deduction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
