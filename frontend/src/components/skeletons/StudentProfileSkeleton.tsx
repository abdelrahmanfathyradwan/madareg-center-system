import '@/styles/skeleton.css';
import { CardSkeleton } from './CardSkeleton';
import { BoxSkeleton } from './BoxSkeleton';

export const StudentProfileSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <BoxSkeleton className="w-24 h-24 rounded-full" />
      <div className="flex flex-col gap-2">
        <BoxSkeleton className="w-48 h-6" />
        <BoxSkeleton className="w-32 h-4" />
      </div>
    </div>
    {/* Stats cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} height="h-24" />
      ))}
    </div>
    {/* Sections */}
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} height="h-40" />
      ))}
    </div>
  </div>
);
