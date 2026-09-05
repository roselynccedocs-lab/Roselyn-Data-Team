import React, { useState, useEffect } from 'react';
import { 
  MasterRequestDocument, 
  MasterRecordDocument, 
  AuditLogEntry, 
  UserRole,
  DomainType 
} from '../../types/masterData';
import { MasterDataService } from '../../services/masterDataService';
import { RoleSwitcher } from './RoleSwitcher';
import { GovernanceAnalyticsDashboard } from './GovernanceAnalyticsDashboard';
import { RequestorEntryForm } from './RequestorEntryForm';
import { QAReviewerQueue } from './QAReviewerQueue';
import { MDMAdminWorkspace } from './MDMAdminWorkspace';
import { MasterRegisterView } from './MasterRegisterView';
import { AuditLogExplorer } from './AuditLogExplorer';
import { 
  Database, 
  Layers, 
  ShieldCheck, 
  PlusCircle, 
  FileText, 
  RefreshCw, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export function MasterDataTab() {
  const [role, setRole] = useState<UserRole>('REQUESTOR');
  const [requests, setRequests] = useState<MasterRequestDocument[]>([]);
  const [masterRecords, setMasterRecords] = useState<MasterRecordDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Sub-Tab view
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'INTAKE' | 'QA_QUEUE' | 'MDM_WORKSPACE' | 'AUDIT_LOGS'>('REGISTER');
  const [editingRequest, setEditingRequest] = useState<MasterRequestDocument | null>(null);
  const [intakeDomain, setIntakeDomain] = useState<DomainType>('CUSTOMER');

  // Simulated authenticated user
  const currentUser = {
    id: role === 'REQUESTOR' ? 'usr_req_109' : role === 'QA_REVIEWER' ? 'usr_qa_442' : role === 'MDM_MANAGER' ? 'usr_mdm_001' : 'usr_audit_990',
    name: role === 'REQUESTOR' ? 'Engr. Jerome Daypuyart' : role === 'QA_REVIEWER' ? 'Maria Santos' : role === 'MDM_MANAGER' ? 'Dr. Arnold Cortina' : 'Auditor General',
    email: 'j.daypuyart@centaurchem.ph'
  };

  const loadData = async () => {
    setIsLoading(true);
    const reqs = await MasterDataService.getRequests();
    const recs = await MasterDataService.getMasterRegister();
    const logs = await MasterDataService.getAuditLogs();
    setRequests(reqs);
    setMasterRecords(recs);
    setAuditLogs(logs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingQaCount = requests.filter(r => r.status === 'PENDING_QA').length;
  const pendingMdmCount = requests.filter(r => r.status === 'PENDING_MDM').length;

  return (
    <div className="space-y-6">
      
      {/* Role Persona Header */}
      <RoleSwitcher
        currentRole={role}
        onRoleChange={(newRole) => {
          setRole(newRole);
          if (newRole === 'QA_REVIEWER') setActiveTab('QA_QUEUE');
          else if (newRole === 'MDM_MANAGER') setActiveTab('MDM_WORKSPACE');
          else if (newRole === 'SYSTEM_AUDITOR') setActiveTab('AUDIT_LOGS');
          else setActiveTab('REGISTER');
        }}
        pendingQaCount={pendingQaCount}
        pendingMdmCount={pendingMdmCount}
      />

      {/* Governance Quantitative Metrics & Recharts Dashboard */}
      <GovernanceAnalyticsDashboard requests={requests} masterRecords={masterRecords} />

      {/* Main Governance View Selection Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === 'REGISTER'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-[18px] h-[18px] stroke-[2.5px]" />
              <span>Active Master Register</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded font-mono text-[10px]">{masterRecords.length}</span>
            </button>

            <button
              onClick={() => { setEditingRequest(null); setActiveTab('INTAKE'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === 'INTAKE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PlusCircle className="w-[18px] h-[18px] stroke-[2.5px]" />
              <span>Initiate Master Entry</span>
            </button>

            <button
              onClick={() => setActiveTab('QA_QUEUE')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === 'QA_QUEUE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-[18px] h-[18px] stroke-[2.5px]" />
              <span>QA Review Queue</span>
              {pendingQaCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded font-mono text-[10px] font-black">{pendingQaCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('MDM_WORKSPACE')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === 'MDM_WORKSPACE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-[18px] h-[18px] stroke-[2.5px]" />
              <span>MDM Sign-off Workspace</span>
              {pendingMdmCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded font-mono text-[10px] font-black">{pendingMdmCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-extrabold transition-all ${
                activeTab === 'AUDIT_LOGS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-[18px] h-[18px] stroke-[2.5px]" />
              <span>Audit Trail Ledger</span>
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors self-end md:self-auto"
            title="Refresh Master Data Collections"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab View Body */}
      {activeTab === 'REGISTER' && (
        <MasterRegisterView
          masterRecords={masterRecords}
          onRefresh={loadData}
          currentUser={currentUser}
          userRole={role}
          onRequestNewDomain={(d) => {
            setEditingRequest(null);
            if (d) setIntakeDomain(d);
            setActiveTab('INTAKE');
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
          requests={requests}
        />
      )}

      {activeTab === 'INTAKE' && (
        <div className="space-y-6">
          <RequestorEntryForm
            existingRecords={masterRecords}
            editingRequest={editingRequest}
            initialDomain={intakeDomain}
            onSuccess={() => {
              loadData();
              setActiveTab('REGISTER');
            }}
            onCancel={() => {
              setEditingRequest(null);
              setActiveTab('REGISTER');
            }}
            currentUser={currentUser}
          />

          {/* Drafts & Active Submissions Queue for Requestor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> My Governance Requests & Drafts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-500">
                    <th className="p-2">Request ID</th>
                    <th className="p-2">Domain</th>
                    <th className="p-2">Entity Title</th>
                    <th className="p-2">Workflow Status</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td className="p-2 font-mono font-bold text-indigo-600">{r.id}</td>
                      <td className="p-2 uppercase font-bold">{r.domain}</td>
                      <td className="p-2 font-bold">{(r.data as any).legalName || (r.data as any).legalEntityName || (r.data as any).description}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-[10px]">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        {(r.status === 'DRAFT' || r.status === 'REVISION_REQUESTED') && (
                          <button
                            onClick={() => { setEditingRequest(r); setActiveTab('INTAKE'); }}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold rounded-lg flex items-center gap-1 ml-auto text-[10px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Request</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'QA_QUEUE' && (
        <QAReviewerQueue
          requests={requests}
          existingRecords={masterRecords}
          onRefresh={loadData}
          currentUser={currentUser}
        />
      )}

      {activeTab === 'MDM_WORKSPACE' && (
        <MDMAdminWorkspace
          requests={requests}
          onRefresh={loadData}
          currentUser={currentUser}
        />
      )}

      {activeTab === 'AUDIT_LOGS' && (
        <AuditLogExplorer
          auditLogs={auditLogs}
          requests={requests}
          masterRecords={masterRecords}
        />
      )}

    </div>
  );
}
