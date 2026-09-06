import React, { useState, useEffect } from 'react';
import { EndUserAccessPermissions } from '../../types/performance';
import { PerformanceService, DEFAULT_END_USER_PERMISSIONS } from '../../services/performanceService';
import { X, ShieldCheck, Key, Lock, CheckCircle2, UserCheck, Eye, HelpCircle, ShieldAlert } from 'lucide-react';

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  currentUserName: string;
}

export function AccessControlModal({ isOpen, onClose, onSaved, currentUserName }: AccessControlModalProps) {
  const [permissions, setPermissions] = useState<EndUserAccessPermissions>(DEFAULT_END_USER_PERMISSIONS);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      PerformanceService.getEndUserPermissions().then(perms => setPermissions(perms));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof EndUserAccessPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleGrantAll = () => {
    setPermissions({
      allowViewLedgerHistory: true,
      allowSubmit360Evaluations: true,
      allowViewStrengthsWeaknesses: true,
      allowViewAwardRecommendations: true,
      allowExportReportCard: true,
      allowViewDeptBenchmarks: true,
      allowSubmitReworkDispute: true,
      allowViewLeaderboard: true
    });
  };

  const handleRestrictAll = () => {
    setPermissions({
      allowViewLedgerHistory: false,
      allowSubmit360Evaluations: false,
      allowViewStrengthsWeaknesses: true, // Keep basic strengths/weaknesses
      allowViewAwardRecommendations: false,
      allowExportReportCard: true,
      allowViewDeptBenchmarks: false,
      allowSubmitReworkDispute: false,
      allowViewLeaderboard: false
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await PerformanceService.saveEndUserPermissions(permissions, currentUserName || 'QA/Admin');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSaved();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save access permissions:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 bg-slate-800/60 p-2 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">QA & Admin End-User Access Management 🔐</h2>
            <p className="text-xs text-slate-400">
              Configure modules, dashboards, and self-service capabilities visible to all end users (Employees)
            </p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>End-user access control policies successfully updated and enforced!</span>
          </div>
        )}

        {/* Quick Action Presets */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-6 text-xs">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Policy Presets:</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleGrantAll}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold transition"
            >
              Grant Full Access (All Features)
            </button>
            <button 
              type="button"
              onClick={handleRestrictAll}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Restrict Sensitive Views
            </button>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="space-y-3 mb-6 text-xs">
          <PermissionToggleRow
            title="Detailed Score Transaction Ledger Audit"
            description="Allows end users to view line-item transaction deductions, SLA bonuses, and QA rework audit logs for their account."
            icon={<Eye className="w-4 h-4 text-blue-400" />}
            enabled={permissions.allowViewLedgerHistory}
            onToggle={() => handleToggle('allowViewLedgerHistory')}
          />

          <PermissionToggleRow
            title="360° Peer Evaluation Participation"
            description="Allows end users to submit anonymous 360° peer reviews and manager feedback during active evaluation windows."
            icon={<UserCheck className="w-4 h-4 text-amber-400" />}
            enabled={permissions.allowSubmit360Evaluations}
            onToggle={() => handleToggle('allowSubmit360Evaluations')}
          />

          <PermissionToggleRow
            title="Strengths & Weaknesses Development Feedback"
            description="Allows end users to see AI & Manager tagged strengths and recommended growth action items."
            icon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
            enabled={permissions.allowViewStrengthsWeaknesses}
            onToggle={() => handleToggle('allowViewStrengthsWeaknesses')}
          />

          <PermissionToggleRow
            title="Award Recommendations & Recognition Candidates"
            description="Allows end users to view company award highlights (Employee of the Quarter, Safety First, Quality Excellence)."
            icon={<CheckCircle2 className="w-4 h-4 text-indigo-400" />}
            enabled={permissions.allowViewAwardRecommendations}
            onToggle={() => handleToggle('allowViewAwardRecommendations')}
          />

          <PermissionToggleRow
            title="Print & Export Annual Performance Card (PDF/CSV)"
            description="Allows end users to download or print their official 2026 Annual Employee Performance Report Card."
            icon={<Eye className="w-4 h-4 text-teal-400" />}
            enabled={permissions.allowExportReportCard}
            onToggle={() => handleToggle('allowExportReportCard')}
          />

          <PermissionToggleRow
            title="Department Performance Benchmarks"
            description="Allows end users to compare their overall score against department-wide averages."
            icon={<Eye className="w-4 h-4 text-pink-400" />}
            enabled={permissions.allowViewDeptBenchmarks}
            onToggle={() => handleToggle('allowViewDeptBenchmarks')}
          />

          <PermissionToggleRow
            title="Self-Service Rework Penalty Dispute / Score Appeal"
            description="Allows end users to submit formal score appeal requests for QA rework deductions or SLA penalties."
            icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
            enabled={permissions.allowSubmitReworkDispute}
            onToggle={() => handleToggle('allowSubmitReworkDispute')}
          />

          <PermissionToggleRow
            title="Top Performers Department Leaderboard"
            description="Displays department rank and top performer badges to end users to promote transparency and healthy competition."
            icon={<Eye className="w-4 h-4 text-emerald-400" />}
            enabled={permissions.allowViewLeaderboard}
            onToggle={() => handleToggle('allowViewLeaderboard')}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="text-[11px] text-slate-500 font-medium">
            Access rules apply immediately across all employee portal sessions.
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium text-xs hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
            >
              <Key className="w-4 h-4" />
              <span>{isSaving ? 'Enforcing...' : 'Save & Enforce Permissions'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionToggleRow({ title, description, icon, enabled, onToggle }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <div className="font-bold text-slate-100">{title}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-1 border ${
          enabled ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'
        }`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}
