import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonSize } from '../../../../components/buttons/Button';
import { ShareActions } from '../../../../components/share/ShareActions';
import { useLogContext } from '../../../../contexts/LogContext';
import { useHotTakeShareEnabled } from '../../../../hooks/useHotTakeShareEnabled';
import { ReferralCampaignKey } from '../../../../lib/referral';
import type { Origin } from '../../../../lib/log';
import { LogEvent } from '../../../../lib/log';

// One `ShareLog` event for every hot-take surface, with the surface carried by
// an `Origin` enum member — the same origins the neighbouring vote events in
// these components already use. No per-surface event names, no free-string
// surface vocabulary shadowing the enum.
export type HotTakeShareOrigin =
  | Origin.HotTakeList
  | Origin.HotAndCold
  | Origin.PopularHotTakes;

export interface HotTakeShareControlProps {
  link: string;
  text: string;
  /** Tooltip + accessible name of the icon trigger. */
  label: string;
  origin: HotTakeShareOrigin;
  /** Hot take id for single-take shares, owner id for section shares. */
  targetId?: string;
  buttonSize?: ButtonSize;
  className?: string;
}

// Presentation only — renders unconditionally, for surfaces that already
// checked the flag themselves (and for Storybook). Product surfaces that
// don't should use `HotTakeShareButton`.
export function HotTakeShareControl({
  link,
  text,
  label,
  origin,
  targetId,
  buttonSize,
  className,
}: HotTakeShareControlProps): ReactElement {
  const { logEvent } = useLogContext();

  return (
    <ShareActions
      link={link}
      text={text}
      cid={ReferralCampaignKey.Generic}
      emailTitle={text}
      buttonSize={buttonSize}
      className={className}
      label={label}
      onShare={(provider) =>
        logEvent({
          event_name: LogEvent.ShareLog,
          target_id: targetId,
          extra: JSON.stringify({ provider, origin }),
        })
      }
    />
  );
}

export function HotTakeShareButton(
  props: HotTakeShareControlProps,
): ReactElement | null {
  const isEnabled = useHotTakeShareEnabled();

  if (!isEnabled) {
    return null;
  }

  return <HotTakeShareControl {...props} />;
}
