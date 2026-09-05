import React, { useState } from 'react';
import POSPage from '../../pages/POSPage';
import ManufacturingPage from '../../pages/ManufacturingPage';
import { ShoppingCart, Factory } from 'lucide-react';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

export function OperationsDepartment() {
  const [activeTab, setActiveTab] = useState<'pos' | 'mrp'>('pos');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Factory className="w-6 p-1 bg-indigo-600/10 text-indigo-600 rounded-lg h-6" /> Operations Department
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Cloud POS Counter Register and Chemical Manufacturing MRP Production.</p>
          </div>

          <div className="flex items-center gap-3">
            <SubmitSupportButton departmentName="Operations Department" />
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'pos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" /> POS Register
              </button>
              <button
                onClick={() => setActiveTab('mrp')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'mrp' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Factory className="w-3.5 h-3.5" /> Manufacturing (MRP)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="transition-all">
        {activeTab === 'pos' && <POSPage />}
        {activeTab === 'mrp' && <ManufacturingPage />}
      </div>
    </div>
  );
}
