import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface PreciseQRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function PreciseQRCode({
  value,
  size = 48,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  includeMargin = true,
  className = '',
  showLabel = false
}: PreciseQRCodeProps) {
  const qrData = value && value.trim() !== '' ? value : 'CENTAUR-ASSET-N/A';

  return (
    <div className={`inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs ${className}`}>
      <QRCodeSVG
        value={qrData}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="M"
        includeMargin={includeMargin}
      />
      {showLabel && (
        <span className="text-[9px] font-mono font-bold text-slate-600 mt-0.5 tracking-tight truncate max-w-full">
          {qrData.length > 14 ? `${qrData.substring(0, 12)}..` : qrData}
        </span>
      )}
    </div>
  );
}
