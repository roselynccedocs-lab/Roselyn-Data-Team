import React from 'react';
import CrmSalesPage from '../../pages/CrmSalesPage';
import { Users } from 'lucide-react';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

export function SalesDepartment() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 p-1 bg-emerald-600/10 text-emerald-600 rounded-lg h-6" /> Sales Department
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">CRM, client pipelines, quotations, and pharmaceutical sales orders.</p>
          </div>
          <SubmitSupportButton departmentName="Sales Department" />
        </div>
      </div>

      <CrmSalesPage />
    </div>
  );
}
