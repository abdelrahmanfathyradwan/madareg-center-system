import '@/styles/skeleton.css';

export const StudentRowSkeleton = () => (
  <tr className="animate-pulse">
    {/* Avatar */}
    <td className="px-6 py-5">
      <div className="skeleton w-10 h-10 rounded-full" aria-hidden="true" />
    </td>
    {/* Name and phone */}
    <td className="px-6 py-5">
      <div className="space-y-1">
        <div className="skeleton w-24 h-4" aria-hidden="true" />
        <div className="skeleton w-20 h-3" aria-hidden="true" />
      </div>
    </td>
    {/* Group */}
    <td className="px-6 py-5">
      <div className="skeleton w-16 h-4" aria-hidden="true" />
    </td>
    {/* Attendance */}
    <td className="px-6 py-5">
      <div className="skeleton w-12 h-4" aria-hidden="true" />
    </td>
    {/* Payment */}
    <td className="px-6 py-5 text-center">
      <div className="skeleton w-12 h-4" aria-hidden="true" />
    </td>
    {/* Status */}
    <td className="px-6 py-5 text-center">
      <div className="skeleton w-20 h-4" aria-hidden="true" />
    </td>
    {/* Actions */}
    <td className="px-6 py-5 text-center">
      <div className="flex items-center justify-center gap-2">
        <div className="skeleton w-9 h-9 rounded-lg" aria-hidden="true" />
        <div className="skeleton w-9 h-9 rounded-lg" aria-hidden="true" />
      </div>
    </td>
  </tr>
);
