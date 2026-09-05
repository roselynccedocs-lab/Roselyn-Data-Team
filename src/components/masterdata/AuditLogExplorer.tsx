import React, { useState } from 'react';
import { AuditLogEntry, MasterRequestDocument, MasterRecordDocument } from '../../types/masterData';
import { 
  FileText, 
  Search, 
  Download, 
  ShieldCheck, 
  User, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface AuditLogExplorerProps {
  auditLogs: AuditLogEntry[];
  requests: MasterRequestDocument[];
  masterRecords: MasterRecordDocument[];
}

export function AuditLogExplorer({ auditLogs, requests, masterRecords }: AuditLogExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all audit entries from requests & master records + global audit collection
  const allEntries: AuditLogEntry[] = [...auditLogs];

  requests.forEach(r => {
    r.auditTrail.forEach(a => {
      if (!allEntries.some(e => e.timestamp === a.timestamp && e.actorId === a.actorId)) {
        allEntries.push(a);
      }
    });
  });

  masterRecords.forEach(m => {
    m.auditTrail.forEach(a => {
      if (!allEntries.some(e => e.timestamp === a.timestamp && e.actorId === a.actorId)) {
        allEntries.push(a);
      }
    });
  });

  // Sort descending by timestamp
  allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter
  const filteredEntries = allEntries.filter(entry => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      entry.action.toLowerCase().includes(query) ||
      entry.actorName.toLowerCase().includes(query) ||
      entry.actorRole.toLowerCase().includes(query) ||
      (entry.details || '').toLowerCase().includes(query)
    );
  });

  // Export JSON / CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Actor_ID', 'Actor_Name', 'Actor_Role', 'Details', 'AI_Score'];
    const rows = filteredEntries.map(e => [
      e.timestamp,
      e.action,
      e.actorId,
      `"${e.actorName.replace(/"/g, '""')}"`,
      e.actorRole,
      `"${(e.details || '').replace(/"/g, '""')}"`,
      e.aiScore ?? ''
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Master_Data_Audit_Trail_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" /> System Auditor Immutable Lifecycle Trail
          </h2>
          <p className="text-slate-500">Traceable chronological ledger of all governance events, state changes, and AI validations.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-500">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action Event</th>
              <th className="p-3">Actor & Role</th>
              <th className="p-3">Governance Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
            {filteredEntries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-3 text-slate-500 font-sans">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded font-bold text-[10px]">
                    {entry.action}
                  </span>
                </td>
                <td className="p-3 font-sans">
                  <span className="font-bold text-slate-900 dark:text-white block">{entry.actorName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">[{entry.actorRole}]</span>
                </td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-300">
                  {entry.details || 'System event recorded.'}
                  {entry.aiScore !== undefined && (
                    <span className="ml-2 font-mono text-[10px] text-indigo-600 font-bold">
                      (AI S_match: {(entry.aiScore * 100).toFixed(0)}%)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
