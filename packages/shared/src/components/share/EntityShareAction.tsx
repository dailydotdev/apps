import type { ReactElement } from 'react';
import React from 'react';
import type { ShareActionsVariant } from './ShareActions';
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
  /**
   * `split` (default) is the same labelled copy control the end-of-conversation
   * band ships: the label copies, the chevron drops the share list. `icon` is
   * the original icon-only trigger.
   */
  display?: Extract<ShareActionsVariant, 'icon' | 'split'>;
}

/**
 * Share control for an entity header (tag / source), promoting share out of the
 * "…" options menu. It reads as "Copy link" with a chevron: the primary intent
 * is named and one click away, and the chevron says there is more than one way
 * to share.
 *
 * Rendered as a fragment so the host action row's own gap does the spacing. The
 * icon-only display keeps a leading vertical rule, which is what separates an
 * unlabelled ghost icon from the filled Follow/Following button; the labelled
 * control carries that separation in its own label and needs no rule.
 */
export function EntityShareAction({
  link,
  text,
  cid,
  event,
  targetId,
  origin,
  display = 'split',
}: EntityShareActionProps): ReactElement {
  const { logEvent } = useLogContext();

  const onShare = (provider: ShareProvider) =>
    logEvent({
      event_name: event,
      target_id: targetId,
      extra: JSON.stringify({ provider, origin }),
    });

  const isIcon = display === 'icon';

  return (
    <>
      {isIcon && (
        // `self-center` because host rows don't all set `items-center`.
        <Divider vertical className="self-center" />
      )}
      <ShareActions
        link={link}
        text={text}
        cid={cid}
        variant={display}
        label={isIcon ? 'Share' : 'Copy link'}
        triggerText={isIcon ? undefined : 'Copy link'}
        emailTitle={text}
        emailSummary={text}
        // Float matches the bell and the "…" button, so every secondary control
        // in the host row reads as the same button.
        buttonVariant={isIcon ? ButtonVariant.Tertiary : ButtonVariant.Float}
        buttonSize={ButtonSize.Small}
        onShare={onShare}
      />
    </>
  );
}
