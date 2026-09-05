import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, UserCheck, X } from 'lucide-react';

interface ShiftManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftManagementModal({ isOpen, onClose }: ShiftManagementModalProps) {
  const [shiftType, setShiftType] = useState('Standard Shift (08:00 AM - 05:00 PM)');
  const [department, setDepartment] = useState('R&D Laboratory Chemists');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Shift & Flexible Schedule Management</h3>
              <p className="text-xs text-slate-500">Configure multi-shift rotations and flexitime rules</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department / Group</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
            >
              <option>R&D Laboratory Chemists</option>
              <option>Quality Assurance Inspectors</option>
              <option>Plant Operators & Production</option>
              <option>Warehouse Logistics & Shipping</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Shift Schedule</label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
            >
              <option>Standard Shift (08:00 AM - 05:00 PM)</option>
              <option>Morning Shift (06:00 AM - 03:00 PM)</option>
              <option>Night Shift (10:00 PM - 07:00 AM w/ Night Diff)</option>
              <option>Flexible Schedule (Core hours 10AM - 3PM)</option>
              <option>Compressed Workweek (10 hrs x 4 days)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Grace Period (Minutes)</label>
              <input type="number" defaultValue={15} className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Overtime Threshold</label>
              <input type="text" defaultValue="After 8 hours" disabled className="w-full mt-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" />
            </div>
          </div>

          {saved && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Shift schedule successfully updated for {department}.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Save Shift Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
