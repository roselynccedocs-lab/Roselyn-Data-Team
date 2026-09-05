import React, { useState } from 'react';
import { Building2, CheckCircle2, Download, FileText, X } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface GovernmentContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GovernmentContributionModal({ isOpen, onClose }: GovernmentContributionModalProps) {
  const [agency, setAgency] = useState('SSS (Social Security System - Form R-3)');
  const [month, setMonth] = useState('August 2026');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Government Statutory Contributions</h3>
              <p className="text-xs text-slate-500">SSS, PhilHealth, Pag-IBIG & BIR eFPS Remittance Files</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Statutory Agency / Form</label>
              <select
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
              >
                <option>SSS (Social Security System - Form R-3 & R5)</option>
                <option>PhilHealth (Philippine Health Insurance - RF-1)</option>
                <option>Pag-IBIG Fund (HDMF - MCRF)</option>
                <option>BIR Monthly Withholding Tax (Form 1601-C)</option>
                <option>BIR Quarterly Income Tax (Form 1702-RT)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Applicable Period</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
              >
                <option>August 2026</option>
                <option>July 2026</option>
                <option>June 2026</option>
                <option>Q2 2026 Quarterly</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
              <span>Total Remittance Amount:</span>
              <span className="text-emerald-600 font-extrabold">{formatCurrency(48500)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Total Employees Included:</span>
              <span className="font-mono">142 Employees</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>File Format Generated:</span>
              <span className="font-mono">DAT / CSV / eFPS Ready</span>
            </div>
          </div>

          {downloaded && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Statutory remittance file successfully downloaded and validated for eFPS upload.
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
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export eFPS / DAT File
          </button>
        </div>
      </div>
    </div>
  );
}
