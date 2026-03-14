import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import type { SentimentResolution, TopSentimentEntitiesData } from './graphql';
import { TOP_SENTIMENT_ENTITIES_QUERY } from './graphql';

interface TopSentimentEntitiesOptionsProps {
  groupId: string;
  resolution?: SentimentResolution;
  lookback?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 1;
const DEFAULT_RESOLUTION: SentimentResolution = 'HOUR';
const DEFAULT_LOOKBACK = '24h';

export const topSentimentEntitiesOptions = ({
  groupId,
  resolution = DEFAULT_RESOLUTION,
  lookback = DEFAULT_LOOKBACK,
  limit = DEFAULT_LIMIT,
}: TopSentimentEntitiesOptionsProps) => ({
  queryKey: generateQueryKey(
    RequestKey.TopSentimentEntities,
    undefined,
    groupId,
    resolution,
    lookback,
    String(limit),
  ),
  queryFn: async () => {
    const res = await gqlClient.request<TopSentimentEntitiesData>(
      TOP_SENTIMENT_ENTITIES_QUERY,
      {
        groupId,
        resolution,
        lookback,
        limit,
      },
    );

    return res.topSentimentEntities;
  },
  staleTime: StaleTime.OneMinute,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: false,
});
