import React, { useState } from 'react';
import { MasterDataTab } from '../../components/masterdata/MasterDataTab';
import { AssetManagementTab } from '../../components/asset/AssetManagementTab';
import { Package, Database, Shield, Layers } from 'lucide-react';
import { SubmitSupportButton } from '../../components/ui/SubmitSupportButton';

export function DataAssetDepartment() {
  const [activeTab, setActiveTab] = useState<'masterdata' | 'assets'>('assets');

  return (
    <div className="space-y-6">
      {/* Primary Department Header with Top-Level Sub-Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 p-1 bg-amber-600/10 text-amber-600 rounded-lg" /> Asset and Data
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Enterprise Master Data Central & Fixed Asset Management System.</p>
          </div>

          <div className="flex items-center gap-3">
            <SubmitSupportButton departmentName="Asset and Data Department" />
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shrink-0">
              <button
                onClick={() => setActiveTab('masterdata')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'masterdata'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" /> Master Data
              </button>

              <button
                onClick={() => setActiveTab('assets')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'assets'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" /> Asset Management
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-200">
        {activeTab === 'masterdata' && <MasterDataTab />}
        {activeTab === 'assets' && <AssetManagementTab />}
      </div>
    </div>
  );
}

export default DataAssetDepartment;
