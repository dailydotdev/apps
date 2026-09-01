import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { SnapshotIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import {
  ToastType,
  useToastNotification,
} from '../../hooks/useToastNotification';
import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from '../../lib/imageShare/captureShareImage';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { playShutterSound } from '../../features/snapshot/shutterSound';

export const SNAPSHOT_LABEL = 'Snapshot';

/** Matches the snapshot-shutter-sweep animation in utilities.css. */
const SHUTTER_SWEEP_MS = 380;

export interface SnapshotButtonProps {
  target: CaptureTarget;
  /**
   * Copied as text beside the image, so a paste carries both halves. A getter
   * rather than a string: the tracked short link is fetched when pressed, the
   * way every other copy on the page fetches it.
   */
  link?: string | (() => Promise<string> | string);
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
  target,
  link,
  filename = 'daily-snapshot',
  label = SNAPSHOT_LABEL,
  showLabel = true,
  captureOptions,
  onCapture,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
  className,
}: SnapshotButtonProps): ReactElement {
  const { displayToast } = useToastNotification();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      if (flashTimeout.current) {
        clearTimeout(flashTimeout.current);
      }
    },
    [],
  );

  const onSnapshot = useCallback(
    async (event: React.MouseEvent) => {
      // Every placement sits inside a clickable card, row or link.
      event.preventDefault();
      event.stopPropagation();
      playShutterSound();
      setIsFlashing(true);
      flashTimeout.current = setTimeout(
        () => setIsFlashing(false),
        SHUTTER_SWEEP_MS,
      );
      setIsCapturing(true);

      try {
        const capture = captureShareImage(target, captureOptions);

        if (onCapture) {
          onCapture(await capture);
          return;
        }

        // Pasting beats a file in Downloads for every target we share to, so
        // the clipboard leads and the download is the fallback.
        // Called, not awaited: the capture and the link resolve in parallel
        // and the clipboard write stays inside the gesture.
        const resolvedLink = typeof link === 'function' ? link() : link;

        if (await copyShareImage(capture, resolvedLink)) {
          displayToast(link ? 'Image and link copied' : 'Image copied', {
            variant: ToastType.Success,
          });
          return;
        }

        downloadShareImage(await capture, filename);
        displayToast('Image saved', { variant: ToastType.Success });
      } catch {
        displayToast('Could not create the snapshot, please try again', {
          variant: ToastType.Error,
        });
      } finally {
        setIsCapturing(false);
      }
    },
    [captureOptions, displayToast, filename, link, onCapture, target],
  );

  return (
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
        size={size}
        variant={variant}
        loading={isCapturing}
        disabled={isCapturing}
        icon={<SnapshotIcon />}
        onClick={onSnapshot}
      >
        {showLabel ? label : undefined}
      </Button>
    </Tooltip>
  );
}
