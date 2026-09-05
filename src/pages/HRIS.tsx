import * as React from 'react';
import { useState } from 'react';
import { AnnualLeaveWidget } from '../components/hr/AnnualLeaveWidget';
import { BirthdayWishesWidget } from '../components/hr/BirthdayWishesWidget';
import { RequestTrackerWidget } from '../components/hr/RequestTrackerWidget';
import { PolicyDocumentsWidget } from '../components/hr/PolicyDocumentsWidget';
import { PerformanceKPIWidget } from '../components/hr/PerformanceKPIWidget';
import { PeersAttendanceWidget } from '../components/hr/PeersAttendanceWidget';
import { EmployeeLifeCycleWidget } from '../components/hr/EmployeeLifeCycleWidget';
import { EmployeeSelfServiceMobileMockup } from '../components/hr/EmployeeSelfServiceMobileMockup';
import { MasterEmployee201Manager } from '../components/hr/MasterEmployee201Manager';
import { initialEmployees, sampleLeaveBalance } from '../data/mockHrData';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  UserCheck, 
  Award, 
  ShieldCheck, 
  Calendar, 
  Users, 
  FileText, 
  Download, 
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';

export default function HRISPage() {
  const [activeTab, setActiveTab] = useState<'hub' | 'gps' | 'directory' | 'lifecycle'>('hub');
  const [clockStatus, setClockStatus] = useState<'OUT' | 'IN'>('IN');
  const [timeLogs, setTimeLogs] = useState<{ time: string; type: string; coords: string; status: string }[]>([
    { time: '08:02 AM - Today', type: 'TIME IN', coords: '14.5547° N, 121.0244° E (Centaur Chem HQ)', status: 'GPS Verified' },
    { time: '05:01 PM - Yesterday', type: 'TIME OUT', coords: '14.5547° N, 121.0244° E (Centaur Chem HQ)', status: 'Regular Sync' },
    { time: '08:00 AM - Yesterday', type: 'TIME IN', coords: '14.5547° N, 121.0244° E (Centaur Chem HQ)', status: 'GPS Verified' },
  ]);

  const handleClockInOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today';
    const newType = clockStatus === 'OUT' ? 'TIME IN' : 'TIME OUT';
    setClockStatus(clockStatus === 'OUT' ? 'IN' : 'OUT');
    setTimeLogs([{ time: timeStr, type: newType, coords: '14.5547° N, 121.0244° E (Centaur Chem HQ)', status: 'GPS Verified' }, ...timeLogs]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Core HRIS Suite
            </span>
            <span className="text-xs text-slate-400">• Up to Enterprise Scale</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Human Resources Information System
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Complete Core HR, Leave Balances, Policy Documents, Birthday Celebrations, and GPS Geofenced Timekeeping.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-auto overflow-x-auto">
          {[
            { id: 'hub', label: 'HR Command Hub', icon: Layers },
            { id: 'gps', label: 'GPS Web Time In/Out', icon: MapPin },
            { id: 'directory', label: 'Employee Directory', icon: Users },
            { id: 'lifecycle', label: 'Life Cycle & Compliance', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: HR COMMAND HUB (The Complete Visual Board from Screenshots) */}
      {activeTab === 'hub' && (
        <div className="space-y-6">
          {/* Main Grid: Widgets matching Image 1 & 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Birthday Wishes + Performance KPI */}
            <div className="space-y-6 flex flex-col">
              <BirthdayWishesWidget />
              <PerformanceKPIWidget />
            </div>

            {/* Column 2: Employee Life Cycle + Request Tracker */}
            <div className="space-y-6 flex flex-col">
              <EmployeeLifeCycleWidget />
              <RequestTrackerWidget />
            </div>

            {/* Column 3: Policy Documents + Team & Peers Attendance */}
            <div className="space-y-6 flex flex-col">
              <PolicyDocumentsWidget />
              <PeersAttendanceWidget />
            </div>
          </div>

          {/* Dedicated Section: Interactive Leave Balances (Image 1 & 2) + Mobile Self-Service View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="lg:col-span-2">
              <AnnualLeaveWidget balance={sampleLeaveBalance} />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center">
              <div className="text-center mb-3">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Mobile Employee Self-Service (ESS)
                </span>
                <p className="text-[11px] text-slate-400">Live preview of mobile interface for chemists & staff</p>
              </div>
              <EmployeeSelfServiceMobileMockup />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GPS WEB TIME IN / OUT */}
      {activeTab === 'gps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Field & Lab Geofence
                </span>
                <h3 className="text-xl font-extrabold mt-3">GPS Web Time In / Out</h3>
                <p className="text-blue-100 text-xs mt-1 leading-relaxed">
                  Real-time geolocation capture with instant radius verification for laboratory chemists, plant operators, and remote field teams.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-white/10 p-3.5 rounded-2xl text-xs space-y-1.5 backdrop-blur-xs">
                  <p className="flex items-center gap-1.5 font-mono font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-blue-300" /> Lat: 14.5547° N, Long: 121.0244° E
                  </p>
                  <p className="text-blue-200 text-[11px]">Accuracy: Within 3.2 meters (BGC HQ Zone)</p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
                    <ShieldCheck className="w-3 h-3" /> Geofence Verified: Authenticated
                  </div>
                </div>

                <button
                  onClick={handleClockInOut}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-lg transition-all transform active:scale-95 ${
                    clockStatus === 'OUT'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  {clockStatus === 'OUT' ? 'CLOCK IN WITH GPS' : 'CLOCK OUT WITH GPS'}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <MapPin className="w-4 h-4 text-blue-600" /> Geofence Boundary Map & Real-time Coordinates
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> GPS Locked
                </span>
              </div>

              {/* Map Preview simulation */}
              <div className="h-56 bg-slate-100 dark:bg-slate-800/80 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Geofence Circle */}
                <div className="absolute w-44 h-44 rounded-full border-2 border-blue-500 bg-blue-500/10 animate-pulse flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded shadow">
                    Centaur Chem HQ (50m Radius)
                  </span>
                </div>

                {/* Pin */}
                <div className="w-5 h-5 bg-blue-600 rounded-full shadow-xl border-2 border-white z-10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Status pills */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Today's Log</p>
                  <p className="text-xs font-extrabold text-emerald-600 mt-1">Present (On-Time)</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Tardiness / Undertime</p>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">0.0 mins</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Payroll Integration</p>
                  <p className="text-xs font-extrabold text-blue-600 mt-1">100% Synced</p>
                </div>
              </div>
            </div>
          </div>

          {/* Time logs */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent GPS Clock Logs</h3>
            <div className="space-y-2">
              {timeLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl gap-2 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${log.type === 'TIME IN' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {log.type} <span className="text-[10px] font-normal text-slate-400 ml-2">({log.time})</span>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {log.coords}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-lg self-start sm:self-auto">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYEE DIRECTORY & MASTER 201 DATABASE */}
      {activeTab === 'directory' && (
        <MasterEmployee201Manager />
      )}

      {/* TAB 4: LIFE CYCLE & COMPLIANCE */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Government & Statutory Vault</h3>
                  <p className="text-xs text-slate-400">Official certificates and regulatory tax documents</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { name: 'BIR Form 2316 (Annual Tax Summary)', year: 'Tax Year 2025' },
                  { name: 'SSS Contribution Certificate & Ledger', year: 'August 2026' },
                  { name: 'PhilHealth Premium Remittance Slip', year: 'August 2026' },
                  { name: 'Pag-IBIG HDMF Remittance Verification', year: 'August 2026' },
                  { name: 'Certificate of Employment & Compensation (COE)', year: 'Active' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.year}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors">
                      <Download className="w-3 h-3" /> Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">HR Admin Approvals</h3>
                  <p className="text-xs text-slate-400">Disciplinary, promotion, and regularization actions</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-400">Probation Reviews</p>
                  <p className="text-sm font-bold text-amber-600 mt-1">1 Employee</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-400">Promotion Due</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">2 Candidates</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-xs space-y-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-100">Next Action: Regularization Board Review</h4>
                <p className="text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
                  Rafael Alcantara is approaching 6-month tenure on Feb 28, 2027. KPI appraisal score: 88%. Ready for supervisor sign-off.
                </p>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                  Open Regularization Docket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
