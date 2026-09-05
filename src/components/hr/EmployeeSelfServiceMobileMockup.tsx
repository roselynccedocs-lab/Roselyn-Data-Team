import * as React from 'react';
import { useState } from 'react';
import { 
  Smartphone, 
  MapPin, 
  User, 
  FileText, 
  Receipt, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface MobileMockupProps {
  onQuickAction?: (action: string) => void;
}

export function EmployeeSelfServiceMobileMockup({ onQuickAction }: MobileMockupProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [activeScreen, setActiveScreen] = useState<'home' | 'leave' | 'profile'>('home');
  const [showCheckInAlert, setShowCheckInAlert] = useState(false);

  const handleToggleCheckIn = () => {
    setIsCheckedIn(!isCheckedIn);
    setShowCheckInAlert(true);
    setTimeout(() => setShowCheckInAlert(false), 2000);
  };

  return (
    <div id="ess-mobile-mockup" className="flex flex-col items-center justify-center p-2">
      {/* Phone frame */}
      <div className="w-[300px] sm:w-[320px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Notch / Speaker bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 mr-2"></div>
          <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Screen canvas */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-[30px] overflow-hidden pt-7 pb-4 px-3.5 space-y-3 min-h-[580px] flex flex-col justify-between text-xs">
          {/* Top App Bar */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                  AC
                </div>
                <div>
                  <p className="font-bold text-[11px] leading-tight text-slate-900 dark:text-white">Welcome, Dr. Arnold</p>
                  <p className="text-[9px] text-slate-400">Centaur Chem R&D</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {showCheckInAlert && (
              <div className="mt-2 bg-emerald-500 text-white text-[10px] p-2 rounded-xl text-center font-bold animate-in fade-in">
                {isCheckedIn ? '✓ Clocked In at BGC Taguig HQ (GPS Verified)' : '✓ Clocked Out (GPS Synced)'}
              </div>
            )}

            {/* Remaining Leave Balance mini card */}
            <div className="mt-2.5 bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-3 rounded-2xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-semibold text-emerald-100">Annual Leave</span>
                  <p className="text-xl font-extrabold mt-0.5">15.0 <span className="text-xs font-normal">Days</span></p>
                  <p className="text-[9px] text-emerald-100">Awarded: 15.0 • Taken: 2.0</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white flex items-center justify-center font-bold text-xs">
                  75%
                </div>
              </div>
              <button 
                onClick={() => onQuickAction && onQuickAction('leave')}
                className="mt-2.5 w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-bold text-center transition-colors"
              >
                + Request Leave
              </button>
            </div>

            {/* Attendance & Shift Card */}
            <div className="mt-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" /> Today's Shift
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">08:00 AM - 05:00 PM</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                <div>
                  <p className="font-bold text-[11px] text-slate-900 dark:text-white">Status: {isCheckedIn ? 'Present' : 'Not Checked In'}</p>
                  <p className="text-[9px] text-slate-400">Lat: 14.5547° N, Long: 121.0244° E</p>
                </div>
                <button
                  onClick={handleToggleCheckIn}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold text-white shadow-xs ${isCheckedIn ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                  {isCheckedIn ? 'Check Out' : 'Check In'}
                </button>
              </div>
            </div>

            {/* Peers on Leave summary */}
            <div className="mt-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Peers on Leave Today</span>
                <span className="text-rose-500 font-bold">1 On Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-[9px] flex items-center justify-center">
                  MS
                </div>
                <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">
                  Maria Santos <span className="text-slate-400">(Vacation Leave)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid matching Image 1 & 2 */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Self-Service Quick Launcher
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-[9px]">
              <button 
                onClick={handleToggleCheckIn}
                className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
              >
                <Clock className="w-4 h-4" />
                <span className="font-semibold leading-tight">Check In</span>
              </button>

              <button 
                onClick={() => onQuickAction && onQuickAction('profile')}
                className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100"
              >
                <User className="w-4 h-4" />
                <span className="font-semibold leading-tight">My Profile</span>
              </button>

              <button 
                onClick={() => onQuickAction && onQuickAction('policy')}
                className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
              >
                <FileText className="w-4 h-4" />
                <span className="font-semibold leading-tight">Policies</span>
              </button>

              <button 
                onClick={() => onQuickAction && onQuickAction('payslips')}
                className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100"
              >
                <Receipt className="w-4 h-4" />
                <span className="font-semibold leading-tight">Payslips</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
