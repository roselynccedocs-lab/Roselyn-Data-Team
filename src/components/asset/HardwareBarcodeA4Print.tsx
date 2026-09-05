import React, { useState } from 'react';
import { Printer, X, Tag, Barcode, Check, Layers, ShieldCheck } from 'lucide-react';
import { PreciseBarcode } from './PreciseBarcode';
import { CentaurLogo } from '../common/CentaurLogo';

interface HardwareBarcodeA4PrintProps {
  tag: {
    tagId: string;
    serialNumber: string;
    deviceName: string;
    category: string;
    location: string;
    custodian: string;
    department: string;
    status: string;
    purchaseDate?: string;
    purchaseAmount?: string | number;
  };
  onClose: () => void;
}

export function HardwareBarcodeA4Print({ tag, onClose }: HardwareBarcodeA4PrintProps) {
  const [printLayout, setPrintLayout] = useState<'single' | 'sheet'>('single');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      {/* Print Style Override specifically for A4 Portrait Barcode Sticker Printing */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 10mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .a4-sticker-print-container {
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
        className="bg-white text-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-8 border border-slate-200 a4-sticker-print-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar (Hidden in Print Preview) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">A4 Hardware Barcode Tag Sticker Print</h3>
              <p className="text-xs text-slate-500">Formats high-resolution barcode tags directly for A4 sticker sheet printing.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Layout toggle */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPrintLayout('single')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printLayout === 'single' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Tag (A4)
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('sheet')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printLayout === 'sheet' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sticker Sheet (4x)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Barcode A4
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 print:p-0 print:space-y-4 print:text-black">
          {/* Header on A4 Sheet */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-emerald-50 rounded-xl border border-emerald-200 shrink-0">
                <CentaurLogo size={42} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                  CENTAUR CHEM ENTERPRISE INC. • IT & ASSET REPOSITORY
                </span>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  OFFICIAL HARDWARE ASSET BARCODE PASSPORT
                </h2>
                <p className="text-[10px] text-slate-600">
                  Taguig Technical Operations & Laguna Manufacturing Depot
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs border border-slate-900 p-2 rounded-lg bg-slate-50 print:bg-white">
              <span className="block font-bold text-slate-900">A4 STICKER SHEET</span>
              <span className="block text-[10px] text-slate-500">TAG ID: {tag.tagId}</span>
            </div>
          </div>

          {printLayout === 'single' ? (
            /* Single Large Clean A4 Equipment Tag */
            <div className="p-6 bg-white border-2 border-slate-900 rounded-2xl shadow-sm space-y-6 print:border-2 print:border-black">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 rounded-xl border border-emerald-300">
                    <CentaurLogo size={36} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 uppercase">CENTAUR CHEM ENTERPRISE</h3>
                    <p className="text-[10px] font-mono font-bold text-slate-600">PROPERTY IDENTIFICATION TAG</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-black text-xs rounded-md">
                    {tag.tagId}
                  </span>
                </div>
              </div>

              {/* Centered Barcode Only Layout */}
              <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-slate-200 rounded-xl print:bg-white print:border-black">
                <PreciseBarcode value={tag.serialNumber} width={380} height={90} />
                <span className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                  BARCODE ENCODED SERIAL: {tag.serialNumber}
                </span>
              </div>

              {/* Asset Information Table */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="border border-slate-300 p-2.5 rounded-lg bg-white print:border-black">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">DEVICE / ASSET NAME</span>
                  <span className="font-bold text-slate-900 text-sm block">{tag.deviceName}</span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded-lg bg-white print:border-black">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">SERIAL NUMBER</span>
                  <span className="font-bold text-emerald-700 text-sm block">{tag.serialNumber}</span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded-lg bg-white print:border-black">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">ASSIGNED CUSTODIAN</span>
                  <span className="font-bold text-slate-800 block">{tag.custodian}</span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded-lg bg-white print:border-black">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">DEPARTMENT & LOCATION</span>
                  <span className="font-bold text-slate-800 block">{tag.department} • {tag.location}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono font-bold text-slate-600">
                <span>DO NOT REMOVE OR TAMPER WITH THIS TAG</span>
                <span>STATUS: {tag.status}</span>
              </div>
            </div>
          ) : (
            /* Multi-Tag Sticker Sheet (4x) for A4 Adhesive Sheets */
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="p-4 border-2 border-slate-900 rounded-xl bg-white space-y-3 print:border-black">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <CentaurLogo size={24} />
                      <span className="font-black text-[10px] text-slate-900">CENTAUR CHEM</span>
                    </div>
                    <span className="font-mono font-black text-[10px] px-1.5 py-0.5 bg-slate-900 text-white rounded">
                      {tag.tagId}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-1">
                    <PreciseBarcode value={tag.serialNumber} width={240} height={55} />
                  </div>

                  <div className="space-y-0.5 text-[10px] font-mono border-t border-slate-200 pt-1.5">
                    <p className="font-bold text-slate-900 truncate">{tag.deviceName}</p>
                    <p className="text-slate-600 truncate">Cust: {tag.custodian}</p>
                    <p className="text-slate-500 text-[9px] truncate">Dept: {tag.department} | {tag.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Verification Footnote */}
          <div className="pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500">
            <p>Generated by Centaur Chem Enterprise Asset Management Engine • Form CCE-TAG-A4-2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
