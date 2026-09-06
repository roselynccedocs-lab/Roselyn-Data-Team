import React from 'react';
import { EmployeePerformanceProfile } from '../../types/performance';
import { X, Printer, Download, Award, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface AnnualReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EmployeePerformanceProfile;
}

export function AnnualReportModal({ isOpen, onClose, profile }: AnnualReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Metric', 'Score'],
      ['Employee Name', profile.employeeName],
      ['Employee ID', profile.employeeId],
      ['Department', profile.department],
      ['Overall Score', `${profile.overallScore}%`],
      ['Performance Level', profile.level],
      ['Productivity Score', `${profile.scores.productivity}%`],
      ['Quality Score', `${profile.scores.quality}%`],
      ['Attendance Score', `${profile.scores.attendance}%`],
      ['Behavior Score', `${profile.scores.behavior}%`],
      ['Manager Evaluation', `${profile.scores.managerEvaluation}%`],
      ['Peer Evaluation', `${profile.scores.peerEvaluation}%`],
      ['HR Development Score', `${profile.scores.hrDevelopment}%`],
      ['Q1 Score', `${profile.quarterlyScores.Q1}%`],
      ['Q2 Score', `${profile.quarterlyScores.Q2}%`],
      ['Q3 Score', `${profile.quarterlyScores.Q3}%`],
      ['Annual Score', `${profile.quarterlyScores.annual}%`]
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Annual_Performance_Report_${profile.employeeId}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:text-black">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 text-slate-100 shadow-2xl relative my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Action Buttons (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-slate-100">Annual Employee Performance Card & Evaluation Report</h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800/60 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="space-y-6 text-xs font-sans">
          {/* Company Branding & Employee Header */}
          <div className="flex justify-between items-start border-b border-slate-800 print:border-slate-300 pb-4">
            <div>
              <div className="text-xl font-extrabold tracking-tight text-blue-400 print:text-blue-800">
                CENTAUR CHEM ENTERPRISE
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase tracking-wider mt-0.5">
                Automated People Analytics & Employee Performance Management System
              </div>
              <h1 className="text-base font-bold text-slate-100 print:text-black mt-2">
                2026 Annual Employee Performance Report Card
              </h1>
            </div>

            <div className="text-right">
              <div className="bg-blue-500/10 border border-blue-500/30 print:border-slate-300 px-4 py-2 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold">Annual Grade</div>
                <div className="text-2xl font-black text-blue-400 print:text-blue-700 font-mono">
                  {profile.overallScore}%
                </div>
                <div className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold uppercase mt-0.5">
                  {profile.level}
                </div>
              </div>
            </div>
          </div>

          {/* Employee Demographic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Employee Name</span>
              <div className="font-bold text-slate-100 print:text-black text-sm">{profile.employeeName}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Employee ID</span>
              <div className="font-mono text-slate-300 print:text-slate-800 font-semibold">{profile.employeeId}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Department</span>
              <div className="font-semibold text-slate-200 print:text-slate-800">{profile.department}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Manager</span>
              <div className="font-semibold text-slate-200 print:text-slate-800">{profile.managerName}</div>
            </div>
          </div>

          {/* Quarterly Score Breakdown Table */}
          <div>
            <h3 className="font-bold text-slate-200 print:text-black uppercase tracking-wider text-[11px] mb-2">Quarterly Score Summary</h3>
            <div className="grid grid-cols-5 gap-3 text-center">
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <div className="text-[10px] text-slate-400">Q1 2026</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.quarterlyScores.Q1}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <div className="text-[10px] text-slate-400">Q2 2026</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.quarterlyScores.Q2}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <div className="text-[10px] text-slate-400">Q3 2026</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.quarterlyScores.Q3}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <div className="text-[10px] text-slate-400">Q4 2026</div>
                <div className="text-sm font-bold font-mono text-slate-400 print:text-slate-500">—</div>
              </div>
              <div className="bg-blue-600/20 print:bg-blue-100 p-3 rounded-xl border border-blue-500/40 print:border-blue-300">
                <div className="text-[10px] text-blue-300 print:text-blue-800 font-bold">ANNUAL AVG</div>
                <div className="text-sm font-extrabold font-mono text-blue-400 print:text-blue-900">{profile.quarterlyScores.annual}%</div>
              </div>
            </div>
          </div>

          {/* 7 Dimension Scores Grid */}
          <div>
            <h3 className="font-bold text-slate-200 print:text-black uppercase tracking-wider text-[11px] mb-2">Detailed 7-Dimension Score Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Productivity (30%)</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.scores.productivity}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Quality & Accuracy (20%)</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.scores.quality}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Attendance (10%)</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.scores.attendance}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Behavior & Teamwork (15%)</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.scores.behavior}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Manager Evaluation (10%)</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.scores.managerEvaluation}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Peer 360° Evaluation (10%)</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.scores.peerEvaluation}%</div>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800 col-span-2">
                <div className="text-[10px] text-slate-400">HR & Professional Development (5%)</div>
                <div className="text-sm font-bold font-mono text-slate-100 print:text-black">{profile.scores.hrDevelopment}%</div>
              </div>
            </div>
          </div>

          {/* Development Action Plan & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-emerald-400 print:text-emerald-800 uppercase text-[10px] mb-2">Confirmed Strengths</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 print:text-black">
                {profile.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-amber-400 print:text-amber-800 uppercase text-[10px] mb-2">Recommended Development Plan</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 print:text-black">
                {profile.recommendedActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Signatures Block for Official Audit */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-slate-400 print:text-black border-t border-slate-800 print:border-slate-300">
            <div>
              <div className="border-b border-slate-700 print:border-black w-3/4 mx-auto mb-1"></div>
              <div className="font-semibold text-slate-200 print:text-black">{profile.managerName}</div>
              <div className="text-[10px]">Department Manager Signature</div>
            </div>
            <div>
              <div className="border-b border-slate-700 print:border-black w-3/4 mx-auto mb-1"></div>
              <div className="font-semibold text-slate-200 print:text-black">HR Governance Director</div>
              <div className="text-[10px]">Human Resources Department</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
