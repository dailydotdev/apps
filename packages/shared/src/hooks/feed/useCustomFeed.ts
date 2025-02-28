import { useActiveFeedContext } from '../../contexts';

interface UseCustomFeed {
  feedId?: string;
  isCustomFeed: boolean;
}

export const useCustomFeed = (): UseCustomFeed => {
  const feedContextData = useActiveFeedContext();
  const { queryKey: feedQueryKey } = feedContextData;
  const isCustomFeed = feedQueryKey?.[0] === 'custom';
  const customFeedId = isCustomFeed ? (feedQueryKey?.[2] as string) : undefined;

  return {
    feedId: isCustomFeed ? customFeedId : undefined,
    isCustomFeed,
  };
};
