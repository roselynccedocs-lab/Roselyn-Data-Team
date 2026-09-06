import React from 'react';
import { EmployeePerformanceProfile, PerformanceScoreTransaction } from '../../types/performance';
import { 
  X, HelpCircle, ArrowUpRight, ArrowDownRight, Calculator, CheckCircle2, 
  AlertCircle, BookOpen, Layers, Clock, ShieldCheck, FileText, Info
} from 'lucide-react';

interface ExplainScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EmployeePerformanceProfile;
  transactions: PerformanceScoreTransaction[];
}

export function ExplainScoreModal({ isOpen, onClose, profile, transactions }: ExplainScoreModalProps) {
  if (!isOpen) return null;

  const empTxns = transactions.filter(t => t.employeeId === profile.employeeId);

  const positiveTxns = empTxns.filter(t => t.adjustment > 0);
  const negativeTxns = empTxns.filter(t => t.adjustment < 0);

  const totalPositive = positiveTxns.reduce((sum, t) => sum + t.adjustment, 0);
  const totalNegative = negativeTxns.reduce((sum, t) => sum + t.adjustment, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0f172a] z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Explain My Performance Score 🔍</span>
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Transparent mathematical breakdown & transaction ledger audit for {profile.employeeName} ({profile.period})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Score Card */}
          <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-950 border border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Final Calculated Score</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-black text-white font-mono">{profile.overallScore}%</span>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg uppercase">
                  Level: {profile.level}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Calculated dynamically from continuous work records, QA SLA reviews, 360° appraisals, and attendance biometric logs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto text-xs">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Positive Credits</span>
                </div>
                <div className="text-lg font-mono font-black text-emerald-400">+{totalPositive.toFixed(2)}%</div>
                <div className="text-[10px] text-slate-500">{positiveTxns.length} credit events</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Deductions</span>
                </div>
                <div className="text-lg font-mono font-black text-rose-400">{totalNegative.toFixed(2)}%</div>
                <div className="text-[10px] text-slate-500">{negativeTxns.length} penalty events</div>
              </div>
            </div>
          </div>

          {/* 7-Dimension Weighted Formula Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Weighted Dimension Component Breakdown (100% Scale)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Weighted Sum Formula</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Performance Dimension</th>
                    <th className="py-2.5 px-3 text-center">Assigned Weight</th>
                    <th className="py-2.5 px-3 text-center">Raw Dimension Score</th>
                    <th className="py-2.5 px-3 text-right">Weighted Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Productivity & SLA Completion</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">30%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-blue-400 font-bold">{profile.scores.productivity}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{(profile.scores.productivity * 0.30).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Quality & Accuracy Rate</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">20%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-400 font-bold">{profile.scores.quality}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{(profile.scores.quality * 0.20).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Attendance & Biometric Punctuality</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">10%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{profile.scores.attendance}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{(profile.scores.attendance * 0.10).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Behavior & Teamwork (360 Peer Avg)</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">15%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-indigo-400 font-bold">{profile.scores.behavior}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{(profile.scores.behavior * 0.15).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Manager Evaluation</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">10%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-purple-400 font-bold">{profile.scores.managerEvaluation}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{(profile.scores.managerEvaluation * 0.10).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Peer Evaluation</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">10%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-pink-400 font-bold">{profile.scores.peerEvaluation}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{(profile.scores.peerEvaluation * 0.10).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">HR Professional Development</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">5%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-teal-400 font-bold">{profile.scores.hrDevelopment}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{(profile.scores.hrDevelopment * 0.05).toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Ledger Audit Trail */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Transaction Ledger Events Affecting Score ({empTxns.length} records)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Real-time audit log</span>
            </div>

            {empTxns.length === 0 ? (
              <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                No individual score adjustment transactions registered for this employee yet. Score reflects default baseline.
              </div>
            ) : (
              <div className="space-y-2">
                {empTxns.map(t => (
                  <div key={t.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{t.category.replace(/_/g, ' ')}</span>
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono rounded">
                          Ref: {t.referenceId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{t.reason}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Source: {t.source} • Logged at: {new Date(t.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Prev: {t.previousScore}%</div>
                        <div className="font-mono font-bold text-slate-200">New: {t.newScore}%</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        t.adjustment > 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {t.adjustment > 0 ? `+${t.adjustment}%` : `${t.adjustment}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Governing Rules Banner */}
          <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Anti-Manipulation Protection Active:</strong> Duplicate transactions on identical reference IDs are automatically rejected. Strength bonuses are capped at once per evaluation cycle. Scores are bounded strictly between 0.00% and 100.00%.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
