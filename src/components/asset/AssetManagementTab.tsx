import React, { useState } from 'react';
import { AssetDashboard } from './AssetDashboard';
import { QrGeneratorVerify } from './QrGeneratorVerify';
import { AssetRegistryList } from './AssetRegistryList';
import { FormsAndRequests } from './FormsAndRequests';
import { AuditTrailView } from './AuditTrailView';
import { Search, Plus, QrCode, Scan, Package, FileText, History, Shield, LayoutDashboard } from 'lucide-react';
import { AssetProvider, useAssetData } from '../../context/AssetContext';

function AssetManagementContent() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'qr' | 'registry' | 'forms' | 'audit'>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [registryFilterCategory, setRegistryFilterCategory] = useState<string | null>(null);
  const { fleetAssets, auditTrail } = useAssetData();

  const handleNavigateToRegistry = (category?: string) => {
    if (category) {
      setRegistryFilterCategory(category);
    }
    setActiveSection('registry');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                Asset & Data
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeSection === 'dashboard' && 'Inventory Health & Category Dashboard'}
                {activeSection === 'qr' && 'QR Generator & Asset Tagging'}
                {activeSection === 'registry' && `Asset Inventory Registry (${fleetAssets.length})`}
                {activeSection === 'forms' && 'Forms, Handovers & Requests'}
                {activeSection === 'audit' && `Audit Log Trail (${auditTrail.length})`}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Welcome back, Dr. Arnold Cortina
            </h2>
            <p className="text-xs text-slate-500">Enterprise Asset Lifecycle, Barcode Generation, Critical Stock Tracking & Issuance Forms.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket number, asset name..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sub-section Navigation Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSection === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </button>

              <button
                onClick={() => setActiveSection('qr')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSection === 'qr'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> QR Generator
              </button>

              <button
                onClick={() => { setRegistryFilterCategory(null); setActiveSection('registry'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSection === 'registry'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Asset Registry ({fleetAssets.length})
              </button>

              <button
                onClick={() => setActiveSection('forms')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSection === 'forms'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Forms & Handovers
              </button>

              <button
                onClick={() => setActiveSection('audit')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSection === 'audit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Audit Log ({auditTrail.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Active View */}
      <div className="transition-all duration-200">
        {activeSection === 'dashboard' && <AssetDashboard onNavigateToRegistry={handleNavigateToRegistry} />}
        {activeSection === 'qr' && <QrGeneratorVerify />}
        {activeSection === 'registry' && <AssetRegistryList initialCategory={registryFilterCategory} onClearFilter={() => setRegistryFilterCategory(null)} />}
        {activeSection === 'forms' && <FormsAndRequests />}
        {activeSection === 'audit' && <AuditTrailView />}
      </div>
    </div>
  );
}

export function AssetManagementTab() {
  return (
    <AssetProvider>
      <AssetManagementContent />
    </AssetProvider>
  );
}
