import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { SnapshotIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from '../../lib/imageShare/captureShareImage';
import { useSnapshotCapture } from '../../features/snapshot/useSnapshotCapture';
import { playShutterSound } from '../../features/snapshot/shutterSound';

export const SNAPSHOT_LABEL = 'Snapshot';

/** Matches the snapshot-shutter-sweep animation in utilities.css. */
const SHUTTER_SWEEP_MS = 380;

export interface SnapshotButtonProps {
  /** The designed square card to rasterize. */
  card?: ReactNode;
  /** Captured instead of `card`, for surfaces with no designed card yet. */
  target?: CaptureTarget;
  filename?: string;
  label?: string;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  captureOptions?: CaptureShareImageOptions;
  onCapture?: (blob: Blob) => void;
}

export function SnapshotButton({
  card,
  target,
  filename = 'daily-snapshot',
  label = SNAPSHOT_LABEL,
  showLabel = true,
  captureOptions,
  onCapture,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
  className,
}: SnapshotButtonProps): ReactElement {
  if (!card && !target) {
    throw new Error('SnapshotButton needs either a card or a target');
  }

  // Rendering starts on intent, not on mount: a feed would otherwise carry a
  // 1080px card for every item it shows.
  const [isPrepared, setIsPrepared] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const isPending = useRef(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>();

  const { status, offScreenCard, shareImage } = useSnapshotCapture({
    card,
    target,
    filename,
    captureOptions,
    isActive: isPrepared,
    onCapture,
  });

  useEffect(
    () => () => {
      if (flashTimeout.current) {
        clearTimeout(flashTimeout.current);
      }
    },
    [],
  );

  // A press before the render finished waits for it. The clipboard needs the
  // press's own gesture, so this path can only download — hovering first is
  // what buys the copy.
  useEffect(() => {
    if (isPending.current && status === 'ready') {
      isPending.current = false;
      shareImage();
    }
  }, [shareImage, status]);

  const prepare = useCallback(() => setIsPrepared(true), []);

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      // The trigger sits inside clickable cards, rows and links.
      event.preventDefault();
      event.stopPropagation();

      playShutterSound();
      setIsFlashing(true);
      flashTimeout.current = setTimeout(
        () => setIsFlashing(false),
        SHUTTER_SWEEP_MS,
      );

      if (status === 'ready') {
        shareImage();
        return;
      }

      isPending.current = true;
      setIsPrepared(true);
    },
    [shareImage, status],
  );

  return (
    <>
      {offScreenCard}
      <Tooltip content={label} visible={!showLabel}>
        <Button
          type="button"
          aria-label={label}
          className={classNames(
            'relative shrink-0 overflow-hidden',
            // A pseudo-element rather than a child: Button reads its children to
            // decide whether it is icon-only, and an overlay node would widen it.
            isFlashing && 'snapshot-shutter-sweep',
            className,
          )}
          icon={<SnapshotIcon />}
          loading={isPending.current && status === 'loading'}
          onClick={onClick}
          onFocus={prepare}
          onPointerEnter={prepare}
          size={size}
          variant={variant}
        >
          {showLabel ? label : undefined}
        </Button>
      </Tooltip>
    </>
  );
}
