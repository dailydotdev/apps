import type { ReactElement } from 'react';
import React from 'react';
import { ShareActions } from './ShareActions';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { Divider } from '../utilities/Divider';
import { useLogContext } from '../../contexts/LogContext';
import type { LogEvent, Origin } from '../../lib/log';
import type { ReferralCampaignKey } from '../../lib/referral';
import type { ShareProvider } from '../../lib/share';

export interface EntityShareActionProps {
  link: string;
  text: string;
  cid: ReferralCampaignKey;
  /** Entity-specific share event, e.g. `LogEvent.ShareTag`. */
  event: LogEvent;
  targetId: string;
  origin: Origin;
}

/**
 * Share control for an entity header (tag / source), promoting share out of the
 * "…" options menu. The leading vertical rule plus the ghost icon button keep
 * "share this" spatially and visually separate from the filled Follow/Following
 * button — different intents must not read as one segmented control.
 *
 * Rendered as a fragment so the host action row's own gap spaces the rule
 * symmetrically against the buttons on either side of it.
 */
export function EntityShareAction({
  link,
  text,
  cid,
  event,
  targetId,
  origin,
}: EntityShareActionProps): ReactElement {
  const { logEvent } = useLogContext();

  const onShare = (provider: ShareProvider) =>
    logEvent({
      event_name: event,
      target_id: targetId,
      extra: JSON.stringify({ provider, origin }),
    });

  return (
    <>
      {/* `self-center` because host rows don't all set `items-center`. */}
      <Divider vertical className="self-center" />
      <ShareActions
        link={link}
        text={text}
        cid={cid}
        label="Share"
        emailTitle={text}
        emailSummary={text}
        buttonVariant={ButtonVariant.Tertiary}
        buttonSize={ButtonSize.Small}
        onShare={onShare}
      />
    </>
  );
}
