import React, { useState } from 'react';
import PurchasingPage from '../../pages/PurchasingPage';
import LogisticsPage from '../../pages/LogisticsPage';
import { Receipt, Truck } from 'lucide-react';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

export function PurchasingLogisticsDepartment() {
  const [activeTab, setActiveTab] = useState<'purchasing' | 'logistics'>('purchasing');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-6 p-1 bg-purple-600/10 text-purple-600 rounded-lg h-6" /> Purchasing & Logistics Department
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage Purchase Orders, supplier evaluation, and logistics & fleet shipping.</p>
          </div>

          <div className="flex items-center gap-3">
            <SubmitSupportButton departmentName="Purchasing & Logistics Department" />
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveTab('purchasing')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'purchasing' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> Purchasing & PO
              </button>
              <button
                onClick={() => setActiveTab('logistics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'logistics' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> Logistics & Shipping
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="transition-all">
        {activeTab === 'purchasing' && <PurchasingPage />}
        {activeTab === 'logistics' && <LogisticsPage />}
      </div>
    </div>
  );
}
