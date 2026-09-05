import React, { useState } from 'react';
import { Scale, CheckCircle2, Plus, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JournalEntryModal({ isOpen, onClose }: JournalEntryModalProps) {
  const [description, setDescription] = useState('Purchase of Laboratory Reagents from Merck Supplier');
  const [entries, setEntries] = useState([
    { account: '1010 - Cash in Bank (BPI Corporate)', debit: 0, credit: 50000 },
    { account: '1520 - Inventory (Raw Chemical Stock)', debit: 50000, credit: 0 },
  ]);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const totalDebit = entries.reduce((s, e) => s + Number(e.debit || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + Number(e.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">General Ledger Journal Entry</h3>
              <p className="text-xs text-slate-500">Double-entry bookkeeping with automated trial balance sync</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Transaction Particulars / Memo</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Journal Lines (Debits & Credits)</span>
              <button
                type="button"
                onClick={() => setEntries([...entries, { account: '2010 - Accounts Payable', debit: 0, credit: 0 }])}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {entries.map((entry, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={entry.account}
                    onChange={(e) => {
                      const updated = [...entries];
                      updated[idx].account = e.target.value;
                      setEntries(updated);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <option>1010 - Cash in Bank (BPI Corporate)</option>
                    <option>1020 - Petty Cash Fund</option>
                    <option>1200 - Accounts Receivable (Trade)</option>
                    <option>1520 - Inventory (Raw Chemical Stock)</option>
                    <option>2010 - Accounts Payable (Suppliers)</option>
                    <option>3010 - Retained Earnings</option>
                    <option>4010 - Sales Revenue (Chemical Products)</option>
                    <option>5010 - Cost of Goods Sold (COGS)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Debit"
                    value={entry.debit || ''}
                    onChange={(e) => {
                      const updated = [...entries];
                      updated[idx].debit = parseFloat(e.target.value) || 0;
                      setEntries(updated);
                    }}
                    className="w-28 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Credit"
                    value={entry.credit || ''}
                    onChange={(e) => {
                      const updated = [...entries];
                      updated[idx].credit = parseFloat(e.target.value) || 0;
                      setEntries(updated);
                    }}
                    className="w-28 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                  {entries.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setEntries(entries.filter((_, i) => i !== idx))}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Total Debit: </span>
              <span className="font-mono font-bold">{formatCurrency(totalDebit)}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Total Credit: </span>
              <span className="font-mono font-bold">{formatCurrency(totalCredit)}</span>
            </div>
            <div>
              {isBalanced ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Balanced</span>
              ) : (
                <span className="text-amber-600 font-bold">Unbalanced</span>
              )}
            </div>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Journal entry successfully posted to General Ledger.
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
              disabled={!isBalanced}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              Post Journal Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
