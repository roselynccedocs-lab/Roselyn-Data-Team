import * as React from 'react';
import { useState } from 'react';
import { peersOnLeaveToday, upcomingLeaves, initialEmployees } from '../../data/mockHrData';
import { Users, CalendarCheck, UserMinus, UserCheck, ChevronRight } from 'lucide-react';

export function PeersAttendanceWidget() {
  const [filterMode, setFilterMode] = useState<'working' | 'off'>('working');

  return (
    <div id="peers-attendance-widget" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header with Off / Working toggle matching Image 1 */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance & Team Radar</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Live roster and leave schedules</p>
            </div>
          </div>

          {/* Off vs Working Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterMode('off')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${filterMode === 'off' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold' : 'text-slate-500'}`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Off
            </button>
            <button
              onClick={() => setFilterMode('working')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${filterMode === 'working' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold' : 'text-slate-500'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Working
            </button>
          </div>
        </div>

        {/* Peers on Leave Today Card matching Image 1 */}
        <div className="mt-4 space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Peers on Leave Today
              </span>
              <span className="text-[10px] font-semibold text-slate-400">1 Employee on leave</span>
            </div>

            <div className="space-y-2">
              {peersOnLeaveToday.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center text-xs">
                      {p.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.role} • <span className="text-rose-500 font-semibold">{p.type}</span></p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    Returns {p.returnDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Leaves Next 5 Days matching Image 1 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-blue-500" /> Upcoming Leaves (Next 5 Days)
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">3 Team Members</span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {upcomingLeaves.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                      {u.avatar}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{u.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({u.type})</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{u.dates}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-500">Live Team Status:</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5" /> 5 of 6 Present at HQ / Field
        </span>
      </div>
    </div>
  );
}
