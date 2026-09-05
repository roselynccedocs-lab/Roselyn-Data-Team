import * as React from 'react';
import { useState } from 'react';
import { initialPerformanceEvaluations, initialEmployees } from '../data/mockHrData';
import { PerformanceEvaluation } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Users, 
  CheckCircle2, 
  Star, 
  PieChart as PieIcon, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function PerformancePage() {
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>(initialPerformanceEvaluations);
  const [selectedEvalIndex, setSelectedEvalIndex] = useState(0);

  const activeEval = evaluations[selectedEvalIndex] || evaluations[0];

  const historicalPerformanceData = [
    { period: 'Q1 2025', rAndD: 86, operations: 82, sales: 88 },
    { period: 'Q2 2025', rAndD: 89, operations: 85, sales: 90 },
    { period: 'Q3 2025', rAndD: 91, operations: 88, sales: 86 },
    { period: 'Q4 2025', rAndD: 93, operations: 90, sales: 92 },
    { period: 'Q1 2026', rAndD: 92, operations: 89, sales: 94 },
    { period: 'Q2 2026', rAndD: 95, operations: 93, sales: 96 },
  ];

  const departmentDistribution = [
    { name: 'R&D Lab', value: 35, color: '#2563eb' },
    { name: 'Manufacturing', value: 25, color: '#10b981' },
    { name: 'Quality Assurance', value: 15, color: '#f59e0b' },
    { name: 'Logistics', value: 15, color: '#8b5cf6' },
    { name: 'Commercial & Sales', value: 10, color: '#ec4899' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              People Analytics & Performance
            </span>
            <span className="text-xs text-slate-400">• 180° / 360° Appraisals & Goal Tracking</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Performance KPIs & People Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Continuous performance evaluations, achievement trends, workforce health metrics, and competency development.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEvalIndex}
            onChange={(e) => setSelectedEvalIndex(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
          >
            {evaluations.map((ev, idx) => (
              <option key={ev.id} value={idx}>
                {ev.employeeName} - {ev.evaluationType}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Average KPI Achievement</p>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">91.5%</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +4.2% from previous cycle
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Workforce Retention Rate</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">98.2%</p>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Industry Benchmark: 88%</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Appraisals Completed</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">100%</p>
          <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">All Staff Reviewed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Attendance Punctuality</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">99.1%</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">GPS Verified On-Time</span>
        </div>
      </div>

      {/* Performance Appraisal Spotlight (Matching Image 1: ACME General Performance Evaluation 180) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{activeEval.evaluationType}</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{activeEval.period}</h3>
              <p className="text-xs text-slate-400">Employee: <strong>{activeEval.employeeName}</strong> • Evaluator: <strong>{activeEval.reviewer}</strong></p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{activeEval.kpiAchievementRate}%</span>
              <p className="text-[10px] text-slate-400 font-semibold">Overall Rating</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeEval.kpis.map((kpi, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 dark:text-white">{kpi.name}</span>
                  <span className="text-purple-600 dark:text-purple-400">{kpi.score.toFixed(1)} / {kpi.weight}% (Score)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((kpi.achieved / kpi.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Target Metric: {kpi.target}%</span>
                  <span>Achieved: {kpi.achieved}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" /> Department Headcount Distribution
            </h3>
            <p className="text-xs text-slate-400">Resource allocation across divisions</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {departmentDistribution.map((dept, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }}></span>
                  <span className="text-slate-700 dark:text-slate-300">{dept.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{dept.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Trend Area Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Multi-Quarter Department Achievement Trends
          </h3>
          <p className="text-xs text-slate-400">Quarterly progress tracking across R&D, Operations, and Commercial teams</p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                  border: 'none',
                }}
              />
              <Area type="monotone" dataKey="rAndD" name="R&D Formulation" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRd)" />
              <Area type="monotone" dataKey="operations" name="Plant Operations" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
