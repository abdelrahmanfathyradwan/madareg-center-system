import '@/styles/skeleton.css';

export const StatCardSkeleton = () => (
  <div className="card p-5 text-center">
    <div className="skeleton w-16 h-6 mx-auto mb-2" aria-hidden="true" />
    <div className="skeleton w-20 h-4 mx-auto" aria-hidden="true" />
  </div>
);
