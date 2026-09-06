import React from 'react';
import { AwardRecommendation } from '../../types/performance';
import { Award, Shield, CheckCircle2, AlertTriangle, XCircle, Star, ThumbsUp, Sparkles, Building2, UserCheck } from 'lucide-react';

interface AwardsEngineViewProps {
  awards: AwardRecommendation[];
  onApproveAward: (awardId: string) => void;
  currentUserRole: string;
}

export function AwardsEngineView({ awards, onApproveAward, currentUserRole }: AwardsEngineViewProps) {
  const getBadgeClass = (status: AwardRecommendation['eligibilityStatus']) => {
    switch (status) {
      case 'RECOMMENDED':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'NOT_ELIGIBLE':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
    }
  };

  const getStatusIcon = (status: AwardRecommendation['eligibilityStatus']) => {
    switch (status) {
      case 'RECOMMENDED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'REVIEW_REQUIRED':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'NOT_ELIGIBLE':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-100">Automated Employee Award Recommendation Engine 🏆</h3>
          </div>
          <p className="text-xs text-slate-400">Continuous quarterly & annual performance analysis automatically identifying qualified candidates for enterprise awards</p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="text-xs text-slate-400">Configured Rules:</div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">Min Score 90% • Min Attendance 95% • 0 Active Violations</span>
        </div>
      </div>

      {/* Special Department + Employee Teamwork Recommendation Highlight */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-950 p-4 rounded-xl border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>🤝 Teamwork & Collaboration Enterprise Recommendation</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">Quarterly System Pick</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">Highest performing cross-functional team and individual based on 360° collaboration metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Top Department</div>
              <div className="text-slate-100 font-bold">Quality Assurance (94.8%)</div>
            </div>
          </div>

          <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Top Employee</div>
              <div className="text-slate-100 font-bold">Juan Dela Cruz (94.5%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Awards Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {awards.map(award => (
          <div key={award.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xs font-bold text-slate-100">{award.awardTitle}</h4>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${getBadgeClass(award.eligibilityStatus)}`}>
                  {getStatusIcon(award.eligibilityStatus)}
                  <span>{award.eligibilityStatus.replace(/_/g, ' ')}</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{award.awardDescription}</p>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1 mb-3">
                <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Candidate / Department:</div>
                <div className="text-xs font-bold text-blue-400">{award.employeeName || award.departmentName}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Eligibility Qualification Rules:</div>
                <ul className="text-[10px] text-slate-300 space-y-1 pl-3 list-disc">
                  {award.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                HR Status: {award.approvedByHR ? <strong className="text-emerald-400">Approved</strong> : 'Pending HR Confirmation'}
              </span>

              {!award.approvedByHR && (currentUserRole === 'HR' || currentUserRole === 'ADMIN' || currentUserRole === 'MANAGEMENT') && (
                <button
                  onClick={() => onApproveAward(award.id)}
                  className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Approve Award</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
