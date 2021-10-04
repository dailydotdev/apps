import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export interface UseFeedInfiniteScrollProps {
  fetchPage: () => Promise<unknown>;
  canFetchMore: boolean;
}

export default function useFeedInfiniteScroll({
  fetchPage,
  canFetchMore,
}: UseFeedInfiniteScrollProps): (node?: Element | null) => void {
  const { ref: infiniteScrollRef, inView } = useInView({
    rootMargin: '20px',
    threshold: 1,
  });

  useEffect(() => {
    if (inView && canFetchMore) {
      fetchPage();
    }
  }, [inView, canFetchMore]);

  return infiniteScrollRef;
}
