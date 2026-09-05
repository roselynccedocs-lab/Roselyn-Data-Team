import React, { useRef } from 'react';
import { Printer, X, QrCode, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { PreciseQRCode } from './PreciseQRCode';
import { CentaurLogo } from '../common/CentaurLogo';

export interface BatchPrintQRItem {
  id: string;
  sku: string; // SKU or Serial Number / Tag ID to print under the QR code
  name: string;
  category?: string;
  department?: string;
  location?: string;
  status?: string;
}

interface BatchQRPrintModalProps {
  items: BatchPrintQRItem[];
  title?: string;
  onClose: () => void;
}

export function BatchQRPrintModal({
  items,
  title = 'Selected Items QR Codes Print Sheet',
  onClose,
}: BatchQRPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printAreaRef.current) {
      window.print();
      return;
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.setAttribute('title', 'Print Preview');
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc || !iframe.contentWindow) {
        window.print();
        return;
      }

      // Extract current stylesheets so Tailwind styling and fonts are preserved
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(el => el.outerHTML)
        .join('\n');

      const printContent = printAreaRef.current.innerHTML;

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title || 'QR Code Stickers - Centaur Chem Enterprise'}</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            ${styles}
            <style>
              @page {
                size: portrait;
                margin: 6mm 6mm;
              }
              body {
                background: white !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 4mm !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              }
              .batch-qr-grid {
                display: grid !important;
                grid-template-columns: repeat(4, 1fr) !important;
                gap: 5mm !important;
                width: 100% !important;
              }
              .batch-qr-sticker {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                border: 1.5px solid #0f172a !important;
                border-radius: 12px !important;
                padding: 2.5mm !important;
                background: white !important;
                text-align: center !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: space-between !important;
                box-sizing: border-box !important;
              }
              svg {
                max-width: 100% !important;
                height: auto !important;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 250);
    } catch (err) {
      console.warn('Iframe print fallback:', err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      {/* High-Density Compressed Print Styles for Direct window.print */}
      <style>{`
        @page {
          size: portrait;
          margin: 8mm 8mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          body > *:not(#root) {
            display: none !important;
          }
          .batch-qr-print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .batch-qr-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 6mm !important;
          }
          .batch-qr-sticker {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1.5px solid #000 !important;
            padding: 2mm !important;
          }
        }
      `}</style>

      <div
        className="bg-white text-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-8 border border-slate-200 batch-qr-print-container max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header (Hidden during Print) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/10 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full">
                  {items.length} Selected QR Codes
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Compressed high-density sheet layout ready for laser printing or sticker sheets. All SKU numbers are aligned under each QR code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print QR Codes Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printAreaRef} className="p-6 overflow-y-auto space-y-6 print:p-0 print:space-y-3 print:overflow-visible">
          {/* Header Banner on print */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CentaurLogo size={32} />
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                  CENTAUR CHEM ENTERPRISE
                </span>
                <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                  BATCH QR PASSPORT & INVENTORY IDENTIFIER STICKERS
                </h2>
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-600">
              <span className="block font-bold text-slate-900">BATCH COUNT: {items.length} ITEMS</span>
              <span className="block text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Compressed Printable QR Code Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 batch-qr-grid">
            {items.map((item) => (
              <div
                key={item.id || item.sku}
                className="bg-white border-2 border-slate-900 rounded-2xl p-3 flex flex-col items-center justify-between text-center batch-qr-sticker shadow-2xs space-y-2"
              >
                {/* Brand header on sticker */}
                <div className="w-full flex items-center justify-between border-b border-slate-200 pb-1 text-[8px] font-mono font-bold text-slate-600">
                  <span>CENTAUR CHEM</span>
                  <span className="uppercase text-amber-700 font-extrabold truncate max-w-[90px]">{item.category || 'ASSET'}</span>
                </div>

                {/* Compressed QR Code */}
                <div className="p-1 bg-white rounded-lg flex justify-center items-center">
                  <PreciseQRCode 
                    value={item.sku} 
                    size={84} 
                    showLabel={false} 
                    includeMargin={false} 
                  />
                </div>

                {/* SKU / Serial Number Underneath QR Code (Mandatory Requirement) */}
                <div className="w-full pt-1 border-t border-slate-100">
                  <div className="font-mono font-black text-xs text-slate-900 tracking-wider break-all leading-tight">
                    {item.sku}
                  </div>
                  <div className="text-[9px] font-semibold text-slate-600 truncate mt-0.5 max-w-full" title={item.name}>
                    {item.name}
                  </div>
                </div>

                <div className="w-full text-[7px] text-slate-400 font-mono flex justify-between pt-0.5">
                  <span>DO NOT REMOVE</span>
                  <span>PROPERTY OF CCE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
