import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { LeaderboardType } from '../../../graphql/leaderboard';
import { isLeaderboardPositionSupported } from '../../../graphql/leaderboard';
import { useLeaderboardPosition } from '../../../hooks/leaderboard/useLeaderboardPosition';
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

  const { position } = useLeaderboardPosition({ type, enabled });

  if (!enabled || !position) {
    return null;
  }

  const rankLabel =
    position.rank === null
      ? `${largeNumberFormat(position.cappedAt)}+`
      : `#${position.rank.toLocaleString()}`;

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
