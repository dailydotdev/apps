import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import classed from '../../lib/classed';

export interface UseFeedInfiniteScrollProps {
  fetchPage: () => Promise<unknown> | void;
  canFetchMore: boolean;
  /**
   * The scrolling element when the list scrolls inside one instead of the
   * page. Against the viewport the sentinel only shows once the element is
   * scrolled to its very end, so the next page never loads ahead.
   */
  root?: Element | null;
  rootMargin?: string;
}

export const InfiniteScrollScreenOffset = classed(
  'div',
  'w-px h-px opacity-0 pointer-events-none',
);

export default function useFeedInfiniteScroll({
  fetchPage,
  canFetchMore,
  root,
  rootMargin = '20px',
}: UseFeedInfiniteScrollProps): (node?: Element | null) => void {
  const { ref: infiniteScrollRef, inView } = useInView({
    root,
    rootMargin,
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
