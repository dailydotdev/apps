import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import type {
  LeaderboardPosition,
  LeaderboardType,
} from '../../../graphql/leaderboard';
import {
  isLeaderboardPositionSupported,
  LEADERBOARD_POSITION_QUERY,
} from '../../../graphql/leaderboard';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { largeNumberFormat } from '../../../lib';
import { UserHighlight } from '../../widgets/PostUsersHighlights';

interface CurrentUserPositionRowProps {
  type: LeaderboardType;
  visibleUserIds: Set<string>;
}

export function CurrentUserPositionRow({
  type,
  visibleUserIds,
}: CurrentUserPositionRowProps): ReactElement | null {
  const { user, isAuthReady } = useAuthContext();
  const enabled =
    isAuthReady &&
    !!user &&
    !visibleUserIds.has(user.id) &&
    isLeaderboardPositionSupported(type);

  const { data } = useQuery({
    queryKey: generateQueryKey(RequestKey.LeaderboardPosition, user, type),
    queryFn: async () => {
      const res = await gqlClient.request<{
        leaderboardPosition: LeaderboardPosition | null;
      }>(LEADERBOARD_POSITION_QUERY, { type });

      return res.leaderboardPosition;
    },
    enabled,
    staleTime: StaleTime.Default,
  });

  if (!enabled || !data) {
    return null;
  }

  const rankLabel =
    data.rank === null
      ? `${largeNumberFormat(data.cappedAt)}+`
      : `#${data.rank.toLocaleString()}`;

  return (
    <li className="mt-1.5 flex w-full flex-row items-center rounded-8 border-t border-border-subtlest-tertiary px-2 pt-3">
      <span className="inline-flex w-14 shrink-0 justify-center font-bold tabular-nums text-text-primary">
        {rankLabel}
      </span>
      <UserHighlight
        {...user}
        showReputation
        className={{
          wrapper: 'min-w-0 flex-shrink !p-2',
          image: '!size-8',
          textWrapper: '!ml-2',
          name: '!typo-caption1',
          reputation: '!typo-caption1',
          handle: '!typo-caption2',
        }}
        allowSubscribe={false}
      />
    </li>
  );
}
