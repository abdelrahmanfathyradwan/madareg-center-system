import '@/styles/skeleton.css';

export const CardSkeleton = ({ height = 'h-48' }: { height?: string }) => (
  <div className={`card h-full flex flex-col justify-between border-2 border-transparent ${height} flex items-center p-4 bg-white`}> 
    <div className="skeleton w-full h-full" aria-hidden="true" />
  </div>
);
