import type { ReactElement, Ref } from 'react';
import React, { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ButtonVariant } from '../../components/buttons/common';
import { ButtonSize } from '../../components/buttons/common';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { getSnapshotCaptureOptions } from './snapshotCapture';
import { useArmedCard } from './useArmedCard';

export interface ProfileSnapshotButtonProps {
  /** Which placement this is, for the snapshot's share event. */
  origin: Origin;
  filename: string;
  /** The profile's user. The profile is also the target unless one is set. */
  ownerId: string;
  targetId?: string;
  targetType?: TargetType;
  /**
   * Called only once the button is armed, so whatever the card derives from
   * the page's data is not computed on every profile view.
   */
  renderCard: (ref: Ref<HTMLDivElement>) => ReactElement;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/**
 * A part of the profile as an image. A profile snapshot is a share of the
 * profile, so it lands on `ShareProfile` with provider `snapshot`, the
 * placement as the origin, and how the press ended.
 *
 * The card is staged off-screen at its full 1080px because the capture reads
 * the live DOM, and portalled to the body so it inherits neither a widget's
 * overflow nor a hover card's transform.
 */
function ArmedProfileSnapshotButton({
  origin,
  filename,
  ownerId,
  targetId = ownerId,
  targetType = TargetType.ProfilePage,
  renderCard,
  size = ButtonSize.XSmall,
  variant,
}: ProfileSnapshotButtonProps): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isArmed, armProps } = useArmedCard();
  const { logEvent } = useLogContext();

  const onResult = useCallback(
    (result: SnapshotResult) =>
      logEvent({
        event_name: LogEvent.ShareProfile,
        target_type: targetType,
        target_id: targetId,
        extra: JSON.stringify({
          provider: ShareProvider.Snapshot,
          origin,
          result,
        }),
      }),
    [logEvent, origin, targetId, targetType],
  );

  return (
    <>
      <span className="contents" {...armProps}>
        <SnapshotButton
          captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
          filename={filename}
          onResult={onResult}
          showLabel={false}
          size={size}
          target={cardRef}
          variant={variant}
        />
      </span>
      {isArmed &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed left-[-300vw] top-0"
          >
            {renderCard(cardRef)}
          </div>,
          document.body,
        )}
    </>
  );
}

// Keyed by the owner: a client-side move to another profile reuses this
// component, and a card armed on the last profile would stay mounted with the
// next one's data.
export function ProfileSnapshotButton({
  ownerId,
  ...props
}: ProfileSnapshotButtonProps): ReactElement {
  return (
    <ArmedProfileSnapshotButton key={ownerId} ownerId={ownerId} {...props} />
  );
}
