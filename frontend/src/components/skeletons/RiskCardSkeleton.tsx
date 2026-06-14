import '@/styles/skeleton.css';
import { HiExclamationTriangle, HiChevronLeft } from 'react-icons/hi2';

export const RiskCardSkeleton = () => (
  <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-r-4 border-r-amber-400 p-4 bg-white">
    <div className="space-y-2">
      <div className="skeleton w-48 h-6" aria-hidden="true" />
      <div className="skeleton w-32 h-4" aria-hidden="true" />
    </div>
    <div className="flex items-center gap-2">
      <div className="skeleton w-20 h-5" aria-hidden="true" />
      <HiChevronLeft className="text-slate-300 text-2xl" aria-hidden="true" />
    </div>
  </div>
);
