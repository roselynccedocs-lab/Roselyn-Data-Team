import * as React from 'react';
import { useState } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { Shipment } from '../types';
import { Package, Truck, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';

const mockShipments: Shipment[] = [
  { id: 'SHP-001', trackingNumber: 'TRK-PH-98213', orderId: 'SO-1001', destination: 'Makati City, Metro Manila', carrier: 'J&T Express', status: 'IN_TRANSIT', backorderStatus: false, estimatedDelivery: 'Sept 3, 2026' },
  { id: 'SHP-002', trackingNumber: 'TRK-PH-44102', orderId: 'SO-1002', destination: 'Cebu IT Park, Cebu', carrier: 'LBC Express', status: 'PACKED', backorderStatus: true, estimatedDelivery: 'Sept 5, 2026' },
  { id: 'SHP-003', trackingNumber: 'TRK-PH-11982', orderId: 'SO-1003', destination: 'Davao City', carrier: 'Flash Express', status: 'DELIVERED', backorderStatus: false, estimatedDelivery: 'Aug 29, 2026' },
];

export default function LogisticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);

  const advanceShipment = (id: string) => {
    setShipments(shipments.map(s => {
      if (s.id === id) {
        const stages: Shipment['status'][] = ['PENDING_PICK', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];
        const currentIndex = stages.indexOf(s.status);
        const nextStatus = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : 'DELIVERED';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pick, Pack & Ship / Shipment Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400">Accurate picking, warehouse packing, carrier dispatch, delivery tracking, and backorders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Package className="w-4 h-4" /> New Dispatch Manifest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Pending Picking</p>
          <p className="text-xl font-bold mt-1">2 Orders</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">In Transit</p>
          <p className="text-xl font-bold mt-1">1 Shipment</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Active Backorders</p>
          <p className="text-xl font-bold mt-1 text-orange-600">1 Backorder</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">On-Time Delivery Rate</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">98.4%</p>
        </div>
      </div>

      <DataTable<Shipment>
        data={shipments}
        columns={[
          { header: 'Tracking Number', accessor: (s) => (
            <div>
              <p className="font-mono text-xs font-bold">{s.trackingNumber}</p>
              <p className="text-xs text-slate-500">Order: {s.orderId}</p>
            </div>
          )},
          { header: 'Destination', accessor: 'destination' },
          { header: 'Carrier', accessor: 'carrier' },
          { header: 'Backorder Alert', accessor: (s) => s.backorderStatus ? (
            <span className="flex items-center gap-1 text-orange-600 text-xs font-bold bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
              <AlertTriangle className="w-3.5 h-3.5" /> Backorder Item
            </span>
          ) : (
            <span className="text-xs text-slate-400">None</span>
          )},
          { header: 'Status & Workflow', accessor: (s) => (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {s.status}
              </span>
              <button 
                onClick={() => advanceShipment(s.id)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition-colors"
                title="Advance shipping stage"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )},
          { header: 'Est. Delivery', accessor: 'estimatedDelivery', className: 'text-xs text-slate-500' }
        ]}
      />
    </div>
  );
}
