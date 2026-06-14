import '@/styles/skeleton.css';

export const TableSkeletonRows = ({ columns = 6, rows = 5, colWidths }: { columns?: number; rows?: number; colWidths?: string[] }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} className="animate-pulse">
        {Array.from({ length: columns }).map((_, c) => (
          <td key={c} className="px-4 py-3">
            <div
              className={`skeleton ${colWidths?.[c] ?? 'w-full'} h-4`}
              aria-hidden="true"
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);
