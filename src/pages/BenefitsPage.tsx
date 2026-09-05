import * as React from 'react';
import { useState } from 'react';
import { initialBenefits, initialBenefitClaims } from '../data/mockHrData';
import { EmployeeBenefit, BenefitClaim } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Plus, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Users,
  Activity,
  Layers
} from 'lucide-react';

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<EmployeeBenefit[]>(initialBenefits);
  const [claims, setClaims] = useState<BenefitClaim[]>(initialBenefitClaims);
  const [activeTab, setActiveTab] = useState<'plans' | 'claims' | 'calculator'>('plans');
  const [showClaimModal, setShowClaimModal] = useState(false);

  // New Claim Form state
  const [benefitType, setBenefitType] = useState('Dental & Optical Subsidy');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimNotes, setClaimNotes] = useState('');

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: BenefitClaim = {
      id: `CLM-${Math.floor(500 + Math.random() * 500)}`,
      employeeName: 'Dr. Arnold Cortina (You)',
      benefitType,
      claimAmount: parseFloat(claimAmount) || 1500,
      approvedAmount: parseFloat(claimAmount) || 1500,
      dateSubmitted: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'UNDER_REVIEW',
    };
    setClaims([newClaim, ...claims]);
    setShowClaimModal(false);
    setClaimAmount('');
    setClaimNotes('');
  };

  const totalCoverage = benefits.reduce((sum, b) => sum + b.coverageAmount, 0);
  const totalCompanyContrib = benefits.reduce((sum, b) => sum + b.companyContribution, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Benefits Management
            </span>
            <span className="text-xs text-slate-400">• Health, Flex & Statutory Protection</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Employee Benefits & Welfare Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Comprehensive medical HMO, group term insurance, flexi-wellness allowances, and Philippine statutory benefit coverages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> File Benefit Claim
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Available Coverage</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(totalCoverage)}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">HMO + Life + Statutory</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Monthly Subsidy</p>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalCompanyContrib)}</p>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">100% Employer Funded Flex</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Benefit Plans</p>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{benefits.length} Enrolled</p>
          <span className="text-[10px] text-purple-600 font-bold mt-1 inline-block">All Staff Covered</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Claims Reimbursed (YTD)</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(9150)}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">3 Claims Processed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'plans', label: 'Enrolled Benefit Packages', count: benefits.length },
          { id: 'claims', label: 'Claims & Reimbursements', count: claims.length },
          { id: 'calculator', label: 'Philippine Statutory Matrix', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PLANS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    {b.type}
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full">
                    {b.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-snug">{b.benefitName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Provider: <strong>{b.provider}</strong></p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Maximum Coverage:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(b.coverageAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employer Subsidy:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(b.companyContribution)} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dependents Covered:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{b.dependentsCount} Family Members</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  File Claim Against Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Benefit Claims & Medical Reimbursements</h3>
            <span className="text-xs text-slate-400 font-semibold">{claims.length} Total Records</span>
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600 text-xs">{claim.id}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{claim.benefitType}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Claimant: {claim.employeeName} • Submitted on {claim.dateSubmitted}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(claim.claimAmount)}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Approved: {formatCurrency(claim.approvedAmount || claim.claimAmount)}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      claim.status === 'REIMBURSED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      claim.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY MATRIX */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-blue-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Social Security System (SSS)
            </h3>
            <p className="text-xs text-slate-500">Regular SSS + WISP Mandatory Provident Fund under 2026 table rates.</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p>• Employee Share: 4.5% of MSC</p>
              <p>• Employer Share: 9.5% of MSC + EC</p>
              <p>• Max Monthly Salary Credit: ₱35,000</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-emerald-600 flex items-center gap-2">
              <Activity className="w-4 h-4" /> PhilHealth Universal Healthcare
            </h3>
            <p className="text-xs text-slate-500">Universal health insurance premium divided equally (50-50).</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p>• Premium Rate: 5.0% of Basic Salary</p>
              <p>• Employee Share: 2.5%</p>
              <p>• Employer Share: 2.5%</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-amber-600 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Pag-IBIG Fund (HDMF)
            </h3>
            <p className="text-xs text-slate-500">Home development mutual fund mandatory savings & MP2 flex.</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p>• Mandatory Employee Contribution: ₱200/mo</p>
              <p>• Mandatory Employer Share: ₱200/mo</p>
              <p>• Optional MP2 High-Yield Dividend Fund</p>
            </div>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit New Benefit Claim</h3>
              <button 
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Select Benefit Program</label>
                <select
                  value={benefitType}
                  onChange={(e) => setBenefitType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option>Dental & Optical Subsidy</option>
                  <option>Flex Allowance - Prescription Medicine</option>
                  <option>HMO Outpatient Consultation</option>
                  <option>Emergency In-Patient Reimbursement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Claim Amount (PHP)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2500"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Official Receipt & Doctor / Clinic Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinic Name, Official Receipt #, Date of Service..."
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
