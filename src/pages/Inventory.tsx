import { useState, useEffect } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { Product } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Package, Plus, Search, Sparkles, Filter } from 'lucide-react';

const mockProducts: Product[] = [
  { id: '1', sku: 'ST-001', name: 'Steel Sheets (Grade A)', description: 'High-grade galvanized steel', category: 'Raw Materials', quantity: 45, minQuantity: 50, warehouse: 'Warehouse A - Manila', price: 1200, lastUpdated: Date.now() },
  { id: '2', sku: 'AL-005', name: 'Aluminum Tubes', description: 'Extruded aluminum 20mm', category: 'Raw Materials', quantity: 210, minQuantity: 100, warehouse: 'Warehouse B - Cebu', price: 450, lastUpdated: Date.now() },
  { id: '3', sku: 'MC-202', name: 'Microcontroller Unit X1', description: 'Main control chip', category: 'Components', quantity: 800, minQuantity: 200, warehouse: 'Warehouse A - Manila', price: 85, lastUpdated: Date.now() },
  { id: '4', sku: 'FG-900', name: 'Chassis Assembly', description: 'Complete welded chassis', category: 'Finished Goods', quantity: 12, minQuantity: 10, warehouse: 'Warehouse C - Davao', price: 15000, lastUpdated: Date.now() },
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const getStockStatus = (p: Product) => {
    if (p.quantity <= 0) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">OUT OF STOCK</span>;
    if (p.quantity <= p.minQuantity) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">LOW STOCK</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">IN STOCK</span>;
  };

  const generateAiForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryData: products })
      });
      const data = await response.json();
      setAiInsight(data.forecast);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and manage your material resources and finished goods.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateAiForecast}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'AI Forecast'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl text-sm text-indigo-900 dark:text-indigo-200 relative">
          <button onClick={() => setAiInsight(null)} className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600">×</button>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Gemini AI Demand Forecast:</p>
              <p className="whitespace-pre-wrap">{aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input 
            type="text" 
            placeholder="Search by SKU, Name or Category..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <DataTable<Product> 
        data={products}
        columns={[
          { header: 'SKU', accessor: 'sku', className: 'font-mono text-xs' },
          { header: 'Product Name', accessor: (p) => (
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-slate-500 truncate max-w-xs">{p.description}</p>
            </div>
          )},
          { header: 'Category', accessor: 'category' },
          { header: 'Quantity', accessor: (p) => (
            <div className="flex flex-col gap-1">
              <span className="font-bold">{p.quantity}</span>
              {getStockStatus(p)}
            </div>
          )},
          { header: 'Unit Price', accessor: (p) => formatCurrency(p.price) },
          { header: 'Last Updated', accessor: (p) => formatDate(p.lastUpdated), className: 'text-slate-500 text-xs' },
        ]}
      />
    </div>
  );
}
