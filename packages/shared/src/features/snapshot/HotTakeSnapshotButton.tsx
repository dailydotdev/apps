import type { ReactElement } from 'react';
import React, { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type {
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/common';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import { useLogContext } from '../../contexts/LogContext';
import type { HotTake } from '../../graphql/user/userHotTake';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { HotTakeSnapshotCard } from './HotTakeSnapshotCard';
import { getSnapshotCaptureOptions } from './snapshotCapture';
import { useArmedCard } from './useArmedCard';

/**
 * A hot take is a self-contained opinion with nowhere to link to, so the card
 * is the whole share. It is portalled to the body: the swipe card it sits on
 * is transformed while it moves, which would carry a fixed child with it.
 */
export function HotTakeSnapshotButton({
  hotTake,
  origin,
  showLabel,
  size,
  variant,
}: {
  hotTake: HotTake;
  /** Which placement this is, for the snapshot's share event. */
  origin: Origin;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isArmed, armProps } = useArmedCard();
  const { logEvent } = useLogContext();

  const onResult = useCallback(
    (result: SnapshotResult) =>
      logEvent({
        event_name: LogEvent.ShareHotTake,
        target_id: hotTake.id,
        extra: JSON.stringify({
          provider: ShareProvider.Snapshot,
          origin,
          result,
        }),
      }),
    [hotTake.id, logEvent, origin],
  );

  return (
    <>
      <span className="contents" {...armProps}>
        <SnapshotButton
          captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
          filename={`hot-take-${hotTake.id}`}
          onResult={onResult}
          showLabel={showLabel}
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
            <HotTakeSnapshotCard ref={cardRef} take={hotTake} />
          </div>,
          document.body,
        )}
    </>
  );
}
