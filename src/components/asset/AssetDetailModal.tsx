import React from 'react';
import { PreciseQRCode } from './PreciseQRCode';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Building2, 
  User, 
  Package, 
  ShieldCheck, 
  Calendar,
  Layers,
  MapPin,
  Tag
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { CentaurLogo } from '../common/CentaurLogo';

interface AssetDetailModalProps {
  item: any;
  onClose: () => void;
}

export function AssetDetailModal({ item, onClose }: AssetDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const serialOrSku = item.serialNo || item.sku || 'N/A';
  const name = item.deviceName || item.name || 'Unnamed Asset';
  const category = item.category || item.group || 'General Equipment';
  const location = item.location || item.warehouse || 'Taguig Head Office & Warehouse';
  const custodian = item.custodian || 'Dr. Arnold Cortina';
  const department = item.department || 'Operations & R&D';
  const status = item.status || (item.balanceQty !== undefined ? (item.balanceQty <= 3 ? 'LOW STOCK' : 'IN STOCK') : 'IN STOCK');
  const timestamp = item.timestamp || new Date().toLocaleString();
  const balanceQty = item.balanceQty !== undefined ? item.balanceQty : 1;
  const balanceValue = item.balanceValue !== undefined ? item.balanceValue : 0;

  const handleCopy = () => {
    navigator.clipboard?.writeText(serialOrSku);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintTag = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
              <CentaurLogo size={28} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Asset Passport & QR Tag
              </h3>
              <p className="text-[10px] text-slate-500">Centaur Chem Enterprise Master Asset Identifier</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Centered Big QR Code */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
              <PreciseQRCode value={serialOrSku} size={150} showLabel={false} />
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className="font-mono font-extrabold text-sm text-amber-600 dark:text-amber-400">
                {serialOrSku}
              </span>
              <button
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                title="Copy Serial / Tag"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 text-center max-w-sm">
              {name}
            </p>
          </div>

          {/* Full Item Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{category}</span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded ${
                status === 'IN STOCK' ? 'bg-blue-100 text-blue-700' :
                status === 'IN USE' ? 'bg-emerald-100 text-emerald-700' :
                status === 'ISSUED' ? 'bg-purple-100 text-purple-700' :
                'bg-slate-200 text-slate-700'
              }`}>
                {status}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custodian</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{custodian}</span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{department}</span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location / Depot</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{location}</span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Quantity</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{balanceQty} units</span>
            </div>

            {balanceValue > 0 && (
              <div className="col-span-2 p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asset Valuation</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm block">
                  {formatCurrency(balanceValue)}
                </span>
              </div>
            )}

            <div className="col-span-2 p-3 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Registry Event</span>
              <span className="font-mono text-slate-500 text-[11px] block">{timestamp}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <button
            onClick={handlePrintTag}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print Tag Label
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
