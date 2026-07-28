import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { ShareActions } from '../share/ShareActions';
import type { ButtonSize } from '../buttons/Button';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import type { ReferralCampaignKey } from '../../lib/referral';
import type { ShareProvider } from '../../lib/share';

// Which of the three Happening Now nesting levels the control belongs to. Kept
// on the log payload so the levels can be compared without three log events.
export type HighlightShareLevel = 'page' | 'topic' | 'highlight';

export interface HighlightShareButtonProps {
  link: string;
  text: string;
  label: string;
  level: HighlightShareLevel;
  targetId: string;
  cid?: ReferralCampaignKey;
  buttonSize?: ButtonSize;
  className?: string;
}

// Thin logging wrapper around the shared `ShareActions` primitive so all three
// Happening Now levels emit an identically shaped event. `LogEvent.ShareLog` is
// the generic share event: a highlight is not a full `Post` here (the feed query
// only returns id + permalink), so emitting `SharePost` would produce events
// missing every standard post property.
export const HighlightShareButton = ({
  link,
  text,
  label,
  level,
  targetId,
  cid,
  buttonSize,
  className,
}: HighlightShareButtonProps): ReactElement => {
  const { logEvent } = useLogContext();

  const onShare = useCallback(
    (provider: ShareProvider) => {
      logEvent({
        event_name: LogEvent.ShareLog,
        target_id: targetId,
        extra: JSON.stringify({
          origin: Origin.HappeningNow,
          provider,
          level,
        }),
      });
    },
    [logEvent, targetId, level],
  );

  return (
    <ShareActions
      link={link}
      text={text}
      label={label}
      cid={cid}
      buttonSize={buttonSize}
      className={className}
      onShare={onShare}
    />
  );
};
