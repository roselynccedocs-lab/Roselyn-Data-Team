import React from 'react';
import { Printer, X, ShieldCheck, FileCheck, Calendar, Building2, User } from 'lucide-react';
import { AuditLogItem } from '../../context/AssetContext';
import { CentaurLogo } from '../common/CentaurLogo';

interface AuditTrailPrintFormProps {
  logs: AuditLogItem[];
  timeFilter: string;
  moduleFilter: string;
  onClose: () => void;
}

export function AuditTrailPrintForm({ logs, timeFilter, moduleFilter, onClose }: AuditTrailPrintFormProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      {/* Landscape Print Style Override */}
      <style>{`
        @page {
          size: landscape;
          margin: 8mm 10mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .audit-print-document {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div 
        className="bg-white text-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-8 border border-slate-200 audit-print-document"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header (hidden on print) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Official Form: Asset Audit Trail</h3>
              <p className="text-xs text-slate-500">Ready for regulatory inspection, compliance filing, and internal sign-off.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Form Now
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Formal Document to be Printed */}
        <div className="p-8 space-y-6 print:p-0 print:space-y-4 print:text-black">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-1 bg-emerald-50 rounded-xl border border-emerald-200 shrink-0">
                  <CentaurLogo size={48} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                    CENTAUR CHEM ENTERPRISE INC.
                  </span>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase mt-0.5 leading-snug">
                    ASSET CUSTODIAL AUDIT TRAIL & TRANSACTION COMPLIANCE FORM
                  </h1>
                  <p className="text-xs text-slate-600">
                    Fixed Asset Master Registry • Taguig Technical Operations & Laguna Manufacturing Depot
                  </p>
                </div>
              </div>

              <div className="text-right border border-slate-900 p-2 rounded-lg text-xs font-mono shrink-0">
                <span className="block font-extrabold text-slate-900">FORM NO: CC-AUD-2026-09</span>
                <span className="block text-[10px] text-slate-500">REV: 04 • COMPLIANT</span>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Report Date</span>
                <span className="font-semibold text-slate-800">September 2, 2026</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Time Filter Scope</span>
                <span className="font-semibold text-slate-800 uppercase">{timeFilter}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Module Category</span>
                <span className="font-semibold text-slate-800 uppercase">{moduleFilter}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Logged Records</span>
                <span className="font-mono font-bold text-purple-700">{logs.length} Transactions</span>
              </div>
            </div>
          </div>

          {/* Form Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-300">
                <tr>
                  <th className="p-2.5 border-r border-slate-300">Timestamp</th>
                  <th className="p-2.5 border-r border-slate-300">Document / Ref ID</th>
                  <th className="p-2.5 border-r border-slate-300">Module Category</th>
                  <th className="p-2.5 border-r border-slate-300">Action Event</th>
                  <th className="p-2.5 border-r border-slate-300">Performer</th>
                  <th className="p-2.5 border-r border-slate-300">Target Dept</th>
                  <th className="p-2.5 border-r border-slate-300">Details & Item Description</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 font-mono text-[10px] text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {log.docId}
                    </td>
                    <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">
                      {log.module}
                    </td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                      {log.action}
                    </td>
                    <td className="p-2 text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {log.performer}
                    </td>
                    <td className="p-2 text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {log.targetDept}
                    </td>
                    <td className="p-2 text-slate-700 border-r border-slate-200">
                      {log.details}
                    </td>
                    <td className="p-2 text-center whitespace-nowrap font-bold text-[10px] text-emerald-800">
                      {log.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Formal Signatures Section */}
          <div className="pt-6 border-t-2 border-slate-900">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PREPARED BY</span>
                <div className="border-t border-slate-900 pt-1.5">
                  <span className="text-[10px] text-slate-400 block italic mb-0.5">(Signature over Printed Name)</span>
                  <span className="font-bold text-slate-900 block text-xs">Finance & Inventory Custodian</span>
                </div>
              </div>

              <div className="space-y-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">VERIFIED & AUDITED BY</span>
                <div className="border-t border-slate-900 pt-1.5">
                  <span className="text-[10px] text-slate-400 block italic mb-0.5">(Signature over Printed Name)</span>
                  <span className="font-bold text-slate-900 block text-xs">IT & Digital Asset Lead</span>
                </div>
              </div>

              <div className="space-y-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">APPROVED BY</span>
                <div className="border-t border-slate-900 pt-1.5">
                  <span className="text-[10px] text-slate-400 block italic mb-0.5">(Signature over Printed Name)</span>
                  <span className="font-bold text-slate-900 block text-xs">Operations & Plant Director</span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 text-center mt-6">
              This document is an immutable system record generated by Centaur Chem Enterprise Asset Management Engine. Confidential & Proprietary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
