import * as React from 'react';
import { useState } from 'react';
import { initialHRRequests } from '../../data/mockHrData';
import { HRRequest } from '../../types';
import { FileClock, Search, Plus, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export function RequestTrackerWidget() {
  const [requests, setRequests] = useState<HRRequest[]>(initialHRRequests);
  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'COMPLETED' | 'REJECTED' | 'FORWARDED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New request form state
  const [requestType, setRequestType] = useState<HRRequest['type']>('Leave Request');
  const [employeeName, setEmployeeName] = useState('Dr. Arnold Cortina');
  const [notes, setNotes] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  const counts = {
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
    FORWARDED: requests.filter(r => r.status === 'FORWARDED').length,
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = r.status === activeFilter;
    const matchesSearch = searchQuery === '' || 
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: HRRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeName,
      employeeId: 'EMP-001',
      type: requestType,
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      expectedDate: expectedDate || 'Sept 10, 2026',
      status: 'PENDING',
      notes,
      department: 'Research & Development',
    };
    setRequests([newReq, ...requests]);
    setShowAddModal(false);
    setNotes('');
    setExpectedDate('');
  };

  const handleFulfillRequest = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
  };

  return (
    <div id="request-tracker-widget" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request Tracker</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Track and fulfill all operational requests</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Request
            </button>
          </div>
        </div>

        {/* 4 Status Pills / Tabs matching Image 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`p-2.5 rounded-xl text-left border transition-all ${activeFilter === 'PENDING' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase">Pending</span>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {counts.PENDING}
              </span>
            </div>
            <p className="text-xs font-bold mt-1">Pending Requests</p>
          </button>

          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`p-2.5 rounded-xl text-left border transition-all ${activeFilter === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase">Completed</span>
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {counts.COMPLETED}
              </span>
            </div>
            <p className="text-xs font-bold mt-1">Completed (30 Days)</p>
          </button>

          <button
            onClick={() => setActiveFilter('REJECTED')}
            className={`p-2.5 rounded-xl text-left border transition-all ${activeFilter === 'REJECTED' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase">Rejected</span>
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {counts.REJECTED}
              </span>
            </div>
            <p className="text-xs font-bold mt-1">Rejected Requests</p>
          </button>

          <button
            onClick={() => setActiveFilter('FORWARDED')}
            className={`p-2.5 rounded-xl text-left border transition-all ${activeFilter === 'FORWARDED' ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase">Forwarded</span>
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                {counts.FORWARDED}
              </span>
            </div>
            <p className="text-xs font-bold mt-1">Forwarded Requests</p>
          </button>
        </div>

        {/* Live Search input */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search any action and data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Request List */}
        <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
          {filteredRequests.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No requests found matching this filter or search query.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">{req.id}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{req.type}</span>
                    <span className="text-[10px] text-slate-400">• {req.department}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{req.notes}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span>Requester: <strong className="text-slate-600 dark:text-slate-300">{req.employeeName}</strong></span>
                    <span>Applied: {req.appliedDate}</span>
                    <span>Expected: {req.expectedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => handleFulfillRequest(req.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Fulfill Request
                    </button>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
                      req.status === 'FORWARDED' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Operation Request</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Request Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option>Leave Request</option>
                  <option>Overtime Approval</option>
                  <option>Cash Advance</option>
                  <option>COE Certificate</option>
                  <option>Equipment Requisition</option>
                  <option>Training Request</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Requester Name</label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Expected Completion / Due Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Details & Justification</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the purpose, requirements or operational urgency..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Save Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
