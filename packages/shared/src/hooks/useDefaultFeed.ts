import { useMemo } from 'react';
import usePersistentState from './usePersistentState';

export default function useDefaultFeed(): {
  defaultFeed: string;
  setDefaultFeed: (feedName: string) => Promise<void>;
} {
  const [defaultFeed, setDefaultFeed] = usePersistentState(
    'defaultFeed',
    null,
    'popular',
  );

  return useMemo(() => {
    return {
      defaultFeed,
      setDefaultFeed,
    };
  }, [defaultFeed]);
}
