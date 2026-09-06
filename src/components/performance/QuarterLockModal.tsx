import React, { useState } from 'react';
import { QuarterLockState } from '../../types/performance';
import { PerformanceService } from '../../services/performanceService';
import { X, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface QuarterLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  quarterLocks: QuarterLockState[];
  onLocked: () => void;
  currentUserName: string;
}

export function QuarterLockModal({ isOpen, onClose, quarterLocks, onLocked, currentUserName }: QuarterLockModalProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterLockState['quarter']>('Q3 2026');
  const [isLocking, setIsLocking] = useState(false);
  const [lockedMsg, setLockedMsg] = useState(false);

  if (!isOpen) return null;

  const handleLockQuarter = async () => {
    try {
      setIsLocking(true);
      await PerformanceService.lockQuarter(selectedQuarter, currentUserName || 'HR Admin');
      setLockedMsg(true);
      setTimeout(() => {
        setLockedMsg(false);
        onLocked();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to lock quarter:', err);
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 bg-slate-800/60 p-2 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Quarter-End Score Locking 🔒</h2>
            <p className="text-xs text-slate-400">Lock evaluation period to finalize historical scores and trigger award recommendations</p>
          </div>
        </div>

        {lockedMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Quarter {selectedQuarter} scores successfully locked and preserved!</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="block text-slate-400 font-medium">Select Evaluation Quarter to Lock</label>
            <div className="grid grid-cols-2 gap-2">
              {quarterLocks.map(ql => (
                <button 
                  key={ql.quarter}
                  onClick={() => setSelectedQuarter(ql.quarter)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    selectedQuarter === ql.quarter 
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{ql.quarter}</span>
                  {ql.isLocked ? (
                    <span className="text-[10px] text-emerald-400 font-bold">LOCKED 🔒</span>
                  ) : (
                    <span className="text-[10px] text-amber-400">OPEN</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-200">Quarter Lock Governance Checklist:</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Final score calculation verified across all departments</li>
              <li>QA validation & rework logs reconciled</li>
              <li>Disciplinary deductions confirmed by HR</li>
              <li>Scores are preserved; future modifications require HR audit override</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button 
              onClick={handleLockQuarter} 
              disabled={isLocking}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>{isLocking ? 'Locking...' : `Lock ${selectedQuarter}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
