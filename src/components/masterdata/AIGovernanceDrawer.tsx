import React, { useState } from 'react';
import { AIGovernanceValidation, MasterRecordDocument } from '../../types/masterData';
import { 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  Building2, 
  ArrowRight 
} from 'lucide-react';

interface AIGovernanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  aiValidation: AIGovernanceValidation | null;
  submittedRecord: any;
  existingCandidateRecords: MasterRecordDocument[];
  duplicateJustification: string;
  onJustificationChange: (val: string) => void;
  onSubmitWithJustification?: () => void;
  isSubmitting?: boolean;
}

export function AIGovernanceDrawer({
  isOpen,
  onClose,
  aiValidation,
  submittedRecord,
  existingCandidateRecords,
  duplicateJustification,
  onJustificationChange,
  onSubmitWithJustification,
  isSubmitting = false
}: AIGovernanceDrawerProps) {
  if (!isOpen || !aiValidation) return null;

  const score = aiValidation.confidenceScore;
  const isHighRisk = score >= 0.75;
  const isModerateRisk = score >= 0.40 && score < 0.75;
  const isLowRisk = score < 0.40;

  // Find candidate matches
  const matchedCandidates = existingCandidateRecords.filter(r => 
    aiValidation.matchedRecordIds.includes(r.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Gemini AI Governance Pre-Check Report
              </h2>
              <p className="text-xs text-slate-500">Automated Entity Resolution, Semantic Matching & Address Normalization</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          
          {/* Score Decision Banner */}
          <div className={`p-5 rounded-2xl border ${
            isHighRisk 
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
              : isModerateRisk
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isHighRisk 
                  ? 'bg-rose-600 text-white' 
                  : isModerateRisk 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-emerald-600 text-white'
              }`}>
                {isHighRisk ? <ShieldAlert className="w-6 h-6" /> : isModerateRisk ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">
                    {isHighRisk ? 'High Duplicate Risk (Score ≥ 0.75)' : isModerateRisk ? 'Moderate Duplicate Probability (0.40 - 0.74)' : 'Low Risk - Passed Pre-Check'}
                  </h3>
                  <span className="font-mono font-black text-base">
                    S_match = {(score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {isHighRisk 
                    ? 'High semantic similarity with existing master records. Submission is blocked unless a mandatory business justification reason is provided.'
                    : isModerateRisk
                    ? 'Moderate structural or name similarity found. Review comparative fields to prevent duplicate entries.'
                    : 'No critical duplicate conflicts found. The entry complies with enterprise normalization standards.'}
                </p>
              </div>
            </div>
          </div>

          {/* Standardized Fields & Address Normalization */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> AI ISO Standardization & Normalization
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Normalized Entity Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {aiValidation.standardizedFields.legalName || submittedRecord?.data?.legalName || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Validated Tax ID:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {aiValidation.standardizedFields.taxId || submittedRecord?.data?.taxId || 'N/A'}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[10px] text-slate-400 font-sans block">ISO Formatted Address:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {aiValidation.standardizedFields.formattedAddress || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Detected Issues & AI Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Detected Anomalies
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                {aiValidation.detectedIssues.map((issue, idx) => (
                  <li key={idx} className="leading-tight">{issue}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Governance Actions
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                {aiValidation.recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-tight">{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Side-by-Side Comparative Matches */}
          {matchedCandidates.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white">Comparative Inspection with Top Match Candidates</h4>
              {matchedCandidates.map(c => (
                <div key={c.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-mono font-extrabold text-indigo-600">{c.id}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold">
                      {c.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans">Active Record Name:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{(c.data as any).legalName || (c.data as any).legalEntityName || (c.data as any).description}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans">Active Tax ID:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{(c.data as any).taxId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mandatory Business Justification for High Risk */}
          {isHighRisk && (
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-3">
              <label className="font-extrabold text-rose-900 dark:text-rose-200 block">
                Mandatory Duplicate Business Justification <span className="text-rose-600">*</span>
              </label>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Because the semantic match score exceeds 0.75, you must explicitly justify why a new master entry is required rather than using an existing active record.
              </p>
              <textarea
                rows={3}
                placeholder="e.g. Target entity represents a distinct legal subsidiary under a separate Tax ID with independent billing operations..."
                value={duplicateJustification}
                onChange={(e) => onJustificationChange(e.target.value)}
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Close Report
          </button>

          {onSubmitWithJustification && (
            <button
              onClick={onSubmitWithJustification}
              disabled={isHighRisk && !duplicateJustification.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md ${
                isHighRisk && !duplicateJustification.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Proceed & Submit for Review'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
