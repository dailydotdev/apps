import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type {
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/common';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import type { SnapshotShare } from '../../components/imageShare/SnapshotSharePanel';
import { getShareSubjectLogEvent } from '../../components/imageShare/SnapshotSharePanel';
import { useLogContext } from '../../contexts/LogContext';
import type { HotTake } from '../../graphql/user/userHotTake';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import type { SnapshotCreditProps } from './SnapshotCredit';
import { HotTakeSnapshotCard } from './HotTakeSnapshotCard';
import { getSnapshotCaptureOptions } from './snapshotCapture';
import { useArmedCard } from './useArmedCard';

/**
 * A hot take is a self-contained opinion with nowhere to link to, so the card
 * is the whole share. It is portalled to the body: the swipe card it sits on
 * is transformed while it moves, which would carry a fixed child with it.
 */
export function HotTakeSnapshotButton({
  author,
  hotTake,
  origin,
  showLabel,
  size,
  variant,
}: {
  /**
   * Credited on the card. Defaults to the take's own user; a profile's list
   * fetches its takes without one, since the profile already names them.
   */
  author?: SnapshotCreditProps;
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
  const credit = author ?? hotTake.user;
  const share = useMemo<SnapshotShare>(
    () => ({ event: LogEvent.ShareHotTake, targetId: hotTake.id }),
    [hotTake.id],
  );

  const onResult = useCallback(
    (result: SnapshotResult) =>
      logEvent(
        getShareSubjectLogEvent(share, {
          provider: ShareProvider.Snapshot,
          origin,
          result,
        }),
      ),
    [share, logEvent, origin],
  );

  return (
    <>
      <span className="contents" {...armProps}>
        <SnapshotButton
          captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
          filename={`hot-take-${hotTake.id}`}
          onResult={onResult}
          origin={origin}
          share={share}
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
            <HotTakeSnapshotCard author={credit} ref={cardRef} take={hotTake} />
          </div>,
          document.body,
        )}
    </>
  );
}
