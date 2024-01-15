import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import classed from '../../lib/classed';

export interface UseFeedInfiniteScrollProps {
  fetchPage: () => Promise<unknown> | void;
  canFetchMore: boolean;
}

export const InfiniteScrollScreenOffset = classed(
  'div',
  'w-px h-px opacity-0 pointer-events-none',
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, canFetchMore]);

  return infiniteScrollRef;
}
