import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonSize } from '../../../../components/buttons/Button';
import { ShareActions } from '../../../../components/share/ShareActions';
import { useLogContext } from '../../../../contexts/LogContext';
import { useHotTakeShareEnabled } from '../../../../hooks/useHotTakeShareEnabled';
import { ReferralCampaignKey } from '../../../../lib/referral';
import { LogEvent, Origin } from '../../../../lib/log';

// One `ShareLog` event with `Origin.HotTake` for every hot-take surface —
// `surface` in `extra` is the only per-surface distinction (no per-surface
// event names).
export type HotTakeShareSurface =
  | 'profile item'
  | 'profile header'
  | 'hot and cold modal'
  | 'popular hot takes';

export interface HotTakeShareControlProps {
  link: string;
  text: string;
  /** Tooltip + accessible name of the icon trigger. */
  label: string;
  surface: HotTakeShareSurface;
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
  surface,
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
          extra: JSON.stringify({ provider, origin: Origin.HotTake, surface }),
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
