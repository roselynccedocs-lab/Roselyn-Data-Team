import React from 'react';
import { AuditLogEntry } from '../../types/masterData';
import { 
  Clock, 
  Edit2, 
  GitCommit, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  AlertTriangle, 
  User 
} from 'lucide-react';

interface AuditTrailTimelineProps {
  auditTrail: AuditLogEntry[];
}

export function AuditTrailTimeline({ auditTrail }: AuditTrailTimelineProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-4">
      <span className="font-sans font-bold text-slate-400 block border-b border-slate-800 pb-2 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Audit Trail & Lifecycle History
      </span>
      
      <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {auditTrail?.map((entry, idx) => {
          let Icon = Clock;
          let iconColor = "text-slate-400";
          let bg = "bg-slate-800 border-slate-700";
          
          if (entry.action === 'DRAFT_CREATED' || entry.action === 'DRAFT_UPDATED' || entry.action === 'REVISION_REQUESTED') {
            Icon = Edit2;
            iconColor = "text-indigo-400";
            bg = "bg-indigo-950 border-indigo-800";
          } else if (entry.action === 'SUBMITTED_FOR_QA') {
            Icon = GitCommit;
            iconColor = "text-blue-400";
            bg = "bg-blue-950 border-blue-800";
          } else if (entry.action === 'QA_APPROVED' || entry.action === 'REGISTER_COMMITTED') {
            Icon = CheckCircle2;
            iconColor = "text-emerald-400";
            bg = "bg-emerald-950 border-emerald-800";
          } else if (entry.action === 'REQUEST_REJECTED' || entry.action === 'RECORD_DEACTIVATED') {
            Icon = XCircle;
            iconColor = "text-rose-400";
            bg = "bg-rose-950 border-rose-800";
          } else if (entry.action === 'AI_PRECHECK_COMPLETED') {
            Icon = ShieldCheck;
            iconColor = "text-amber-400";
            bg = "bg-amber-950 border-amber-800";
          }

          return (
            <div key={idx} className="relative">
              <div className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full border ${bg} flex items-center justify-center z-10`}>
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold tracking-wide ${iconColor}`}>
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <User className="w-3 h-3" />
                  <span className="font-bold text-slate-200">{entry.actorName}</span>
                  <span className="text-slate-500">({entry.actorRole.replace(/_/g, ' ')})</span>
                </div>
                {entry.details && (
                  <div className="mt-1 p-2 bg-slate-800/50 rounded-lg text-slate-300 text-[10.5px] italic border border-slate-800/80">
                    "{entry.details}"
                  </div>
                )}
                {entry.aiScore !== undefined && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-950/30 px-2.5 py-1.5 rounded-lg w-fit border border-amber-900/50">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-bold">AI Confidence Score:</span> {(entry.aiScore * 100).toFixed(1)}% Match
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {(!auditTrail || auditTrail.length === 0) && (
          <div className="text-[10px] text-slate-500 italic">No audit trail records available.</div>
        )}
      </div>
    </div>
  );
}
