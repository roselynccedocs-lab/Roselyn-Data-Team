import * as React from 'react';
import { useState } from 'react';
import { LeaveBalance } from '../../types';
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface AnnualLeaveWidgetProps {
  balance?: LeaveBalance;
  onRequestLeave?: () => void;
}

export function AnnualLeaveWidget({ balance, onRequestLeave }: AnnualLeaveWidgetProps) {
  const [showModal, setShowModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const b = balance || {
    employeeId: 'EMP-001',
    totalBalance: 15.0,
    additions: 20.0,
    deductions: 5.0,
    awarded: 15.0,
    pending: 3.0,
    carryOver: 4.0,
    taken: 2.0,
    adjustments: 1.0,
    carryOverExpires: 'Feb-28-2027',
  };

  // SVG Circular progress math
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Let max capacity be 25 days
  const maxDays = 25;
  const progressRatio = Math.min(Math.max(b.totalBalance / maxDays, 0), 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      if (onRequestLeave) onRequestLeave();
    }, 1500);
  };

  return (
    <div id="annual-leave-widget" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Leave Entitlement</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Annual Leave</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Request Leave
        </button>
      </div>

      {/* Donut Ring and Key Balance */}
      <div className="py-6 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Additions / Total Base */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#eab308"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.75}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            {/* Active Balance Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Balance</span>
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
              {b.totalBalance.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Days</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span className="text-slate-600 dark:text-slate-400">Remaining Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Allocated / Carry Over</span>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics Grid (Matching Image 1, 2, 4) */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-blue-50/70 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Additions
            </span>
            <p className="text-base font-bold text-blue-900 dark:text-blue-100 mt-0.5">{b.additions.toFixed(1)} days</p>
          </div>
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> Deductions
            </span>
            <p className="text-base font-bold text-amber-900 dark:text-amber-100 mt-0.5">{b.deductions.toFixed(1)} days</p>
          </div>
        </div>

        {/* Detailed 2-column list matching mockup */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs py-2">
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Awarded</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.awarded.toFixed(1)} days</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Pending</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{b.pending.toFixed(1)} days</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Carry Over</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.carryOver.toFixed(1)} days</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Taken</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.taken.toFixed(1)} days</span>
          </div>
          <div className="flex justify-between items-center py-1 col-span-2">
            <span className="text-slate-500 dark:text-slate-400">Adjustments</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.adjustments.toFixed(1)} days</span>
          </div>
        </div>

        {/* Expiration Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" /> Carry over expires on:
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{b.carryOverExpires}</span>
        </div>
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">File Leave Request</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Leave Request Submitted</h4>
                <p className="text-xs text-slate-500">Your manager and HR have been notified for digital sign-off.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Leave Type</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option>Annual Leave</option>
                    <option>Vacation Leave</option>
                    <option>Sick Leave</option>
                    <option>Emergency Leave</option>
                    <option>Maternity/Paternity Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                    <input 
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reason / Handover Notes</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Provide details and emergency contact / handover plan..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
