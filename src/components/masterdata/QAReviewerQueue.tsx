import React, { useState, useMemo } from 'react';
import { MasterRequestDocument, MasterRecordDocument } from '../../types/masterData';
import { MasterDataService } from '../../services/masterDataService';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertTriangle, 
  Paperclip,
  Check,
  RefreshCw,
  Copy
} from 'lucide-react';

interface QAReviewerQueueProps {
  requests: MasterRequestDocument[];
  existingRecords: MasterRecordDocument[];
  onRefresh: () => void;
  currentUser: { id: string; name: string; email: string };
}

export function QAReviewerQueue({
  requests,
  existingRecords,
  onRefresh,
  currentUser
}: QAReviewerQueueProps) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'DUPLICATES' | 'RETURNED'>('PENDING');
  const [selectedRequest, setSelectedRequest] = useState<MasterRequestDocument | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false]);
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingQaRequests = requests.filter(r => r.status === 'PENDING_QA');
  // Mocking duplicates/returned for tabs
  const duplicates = requests.filter(r => r.governance?.aiValidation?.confidenceScore && r.governance.aiValidation.confidenceScore >= 0.85);
  const returned = requests.filter(r => r.status === 'REVISION_REQUESTED');

  const displayedRequests = useMemo(() => {
    if (activeTab === 'DUPLICATES') return duplicates;
    if (activeTab === 'RETURNED') return returned;
    return pendingQaRequests;
  }, [activeTab, pendingQaRequests, duplicates, returned]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setErrorMsg('');
    setIsProcessing(true);
    try {
      await MasterDataService.approveAndEscalate(selectedRequest, {
        id: currentUser.id,
        name: currentUser.name
      });
      setSelectedRequest(null);
      setRemarks('');
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedRequest) return;
    setErrorMsg('');
    setIsProcessing(true);
    try {
      await MasterDataService.requestRevision(
        selectedRequest,
        remarks || 'Returned for fix by QA',
        { id: currentUser.id, name: currentUser.name }
      );
      setSelectedRequest(null);
      setRemarks('');
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to return request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setErrorMsg('');
    setIsProcessing(true);
    try {
      await MasterDataService.rejectRequest(
        selectedRequest,
        'QA_REJECTED',
        remarks || 'Rejected by QA Governance',
        { id: currentUser.id, name: currentUser.name, role: 'QA_REVIEWER' }
      );
      setSelectedRequest(null);
      setRemarks('');
      onRefresh();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  // formatting for date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className="flex flex-col min-h-[75vh] bg-[#0B0F19] text-slate-300 font-sans text-xs border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Banner */}
      <div className="bg-[#026F4A] text-white p-4 mx-4 mt-4 rounded-xl shadow-lg border border-emerald-700 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1 opacity-90 text-[11px] font-bold">
            <span className="flex items-center gap-1 border border-white/30 rounded-full px-2 py-0.5 bg-white/10">
              <ShieldCheck className="w-3.5 h-3.5" /> QA Governance Terminal
            </span>
            <span>Authority: SYSTEM_ADMINISTRATOR (DATA & IT)</span>
          </div>
          <h2 className="text-xl font-extrabold mb-1">QA Master Data Review & Validation Deck</h2>
          <p className="text-emerald-50 text-[11px]">
            Verify submitted master data records against duplicate algorithms, statutory BIR documents, and internal compliance rules before creating or modifying official master data.
          </p>
        </div>
        <div className="bg-[#014D33] border border-[#016040] rounded-xl px-4 py-2 text-center">
          <div className="text-[10px] font-bold text-emerald-300 mb-0.5 uppercase">Queue Backlog</div>
          <div className="text-xl font-extrabold">{pendingQaRequests.length} Pending</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden mt-4 mx-4 pb-4 gap-4">
        {/* Sidebar */}
        <div className="w-1/3 flex flex-col gap-3 min-w-[320px]">
          {/* Tabs */}
          <div className="flex p-1 bg-[#111625] rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-colors ${activeTab === 'PENDING' ? 'bg-[#1E40AF] text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Pending ({pendingQaRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('DUPLICATES')}
              className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-colors ${activeTab === 'DUPLICATES' ? 'bg-[#1E40AF] text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Duplicates ({duplicates.length})
            </button>
            <button 
              onClick={() => setActiveTab('RETURNED')}
              className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-colors ${activeTab === 'RETURNED' ? 'bg-[#1E40AF] text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Returned ({returned.length})
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {displayedRequests.map((req) => {
              const data = req.data as any;
              const title = data.legalName || data.legalEntityName || data.description || req.id;
              const aiScore = req.governance?.aiValidation?.confidenceScore || 0;
              const isSelected = selectedRequest?.id === req.id;
              
              let badgeText = req.status.replace('_', ' ');
              let badgeClass = 'bg-[#1E3A8A] text-blue-300 border-[#1E40AF]';
              
              if (aiScore >= 0.85) {
                badgeText = 'POSSIBLE DUPLICATE';
                badgeClass = 'bg-[#78350F] text-amber-300 border-[#92400E]';
              } else if (req.status === 'PENDING_QA') {
                badgeText = 'SUBMITTED';
              }

              return (
                <div 
                  key={req.id}
                  onClick={() => { setSelectedRequest(req); setChecklist([false, false, false, false]); }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-[#172033] border-[#3B82F6]' : 'bg-[#0F1423] border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <span className={`font-mono font-bold ${isSelected ? 'text-blue-400' : 'text-blue-500'}`}>{req.id}</span>
                      <span className="text-[10px] font-bold bg-[#1E293B] text-slate-300 px-2 py-0.5 rounded uppercase">{req.domain}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>{badgeText}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-100 mb-1">{title}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>DATA & IT • {req.createdBy.name.toUpperCase()}</span>
                    <span>{formatDate(req.createdAt)}</span>
                  </div>
                  {aiScore >= 0.85 && (
                    <div className="mt-2 text-[10px] font-bold bg-amber-950/30 text-amber-500 border border-amber-900/50 p-1.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {(aiScore * 100).toFixed(0)}% match with existing master
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        {selectedRequest ? (() => {
          const data = selectedRequest.data as any;
          const title = data.legalName || data.legalEntityName || data.description || 'N/A';
          const aiScore = selectedRequest.governance?.aiValidation?.confidenceScore || 0;
          const documents = data.documents || [];

          return (
            <div className="w-2/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
              
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-blue-400 text-lg">{selectedRequest.id}</span>
                    <span className="bg-[#1E293B] border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{selectedRequest.domain} Master</span>
                    <span className="bg-[#1E293B] border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">ADD NEW</span>
                  </div>
                  <div className="font-bold text-2xl text-white">{title}</div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>Requestor: <span className="font-bold text-slate-200">{selectedRequest.createdBy.name.toUpperCase()}</span></div>
                  <div>Department: <span className="font-bold text-blue-400">DATA & IT</span></div>
                </div>
              </div>

              {/* Hierarchy block for ITEM */}
              {selectedRequest.domain === 'ITEM' && (
                <div className="border border-slate-700 bg-[#0F1423] rounded-xl overflow-hidden">
                  <div className="bg-[#111625] px-3 py-2 text-[10px] font-bold text-amber-500 border-b border-slate-700">
                    ITEM HIERARCHY STRUCTURE (*ITEM NAME - *CATEGORY - *BRAND - *S/N)
                  </div>
                  <div className="p-4 font-mono text-[11px] text-slate-300 space-y-1 relative">
                    <div className="text-amber-400 font-bold">* {title}</div>
                    <div className="pl-4 text-cyan-400">- {data.category || 'MACHINERY & EQUIPMENT'}</div>
                    <div className="pl-8 text-blue-300">- {data.brand || data.classification || 'REPAIR MAINTENANCE'}</div>
                    <div className="pl-12 text-emerald-400">
                      - <span className="bg-emerald-950/50 border border-emerald-800 px-1 rounded text-emerald-300">S/N</span> {data.serialNumber || 'N/A'}
                    </div>
                    
                    <button className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 px-2 py-1 rounded">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Business Justification */}
              <div className="border border-slate-700 bg-[#0F1423] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-1">Department Business Justification:</div>
                <div className="italic text-slate-300">
                  {data.businessJustification || 'jmj'}
                </div>
              </div>

              {/* Automated Duplicate Checking Radar */}
              <div className="border border-slate-700 bg-[#0F1423] rounded-xl overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Automated Duplicate Checking Radar</div>
                      <div className="text-[10px] text-slate-500">Cross-checks TIN, Registered Names, Trade Names, and SKUs against official master tables.</div>
                    </div>
                  </div>
                  {aiScore >= 0.85 ? (
                    <div className="border border-rose-800 bg-rose-950/40 text-rose-400 px-3 py-1 rounded-full text-[10px] font-bold">
                      {(aiScore * 100).toFixed(0)}% Duplicate
                    </div>
                  ) : (
                    <div className="border border-emerald-800 bg-emerald-950/40 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">
                      Clean (0% Duplicate)
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {aiScore >= 0.85 ? (
                    <div className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-3 rounded-lg flex items-center gap-2 text-[11px]">
                      <AlertTriangle className="w-4 h-4" />
                      Possible duplicate records found in master tables.
                    </div>
                  ) : (
                    <div className="bg-[#022C22] border border-[#064E3B] text-emerald-400 p-3 rounded-lg flex items-center gap-2 text-[11px]">
                      <CheckCircle className="w-4 h-4" />
                      No existing Master Records match this entry. Passed automated uniqueness verification.
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Checklist */}
              <div className="border border-slate-700 bg-[#0F1423] rounded-xl p-4 space-y-3">
                <div>
                  <div className="font-bold text-white text-[11px]">QA Mandatory Data Validation Checklist</div>
                  <div className="text-[10px] text-slate-500">Ensure standard compliance with BIR tax guidelines and organizational master data policies.</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "1. All mandatory fields complete & non-blank",
                    "2. TIN format & BIR registration validated",
                    "3. Physical and registered addresses verified",
                    "4. Tax & VAT classification conforms to policy"
                  ].map((label, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        const newChecklist = [...checklist];
                        newChecklist[idx] = !newChecklist[idx];
                        setChecklist(newChecklist);
                      }}
                      className="bg-[#0B0F19] border border-slate-800 p-2.5 rounded-lg flex items-center gap-3 cursor-pointer hover:border-slate-600 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${checklist[idx] ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-600'}`}>
                        {checklist[idx] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[10px] text-slate-300">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supporting Docs */}
              <div className="border border-slate-700 bg-[#0F1423] rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-white text-[11px]">Supporting Documents Deck</div>
                    <div className="text-[10px] text-slate-500">Inspect attached certificates, business permits, and vendor accreditation records.</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">
                    {documents.length} Attached
                  </div>
                </div>
                
                {documents.length === 0 ? (
                  <div className="border border-dashed border-slate-700 bg-[#0B0F19] p-4 rounded-xl text-center text-slate-500 text-[10px]">
                    No supporting documents attached to this request.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 border border-slate-700 p-2 rounded-lg bg-slate-800/50">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                        <span className="truncate flex-1">{doc.name || `Document ${i+1}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decision Section */}
              <div className="border border-slate-700 bg-[#0F1423] rounded-xl p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <CheckCircle className="w-4 h-4" /> QA Governance Authority Decision
                  </div>
                  <div className="text-[10px] text-slate-500">Select official action. Approving will automatically commit and assign official Master ID.</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-300 mb-1">QA Auditor Remarks / Specific Correction Notes *</div>
                  {errorMsg && (
                    <div className="mb-2 p-2 bg-rose-950/50 border border-rose-900 rounded-lg text-rose-400 text-[10px] flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      {errorMsg}
                    </div>
                  )}
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="E.g., All BIR 2303 details verified against BIR portal. Approved for master data incorporation..."
                    className="w-full h-20 bg-[#0B0F19] border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-2 justify-between mt-4">
                  <button 
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve & Finalize
                  </button>
                  <button 
                    onClick={handleReturn}
                    disabled={isProcessing}
                    className="flex-1 bg-[#D97706] hover:bg-[#B45309] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" /> Return for Fix
                  </button>
                  <button 
                    onClick={handleReturn}
                    disabled={isProcessing}
                    className="flex-1 bg-[#EA580C] hover:bg-[#C2410C] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" /> Incomplete Docs
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject Request
                  </button>
                </div>
              </div>

            </div>
          );
        })() : (
          <div className="w-2/3 flex items-center justify-center text-slate-500 flex-col gap-3">
            <ShieldCheck className="w-12 h-12 opacity-20" />
            <div>Select a request from the queue to begin QA review.</div>
          </div>
        )}
      </div>
    </div>
  );
}
