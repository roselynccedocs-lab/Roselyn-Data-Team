import React, { useState } from 'react';
import { Evaluation360 } from '../../types/performance';
import { SEED_EMPLOYEES, PerformanceService } from '../../services/performanceService';
import { X, Star, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Evaluation360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
  currentUserId: string;
  currentUserName: string;
  onSubmitted: () => void;
}

export function Evaluation360Modal({
  isOpen,
  onClose,
  currentUserRole,
  currentUserId,
  currentUserName,
  onSubmitted
}: Evaluation360ModalProps) {
  const [selectedEvaluateeId, setSelectedEvaluateeId] = useState<string>(SEED_EMPLOYEES[0].id);
  const [evaluatorRole, setEvaluatorRole] = useState<'PEER' | 'MANAGER' | 'SUBORDINATE' | 'HR'>('PEER');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>('Q3 2026');

  // 10 Dimensions Ratings (1 - 100)
  const [ratings, setRatings] = useState({
    professionalism: 90,
    respect: 90,
    integrity: 95,
    cooperation: 88,
    communication: 85,
    accountability: 92,
    reliability: 90,
    teamwork: 92,
    leadership: 85,
    problemSolving: 88
  });

  const [comments, setComments] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [weaknessesText, setWeaknessesText] = useState('');
  const [recommendations, setRecommendations] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetEmp = SEED_EMPLOYEES.find(e => e.id === selectedEvaluateeId);

  const calculateOverall = () => {
    const vals = Object.values(ratings) as number[];
    const sum = vals.reduce((a: number, b: number) => a + b, 0);
    return Number((sum / vals.length).toFixed(1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Anti-manipulation rule: no self evaluation
    if (selectedEvaluateeId === currentUserId) {
      setErrorMsg('Anti-Manipulation Rule Violation: You cannot submit a 180°/360° evaluation for yourself.');
      return;
    }

    try {
      setIsSubmitting(true);
      const strengthsArray = strengthsText.split(',').map(s => s.trim()).filter(Boolean);
      const weaknessesArray = weaknessesText.split(',').map(w => w.trim()).filter(Boolean);

      await PerformanceService.submit360Evaluation({
        evaluatorId: currentUserId || 'EMP-1002',
        evaluatorName: currentUserName || 'Maria Santos',
        evaluatorRole,
        evaluateeId: selectedEvaluateeId,
        evaluateeName: targetEmp?.name || 'Employee',
        period,
        isAnonymous,
        ratings,
        overallRating: calculateOverall(),
        comments,
        observedStrengths: strengthsArray,
        observedWeaknesses: weaknessesArray,
        recommendations
      });

      setSuccessMsg('360° Evaluation successfully recorded into Performance Intelligence Engine.');
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl text-slate-100 shadow-2xl p-6 relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 bg-slate-800/60 p-2 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Submit 180° / 360° Employee Evaluation</h2>
            <p className="text-xs text-slate-400">Provide structured multi-attribute feedback contributing to employee performance intelligence</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Target Employee & Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Evaluate Employee</label>
              <select 
                value={selectedEvaluateeId}
                onChange={e => setSelectedEvaluateeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {SEED_EMPLOYEES.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department} - {e.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Evaluation Role</label>
              <select 
                value={evaluatorRole}
                onChange={e => setEvaluatorRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="PEER">Peer / Coworker</option>
                <option value="MANAGER">Manager / Team Lead</option>
                <option value="SUBORDINATE">Subordinate / Team Member</option>
                <option value="HR">HR Evaluator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Evaluation Period</label>
              <select 
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Q1 2026">Q1 2026</option>
                <option value="Q2 2026">Q2 2026</option>
                <option value="Q3 2026">Q3 2026</option>
                <option value="Q4 2026">Q4 2026</option>
              </select>
            </div>
          </div>

          {/* Anonymous Safeguard Toggle */}
          <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">Keep my identity anonymous to the employee being evaluated</span>
            </div>
            <input 
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          {/* 10 Rating Sliders Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Evaluation Categories (1 - 100 Rating)</h3>
              <span className="text-sm font-bold text-blue-400">Calculated Average: {calculateOverall()}%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {Object.entries(ratings).map(([key, val]) => (
                <div key={key} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-slate-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-blue-400">{val}%</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="100"
                    value={val}
                    onChange={e => setRatings({ ...ratings, [key]: Number(e.target.value) })}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Qualitative Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Observed Strengths (comma-separated)</label>
              <input 
                type="text"
                value={strengthsText}
                onChange={e => setStrengthsText(e.target.value)}
                placeholder="e.g. Excellent teamwork, High transaction quality"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Observed Areas for Improvement (comma-separated)</label>
              <input 
                type="text"
                value={weaknessesText}
                onChange={e => setWeaknessesText(e.target.value)}
                placeholder="e.g. Documentation detail precision"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Detailed Feedback & Comments</label>
            <textarea 
              rows={2}
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Provide constructive feedback on work attitude, cooperation, and performance..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
            >
              {isSubmitting ? 'Recording...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
