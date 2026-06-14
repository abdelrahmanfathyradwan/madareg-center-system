import '@/styles/skeleton.css';
import { HiCalendarDays } from 'react-icons/hi2';

export const EmptyStateSkeleton = () => (
  <div className="card text-center py-14 flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <HiCalendarDays className="text-4xl text-slate-300" aria-hidden="true" />
    </div>
    <div className="skeleton w-48 h-6 mx-auto mb-2" aria-hidden="true" />
    <div className="skeleton w-64 h-4 mx-auto" aria-hidden="true" />
  </div>
);
