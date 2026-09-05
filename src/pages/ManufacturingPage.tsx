import * as React from 'react';
import { useState } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { ManufacturingOrder, BillOfMaterials } from '../types';
import { formatCurrency } from '../lib/utils';
import { Factory, Layers, Cpu, FileSpreadsheet, Plus, ArrowRight } from 'lucide-react';

const mockBOMs: BillOfMaterials[] = [
  { id: 'BOM-001', itemName: 'Industrial Chassis X', version: 'v1.2', components: [{ materialName: 'Steel Sheets Grade A', qtyRequired: 2, unitCost: 1200 }, { materialName: 'Heavy Duty Cartons', qtyRequired: 1, unitCost: 25 }], totalBOMCost: 2425 },
  { id: 'BOM-002', itemName: 'Control Panel V2', version: 'v2.0', components: [{ materialName: 'Microcontrollers X1', qtyRequired: 4, unitCost: 85 }, { materialName: 'Aluminum Tubes', qtyRequired: 3, unitCost: 450 }], totalBOMCost: 1690 },
];

const mockMOs: ManufacturingOrder[] = [
  { id: 'MO-501', bomId: 'BOM-001', productName: 'Industrial Chassis X', quantity: 20, status: 'IN_PROCESS', wipStage: 'ASSEMBLY', cogm: 48500, startDate: Date.now() - 86400000 },
  { id: 'MO-502', bomId: 'BOM-002', productName: 'Control Panel V2', quantity: 50, status: 'PLANNED', wipStage: 'READY', cogm: 84500, startDate: Date.now() },
];

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState<'mrp' | 'wip' | 'reports'>('mrp');
  const [mos, setMos] = useState<ManufacturingOrder[]>(mockMOs);
  const [boms] = useState<BillOfMaterials[]>(mockBOMs);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manufacturing & MRP (BOM, WIP, COGM/COGS)</h1>
          <p className="text-slate-500 dark:text-slate-400">Material Resource Planning, bill of materials explosion, and work-in-process tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('mrp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${activeTab === 'mrp' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
          >
            MRP & BOM
          </button>
          <button 
            onClick={() => setActiveTab('wip')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${activeTab === 'wip' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
          >
            Work in Process (WIP)
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
          >
            COGM & Reports
          </button>
        </div>
      </div>

      {activeTab === 'mrp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Material Requirement Plan</p>
              <p className="text-lg font-bold mt-1">Optimized for 3 Active Batches</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">BOM Explosion Templates</p>
              <p className="text-lg font-bold mt-1">2 Active BOMs Loaded</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Run MRP Calculation
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bills of Materials (BOM Explosion)</h3>
            {boms.map((bom) => (
              <div key={bom.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-base">{bom.itemName} <span className="text-xs font-mono opacity-50 ml-2">({bom.version})</span></h4>
                    <p className="text-xs text-slate-500">Estimated Unit BOM Cost: {formatCurrency(bom.totalBOMCost)}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full">BOM ID: {bom.id}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Components</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bom.components.map((comp, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg text-sm">
                        <span>{comp.materialName} ({comp.qtyRequired}x)</span>
                        <span className="font-mono text-xs">{formatCurrency(comp.unitCost * comp.qtyRequired)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wip' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work in Process (WIP) Tracking</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> New Manufacturing Order
            </button>
          </div>
          <DataTable<ManufacturingOrder>
            data={mos}
            columns={[
              { header: 'Order ID', accessor: (m) => <span className="font-mono text-xs font-bold">{m.id}</span> },
              { header: 'Product Name', accessor: 'productName' },
              { header: 'Quantity', accessor: (m) => <span className="font-bold">{m.quantity} units</span> },
              { header: 'WIP Stage', accessor: (m) => (
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {m.wipStage}
                </span>
              )},
              { header: 'COGM', accessor: (m) => formatCurrency(m.cogm), className: 'font-mono' },
              { header: 'Status', accessor: 'status' }
            ]}
          />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-semibold">Cost of Goods Manufactured (COGM)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Direct Materials Used</span>
                <span className="font-bold">{formatCurrency(133000)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Direct Labor Expenses</span>
                <span className="font-bold">{formatCurrency(84000)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Manufacturing Overhead</span>
                <span className="font-bold">{formatCurrency(42000)}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-bold">
                <span>Total COGM</span>
                <span className="text-blue-600">{formatCurrency(259000)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-semibold">Cost of Goods Sold (COGS)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Beginning Finished Goods</span>
                <span className="font-bold">{formatCurrency(95000)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Cost of Goods Manufactured</span>
                <span className="font-bold">{formatCurrency(259000)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Ending Finished Goods</span>
                <span className="font-bold">{formatCurrency(-70000)}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-bold">
                <span>Total COGS</span>
                <span className="text-emerald-600">{formatCurrency(284000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
