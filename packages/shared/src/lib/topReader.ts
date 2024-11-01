import type { TopReader } from '../components/badges/TopReaderBadge';
import { gqlClient } from '../graphql/common';
import { TOP_READER_BADGE, TOP_READER_BADGE_BY_ID } from '../graphql/users';

export const fetchTopReaders = async (limit = 5): Promise<TopReader[]> => {
  const { topReaderBadge } = await gqlClient.request<{
    topReaderBadge: TopReader[];
  }>(TOP_READER_BADGE, {
    limit,
  });

  return topReaderBadge;
};

export const fetchTopReaderById = async (
  badgeId: string,
): Promise<TopReader> => {
  const { topReaderBadgeById } = await gqlClient.request<{
    topReaderBadgeById: TopReader;
  }>(TOP_READER_BADGE_BY_ID, {
    id: badgeId,
  });

  return topReaderBadgeById;
};
