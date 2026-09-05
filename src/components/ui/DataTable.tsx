import * as React from 'react';
import { cn } from '../../lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

export function DataTable<T>({ data, columns, onRowClick, loading }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                className={cn(
                  "px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 text-sm">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, j) => (
                  <td key={j} className={cn("px-4 py-3 text-sm", col.className)}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
