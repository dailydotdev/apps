import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserShortInfo } from '../../../graphql/users';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import UserEntityCard from './UserEntityCard';

interface LazyUserEntityCardProps {
  id: string;
}

/**
 * Fetches the author's profile on demand (when the hover card mounts) so the
 * feed request stays lean — instead of shipping bio/reputation/… on every post.
 */
export const LazyUserEntityCard = ({
  id,
}: LazyUserEntityCardProps): ReactElement | null => {
  const { data: user } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserShortById,
      id ? { id } : undefined,
    ),
    queryFn: () => getUserShortInfo(id),
    enabled: !!id,
    staleTime: StaleTime.Default,
  });

  if (!user) {
    return null;
  }

  return <UserEntityCard user={user} />;
};
