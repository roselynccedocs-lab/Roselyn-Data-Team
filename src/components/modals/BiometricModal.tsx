import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, ShieldCheck, RefreshCw, X, AlertCircle } from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BiometricModal({ isOpen, onClose }: BiometricModalProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [deviceBranch, setDeviceBranch] = useState('BGC Taguig HQ - Terminal 1');

  if (!isOpen) return null;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncComplete(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Biometric Timekeeping Sync</h3>
              <p className="text-xs text-slate-500">Real-time ZKTeco & Suprema terminal logs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Branch Terminal</label>
            <select 
              value={deviceBranch}
              onChange={(e) => setDeviceBranch(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
            >
              <option>BGC Taguig HQ - Terminal 1 (Main Lobby)</option>
              <option>Laguna Chemical Plant - Gate 2</option>
              <option>Cebu Distribution Hub - Warehouse B</option>
              <option>Davao Cold Storage - Plant 4</option>
            </select>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Terminal IP: 192.168.10.45</span>
              <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Online (99.8% Signal)</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Unsynced Logs: 42 records</span>
              <span>Last Polled: 2 mins ago</span>
            </div>
          </div>

          {syncComplete && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Successfully synced 42 logs from {deviceBranch}. Attendance time-ins updated.</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Recent Biometric Punches</p>
            <div className="max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
              {[
                { name: 'Dr. Arnold Cortina', time: '08:02:15 AM', type: 'IN', method: 'Fingerprint' },
                { name: 'Maria Santos', time: '08:10:44 AM', type: 'IN', method: 'Facial Scan' },
                { name: 'Juan Dela Cruz', time: '08:15:22 AM', type: 'IN', method: 'Fingerprint' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.name}</span>
                  <span className="text-slate-500">{log.time}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded font-bold">{log.type}</span>
                  <span className="text-[10px] text-slate-400">{log.method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Biometrics...' : 'Trigger Live Sync'}
          </button>
        </div>
      </div>
    </div>
  );
}
