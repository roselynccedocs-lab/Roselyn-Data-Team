import React from 'react';
import { MasterRecordDocument, MasterRequestDocument } from '../../types/masterData';
import { 
  Building2, 
  Truck, 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ArrowUpRight, 
  FileText, 
  PlusCircle, 
  Download, 
  Layers 
} from 'lucide-react';

interface GovernanceHubDrawerProps {
  masterRecords: MasterRecordDocument[];
  requests: MasterRequestDocument[];
  onClose: () => void;
  onNavigateTab: (tab: 'REGISTER' | 'INTAKE' | 'QA_QUEUE' | 'MDM_WORKSPACE' | 'AUDIT_LOGS') => void;
  onOpenBatchImport: () => void;
}

export function GovernanceHubDrawer({
  masterRecords,
  requests,
  onClose,
  onNavigateTab,
  onOpenBatchImport
}: GovernanceHubDrawerProps) {
  const customerCount = masterRecords.filter(r => r.domain === 'CUSTOMER' && r.status === 'ACTIVE').length;
  const supplierCount = masterRecords.filter(r => r.domain === 'SUPPLIER' && r.status === 'ACTIVE').length;
  const itemCount = masterRecords.filter(r => r.domain === 'ITEM' && r.status === 'ACTIVE').length;

  const pendingQaCount = requests.filter(r => r.status === 'PENDING_QA').length;
  const pendingMdmCount = requests.filter(r => r.status === 'PENDING_MDM').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 block">Governance Central Command</span>
              <h2 className="font-extrabold text-base text-white">Master Data Repository Hub</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Domain Counters Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>Customers</span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black font-mono text-indigo-400">{customerCount}</p>
            <span className="text-[10px] text-slate-400 block">Verified BIR / Tax IDs</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>Suppliers</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black font-mono text-amber-400">{supplierCount}</p>
            <span className="text-[10px] text-slate-400 block">Banking & SWIFT Approved</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>Chemicals & Items</span>
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black font-mono text-emerald-400">{itemCount}</p>
            <span className="text-[10px] text-slate-400 block">UOM & Margin Validated</span>
          </div>
        </div>

        {/* Workflow Queues Bar */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Active Governance Workflow Queues
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { onClose(); onNavigateTab('QA_QUEUE'); }}
              className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 rounded-xl text-left flex items-center justify-between group transition-all"
            >
              <div>
                <span className="text-slate-400 font-bold block">Department QA Review</span>
                <span className="font-mono text-lg font-black text-amber-400">{pendingQaCount} Pending</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => { onClose(); onNavigateTab('MDM_WORKSPACE'); }}
              className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 rounded-xl text-left flex items-center justify-between group transition-all"
            >
              <div>
                <span className="text-slate-400 font-bold block">MDM Manager Approval</span>
                <span className="font-mono text-lg font-black text-emerald-400">{pendingMdmCount} Pending</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Governance Quick Action Links */}
        <div className="space-y-2">
          <span className="font-bold text-slate-400 block uppercase text-[10px]">Governance Quick Actions</span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onClose(); onOpenBatchImport(); }}
              className="flex items-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all text-white"
            >
              <Download className="w-4 h-4" />
              <span>Batch CSV Import Engine</span>
            </button>

            <button
              onClick={() => { onClose(); onNavigateTab('INTAKE'); }}
              className="flex items-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition-all text-white"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request New Single Master</span>
            </button>

            <button
              onClick={() => { onClose(); onNavigateTab('AUDIT_LOGS'); }}
              className="flex items-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all text-slate-200"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Explore Audit Trail Ledger</span>
            </button>

            <button
              onClick={() => { onClose(); onNavigateTab('REGISTER'); }}
              className="flex items-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all text-slate-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>View Official Master Register</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
