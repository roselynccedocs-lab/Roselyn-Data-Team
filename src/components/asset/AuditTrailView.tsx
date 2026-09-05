import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Printer, 
  CheckCircle2, 
  FileText, 
  User, 
  Building2,
  Calendar,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useAssetData } from '../../context/AssetContext';
import { AuditTrailPrintForm } from './AuditTrailPrintForm';

export function AuditTrailView() {
  const { auditTrail } = useAssetData();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [showPrintForm, setShowPrintForm] = useState(false);

  // Synchronized KPI metrics from the actual live audit logs
  const metrics = useMemo(() => {
    const totalLogs = auditTrail.length;
    const generalReturns = auditTrail.filter(l => l.module === 'General Items Return').length;
    const generalIssuances = auditTrail.filter(l => l.module === 'General Items Issuance').length;
    const employeeOnboarding = auditTrail.filter(l => l.module === 'Employee Onboarding').length;
    const employeeOffboarding = auditTrail.filter(l => l.module.toLowerCase().includes('offboard')).length;

    return {
      totalLogs,
      generalReturns,
      generalIssuances,
      employeeOnboarding,
      employeeOffboarding,
    };
  }, [auditTrail]);

  // Filtering based on module and time selection matching the user's image details
  const filteredTrail = useMemo(() => {
    // Current environment date: Sep 2, 2026
    const now = new Date('2026-09-02T18:00:00');

    return auditTrail.filter(log => {
      // 1. Text Search Filter
      const matchesSearch = 
        log.docId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Module Category Filter
      const matchesModule = 
        moduleFilter === 'All Modules' || 
        log.module.toLowerCase() === moduleFilter.toLowerCase();

      // 3. Time Filter (All Time, Today, This Week, This Month)
      let matchesTime = true;
      const logDate = log.dateObj ? new Date(log.dateObj) : new Date(log.timestamp);
      
      if (timeFilter === 'Today') {
        matchesTime = 
          logDate.getDate() === now.getDate() &&
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'This Week') {
        const diffDays = Math.abs(now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        matchesTime = diffDays <= 7;
      } else if (timeFilter === 'This Month') {
        matchesTime = 
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesModule && matchesTime;
    });
  }, [auditTrail, searchTerm, moduleFilter, timeFilter]);

  return (
    <div className="space-y-6">
      {/* Header Bar: Import and Export buttons removed; Print Trail activated */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/10 text-purple-600 rounded-xl flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audit Log Trail</h2>
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-extrabold text-xs rounded-full">
                  {filteredTrail.length} of {metrics.totalLogs} Records
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Immutable system activity log tracking asset additions, returns, issuances, and handovers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPrintForm(true)} 
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Print official audit compliance report form"
            >
              <Printer className="w-3.5 h-3.5 text-white" /> Print Trail
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">TOTAL LOGS</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{metrics.totalLogs}</p>
          <span className="text-[10px] text-slate-400">All registered system events</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">GENERAL RETURNS</span>
          <p className="text-xl font-extrabold text-rose-600 font-mono mt-0.5">{metrics.generalReturns}</p>
          <span className="text-[10px] text-slate-400">Surrenders & inventory returns</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">GENERAL ISSUANCES</span>
          <p className="text-xl font-extrabold text-purple-600 font-mono mt-0.5">{metrics.generalIssuances}</p>
          <span className="text-[10px] text-slate-400">Equipment provisioned & deployed</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">EMPLOYEE ON-BOARDING</span>
          <p className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">{metrics.employeeOnboarding}</p>
          <span className="text-[10px] text-slate-400">New hire initial hardware packs</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">EMPLOYEE OFF-BOARDING</span>
          <p className="text-xl font-extrabold text-amber-600 font-mono mt-0.5">{metrics.employeeOffboarding}</p>
          <span className="text-[10px] text-slate-400">Exit asset surrender records</span>
        </div>
      </div>

      {/* Main Table Card with Live Filtering */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Filters Row */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Document ID, Ref No, Name, Dept, or Details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Module and Time Selection Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer py-1"
              >
                <option value="All Modules">All Modules</option>
                <option value="General Items Issuance">General Items Issuance</option>
                <option value="Material Request">Material Request</option>
                <option value="Purchase Receipt">Purchase Receipt</option>
                <option value="Employee Onboarding">Employee Onboarding</option>
                <option value="Employee offboarding">Employee offboarding</option>
                <option value="General Items Return">General Items Return</option>
              </select>
            </div>

            {/* Time Filter matching User's Image */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer py-1"
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp & Date</th>
                <th className="p-3.5">Ref / Document ID</th>
                <th className="p-3.5">Module Category</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Performer / Actor</th>
                <th className="p-3.5">Target Department</th>
                <th className="p-3.5">Details & Asset Items</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTrail.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <p className="font-bold text-sm">No audit records found matching your selection.</p>
                    <p className="text-xs mt-1">Try switching the time range or selecting "All Modules".</p>
                  </td>
                </tr>
              ) : (
                filteredTrail.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400 text-[10px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3.5 font-mono font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">{log.docId}</td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{log.module}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{log.performer}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{log.targetDept}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.details}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-extrabold text-[10px] rounded">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Audit Trail Form Modal */}
      {showPrintForm && (
        <AuditTrailPrintForm 
          logs={filteredTrail}
          timeFilter={timeFilter}
          moduleFilter={moduleFilter}
          onClose={() => setShowPrintForm(false)}
        />
      )}
    </div>
  );
}
