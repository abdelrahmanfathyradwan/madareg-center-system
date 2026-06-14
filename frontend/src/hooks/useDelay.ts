import { useEffect, useState } from 'react';

/**
 * Ensures a loading state persists for at least `minMs` milliseconds.
 * Returns the delayed loading flag.
 */
export const useDelay = (loading: boolean, minMs = 300): boolean => {
  const [delayed, setDelayed] = useState(loading);

  useEffect(() => {
    if (!loading) {
      // when loading finishes, remove delay immediately
      setDelayed(false);
      return;
    }
    // start timer
    const timer = setTimeout(() => setDelayed(true), minMs);
    return () => clearTimeout(timer);
  }, [loading, minMs]);

  return delayed;
};
