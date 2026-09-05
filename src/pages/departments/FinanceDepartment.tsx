import React, { useState } from 'react';
import FinancePage from '../../pages/FinancePage';
import { DollarSign, Landmark, Scale, Building2, CreditCard, Send, Plus, CheckCircle2, FileText, Download, ShieldCheck, Printer, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { JournalEntryModal } from '../../components/modals/JournalEntryModal';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

export function FinanceDepartment() {
  const [departmentSubTab, setDepartmentSubTab] = useState<'accounting' | 'treasury' | 'statements' | 'bir-forms'>('accounting');
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedBirForm, setSelectedBirForm] = useState<any>(null);
  const [filingSuccess, setFilingSuccess] = useState(false);

  // 10 BIR Tax Forms & Statutory Reports from user specification
  const birFormsList = [
    {
      code: 'BIR Form 2307',
      name: 'Certificate of Creditable Tax Withheld at Source',
      category: 'Expanded Withholding Tax (EWT)',
      period: 'Monthly / Quarterly',
      status: 'Ready for e-Filing',
      description: 'Certifies taxes withheld by Centaur Chem Enterprise from suppliers and contractors.',
      amount: '₱384,500.00',
      deadline: '20th day following the close of the taxable quarter'
    },
    {
      code: 'BIR Form 0619-E',
      name: 'Monthly Remittance Form of Creditable Income Taxes Withheld (Expanded)',
      category: 'Withholding Tax Remittance',
      period: 'Monthly (First 2 Months of Quarter)',
      status: 'Filed & Paid (eFPS)',
      description: 'Monthly remittance of EWT withheld from professional fees, rentals, and supplier services.',
      amount: '₱128,400.00',
      deadline: '10th day of the following month'
    },
    {
      code: 'BIR Form 1601EQ',
      name: 'Quarterly Remittance Return of Creditable Income Taxes Withheld (Expanded)',
      category: 'Expanded Withholding Tax',
      period: 'Quarterly',
      status: 'Pending Submission',
      description: 'Quarterly consolidated return for creditable income taxes withheld on expanded withholding.',
      amount: '₱412,000.00',
      deadline: 'Last day of the month following the close of the quarter'
    },
    {
      code: 'BIR Form 2550M',
      name: 'Monthly Value-Added Tax Declaration',
      category: 'Value-Added Tax (VAT)',
      period: 'Monthly (Months 1 & 2 of Quarter)',
      status: 'Filed & Paid via eBIRForms',
      description: 'Monthly declaration of output and input value-added tax for chemical manufacturing sales.',
      amount: '₱1,240,000.00',
      deadline: '20th day following the end of the month'
    },
    {
      code: 'BIR Form 2550Q',
      name: 'Quarterly Value-Added Tax Declaration',
      category: 'Value-Added Tax (VAT)',
      period: 'Quarterly',
      status: 'Ready for Review',
      description: 'Quarterly VAT return consolidating monthly declarations and creditable input taxes.',
      amount: '₱3,650,000.00',
      deadline: '25th day following the close of the taxable quarter'
    },
    {
      code: 'EWT REPORT',
      name: 'Expanded Withholding Tax Summary Report',
      category: 'Tax Compliance Schedules',
      period: 'Monthly / Quarterly',
      status: 'Generated & Validated',
      description: 'Detailed alphalist of payees subjected to withholding tax with TIN and gross amounts.',
      amount: '₱540,400.00',
      deadline: 'Attached to quarterly 1601EQ'
    },
    {
      code: 'BOOKS OF ACCOUNT',
      name: 'Registered Books of Account (Journals & Ledgers)',
      category: 'Statutory Accounting Books',
      period: 'Real-time Continuous / Annual',
      status: 'Maintained & Synced',
      description: 'Cash Receipts, Cash Disbursements, General Journal, and General Ledger (Bound / Computerized).',
      amount: '₱45,200,000.00 Total Assets',
      deadline: 'Maintained at principal place of business'
    },
    {
      code: 'OUTPUT & INPUT VAT REPORTS',
      name: 'VAT Summary & Reconciliation Schedule',
      category: 'VAT Audit Schedules',
      period: 'Monthly / Quarterly',
      status: 'Reconciled with General Ledger',
      description: 'Detailed breakdown of taxable sales, zero-rated exports, and importation input VAT credits.',
      amount: '₱1,850,000.00 Input Credits',
      deadline: 'Available for BIR Tax Audit'
    },
    {
      code: 'MAP / QAP / SAWT REPORTS',
      name: 'MAP, QAP & SAWT (Summary Alphalist of Withholding Agents)',
      category: 'Alphalist Submissions',
      period: 'Quarterly / Annual',
      status: 'Ready for RELIEF / eSubmission',
      description: 'Monthly Alphalist of Payees (MAP), Quarterly Alphalist of Payees (QAP), and SAWT data files.',
      amount: '₱12.4M Total Base',
      deadline: 'End of month following close of quarter'
    },
    {
      code: 'BIR RELIEF (Purchase & Sales)',
      name: 'Reconciliation of Listing for Enforcement (RELIEF)',
      category: 'Digital Tax Compliance',
      period: 'Quarterly / Submission via RELIEF System',
      status: 'DAT Files Generated',
      description: 'Electronic submission files for quarterly sales and purchase listings exceeding threshold.',
      amount: '₱28,900,000.00 Volume',
      deadline: '30 days from end of quarter'
    }
  ];

  const handleFileForm = (form: any) => {
    setSelectedBirForm(form);
    setFilingSuccess(false);
  };

  const handleConfirmSubmission = () => {
    setFilingSuccess(true);
    setTimeout(() => {
      setFilingSuccess(false);
      setSelectedBirForm(null);
    }, 2000);
  };

  // Treasury specific state
  const [bankAccounts, setBankAccounts] = useState([
    { id: 'BA-01', bank: 'BPI Corporate Banking', accountNo: '****-4820-991', type: 'Current Account (PHP)', balance: 14250000 },
    { id: 'BA-02', bank: 'BDO Unibank', accountNo: '****-1192-334', type: 'Savings & Operating', balance: 8750000 },
    { id: 'BA-03', bank: 'UnionBank of the Philippines', accountNo: '****-9921-002', type: 'Foreign Currency (USD)', balance: 125000 }, // USD
  ]);
  const [transferModal, setTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('500000');
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setTransferModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 p-1 bg-emerald-600/10 text-emerald-600 rounded-lg h-6" /> Finance Department (Accounting, Treasury & Finance)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive financial management, double-entry general ledger, treasury banking, and statutory BIR tax compliance.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <SubmitSupportButton departmentName="Finance Department" />
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setDepartmentSubTab('accounting')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                departmentSubTab === 'accounting' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Accounting & Ledger
            </button>
            <button
              onClick={() => setDepartmentSubTab('treasury')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                departmentSubTab === 'treasury' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" /> Treasury & Banking
            </button>
            <button
              onClick={() => setDepartmentSubTab('statements')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                departmentSubTab === 'statements' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Financial Statements
            </button>
            <button
              onClick={() => setDepartmentSubTab('bir-forms')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                departmentSubTab === 'bir-forms' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> BIR Tax Forms & Reports
            </button>
          </div>
        </div>
      </div>
    </div>

      <div className="transition-all">
        {departmentSubTab === 'accounting' && <FinancePage />}
        
        {departmentSubTab === 'treasury' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Corporate Treasury & Cash Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time multi-bank balances, liquidity forecasting, and inter-account fund transfers.</p>
              </div>
              <button
                onClick={() => setTransferModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" /> Fund Transfer / Disbursement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bankAccounts.map((ba) => (
                <div key={ba.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {ba.type}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{ba.bank}</h4>
                    </div>
                    <Landmark className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-mono">{ba.accountNo}</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {ba.bank.includes('USD') ? `$${ba.balance.toLocaleString()}` : formatCurrency(ba.balance)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-semibold text-slate-500">
                    <span>Status: Verified Active</span>
                    <span className="text-emerald-600 font-bold">Synchronized</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Treasury Cash Flows</h3>
              <div className="space-y-2">
                {[
                  { ref: 'TR-8812', desc: 'Incoming Client Payment - Apex Chemical', bank: 'BPI Corporate', amount: '+ ₱485,000.00', type: 'CREDIT', date: 'Today, 09:42 AM' },
                  { ref: 'TR-8811', desc: 'Payroll Fund Sweep to Security Bank', bank: 'BDO Unibank', amount: '- ₱2,450,000.00', type: 'DEBIT', date: 'Yesterday' },
                  { ref: 'TR-8810', desc: 'Supplier Disbursement - Merck Reagents', bank: 'BPI Corporate', amount: '- ₱500,000.00', type: 'DEBIT', date: 'Aug 30, 2026' },
                ].map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">{tx.desc}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{tx.ref} • {tx.bank} • {tx.date}</span>
                    </div>
                    <span className={`font-mono font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {transferModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Treasury Fund Transfer / Disbursement</h3>
                  <form onSubmit={handleTransfer} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300">Source Account</label>
                      <select className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none">
                        <option>BPI Corporate Banking (₱14,250,000.00)</option>
                        <option>BDO Unibank (₱8,750,000.00)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300">Destination Account / Beneficiary</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Merck Chemical Supplies Inc. (BPI #0021-998)"
                        defaultValue="Merck Chemical Supplies Inc."
                        className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300">Transfer Amount (PHP)</label>
                      <input 
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono font-bold"
                      />
                    </div>
                    {transferSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transfer successfully processed and journalized!
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        type="button" 
                        onClick={() => setTransferModal(false)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                      >
                        Authorize & Execute Transfer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {departmentSubTab === 'statements' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Executive Financial Statements & BIR Tax Reports</h3>
                  <p className="text-xs text-slate-500">Income Statement (P&L), Balance Sheet, Statement of Cash Flows, and statutory tax returns.</p>
                </div>
                <button
                  onClick={() => alert('Exporting Certified Financial Statements to PDF/Excel...')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Download Certified FS Package
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statement of Income (P&L)</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">YTD Net Income</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono">₱12,840,500.00</p>
                  <p className="text-[11px] text-slate-500">Gross Margin: 64.2% • Operating Expenses: ₱4.2M</p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance Sheet</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Total Assets = L + E</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">₱45,200,000.00</p>
                  <p className="text-[11px] text-slate-500">Current Ratio: 2.84 • Debt-to-Equity: 0.35</p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash Flow Statement</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Operating Cash Flow</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono">₱15,120,000.00</p>
                  <p className="text-[11px] text-slate-500">Free Cash Flow: ₱11.4M after CapEx</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {departmentSubTab === 'bir-forms' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    CENTAUR CHEM ENTERPRISE - BIR TAX FORMS & STATUTORY REPORTS
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">Official BIR Electronic Tax Forms & Financial Alphalists</h3>
                  <p className="text-xs text-slate-500">All required Philippine Bureau of Internal Revenue (BIR) tax forms, VAT reports, EWT schedules, and RELIEF submissions ready for eFPS / eBIRForms.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Generating consolidated BIR eFPS / eBIRForms ZIP package (.DAT files & XML)...')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" /> Export All BIR DAT / XML Files
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {birFormsList.map((form, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold rounded-lg">
                          {form.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          form.status.includes('Filed') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {form.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{form.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{form.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Declared Amount / Base</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{form.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFileForm(form)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5" /> View / File Form
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedBirForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold rounded-lg">
                        {selectedBirForm.code}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">{selectedBirForm.name}</h3>
                      <p className="text-xs text-slate-500">{selectedBirForm.category} • Period: {selectedBirForm.period}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedBirForm(null)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Taxpayer Name:</span>
                        <strong className="text-slate-900 dark:text-white">CENTAUR CHEM ENTERPRISE INC.</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">TIN Number:</span>
                        <strong className="font-mono text-slate-900 dark:text-white">009-842-102-000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Registered Address:</span>
                        <span className="text-slate-900 dark:text-white font-medium">BGC Taguig Corporate Center, Metro Manila</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Statutory Deadline:</span>
                        <span className="text-amber-600 font-bold">{selectedBirForm.deadline}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-white">Form Details & Summary Computation</h5>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-emerald-800 dark:text-emerald-300">Total Tax Base / Gross Amount:</span>
                          <span className="font-mono font-bold text-emerald-950 dark:text-emerald-100">{selectedBirForm.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-800 dark:text-emerald-300">Compliance Status:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">{selectedBirForm.status}</span>
                        </div>
                      </div>
                    </div>

                    {filingSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Form successfully filed & e-receipt generated!
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => alert(`Downloading official PDF copy for ${selectedBirForm.code}...`)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / PDF
                    </button>
                    <button
                      onClick={handleConfirmSubmission}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" /> Submit via eFPS / eBIRForms
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <JournalEntryModal isOpen={showJournalModal} onClose={() => setShowJournalModal(false)} />
    </div>
  );
}
