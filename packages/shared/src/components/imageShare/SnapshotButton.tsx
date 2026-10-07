import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { SnapshotIcon, VIcon } from '../icons';
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
import type { ShareablePost } from '../../lib/feed';
import type { Origin } from '../../lib/log';
import type { SnapshotShare, SnapshotSubject } from './SnapshotSharePanel';
import { SnapshotSharePanel } from './SnapshotSharePanel';

export const SNAPSHOT_LABEL = 'Snapshot';

const COPIED_CHECK_MS = 2000;

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
  /** The post the snapshot is from, which the share panel sends to Slack. */
  post?: ShareablePost;
  /** How the share panel logs, in place of the post's own share event. */
  share?: SnapshotShare;
  /** Which placement this is, for the share panel's events. */
  origin?: Origin;
  /** Pointer and focus inside this element leave the share panel open. */
  ignoreOutsideRef?: RefObject<HTMLElement>;
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
  ignoreOutsideRef,
  onActiveChange,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
  className,
}: SnapshotButtonProps): ReactElement {
  const { displayToast } = useToastNotification();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [copiedImage, setCopiedImage] = useState<Blob>();
  const [isJustCopied, setIsJustCopied] = useState(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>();
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const subject: SnapshotSubject | undefined = post
    ? { post, share }
    : share && { share };
  const hasPanel = !!subject;
  const isActive = isCapturing || !!copiedImage;

  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  useEffect(
    () => () => {
      if (flashTimeout.current) {
        clearTimeout(flashTimeout.current);
      }
      clearTimeout(copiedTimeout.current);
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
          setIsJustCopied(true);
          clearTimeout(copiedTimeout.current);
          copiedTimeout.current = setTimeout(
            () => setIsJustCopied(false),
            COPIED_CHECK_MS,
          );

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
          icon={
            isJustCopied ? (
              <VIcon className="text-accent-avocado-default" />
            ) : (
              <SnapshotIcon />
            )
          }
          onClick={onSnapshot}
        >
          {showLabel ? label : undefined}
        </Button>
      </Tooltip>
      {copiedImage && subject && (
        <SnapshotSharePanel
          {...subject}
          anchorRef={buttonRef}
          filename={filename}
          ignoreOutsideRef={ignoreOutsideRef}
          image={copiedImage}
          placement={origin}
          onClose={() => setCopiedImage(undefined)}
        />
      )}
    </>
  );
}
