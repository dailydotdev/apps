import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ShareActions } from '../../share/ShareActions';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { TopRankBadge } from './TopRankBadge';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import type { LeaderboardType } from '../../../graphql/leaderboard';
import {
  isLeaderboardPositionSupported,
  leaderboardTypeToTitle,
} from '../../../graphql/leaderboard';
import { useLeaderboardPosition } from '../../../hooks/leaderboard/useLeaderboardPosition';
import { useLeaderboardShareEnabled } from '../../../hooks/leaderboard/useLeaderboardShareEnabled';
import { ReferralCampaignKey } from '../../../lib/referral';
import {
  getLeaderboardRankShareText,
  getLeaderboardUrl,
} from '../../../lib/leaderboardShare';
import { LogEvent, Origin } from '../../../lib/log';

interface LeaderboardRankCardProps {
  type: LeaderboardType;
  rank: number;
  className?: string;
}

// Presentation only — takes a resolved rank so Storybook can render every
// state. Product surfaces should use `LeaderboardRankShare`, which owns the
// flag gate and the "no honest rank to share" cases.
export function LeaderboardRankCard({
  type,
  rank,
  className,
}: LeaderboardRankCardProps): ReactElement {
  const { logEvent } = useLogContext();
  const board = leaderboardTypeToTitle[type].toLowerCase();
  const text = getLeaderboardRankShareText(type, rank);

  return (
    <section
      className={classNames(
        'mb-6 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4',
        className,
      )}
      aria-label="Your leaderboard rank"
    >
      <TopRankBadge rankIndex={rank - 1} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold>
          You&apos;re <span className="tabular-nums">#{rank}</span> on the{' '}
          {board} leaderboard
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="truncate"
        >
          {text}
        </Typography>
      </div>
      <ShareActions
        link={getLeaderboardUrl(type)}
        text={text}
        cid={ReferralCampaignKey.Generic}
        emailTitle={`My daily.dev ${board} rank`}
        emailSummary={text}
        buttonVariant={ButtonVariant.Primary}
        buttonSize={ButtonSize.Medium}
        className="shrink-0"
        label="Share your rank"
        onShare={(provider) =>
          logEvent({
            event_name: LogEvent.ShareLeaderboardRank,
            target_id: type,
            extra: JSON.stringify({
              provider,
              rank,
              origin: Origin.Leaderboard,
            }),
          })
        }
      />
    </section>
  );
}

interface LeaderboardRankShareProps {
  type: LeaderboardType;
  className?: string;
}

export function LeaderboardRankShare({
  type,
  className,
}: LeaderboardRankShareProps): ReactElement | null {
  const isEnabled = useLeaderboardShareEnabled();
  const { user, isAuthReady } = useAuthContext();
  const isSupported = isLeaderboardPositionSupported(type);
  const { position, isPending } = useLeaderboardPosition({
    type,
    enabled: isEnabled && isAuthReady && !!user && isSupported,
  });

  if (!isEnabled || !user || !isSupported || isPending) {
    return null;
  }

  // `rank` is null once the viewer sits past `cappedAt` — there is no honest
  // number to put in the share text, so no rank-share affordance either.
  if (!position || position.rank === null) {
    return null;
  }

  return (
    <LeaderboardRankCard
      type={type}
      rank={position.rank}
      className={className}
    />
  );
}
