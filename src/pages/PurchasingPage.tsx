import * as React from 'react';
import { useState } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { PurchaseOrder } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { ShoppingCart, Plus, CheckCircle, ArrowRight, Truck } from 'lucide-react';

const mockPOs: PurchaseOrder[] = [
  { id: 'PO-901', poNumber: 'PO-2026-001', supplierName: 'Manila Steel Corp', items: [{ name: 'Steel Sheets Grade A', qty: 50, cost: 1200 }], totalCost: 60000, status: 'RECEIVED', createdAt: Date.now() - 172800000 },
  { id: 'PO-902', poNumber: 'PO-2026-002', supplierName: 'Cebu Electronics Ltd', items: [{ name: 'Microcontrollers X1', qty: 300, cost: 85 }], totalCost: 25500, status: 'SENT', createdAt: Date.now() - 86400000 },
  { id: 'PO-903', poNumber: 'PO-2026-003', supplierName: 'Laguna Packaging Inc', items: [{ name: 'Heavy Duty Cartons', qty: 500, cost: 25 }], totalCost: 12500, status: 'DRAFT', createdAt: Date.now() },
];

export default function PurchasingPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>(mockPOs);

  const advancePoStatus = (id: string) => {
    setPos(pos.map(p => {
      if (p.id === id) {
        const stages: PurchaseOrder['status'][] = ['DRAFT', 'SENT', 'RECEIVED', 'PAID'];
        const currentIndex = stages.indexOf(p.status);
        const nextStatus = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : 'PAID';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchasing & Receiving (PO to Payment)</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage supplier purchase orders, goods receipts, and vendor payments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Total PO Spend (MTD)</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(98000)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Pending Deliveries</p>
          <p className="text-xl font-bold mt-1">1 Shipment</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Pending Payments</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(25500)}</p>
        </div>
      </div>

      <DataTable<PurchaseOrder>
        data={pos}
        columns={[
          { header: 'PO Number', accessor: (p) => <span className="font-mono text-xs font-bold">{p.poNumber}</span> },
          { header: 'Supplier Name', accessor: 'supplierName' },
          { header: 'Total Cost', accessor: (p) => formatCurrency(p.totalCost), className: 'font-bold' },
          { header: 'PO-to-Payment Workflow', accessor: (p) => (
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                {p.status}
              </span>
              <button 
                onClick={() => advancePoStatus(p.id)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition-colors"
                title="Advance workflow"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )},
          { header: 'Date', accessor: (p) => formatDate(p.createdAt), className: 'text-xs text-slate-500' }
        ]}
      />
    </div>
  );
}
