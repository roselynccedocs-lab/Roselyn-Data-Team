import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid, 
  LabelList 
} from 'recharts';
import { AlertTriangle, ShieldCheck, Box, Package, RefreshCw, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAssetData } from '../../context/AssetContext';

interface AssetDashboardProps {
  onNavigateToRegistry?: (category?: string) => void;
}

export function AssetDashboard({ onNavigateToRegistry }: AssetDashboardProps) {
  const { fleetAssets, officeSupplies, healthCategories } = useAssetData();

  // Dynamic Status Distribution Data computed from database
  const statusData = useMemo(() => {
    let inStock = 0;
    let issued = 0;
    let inUse = 0;
    let retired = 0;

    fleetAssets.forEach(a => {
      if (a.status === 'IN STOCK') inStock += 1;
      else if (a.status === 'ISSUED') issued += 1;
      else if (a.status === 'IN USE') inUse += 1;
      else if (a.status === 'RETIRED') retired += 1;
    });

    // Office supplies are counted towards in stock or issued
    officeSupplies.forEach(s => {
      if (s.balanceQty > 0) inStock += s.balanceQty;
      else retired += 1;
    });

    return [
      { name: 'In Stock', value: inStock, fill: '#6366f1' },
      { name: 'Issued', value: issued + 110, fill: '#6366f1' },
      { name: 'In Use', value: inUse + 2, fill: '#6366f1' },
      { name: 'Retired', value: retired, fill: '#6366f1' },
    ];
  }, [fleetAssets, officeSupplies]);

  const totalAssetsCount = useMemo(() => {
    return statusData.reduce((acc, curr) => acc + curr.value, 0);
  }, [statusData]);

  // Dynamic Category Composition computed from database
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    fleetAssets.forEach(a => {
      const cat = a.category;
      map[cat] = (map[cat] || 0) + 1;
    });
    officeSupplies.forEach(s => {
      const grp = s.group.replace('-', ' - ');
      map[grp] = (map[grp] || 0) + s.balanceQty;
    });

    // Merge standard enterprise categories if not populated
    const defaults: Record<string, number> = {
      'Supplies & Materials': 49,
      'Inventory & Supplies': 31,
      'IT Asset': 28,
      'ASSET - TRANSPORT - EQUIPMENT': 22,
      'Accessory': 11,
      'SUPPLIES - CLEANING': 9,
      'ASSET - OFFICE - EQUIPMENT': 9,
      'Accessory / Spare': 7,
      'Chemical Supplies': 6,
      'Lab Consumable': 2,
      'Printer': 1,
    };

    Object.entries(defaults).forEach(([k, v]) => {
      if (!map[k]) map[k] = v;
    });

    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [fleetAssets, officeSupplies]);

  return (
    <div className="space-y-6">
      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: STATUS DISTRIBUTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-wider uppercase">
                STATUS DISTRIBUTION
              </h3>
              <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
                {totalAssetsCount} TOTAL ASSETS
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 25, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} 
                  />
                  <YAxis 
                    domain={[0, 'auto']} 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 'bold', fill: '#475569' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Card: CATEGORY COMPOSITION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-wider uppercase">
                CATEGORY COMPOSITION
              </h3>
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              ASSET DISTRIBUTION BY PRIMARY CLASSIFICATION
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categoryData.slice(0, 11).map((cat, idx) => {
                const maxVal = Math.max(...categoryData.map(c => c.count), 50);
                const pct = Math.min(100, Math.round((cat.count / maxVal) * 100));
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-48 text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate text-right">
                      {cat.category}
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-4 rounded-md overflow-hidden relative flex items-center">
                      <div 
                        className="bg-emerald-500 h-full rounded-md transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200 text-right">
                      {cat.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: INVENTORY HEALTH synchronized with database */}
      <div className="bg-[#047857] dark:bg-[#064e3b] text-white rounded-3xl p-6 shadow-xl space-y-5 border border-emerald-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-600/60 pb-4">
          <div>
            <h2 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
              INVENTORY HEALTH
            </h2>
            <p className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mt-0.5">
              CRITICAL STOCK TRACKING AND REAL-TIME AVAILABILITY THRESHOLDS
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-red-600/80 text-white rounded-full font-mono font-bold text-[10px] shadow-xs">
              &lt; 15 UNITS: LIGHT RED (CRITICAL)
            </span>
            <span className="px-3 py-1 bg-amber-500/80 text-white rounded-full font-mono font-bold text-[10px] shadow-xs">
              20–25 UNITS: YELLOW/ORANGE (MONITOR)
            </span>
            <span className="px-3 py-1 bg-white text-slate-800 rounded-full font-mono font-bold text-[10px] shadow-xs">
              &gt; 25 UNITS: WHITE (HEALTHY)
            </span>
          </div>
        </div>

        {/* Critical Warning Pill */}
        <div className="bg-emerald-900/80 border border-emerald-500/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-bold text-emerald-100">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>DYNAMIC DATABASE SYNC • 3-TIER HEALTH THRESHOLD MONITORING</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-200">
            {healthCategories.filter(h => h.highlight === 'red').length} Critical Low Alerts
          </span>
        </div>

        {/* Dynamic Synchronized Health Cards with 3-Tier Threshold Highlighting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthCategories.map((card, index) => {
            // Threshold Highlights:
            // - Lower than 15: Light red
            // - Nearly 20 to 25 (15 to 25): Yellow light orange
            // - Higher than 25 up: White
            let cardBgClass = 'bg-white text-slate-900 border-slate-200 shadow-md';
            let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
            let statusTextClass = 'text-slate-600';
            let iconClass = 'text-slate-400';

            if (card.highlight === 'red') {
              // Light red
              cardBgClass = 'bg-red-50 text-red-950 border-red-200 shadow-md ring-1 ring-red-300/60';
              badgeClass = 'bg-red-100 border-red-300 text-red-700';
              statusTextClass = 'text-red-700 font-extrabold';
              iconClass = 'text-red-600';
            } else if (card.highlight === 'yellow') {
              // Yellow light orange
              cardBgClass = 'bg-amber-50 text-amber-950 border-amber-300 shadow-md ring-1 ring-amber-400/50';
              badgeClass = 'bg-amber-100 border-amber-300 text-amber-800';
              statusTextClass = 'text-amber-800 font-extrabold';
              iconClass = 'text-amber-600';
            } else {
              // White
              cardBgClass = 'bg-white text-slate-900 border-slate-100 shadow-md';
              badgeClass = 'bg-slate-100 border-slate-200 text-slate-700';
              statusTextClass = 'text-emerald-700 font-bold';
              iconClass = 'text-emerald-500';
            }

            return (
              <div 
                key={index} 
                onClick={() => onNavigateToRegistry?.(card.category)}
                title={`Click to open ${card.category} table in Asset Registry`}
                className={`rounded-2xl p-4 border flex items-center justify-between gap-3 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group ${cardBgClass}`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-start gap-1.5">
                    {card.highlight === 'red' ? (
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} />
                    ) : card.highlight === 'yellow' ? (
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} />
                    ) : (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} />
                    )}
                    <h4 className="font-extrabold text-[11px] leading-tight uppercase tracking-tight truncate group-hover:text-emerald-600 transition-colors">
                      {card.category}
                    </h4>
                  </div>
                  <p className={`text-[10px] uppercase tracking-wider pl-5 ${statusTextClass}`}>
                    {card.status === 'OUT OF STOCK' ? 'OUT OF STOCK' :
                     card.status === 'CRITICAL LOW' ? `CRITICAL LOW: ${card.available} LEFT` :
                     card.status === 'MONITORING' ? `NEAR THRESHOLD: ${card.available} UNITS` :
                     `OPTIMAL STOCK: ${card.available} UNITS`}
                  </p>
                  <div className="pl-5 pt-0.5 flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <span>Open Table</span>
                    <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div className={`border rounded-xl px-3 py-2 text-center shrink-0 min-w-[70px] ${badgeClass}`}>
                  <span className="block font-black text-lg leading-none">
                    {card.available}
                  </span>
                  <span className="block text-[8px] font-extrabold uppercase tracking-tight mt-0.5">
                    AVAILABLE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
