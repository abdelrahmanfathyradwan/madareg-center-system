import '@/styles/skeleton.css';
import { CardSkeleton } from './CardSkeleton';

export const DashboardSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {/* 3‑4 cards */}
    <CardSkeleton height="h-40" />
    <CardSkeleton height="h-40" />
    <CardSkeleton height="h-40" />
    {/* Chart area */}
    <div className="col-span-full">
      <div className="skeleton w-full h-64 rounded-lg" aria-hidden="true" />
    </div>
  </div>
);
 