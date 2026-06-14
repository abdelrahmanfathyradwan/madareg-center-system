import '@/styles/skeleton.css';

type TableSkeletonProps = {
  rows?: number; // default 8
  columns?: number; // default 3
  colWidths?: string[]; // Tailwind width classes for each column
};

export const TableSkeleton = ({ rows = 8, columns = 3, colWidths }: TableSkeletonProps) => {
  const widths = colWidths ?? Array(columns).fill('w-full');
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-right">
        <thead className="bg-slate-50/50">
          <tr className="border-b border-slate-100">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className={`skeleton ${widths[i]} h-4`} aria-hidden="true" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div className={`skeleton ${widths[c]} h-4`} aria-hidden="true" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
