import * as React from 'react';
import { useState, useMemo } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { formatCurrency } from '../lib/utils';
import { DollarSign, FileText, Calculator, ShieldCheck, Download, Plus, CheckCircle, Printer, Fingerprint, Clock, Building2 } from 'lucide-react';
import { BiometricModal } from '../components/modals/BiometricModal';
import { PayrollProcessModal } from '../components/modals/PayrollProcessModal';
import { ShiftManagementModal } from '../components/modals/ShiftManagementModal';
import { LoanDeductionModal } from '../components/modals/LoanDeductionModal';
import { GovernmentContributionModal } from '../components/modals/GovernmentContributionModal';
import { useEmployees } from '../hooks/useEmployees';

export default function PayrollPage() {
  const { employees } = useEmployees();
  const [activeTab, setActiveTab] = useState<'processing' | 'ledger' | 'statutory' | 'reports'>('processing');
  const [payPeriod, setPayPeriod] = useState('August 16 - 31, 2026 (Semi-Monthly)');

  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showGovModal, setShowGovModal] = useState(false);

  // Derive payroll data from active employees
  const employeePayrolls = useMemo(() => {
    return employees
      .filter(e => e.status === 'REGULAR' || e.status === 'PROBATIONARY' || e.status === 'ACTIVE' || e.status === 'CONTRACTUAL')
      .map(emp => {
        const monthly = emp.salary || 30000;
        const semiMonthlyBasic = Math.round(monthly / 2);
        const allowances = Math.round(semiMonthlyBasic * 0.12);
        const sss = Math.min(1350, Math.round(semiMonthlyBasic * 0.045));
        const philhealth = Math.min(1000, Math.round(semiMonthlyBasic * 0.025));
        const pagibig = 200;
        const taxable = Math.max(0, semiMonthlyBasic + allowances - (sss + philhealth + pagibig));
        const tax = taxable > 10417 ? Math.round((taxable - 10417) * 0.15) : 0;
        const net = semiMonthlyBasic + allowances - (sss + philhealth + pagibig + tax);

        return {
          id: emp.id,
          name: emp.fullName || `${emp.lastName}, ${emp.firstName}`,
          role: emp.position,
          department: emp.department,
          basic: semiMonthlyBasic,
          allowances,
          sss,
          philhealth,
          pagibig,
          tax,
          net,
          status: 'PROCESSED'
        };
      });
  }, [employees]);

  const totals = useMemo(() => {
    const gross = employeePayrolls.reduce((sum, p) => sum + p.basic + p.allowances, 0);
    const deductions = employeePayrolls.reduce((sum, p) => sum + p.sss + p.philhealth + p.pagibig + p.tax, 0);
    const net = employeePayrolls.reduce((sum, p) => sum + p.net, 0);
    return { gross, deductions, net };
  }, [employeePayrolls]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll & Statutory Compliance</h1>
          <p className="text-slate-500 dark:text-slate-400">Centaur Chem Enterprise Payroll Processing, SSS/PhilHealth/Pag-IBIG/BIR reports, and LEDGER registers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowBiometricModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
          >
            <Fingerprint className="w-4 h-4 text-blue-600" /> Biometric Sync
          </button>
          <button 
            onClick={() => setShowShiftModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
          >
            <Clock className="w-4 h-4 text-indigo-600" /> Shift Management
          </button>
          <button 
            onClick={() => setShowLoanModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" /> Loans & Deductions
          </button>
          <button 
            onClick={() => setShowGovModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
          >
            <Building2 className="w-4 h-4 text-purple-600" /> Government Forms
          </button>
          <button 
            onClick={() => setShowPayrollModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Calculator className="w-4 h-4" /> Run Payroll Calculation
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'processing', label: 'Payroll Processing & Payslips' },
          { id: 'ledger', label: 'Payroll Ledger & Registers' },
          { id: 'statutory', label: 'Government & Statutory Reports' },
          { id: 'reports', label: 'Reports You Can Rely On' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'processing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Total Gross Payroll</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(totals.gross)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Statutory Deductions</p>
              <p className="text-xl font-bold mt-1 text-orange-600">{formatCurrency(totals.deductions)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Total Net Payroll</p>
              <p className="text-xl font-bold mt-1 text-emerald-600">{formatCurrency(totals.net)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Active Pay Cycle</p>
              <p className="text-xl font-bold mt-1 text-blue-600">{employeePayrolls.length} Active Staff</p>
            </div>
          </div>

          <DataTable
            data={employeePayrolls}
            columns={[
              { header: 'Employee', accessor: (p: any) => (
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.role}</p>
                </div>
              )},
              { header: 'Basic Pay', accessor: (p: any) => formatCurrency(p.basic) },
              { header: 'Allowances', accessor: (p: any) => formatCurrency(p.allowances) },
              { header: 'Statutory (SSS/Phil/Pag)', accessor: (p: any) => formatCurrency(p.sss + p.philhealth + p.pagibig), className: 'text-orange-600 font-mono' },
              { header: 'Withholding Tax', accessor: (p: any) => formatCurrency(p.tax), className: 'font-mono' },
              { header: 'Net Pay', accessor: (p: any) => <span className="font-bold text-emerald-600">{formatCurrency(p.net)}</span> },
              { header: 'Status', accessor: (p: any) => (
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${p.status === 'PROCESSED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {p.status}
                </span>
              )}
            ]}
          />
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Payroll Ledger & Registers</h3>
                <p className="text-xs text-slate-500">Comprehensive ledger of all earnings, deductions, overtime, and allowances across departments.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <Printer className="w-4 h-4" /> Export Ledger Register
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-500">R&D Laboratory Ledger</p>
                <p className="text-lg font-bold mt-1">{formatCurrency(450000)} YTD</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-500">Quality Control Ledger</p>
                <p className="text-lg font-bold mt-1">{formatCurrency(310000)} YTD</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-500">Supply Chain & Warehouse Ledger</p>
                <p className="text-lg font-bold mt-1">{formatCurrency(280000)} YTD</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'statutory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'SSS Contribution Remittance (Forms R-3 / R5)', code: 'SSS-PH-2026', total: formatCurrency(14250), status: 'Ready for Electronic Submission' },
              { title: 'PhilHealth Premium Remittance (RF-1)', code: 'PH-MED-2026', total: formatCurrency(6800), status: 'Generated & Validated' },
              { title: 'Pag-IBIG Fund Contribution (MCRF)', code: 'HDMF-2026', total: formatCurrency(2400), status: 'Generated & Validated' },
              { title: 'BIR Monthly Withholding Tax (Form 1601-C)', code: 'BIR-1601C', total: formatCurrency(28500), status: 'Ready for eFPS Upload' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base">{stat.title}</h4>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">Reference: {stat.code}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full">
                    {stat.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-500">Total Contribution Value:</span>
                  <span className="text-lg font-bold">{stat.total}</span>
                </div>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Download Statutory Submission File
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-semibold">Reports You Can Rely On</h3>
            <p className="text-xs text-slate-500">Select any official report to generate real-time PDF or spreadsheet exports.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Timekeeping Reports', 'TIC Cutoff Summary', 'Daily Time Record (DTR)',
                'Undertime & Lateness', 'Night Differential Report', 'Overtime Summary',
                'Holiday Pay Register', 'Leave Ledger & Balances', 'Individual Payslips',
                'Payroll Ledger Summary', 'Alphalist Report (BIR)', 'Payroll Journal Register',
                'Payroll Summary Report', 'BIR Form 2316 Annual'
              ].map((reportName, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                  <span className="font-medium">{reportName}</span>
                  <button className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg transition-colors" title="Download report">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BiometricModal isOpen={showBiometricModal} onClose={() => setShowBiometricModal(false)} />
      <PayrollProcessModal isOpen={showPayrollModal} onClose={() => setShowPayrollModal(false)} />
      <ShiftManagementModal isOpen={showShiftModal} onClose={() => setShowShiftModal(false)} />
      <LoanDeductionModal isOpen={showLoanModal} onClose={() => setShowLoanModal(false)} />
      <GovernmentContributionModal isOpen={showGovModal} onClose={() => setShowGovModal(false)} />
    </div>
  );
}
