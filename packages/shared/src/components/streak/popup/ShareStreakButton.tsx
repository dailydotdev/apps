import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ShareIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { useShareStreak } from '../../../hooks/streaks/useShareStreak';
import type { ShareStreakResult } from '../../../hooks/streaks/useShareStreak';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { ReferralCampaignKey } from '../../../lib/referral';

// Kept short on purpose: on mobile this label sits next to "Settings" in the
// same row, and anything longer overflows a 375px drawer.
const LABEL = 'Share streak';

// A streak is a status moment, so the copy carries the number and sounds like
// the developer who earned it — the link is the footnote, not the headline.
export const getStreakShareText = (current: number): string => {
  if (current >= 100) {
    return `${current} days without breaking my reading streak on daily.dev. Not stopping now.`;
  }

  if (current >= 30) {
    return `${current} days straight of reading dev news on daily.dev. The habit stuck.`;
  }

  return `${current}-day reading streak on daily.dev and counting.`;
};

interface ShareStreakButtonProps {
  currentStreak: number;
  link: string;
  /**
   * Generated streak image. Left undefined until the backend screenshot
   * service renders `/image-generator/streak/[userId]` and exposes the URL —
   * the share degrades to link + text without it.
   */
  imageUrl?: string;
  showLabel?: boolean;
  className?: string;
}

export function ShareStreakButton({
  currentStreak,
  link,
  imageUrl,
  showLabel,
  className,
}: ShareStreakButtonProps): ReactElement {
  const { logEvent } = useLogContext();

  const onShare = useCallback(
    ({ provider, withImage }: ShareStreakResult) => {
      // Same target shape as the milestone share events so analytics can
      // union streak shares regardless of the surface they came from.
      logEvent({
        event_name: LogEvent.ShareLog,
        target_type: TargetType.StreaksMilestone,
        target_id: String(currentStreak),
        extra: JSON.stringify({
          origin: Origin.ReadingStreak,
          provider,
          with_image: withImage,
        }),
      });
    },
    [currentStreak, logEvent],
  );

  const { isSharing, onShareStreak } = useShareStreak({
    link,
    text: getStreakShareText(currentStreak),
    cid: ReferralCampaignKey.ShareProfile,
    imageUrl,
    onShare,
  });

  return (
    <Tooltip content={LABEL}>
      <Button
        type="button"
        variant={ButtonVariant.Float}
        icon={<ShareIcon secondary={isSharing} />}
        aria-label={LABEL}
        className={className}
        onClick={onShareStreak}
      >
        {showLabel ? LABEL : null}
      </Button>
    </Tooltip>
  );
}
