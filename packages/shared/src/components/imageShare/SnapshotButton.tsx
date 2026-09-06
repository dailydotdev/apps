import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DownloadIcon, ShareIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from '../../lib/imageShare/captureShareImage';
import { useSnapshotCapture } from '../../features/snapshot/useSnapshotCapture';

export const SHARE_LABEL = 'Share as image';

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
  filename = 'daily-share',
  label = SHARE_LABEL,
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
  const isPending = useRef(false);

  const { status, canShareFile, canCopyImage, offScreenCard, shareImage } =
    useSnapshotCapture({
      card,
      target,
      filename,
      captureOptions,
      isActive: isPrepared,
      onCapture,
    });

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

      if (status === 'ready') {
        shareImage();
        return;
      }

      isPending.current = true;
      setIsPrepared(true);
    },
    [shareImage, status],
  );

  const canShare = canShareFile || canCopyImage;

  return (
    <>
      {offScreenCard}
      <Tooltip content={label} visible={!showLabel}>
        <Button
          type="button"
          aria-label={label}
          className={classNames('shrink-0', className)}
          icon={canShare ? <ShareIcon /> : <DownloadIcon />}
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
