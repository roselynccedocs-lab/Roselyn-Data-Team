import React from 'react';

interface PreciseBarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
  darkColor?: string;
}

export function PreciseBarcode({
  value,
  width = 280,
  height = 70,
  showText = true,
  className = '',
  darkColor = '#0f172a'
}: PreciseBarcodeProps) {
  const code = (value || 'CEN-2026-01').toUpperCase().trim();
  
  // Generate deterministic realistic barcode pattern for the string
  const bars = React.useMemo(() => {
    let pattern: number[] = [2, 1, 2, 1]; // Start guard
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const b1 = ((charCode * 3) % 4) + 1;
      const b2 = ((charCode * 7) % 3) + 1;
      const b3 = ((charCode * 5) % 4) + 1;
      const b4 = ((charCode * 11) % 3) + 1;
      pattern.push(b1, b2, b3, b4);
    }
    pattern.push(2, 1, 1, 3, 2); // Stop guard
    return pattern;
  }, [code]);

  const totalUnits = bars.reduce((a, b) => a + b, 0);
  const unitWidth = width / totalUnits;

  let currentX = 0;
  const rects: { x: number; w: number; isBar: boolean }[] = [];
  bars.forEach((barWidthUnits, index) => {
    const isBar = index % 2 === 0;
    const w = barWidthUnits * unitWidth;
    rects.push({ x: currentX, w, isBar });
    currentX += w;
  });

  return (
    <div className={`inline-flex flex-col items-center justify-center p-2 bg-white ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-full h-auto"
      >
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
        {rects.map((r, i) => (
          r.isBar ? (
            <rect
              key={i}
              x={r.x}
              y="0"
              width={r.w}
              height={height}
              fill={darkColor}
            />
          ) : null
        ))}
      </svg>
      {showText && (
        <span className="text-[12px] font-mono font-black tracking-widest text-slate-900 mt-1 uppercase">
          *{code}*
        </span>
      )}
    </div>
  );
}
