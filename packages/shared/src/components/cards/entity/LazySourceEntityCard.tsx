import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSourceTooltip } from '../../../graphql/sources';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import SourceEntityCard from './SourceEntityCard';

interface LazySourceEntityCardProps {
  id: string;
}

/**
 * Fetches the source's details (description, followers, upvotes) on demand when
 * the hover card mounts, so the feed request stays lean. source(id) also
 * resolves membersCount, which the feed's collectionSources selection cannot.
 */
export const LazySourceEntityCard = ({
  id,
}: LazySourceEntityCardProps): ReactElement | null => {
  const { data: source } = useQuery({
    queryKey: generateQueryKey(RequestKey.Source, undefined, id, 'tooltip'),
    queryFn: () => getSourceTooltip(id),
    enabled: !!id,
    staleTime: StaleTime.Default,
  });

  if (!source) {
    return null;
  }

  return <SourceEntityCard source={source} />;
};
