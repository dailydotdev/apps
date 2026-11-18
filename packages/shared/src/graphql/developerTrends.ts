import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { RequestKey, StaleTime } from '../lib/query';

export const DEVELOPER_TRENDS_QUERY = gql`
  query DeveloperTrends {
    developerTrends {
      weekStart
      weekEnd
      risingTopics {
        tag
        multiple
        broad
      }
      formats {
        format
        comments
      }
    }
  }
`;

export interface DeveloperTrends {
  weekStart: string;
  /** Exclusive: the Monday after the week */
  weekEnd: string;
  risingTopics: { tag: string; multiple: number; broad: boolean }[];
  formats: { format: string; comments: number }[];
}

export const developerTrendsQueryOptions = () => ({
  queryKey: [RequestKey.DeveloperTrends],
  queryFn: async (): Promise<DeveloperTrends | null> => {
    const res = await gqlClient.request<{
      developerTrends: DeveloperTrends | null;
    }>(DEVELOPER_TRENDS_QUERY);

    return res.developerTrends;
  },
  staleTime: StaleTime.Default,
});
