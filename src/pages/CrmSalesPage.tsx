import * as React from 'react';
import { useState } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { SalesOrder, Contact } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Users, FileText, Plus, CheckCircle, ArrowRight, DollarSign } from 'lucide-react';

const mockSalesOrders: SalesOrder[] = [
  { id: 'SO-1001', customerName: 'Acme Corporation', quotationNumber: 'QT-501', items: [{ productId: 'p1', name: 'Industrial Chassis X', qty: 5, price: 15000 }], totalAmount: 75000, status: 'CONFIRMED', createdAt: Date.now() - 86400000 },
  { id: 'SO-1002', customerName: 'Globex Logistics', quotationNumber: 'QT-502', items: [{ productId: 'p2', name: 'Control Panel V2', qty: 2, price: 28000 }], totalAmount: 56000, status: 'RESERVED', createdAt: Date.now() - 43200000 },
  { id: 'SO-1003', customerName: 'Stark Enterprises', quotationNumber: 'QT-503', items: [{ productId: 'p3', name: 'Hydraulic Valve A', qty: 10, price: 4500 }], totalAmount: 45000, status: 'COLLECTED', createdAt: Date.now() - 172800000 },
];

const mockContacts: Contact[] = [
  { id: 'c1', name: 'Alice Santos', email: 'alice@acme.ph', phone: '+63 917 555 0192', company: 'Acme Corporation', status: 'CUSTOMER', assignedTo: 'Mark Sales', createdAt: Date.now() },
  { id: 'c2', name: 'Roberto Tan', email: 'roberto@globex.ph', phone: '+63 922 333 4455', company: 'Globex Logistics', status: 'OPPORTUNITY', assignedTo: 'Sarah Sales', createdAt: Date.now() },
];

export default function CrmSalesPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'orders'>('orders');
  const [orders, setOrders] = useState<SalesOrder[]>(mockSalesOrders);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);

  const advanceOrderStatus = (id: string) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        const stages: SalesOrder['status'][] = ['QUOTATION', 'CONFIRMED', 'RESERVED', 'IN_PACKING', 'SHIPPED', 'COLLECTED'];
        const currentIndex = stages.indexOf(o.status);
        const nextStatus = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : 'COLLECTED';
        return { ...o, status: nextStatus };
      }
      return o;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM & Sales (Quotation to Collection)</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage client relationships, sales orders, reservations, and collections.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
          >
            Sales Orders Pipeline
          </button>
          <button 
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
          >
            CRM Contacts & Leads
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Total Pipeline Value</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(176000)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Pending Collection</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(131000)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">Active Orders</p>
              <p className="text-xl font-bold mt-1">3 Orders</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors w-full justify-center">
                <Plus className="w-4 h-4" /> New Sales Quotation
              </button>
            </div>
          </div>

          <DataTable<SalesOrder>
            data={orders}
            columns={[
              { header: 'Order ID', accessor: (o) => <span className="font-mono text-xs font-bold">{o.id}</span> },
              { header: 'Customer & Quotation', accessor: (o) => (
                <div>
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-slate-500">Ref: {o.quotationNumber}</p>
                </div>
              )},
              { header: 'Total Amount', accessor: (o) => formatCurrency(o.totalAmount), className: 'font-bold' },
              { header: 'Status Workflow', accessor: (o) => (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {o.status}
                  </span>
                  <button 
                    onClick={() => advanceOrderStatus(o.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition-colors"
                    title="Advance to next stage"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )},
              { header: 'Date Created', accessor: (o) => formatDate(o.createdAt), className: 'text-xs text-slate-500' }
            ]}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Database & Leads</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>
          <DataTable<Contact>
            data={contacts}
            columns={[
              { header: 'Name', accessor: (c) => (
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
              )},
              { header: 'Company', accessor: 'company' },
              { header: 'Phone', accessor: 'phone' },
              { header: 'Status', accessor: (c) => (
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${c.status === 'CUSTOMER' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                  {c.status}
                </span>
              )},
              { header: 'Assigned Agent', accessor: 'assignedTo' }
            ]}
          />
        </div>
      )}
    </div>
  );
}
