import React, { useState } from 'react';
import HRISPage from '../../pages/HRIS';
import BenefitsPage from '../../pages/BenefitsPage';
import RecruitmentPage from '../../pages/RecruitmentPage';
import PerformancePage from '../../pages/PerformancePage';
import PayrollPage from '../../pages/Payroll';
import { MasterEmployee201Manager } from '../../components/hr/MasterEmployee201Manager';
import { HRProcessFlow } from '../../components/hr/HRProcessFlow';
import { Briefcase, HeartHandshake, UserPlus, Target, CreditCard, Users } from 'lucide-react';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

export function HRDepartment() {
  const [activeTab, setActiveTab] = useState<'roster' | 'hris' | 'benefits' | 'recruitment' | 'performance' | 'payroll'>('roster');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-6 p-1 bg-blue-600/10 text-blue-600 rounded-lg h-6" /> Human Resources Department Suite
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage Master 201 Database, Core HRIS, Benefits, Recruitment ATS, Performance KPIs, and Payroll.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <SubmitSupportButton departmentName="Human Resources Department" />
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveTab('roster')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'roster' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> 201 Master Roster
              </button>
              <button
                onClick={() => setActiveTab('hris')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'hris' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> HRIS Suite
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'benefits' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" /> Benefits
              </button>
              <button
                onClick={() => setActiveTab('recruitment')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'recruitment' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Recruitment & ATS
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'performance' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5" /> Performance & KPIs
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'payroll' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Payroll & 201 Files
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* End-to-End Process Flow Ribbon */}
      <HRProcessFlow activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      <div className="transition-all">
        {activeTab === 'roster' && <MasterEmployee201Manager />}
        {activeTab === 'hris' && <HRISPage />}
        {activeTab === 'benefits' && <BenefitsPage />}
        {activeTab === 'recruitment' && <RecruitmentPage />}
        {activeTab === 'performance' && <PerformancePage />}
        {activeTab === 'payroll' && <PayrollPage />}
      </div>
    </div>
  );
}
