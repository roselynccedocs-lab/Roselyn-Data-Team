import React, { useState, useEffect } from 'react';
import { PerformanceRuleConfig, DimensionWeights } from '../../types/performance';
import { PerformanceService, DEFAULT_PERFORMANCE_RULES, DEFAULT_DIMENSION_WEIGHTS } from '../../services/performanceService';
import { X, Settings, Save, CheckCircle2 } from 'lucide-react';

interface AdminRulesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AdminRulesConfigModal({ isOpen, onClose, onSaved }: AdminRulesConfigModalProps) {
  const [rules, setRules] = useState<PerformanceRuleConfig>(DEFAULT_PERFORMANCE_RULES);
  const [weights, setWeights] = useState<DimensionWeights>(DEFAULT_DIMENSION_WEIGHTS);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadRules = async () => {
      const r = await PerformanceService.getRules();
      setRules(r);
    };
    if (isOpen) loadRules();
  }, [isOpen]);

  if (!isOpen) return null;

  const totalWeight = (Object.values(weights) as number[]).reduce((a: number, b: number) => a + b, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await PerformanceService.updateRules(rules);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSaved();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save rules:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 text-slate-100 shadow-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 bg-slate-800/60 p-2 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Performance Rules & Scoring Configuration</h2>
            <p className="text-xs text-slate-400">Configure transaction point additions, deductions, and 7-dimension evaluation model weights</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Performance Scoring Rules saved and applied across the enterprise system!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Dimension Weights */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Core Dimension Weights (Total: 100%)</h3>
              <span className={`font-mono font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Current Sum: {totalWeight}%
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(weights).map(([k, v]) => (
                <div key={k} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <label className="block text-[10px] text-slate-400 capitalize mb-1">{k.replace(/([A-Z])/g, ' $1')}</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={v}
                      onChange={e => setWeights({ ...weights, [k]: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono text-xs"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configurable Point Rules */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Transaction Point Rules & Deductions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-400 mb-1">On-Time Completion Bonus (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={rules.onTimeCompletion}
                  onChange={e => setRules({ ...rules, onTimeCompletion: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Early Completion Bonus (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={rules.earlyCompletion}
                  onChange={e => setRules({ ...rules, earlyCompletion: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rejected Transaction Deduction (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={rules.rejectedTransaction}
                  onChange={e => setRules({ ...rules, rejectedTransaction: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rework Required Deduction (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={rules.reworkRequired}
                  onChange={e => setRules({ ...rules, reworkRequired: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">1 Hour Lateness Deduction (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={rules.latenessPerHour}
                  onChange={e => setRules({ ...rules, latenessPerHour: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Disciplinary Action (DA) Deduction (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={rules.daDisciplinaryAction}
                  onChange={e => setRules({ ...rules, daDisciplinaryAction: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-red-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Suspension Deduction (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={rules.suspensionDeduction}
                  onChange={e => setRules({ ...rules, suspensionDeduction: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-red-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">HR Confirmed Strength Bonus (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={rules.hrStrengthBonus}
                  onChange={e => setRules({ ...rules, hrStrengthBonus: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
