import { useInView } from 'react-intersection-observer';
import { useContext, useEffect } from 'react';
import OnboardingContext, {
  EngagementAction,
} from '../../contexts/OnboardingContext';

export interface UseFeedInfiniteScrollProps {
  fetchPage: () => Promise<unknown>;
  canFetchMore: boolean;
  enableTrackEngagement?: boolean;
}

export default function useFeedInfiniteScroll({
  fetchPage,
  canFetchMore,
  enableTrackEngagement = true,
}: UseFeedInfiniteScrollProps): (node?: Element | null) => void {
  const { trackEngagement } = useContext(OnboardingContext);
  const { ref: infiniteScrollRef, inView } = useInView({
    rootMargin: '20px',
    threshold: 1,
  });

  useEffect(() => {
    if (inView && canFetchMore) {
      fetchPage().then(async () => {
        if (enableTrackEngagement) {
          await trackEngagement(EngagementAction.Scroll);
        }
      });
    }
  }, [inView, canFetchMore]);

  return infiniteScrollRef;
}
