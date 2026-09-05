import React, { useState } from 'react';
import { MasterRequestDocument, MasterRecordDocument } from '../../types/masterData';
import { MasterDataService } from '../../services/masterDataService';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Building2, 
  Truck, 
  Package, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

interface MDMAdminWorkspaceProps {
  requests: MasterRequestDocument[];
  onRefresh: () => void;
  currentUser: { id: string; name: string; email: string };
}

export function MDMAdminWorkspace({
  requests,
  onRefresh,
  currentUser
}: MDMAdminWorkspaceProps) {
  const pendingMdmRequests = requests.filter(r => r.status === 'PENDING_MDM');

  const [selectedRequest, setSelectedRequest] = useState<MasterRequestDocument | null>(null);
  const [rejectionCategory, setRejectionCategory] = useState('POLICY_VIOLATION');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Commit to Master Register
  const handleCommit = async (reqDoc: MasterRequestDocument) => {
    setIsProcessing(true);
    await MasterDataService.commitToMasterRegister(reqDoc, {
      id: currentUser.id,
      name: currentUser.name
    });
    setIsProcessing(false);
    onRefresh();
  };

  // Confirm Reject
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    setIsProcessing(true);
    await MasterDataService.rejectRequest(
      selectedRequest,
      rejectionCategory,
      rejectionReason,
      { id: currentUser.id, name: currentUser.name, role: 'MDM_MANAGER' }
    );
    setIsProcessing(false);
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
    onRefresh();
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Workspace Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" /> Master Data Manager Final Approval Portal
          </h2>
          <p className="text-slate-500">Grant final executive sign-off and assign immutable master registration IDs.</p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl font-black font-mono">
          {pendingMdmRequests.length} Pending Sign-off
        </span>
      </div>

      {/* Queue Table */}
      {pendingMdmRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="font-bold">MDM Workspace Up to Date</p>
          <p className="text-[11px]">No requests awaiting final master register commitment.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-500">
                <th className="p-3">Request ID</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Legal Name / Title</th>
                <th className="p-3">QA Reviewer Sign-off</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingMdmRequests.map((reqDoc) => {
                const reqData = reqDoc.data as any;
                const title = reqData.legalName || reqData.legalEntityName || reqData.description || 'N/A';

                return (
                  <tr key={reqDoc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600">{reqDoc.id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold uppercase text-[10px]">
                        {reqDoc.domain}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{title}</td>
                    <td className="p-3 text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{reqDoc.governance.qaReviewerName || 'QA Department'}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedRequest(reqDoc); setIsRejectModalOpen(true); }}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg font-bold"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleCommit(reqDoc)}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Commit to Master Register</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-extrabold text-sm text-rose-600">Reject Master Data Request</h3>
            
            <div className="space-y-2">
              <label className="font-bold">Rejection Category</label>
              <select
                value={rejectionCategory}
                onChange={e => setRejectionCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="POLICY_VIOLATION">Corporate Governance Policy Violation</option>
                <option value="DUPLICATE_ENTITY">Duplicate Entity Found</option>
                <option value="OTHER">Other Compliance Reason</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-bold">Reason</label>
              <textarea
                rows={3}
                placeholder="Detailed reason for rejecting request..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl">Cancel</button>
              <button onClick={handleReject} disabled={isProcessing} className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
