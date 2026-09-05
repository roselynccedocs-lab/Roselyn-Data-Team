import React from 'react';
import { 
  Users, 
  Clock, 
  Building2, 
  CreditCard, 
  FolderLock, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

interface HRProcessFlowProps {
  activeTab: string;
  onSelectTab: (tab: 'roster' | 'hris' | 'benefits' | 'recruitment' | 'performance' | 'payroll') => void;
}

export function HRProcessFlow({ activeTab, onSelectTab }: HRProcessFlowProps) {
  const steps = [
    {
      id: 'step-1',
      num: '1',
      title: 'Employee & 201 Roster',
      desc: 'Master records, positions, departments, history & 201 files',
      icon: Users,
      targetTab: 'roster' as const,
      color: 'border-blue-500 text-blue-600 bg-blue-50/80 dark:bg-blue-950/40',
      activeBadge: 'bg-blue-600 text-white'
    },
    {
      id: 'step-2',
      num: '2',
      title: 'Timekeeping & Attendance',
      desc: 'GPS clock in/out, overtime monitoring, shifts & leave tracking',
      icon: Clock,
      targetTab: 'hris' as const,
      color: 'border-indigo-500 text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40',
      activeBadge: 'bg-indigo-600 text-white'
    },
    {
      id: 'step-3',
      num: '3',
      title: 'Statutory & Loans',
      desc: 'SSS, PhilHealth, Pag-IBIG contributions, BIR taxes & loan deductions',
      icon: Building2,
      targetTab: 'benefits' as const,
      color: 'border-rose-500 text-rose-600 bg-rose-50/80 dark:bg-rose-950/40',
      activeBadge: 'bg-rose-600 text-white'
    },
    {
      id: 'step-4',
      num: '4',
      title: 'Payroll Computation',
      desc: 'Net salary calculations, allowances, 13th month & payslip generation',
      icon: CreditCard,
      targetTab: 'payroll' as const,
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40',
      activeBadge: 'bg-emerald-600 text-white'
    },
    {
      id: 'step-5',
      num: '5',
      title: 'Ledger & Archive',
      desc: 'Performance appraisal, ATS contracts & centralized document archive',
      icon: FolderLock,
      targetTab: 'performance' as const,
      color: 'border-purple-500 text-purple-600 bg-purple-50/80 dark:bg-purple-950/40',
      activeBadge: 'bg-purple-600 text-white'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            End-to-End Human Resources Process Flow
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Process Flow Synchronized
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          const isCurrentTab = activeTab === step.targetTab;

          return (
            <div
              key={step.id}
              onClick={() => onSelectTab(step.targetTab)}
              className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isCurrentTab 
                  ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/50 ring-2 ring-blue-500/30 shadow-xs' 
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                    isCurrentTab ? step.activeBadge : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {step.num}
                  </span>
                  <div className={`p-1.5 rounded-lg ${step.color}`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {step.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <span>{isCurrentTab ? 'Active Stage' : 'View Module'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
