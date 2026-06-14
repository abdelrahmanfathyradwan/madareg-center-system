import '@/styles/skeleton.css';

export const BoxSkeleton = ({ className }: { className?: string }) => (
  <div className={`skeleton ${className ?? ''}`} aria-hidden="true" />
);
