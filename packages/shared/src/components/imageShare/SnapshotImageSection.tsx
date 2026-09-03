import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DownloadIcon, ImageIcon } from '../icons';
import { SocialShareButton } from '../widgets/SocialShareButton';
import { Pill, PillSize } from '../Pill';
import { useSnapshotCapture } from '../../features/snapshot/useSnapshotCapture';
import type { CaptureShareImageOptions } from '../../lib/imageShare/captureShareImage';

export interface SnapshotImageSectionProps {
  /** The designed square card this section renders and shares. */
  card: ReactNode;
  filename?: string;
  captureOptions?: CaptureShareImageOptions;
  className?: string;
  /** Drops the description and shrinks the thumbnail, for a dropdown. */
  compact?: boolean;
  /** Card above its action rather than beside it, for a narrow column. */
  stacked?: boolean;
  onCapture?: (blob: Blob) => void;
}

/**
 * The image half of a share sheet: a thumbnail of the card beside its own
 * action. Deliberately not a mode over the sheet's other targets — a link needs
 * a destination and an image does not, so this owns the whole image path.
 */
export function SnapshotImageSection({
  card,
  filename = 'daily-share',
  captureOptions,
  className,
  compact = false,
  stacked = false,
  onCapture,
}: SnapshotImageSectionProps): ReactElement {
  const {
    status,
    preview,
    width,
    height,
    offScreenCard,
    canShareFile,
    canCopyImage,
    shareImage,
  } = useSnapshotCapture({
    card,
    filename,
    captureOptions,
    // A share sheet is already a deliberate act, so the card renders as soon
    // as the sheet does rather than waiting for another press.
    isActive: true,
    onCapture,
  });

  // Both paths are a share; only the last-resort download is a different verb.
  const canShare = canShareFile || canCopyImage;

  return (
    <section className={classNames('flex flex-col', className)}>
      {offScreenCard}
      <h4 className="font-bold typo-callout">Share as image</h4>
      <div
        className={classNames(
          'flex',
          stacked ? 'flex-col items-stretch' : 'items-center',
          compact ? 'mt-2 gap-3' : 'mt-4 gap-4',
        )}
      >
        <div
          className={classNames(
            'relative shrink-0 overflow-hidden rounded-12 bg-surface-float',
            // eslint-disable-next-line no-nested-ternary
            stacked ? 'w-full' : compact ? 'w-16' : 'w-24',
            status === 'loading' && 'animate-pulse',
          )}
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {status === 'ready' && (
            <img
              src={preview}
              alt="Preview of what will be shared"
              className="size-full object-cover"
            />
          )}
          {/* Sits on the preview, never in the capture — the card is rasterized
              from the off-screen copy, so this cannot end up in the PNG. */}
          <Pill
            alignment=""
            className="absolute left-2 top-2 bg-accent-cabbage-default text-white"
            label="New"
            size={PillSize.XSmall}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {(!compact || status === 'error') && (
            <p className="break-words text-text-tertiary typo-footnote">
              {status === 'error'
                ? 'The card could not be rendered.'
                : 'A square card of this post, ready for stories and chats.'}
            </p>
          )}
          <Button
            className={stacked ? 'w-full' : 'self-start'}
            disabled={status !== 'ready'}
            icon={canShare ? <ImageIcon /> : <DownloadIcon />}
            onClick={shareImage}
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
          >
            {canShare ? 'Share as image' : 'Download image'}
          </Button>
        </div>
      </div>
    </section>
  );
}

/** The zero-height alternative: one tile, no section, nothing to discover. */
export function SnapshotImageTile({
  card,
  filename = 'daily-share',
  captureOptions,
  onCapture,
}: SnapshotImageSectionProps): ReactElement {
  const { status, offScreenCard, canShareFile, canCopyImage, shareImage } =
    useSnapshotCapture({
      card,
      filename,
      captureOptions,
      isActive: true,
      onCapture,
    });

  return (
    <>
      {offScreenCard}
      <SocialShareButton
        disabled={status !== 'ready'}
        icon={canShareFile || canCopyImage ? <ImageIcon /> : <DownloadIcon />}
        label="Image"
        onClick={shareImage}
        variant={ButtonVariant.Primary}
      />
    </>
  );
}
