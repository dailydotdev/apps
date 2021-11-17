import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import classed from '../../lib/classed';

export interface UseFeedInfiniteScrollProps {
  fetchPage: () => Promise<unknown>;
  canFetchMore: boolean;
}

export const InfiniteScrollScreenOffset = classed(
  'div',
  'absolute bottom-screen desktopL:bottom-screen-20 left-0 w-px h-px opacity-0 pointer-events-none',
);

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
