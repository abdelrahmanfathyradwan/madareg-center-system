import '@/styles/skeleton.css';
import { CardSkeleton } from './CardSkeleton';

export const GroupsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {/* Render 6 placeholder cards */}
    {Array.from({ length: 6 }).map((_, i) => (
      <CardSkeleton key={i} height="h-48" />
    ))}
  </div>
);
