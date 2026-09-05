import * as React from 'react';
import { useState } from 'react';
import { initialPerformanceEvaluations } from '../../data/mockHrData';
import { Target, TrendingUp, Award, ChevronRight, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export function PerformanceKPIWidget() {
  const [evaluations, setEvaluations] = useState(initialPerformanceEvaluations);
  const [selectedEvalIndex, setSelectedEvalIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const activeEval = evaluations[selectedEvalIndex] || evaluations[0];

  // Radial gauge calculation
  const gaugeSize = 100;
  const strokeWidth = 8;
  const radius = (gaugeSize - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const achievementRate = activeEval.kpiAchievementRate;
  const dashoffset = circ - (achievementRate / 100) * circ;

  const chartData = activeEval.kpis.map(k => ({
    name: k.name.length > 15 ? k.name.slice(0, 15) + '...' : k.name,
    score: k.score,
    target: k.weight,
  }));

  return (
    <div id="performance-kpi-widget" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance KPIs</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Select an evaluation type and manage your / team KPI</p>
            </div>
          </div>
        </div>

        {/* Evaluation Type Selector dropdown matching Image 1 */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Self / Team Evaluation</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
              Active Cycle
            </span>
          </div>

          <select
            value={selectedEvalIndex}
            onChange={(e) => setSelectedEvalIndex(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            {evaluations.map((ev, idx) => (
              <option key={ev.id} value={idx}>
                {ev.employeeName} - {ev.period}
              </option>
            ))}
          </select>

          <p className="text-[10px] text-slate-400">Period From 01/01/2026 To 31/12/2026</p>
        </div>

        {/* Gauge + Achievement Trend Section */}
        <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
          {/* Radial Donut */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg width={gaugeSize} height={gaugeSize} className="transform -rotate-90">
              <circle
                cx={gaugeSize / 2}
                cy={gaugeSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx={gaugeSize / 2}
                cy={gaugeSize / 2}
                r={radius}
                stroke="#9333ea"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circ}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold text-purple-700 dark:text-purple-400">{achievementRate}%</span>
              <span className="text-[8px] font-semibold uppercase text-slate-400">Rate</span>
            </div>
          </div>

          {/* Quick bar visualization */}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Achievement Trend (%)</span>
            <div className="h-16 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} hide />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="score" fill="#9333ea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Button matching Image 1 */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowDetailModal(true)}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Award className="w-3.5 h-3.5" /> View / Manage My KPI
        </button>
      </div>

      {/* Detailed Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">KPI Breakdown & Objectives</h3>
                <p className="text-xs text-slate-500">{activeEval.period}</p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeEval.kpis.map((kpi, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800 dark:text-slate-100">{kpi.name}</span>
                    <span className="text-purple-600 dark:text-purple-400">{kpi.score.toFixed(1)} / {kpi.weight}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((kpi.achieved / kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Target: {kpi.target}%</span>
                    <span>Achieved: {kpi.achieved}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-slate-500">Reviewer: <strong>{activeEval.reviewer}</strong></span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
