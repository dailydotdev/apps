import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonSize } from '../../buttons/Button';
import { ShareActions } from '../../share/ShareActions';
import { useLogContext } from '../../../contexts/LogContext';
import type { LeaderboardType } from '../../../graphql/leaderboard';
import { leaderboardTypeToTitle } from '../../../graphql/leaderboard';
import { useLeaderboardShareEnabled } from '../../../hooks/leaderboard/useLeaderboardShareEnabled';
import { ReferralCampaignKey } from '../../../lib/referral';
import {
  getLeaderboardShareText,
  getLeaderboardUrl,
} from '../../../lib/leaderboardShare';
import { LogEvent, Origin } from '../../../lib/log';

interface LeaderboardShareControlProps {
  type: LeaderboardType;
  buttonSize?: ButtonSize;
  className?: string;
}

// Presentation only — renders unconditionally so Storybook can show it without
// a GrowthBook instance. Product surfaces should use `LeaderboardShareButton`.
export function LeaderboardShareControl({
  type,
  buttonSize,
  className,
}: LeaderboardShareControlProps): ReactElement {
  const { logEvent } = useLogContext();
  const title = leaderboardTypeToTitle[type];
  const text = getLeaderboardShareText(type);

  return (
    <ShareActions
      link={getLeaderboardUrl(type)}
      text={text}
      cid={ReferralCampaignKey.Generic}
      emailTitle={title}
      emailSummary={text}
      buttonSize={buttonSize}
      className={className}
      label={`Share the ${title.toLowerCase()} leaderboard`}
      onShare={(provider) =>
        logEvent({
          event_name: LogEvent.ShareLeaderboard,
          target_id: type,
          extra: JSON.stringify({ provider, origin: Origin.Leaderboard }),
        })
      }
    />
  );
}

export function LeaderboardShareButton(
  props: LeaderboardShareControlProps,
): ReactElement | null {
  const isEnabled = useLeaderboardShareEnabled();

  if (!isEnabled) {
    return null;
  }

  return <LeaderboardShareControl {...props} />;
}
