import React, { useState } from 'react';
import { Calculator, CheckCircle2, DollarSign, Building2, X, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface PayrollProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PayrollProcessModal({ isOpen, onClose }: PayrollProcessModalProps) {
  const [selectedBranch, setSelectedBranch] = useState('All Branches (Consolidated)');
  const [payPeriod, setPayPeriod] = useState('August 16 - 31, 2026');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Branch Payroll Processing</h3>
              <p className="text-xs text-slate-500">Automated tax, SSS, PhilHealth & Lighten ERP Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Branch / Plant</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
              >
                <option>All Branches (Consolidated)</option>
                <option>BGC Taguig HQ (Corporate & R&D)</option>
                <option>Laguna Chemical Manufacturing Plant</option>
                <option>Cebu Distribution & Warehousing</option>
                <option>Davao Cold Storage Facility</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payroll Cycle / Period</label>
              <select
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
              >
                <option>August 16 - 31, 2026 (Semi-Monthly)</option>
                <option>September 1 - 15, 2026 (Semi-Monthly)</option>
                <option>August 2026 (Full Monthly)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Calculation Parameters & Rules</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Biometric Time In/Out Integration</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Overtime & Night Diff Computed</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SSS, PhilHealth, Pag-IBIG Matrix</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Lighten ERP Journal Entry Sync</div>
            </div>
          </div>

          {completed && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payroll Successfully Computed & Posted to Lighten Accounting!
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Total Net Payroll: {formatCurrency(2450000)} across 142 employees. EPayslips generated and emailed.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleProcess}
            disabled={processing}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <Calculator className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Processing Payroll & Ledger...' : 'Run & Post Payroll'}
          </button>
        </div>
      </div>
    </div>
  );
}
