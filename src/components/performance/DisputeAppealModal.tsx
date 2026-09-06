import React, { useState } from 'react';
import { PerformanceScoreTransaction } from '../../types/performance';
import { PerformanceService } from '../../services/performanceService';
import { X, AlertTriangle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DisputeAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: PerformanceScoreTransaction[];
  currentUserId: string;
  currentUserName: string;
  onSubmitted: () => void;
}

export function DisputeAppealModal({
  isOpen,
  onClose,
  transactions,
  currentUserId,
  currentUserName,
  onSubmitted
}: DisputeAppealModalProps) {
  const [selectedTxnId, setSelectedTxnId] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceDoc, setEvidenceDoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const employeeTxns = transactions.filter(t => t.employeeId === currentUserId || t.employeeId === 'EMP-1001');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason) return;

    try {
      setIsSubmitting(true);
      const targetTxn = employeeTxns.find(t => t.id === selectedTxnId);

      const empSeed = {
        id: currentUserId || 'EMP-1001',
        name: currentUserName || 'Juan Dela Cruz',
        department: targetTxn?.department || 'Operations',
        position: 'Specialist',
        managerName: 'Manager',
        role: 'REQUESTOR',
        email: 'employee@company.com'
      };

      await PerformanceService.logScoreTransaction(
        empSeed,
        'MANUAL_OVERRIDE',
        0, // Pending QA/Admin review
        `[END-USER DISPUTE APPEAL] For Transaction ${selectedTxnId || 'General'}: ${disputeReason}. Evidence/Ref: ${evidenceDoc || 'N/A'}`,
        selectedTxnId || 'DISPUTE-2026',
        'EMPLOYEE_SELF_SERVICE_APPEAL',
        currentUserId || 'EMP-1001',
        currentUserName || 'Juan Dela Cruz',
        targetTxn?.newScore || 90.0
      );

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setDisputeReason('');
        setEvidenceDoc('');
        onSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit score appeal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 bg-slate-800/60 p-2 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Submit Score Penalty Appeal / Dispute ⚖️</h2>
            <p className="text-xs text-slate-400">
              Contest a QA rework penalty, SLA deduction, or missing document record for review by QA & HR Admin
            </p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Appeal successfully submitted to QA & HR Governance queue!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Select Transaction to Dispute (Optional)</label>
            <select
              value={selectedTxnId}
              onChange={e => setSelectedTxnId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-rose-500"
            >
              <option value="">-- Select Deduction Transaction --</option>
              {employeeTxns.map(t => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.category} ({t.adjustment >= 0 ? `+${t.adjustment}` : t.adjustment}%) - {t.reason.substring(0, 40)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Reason for Dispute / Justification *</label>
            <textarea
              required
              rows={4}
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Explain why this deduction should be waived or corrected (e.g. System outage, client delay, approved extension by manager...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Supporting Reference / Ticket ID or Document Link</label>
            <input
              type="text"
              value={evidenceDoc}
              onChange={e => setEvidenceDoc(e.target.value)}
              placeholder="e.g. REQ-2026-8842 or Email Confirmation Ref"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <span className="font-bold text-slate-200">Governance Review Note:</span> Submitted appeals are routed to QA Reviewers and HR Administration. Points are adjusted only upon QA/HR approval.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Dispute Appeal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
