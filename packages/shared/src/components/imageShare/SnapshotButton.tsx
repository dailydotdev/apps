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
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import type { SnapshotShare } from './SnapshotSharePanel';
import { getPostSnapshotShare, SnapshotSharePanel } from './SnapshotSharePanel';

export const SNAPSHOT_LABEL = 'Snapshot';

/** Matches the snapshot-shutter-sweep animation in utilities.css. */
const SHUTTER_SWEEP_MS = 380;

/** How a press ended: pasted-ready, saved as a file, or not at all. */
export type SnapshotResult = 'clipboard' | 'download' | 'error';

export interface SnapshotButtonProps {
  target: CaptureTarget;
  filename?: string;
  label?: string;
  /**
   * The name a screen reader announces, when the label alone does not say
   * what this captures: a body with a control on every paragraph. The visible
   * label and tooltip stay the label.
   */
  ariaLabel?: string;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  /**
   * A getter rather than a value for cards whose frame grows with its copy:
   * the height can only be measured once the card is mounted.
   */
  captureOptions?: CaptureShareImageOptions | (() => CaptureShareImageOptions);
  onCapture?: (blob: Blob) => void;
  /** Called once per press with how it ended, so the host can log it. */
  onResult?: (result: SnapshotResult) => void;
  /** The post the snapshot is from, which the share panel links and sends. */
  post?: Post;
  /** What the share panel links to when the snapshot is not of a post. */
  share?: SnapshotShare;
  /** Which placement this is, for the share panel's events. */
  origin?: Origin;
  /**
   * True from a press until it is over: once its share panel closes, or as
   * soon as it ends without one. A host that would unmount the button on its
   * own, like the selection bar, stays up until then.
   */
  onActiveChange?: (isActive: boolean) => void;
}

export function SnapshotButton({
  target,
  filename = 'daily-snapshot',
  label = SNAPSHOT_LABEL,
  ariaLabel,
  showLabel = true,
  captureOptions,
  onCapture,
  onResult,
  post,
  share,
  origin,
  onActiveChange,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
  className,
}: SnapshotButtonProps): ReactElement {
  const { displayToast } = useToastNotification();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [copiedImage, setCopiedImage] = useState<Blob>();
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelShare = share ?? (post && getPostSnapshotShare(post));
  const hasPanel = !!panelShare;
  const isActive = isCapturing || !!copiedImage;

  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

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
      if (isCapturing) {
        return;
      }
      setIsFlashing(true);
      flashTimeout.current = setTimeout(
        () => setIsFlashing(false),
        SHUTTER_SWEEP_MS,
      );
      setIsCapturing(true);

      try {
        const capture = captureShareImage(
          target,
          typeof captureOptions === 'function'
            ? captureOptions()
            : captureOptions,
        );

        if (onCapture) {
          onCapture(await capture);
          return;
        }

        // Pasting beats a file in Downloads for every target we share to, so
        // the clipboard leads and the download is the fallback. The image is
        // the whole payload: a link pasted beside it lands as a second line of
        // text in the composer, which is not what a snapshot is for.
        if (await copyShareImage(capture)) {
          if (hasPanel) {
            setCopiedImage(await capture);
          } else {
            displayToast('Image copied', { variant: ToastType.Success });
          }
          onResult?.('clipboard');
          return;
        }

        downloadShareImage(await capture, filename);
        displayToast('Image saved', { variant: ToastType.Success });
        onResult?.('download');
      } catch {
        displayToast('Could not create the snapshot, please try again', {
          variant: ToastType.Error,
        });
        onResult?.('error');
      } finally {
        setIsCapturing(false);
      }
    },
    [
      captureOptions,
      displayToast,
      filename,
      hasPanel,
      isCapturing,
      onCapture,
      onResult,
      target,
    ],
  );

  return (
    <>
      <Tooltip content={label} visible={!showLabel}>
        <Button
          ref={buttonRef}
          type="button"
          aria-label={ariaLabel ?? label}
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
          icon={<SnapshotIcon />}
          onClick={onSnapshot}
        >
          {showLabel ? label : undefined}
        </Button>
      </Tooltip>
      {copiedImage && panelShare && (
        <SnapshotSharePanel
          anchorRef={buttonRef}
          filename={filename}
          image={copiedImage}
          placement={origin}
          post={post}
          share={panelShare}
          onClose={() => setCopiedImage(undefined)}
        />
      )}
    </>
  );
}
