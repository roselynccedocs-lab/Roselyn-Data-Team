import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Ticket, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { formatCurrency } from '../lib/utils';

const data = [
  { name: 'Jan', sales: 4000, expenses: 2400 },
  { name: 'Feb', sales: 3000, expenses: 1398 },
  { name: 'Mar', sales: 2000, expenses: 9800 },
  { name: 'Apr', sales: 2780, expenses: 3908 },
  { name: 'May', sales: 1890, expenses: 4800 },
  { name: 'Jun', sales: 2390, expenses: 3800 },
  { name: 'Jul', sales: 3490, expenses: 4300 },
];

const inventoryData = [
  { category: 'Raw Materials', count: 450 },
  { category: 'WIP', count: 120 },
  { category: 'Finished Goods', count: 340 },
  { category: 'Packaging', count: 210 },
];

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time overview of your enterprise operations.</p>
        </div>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              LIVE SYNC ACTIVE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              OFFLINE MODE
            </div>
          )}
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sales (MTD)" 
          value={formatCurrency(1245900)} 
          change="+12.5%" 
          trend="up" 
          icon={TrendingUp} 
          color="blue"
        />
        <StatCard 
          title="Active Workforce" 
          value="156" 
          change="+2" 
          trend="up" 
          icon={Users} 
          color="purple"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value="14" 
          change="-3" 
          trend="down" 
          icon={AlertTriangle} 
          color="orange"
        />
        <StatCard 
          title="Open Tickets" 
          value="23" 
          change="+5" 
          trend="up" 
          icon={Ticket} 
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Financial Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1}/>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value/1000}k`}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Inventory by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.1}/>
                <XAxis type="number" hide/>
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100}/>
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Critical Notifications</h3>
          <button className="text-sm text-blue-600 font-medium">View All</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <ActivityItem 
            title="Low Stock Alert: Steel Sheets (Grade A)" 
            desc="Inventory dropped below 50 units. Automated PO triggered." 
            time="10 mins ago" 
            type="warning"
          />
          <ActivityItem 
            title="Production Delay: Batch #889" 
            desc="Machine downtime reported in Assembly Line 3." 
            time="2 hours ago" 
            type="error"
          />
          <ActivityItem 
            title="Payroll Processed: August 2026" 
            desc="Batch processing for 156 employees completed successfully." 
            time="5 hours ago" 
            type="success"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
    </motion.div>
  );
}

function ActivityItem({ title, desc, time, type }: any) {
  const typeMap: any = {
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="p-6 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", typeMap[type])}></div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <span className="text-xs text-slate-400">{time}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
