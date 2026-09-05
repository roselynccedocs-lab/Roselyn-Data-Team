import * as React from 'react';
import { useState } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  DollarSign, 
  FileText, 
  Plus, 
  CheckCircle, 
  ArrowRight, 
  TrendingUp, 
  PieChart, 
  Download, 
  Building2, 
  Receipt,
  Scale
} from 'lucide-react';
import { JournalEntryModal } from '../components/modals/JournalEntryModal';

const initialInvoices: Invoice[] = [
  { id: 'INV-301', invoiceNumber: 'INV-2026-001', customerName: 'Apex Chemical Refining Inc.', amount: 485000, status: 'PAID', dueDate: 'Sept 15, 2026', createdAt: Date.now() - 172800000 },
  { id: 'INV-302', invoiceNumber: 'INV-2026-002', customerName: 'Globex Petrochemical Logistics', amount: 320000, status: 'UNPAID', dueDate: 'Sept 20, 2026', createdAt: Date.now() - 86400000 },
  { id: 'INV-303', invoiceNumber: 'INV-2026-003', customerName: 'Stark Pharma Laboratories', amount: 650000, status: 'PARTIAL', dueDate: 'Sept 25, 2026', createdAt: Date.now() },
  { id: 'INV-304', invoiceNumber: 'INV-2026-004', customerName: 'BioSynthetics Asia Corp.', amount: 215000, status: 'UNPAID', dueDate: 'Oct 02, 2026', createdAt: Date.now() - 3600000 },
];

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [activeTab, setActiveTab] = useState<'invoices' | 'statements' | 'tax'>('invoices');
  const [statementType, setStatementType] = useState<'income' | 'balance' | 'cashflow'>('income');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // New Invoice Form
  const [custName, setCustName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('Oct 15, 2026');

  const toggleInvoiceStatus = (id: string) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        const next: Invoice['status'] = inv.status === 'UNPAID' ? 'PARTIAL' : inv.status === 'PARTIAL' ? 'PAID' : 'UNPAID';
        return { ...inv, status: next };
      }
      return inv;
    }));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: Invoice = {
      id: `INV-${Math.floor(305 + Math.random() * 200)}`,
      invoiceNumber: `INV-2026-00${invoices.length + 1}`,
      customerName: custName,
      amount: parseFloat(amount) || 50000,
      status: 'UNPAID',
      dueDate,
      createdAt: Date.now(),
    };
    setInvoices([newInv, ...invoices]);
    setShowNewInvoiceModal(false);
    setCustName('');
    setAmount('');
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReceivable = invoices.filter(inv => inv.status !== 'PAID').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Automated Accounting Suite
            </span>
            <span className="text-xs text-slate-400">• BIR & IFRS Compliant Financials</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Finance & Automated Financial Statements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Real-time multi-currency general ledger, accounts receivable/payable, automated balance sheets, income statements, and tax reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJournalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Scale className="w-4 h-4 text-emerald-600" /> New Journal Entry
          </button>
          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Sales Invoice
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Gross Billed Revenue (YTD)</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">+18.4% vs FY 2025</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Accounts Receivable (A/R)</p>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalReceivable)}</p>
          <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">3 Outstanding Invoices</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Accounts Payable (A/P)</p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(412500)}</p>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Raw chemical vendor terms</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">Net Operating Cash Flow</p>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(1257500)}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Healthy Liquidity (Quick Ratio: 2.8)</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'invoices', label: 'Invoices & A/R Ledger', icon: Receipt },
          { id: 'statements', label: 'Automated Financial Statements', icon: Scale },
          { id: 'tax', label: 'BIR Tax Compliance & Returns', icon: Building2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INVOICES & LEDGER */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Commercial Accounts Receivable (A/R)</h3>
            <span className="text-xs text-slate-400 font-semibold">{invoices.length} Registered Invoices</span>
          </div>

          <DataTable<Invoice>
            data={invoices}
            columns={[
              { header: 'Invoice #', accessor: (i) => <span className="font-mono text-xs font-bold text-blue-600">{i.invoiceNumber}</span> },
              { header: 'Customer / Client Name', accessor: 'customerName', className: 'font-semibold' },
              { header: 'Billed Amount', accessor: (i) => formatCurrency(i.amount), className: 'font-bold text-slate-900 dark:text-white' },
              { header: 'Payment Status', accessor: (i) => (
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    i.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    i.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {i.status}
                  </span>
                  <button 
                    onClick={() => toggleInvoiceStatus(i.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition-colors"
                    title="Advance status"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )},
              { header: 'Due Date', accessor: 'dueDate', className: 'text-xs text-slate-500 font-semibold' }
            ]}
          />
        </div>
      )}

      {/* TAB 2: AUTOMATED FINANCIAL STATEMENTS */}
      {activeTab === 'statements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              {[
                { id: 'income', label: 'Income Statement (P&L)' },
                { id: 'balance', label: 'Balance Sheet' },
                { id: 'cashflow', label: 'Statement of Cash Flows' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatementType(st.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statementType === st.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF / CSV
            </button>
          </div>

          {/* INCOME STATEMENT */}
          {statementType === 'income' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-mono text-xs">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-sans">CENTAUR CHEM ENTERPRISE</h2>
                <p className="text-xs text-slate-500 font-sans font-semibold">Statement of Profit and Loss (Income Statement)</p>
                <p className="text-[10px] text-slate-400 font-sans">For the Fiscal Period Ended August 31, 2026 (Expressed in Philippine Pesos)</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                  <span>REVENUE / GROSS SALES:</span>
                  <span>{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Chemical Products & Synthesis Sales</span>
                    <span>{formatCurrency(1450000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lab Testing & Formulation Consulting Fees</span>
                    <span>{formatCurrency(220000)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>LESS: COST OF GOODS SOLD (COGS)</span>
                  <span className="text-rose-600">({formatCurrency(680000)})</span>
                </div>
                <div className="pl-4 space-y-1 text-slate-500">
                  <div className="flex justify-between"><span>Raw Chemical Precursors & Solvents</span><span>₱420,000.00</span></div>
                  <div className="flex justify-between"><span>Direct Laboratory Labor & Synthesist Payroll</span><span>₱180,000.00</span></div>
                  <div className="flex justify-between"><span>Factory Overhead & Power Utilities</span><span>₱80,000.00</span></div>
                </div>

                <div className="border-t border-b border-slate-300 dark:border-slate-700 py-2 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                  <span>GROSS PROFIT:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue - 680000)}</span>
                </div>

                <div className="pt-2 flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>OPERATING EXPENSES (OPEX):</span>
                  <span className="text-rose-600">({formatCurrency(310000)})</span>
                </div>
                <div className="pl-4 space-y-1 text-slate-500">
                  <div className="flex justify-between"><span>Administrative Salaries & Benefits</span><span>₱195,000.00</span></div>
                  <div className="flex justify-between"><span>BGC HQ Lease & Facility Management</span><span>₱85,000.00</span></div>
                  <div className="flex justify-between"><span>Depreciation & Lab Equipment Amortization</span><span>₱30,000.00</span></div>
                </div>

                <div className="border-t-2 border-double border-slate-900 dark:border-slate-100 pt-3 flex justify-between font-extrabold text-base text-blue-600 dark:text-blue-400">
                  <span>NET INCOME BEFORE TAX (EBIT):</span>
                  <span>{formatCurrency(totalRevenue - 680000 - 310000)}</span>
                </div>
              </div>
            </div>
          )}

          {/* BALANCE SHEET */}
          {statementType === 'balance' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-mono text-xs">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-sans">CENTAUR CHEM ENTERPRISE</h2>
                <p className="text-xs text-slate-500 font-sans font-semibold">Statement of Financial Position (Balance Sheet)</p>
                <p className="text-[10px] text-slate-400 font-sans">As of August 31, 2026</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="font-extrabold text-sm text-blue-600 dark:text-blue-400 font-sans">TOTAL ASSETS</p>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between"><span>Cash & Cash Equivalents</span><span>₱1,850,000.00</span></div>
                    <div className="flex justify-between"><span>Accounts Receivable (Net)</span><span>₱{totalReceivable.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Chemical Reagent Inventory</span><span>₱920,000.00</span></div>
                    <div className="flex justify-between"><span>Property, Plant & Lab Equipment</span><span>₱4,500,000.00</span></div>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-2 flex justify-between font-extrabold text-slate-900 dark:text-white">
                    <span>SUM OF ASSETS:</span>
                    <span>{formatCurrency(1850000 + totalReceivable + 920000 + 4500000)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-extrabold text-sm text-amber-600 dark:text-amber-400 font-sans">LIABILITIES & STOCKHOLDERS' EQUITY</p>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between"><span>Accounts Payable (Trade Vendors)</span><span>₱412,500.00</span></div>
                    <div className="flex justify-between"><span>Accrued Payroll & Statutory Liabilities</span><span>₱145,000.00</span></div>
                    <div className="flex justify-between"><span>Paid-in Capital Stock</span><span>₱5,000,000.00</span></div>
                    <div className="flex justify-between"><span>Retained Earnings</span><span>₱{((1850000 + totalReceivable + 920000 + 4500000) - (412500 + 145000 + 5000000)).toLocaleString()}</span></div>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-2 flex justify-between font-extrabold text-slate-900 dark:text-white">
                    <span>SUM OF LIAB & EQUITY:</span>
                    <span>{formatCurrency(1850000 + totalReceivable + 920000 + 4500000)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASH FLOW */}
          {statementType === 'cashflow' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-mono text-xs">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-sans">CENTAUR CHEM ENTERPRISE</h2>
                <p className="text-xs text-slate-500 font-sans font-semibold">Statement of Cash Flows</p>
                <p className="text-[10px] text-slate-400 font-sans">Direct Method • Period Ended August 31, 2026</p>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Cash Generated from Operations:</span>
                  <span className="text-emerald-600">+₱1,420,000.00</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Cash Outflow for Capital Expenditures (CapEx):</span>
                  <span className="text-rose-600">-₱280,000.00</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Financing Activities (Dividends & Debt Repayment):</span>
                  <span className="text-slate-500">₱0.00</span>
                </div>
                <div className="border-t-2 border-slate-900 dark:border-slate-100 pt-2 flex justify-between font-extrabold text-base text-slate-900 dark:text-white">
                  <span>NET CASH AT END OF PERIOD:</span>
                  <span className="text-blue-600 dark:text-blue-400">₱1,850,000.00</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TAX COMPLIANCE */}
      {activeTab === 'tax' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Bureau of Internal Revenue (BIR) Returns
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { code: 'BIR Form 2550M', name: 'Monthly Value-Added Tax (VAT) Return', status: 'Filed', deadline: 'Sept 20, 2026' },
                { code: 'BIR Form 1601-C', name: 'Monthly Remittance Return of Income Taxes Withheld on Compensation', status: 'Filed', deadline: 'Sept 10, 2026' },
                { code: 'BIR Form 1702-RT', name: 'Annual Income Tax Return for Corporation', status: 'Ready for Audit', deadline: 'April 15, 2027' },
                { code: 'BIR Form 0605', name: 'Payment Form / Annual Registration Fee', status: 'Active (2026)', deadline: 'Jan 31, 2027' },
              ].map((f, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{f.code}</p>
                    <p className="text-[10px] text-slate-500">{f.name}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Withholding Tax & 2307 Auto-Generator</h3>
              <p className="text-xs text-slate-400">Generate Certificate of Creditable Tax Withheld at Source (Form 2307) for enterprise B2B customers.</p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-100">ATC Code: WI 100 (Creditable Income Tax - 1% to 2%)</p>
                <p className="text-blue-700 dark:text-blue-300 text-[11px]">
                  Automatically applied on all invoices exceeding ₱10,000 to maintain seamless corporate credit reconciliation.
                </p>
              </div>
            </div>

            <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export Form 2307 XML & PDF
            </button>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Sales Invoice</h3>
              <button 
                onClick={() => setShowNewInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer / Enterprise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Chemical Refining Inc."
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Invoice Gross Amount (PHP)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Due Date</label>
                <input
                  type="text"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <JournalEntryModal isOpen={showJournalModal} onClose={() => setShowJournalModal(false)} />
    </div>
  );
}
