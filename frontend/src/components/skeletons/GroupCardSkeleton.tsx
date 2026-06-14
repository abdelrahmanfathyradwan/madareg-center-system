import '@/styles/skeleton.css';
import { HiChevronLeft } from 'react-icons/hi2';

export const GroupCardSkeleton = () => (
  <div className="card h-full flex flex-col justify-between border-2 border-transparent hover:border-blue-200 hover:shadow-md transition-all">
    {/* Title placeholder */}
    <div className="mb-3">
      <div className="skeleton w-3/4 h-6" aria-hidden="true" />
    </div>
    {/* Info rows placeholders */}
    <div className="flex flex-col gap-2 text-sm text-slate-500">
      <div className="skeleton w-20 h-5" aria-hidden="true" /> {/* days */}
      <div className="skeleton w-24 h-5" aria-hidden="true" /> {/* time */}
      <div className="skeleton w-24 h-5" aria-hidden="true" /> {/* teacher */}
    </div>
    {/* Footer placeholder */}
    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
      <span className="skeleton w-16 h-5" aria-hidden="true" />
      <HiChevronLeft className="text-slate-300 text-2xl" aria-hidden="true" />
    </div>
  </div>
);
