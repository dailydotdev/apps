import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from '../../lib/imageShare/captureShareImage';
import {
  captureShareImage,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
} from '../../lib/imageShare/captureShareImage';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';
import { useToastNotification } from '../../hooks/useToastNotification';
import { SNAPSHOT_SIZE } from './snapshotGradient';

export type SnapshotStatus = 'loading' | 'ready' | 'error';

/** A designed card is already square and carries its own logo. */
const CARD_CAPTURE_OPTIONS: CaptureShareImageOptions = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

// Writing an image needs both the async clipboard and ClipboardItem; Firefox
// has the former without the latter.
const supportsImageCopy = (): boolean =>
  typeof ClipboardItem !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  typeof navigator.clipboard?.write === 'function';

// Probing needs a File instance, so capability is resolved on the client only.
const supportsFileShare = (): boolean => {
  if (typeof navigator === 'undefined' || !navigator.canShare) {
    return false;
  }

  try {
    return navigator.canShare({
      files: [new File([], 'probe.png', { type: 'image/png' })],
    });
  } catch {
    return false;
  }
};

export interface UseSnapshotCaptureProps {
  /** The designed square card to rasterize, mounted off-screen while active. */
  card?: ReactNode;
  /** Captured instead of `card`, for surfaces with no designed card yet. */
  target?: CaptureTarget;
  filename: string;
  captureOptions?: CaptureShareImageOptions;
  /**
   * Gates both the off-screen mount and the capture, so a feed never carries
   * one 1080px card per item until someone actually asks to share.
   */
  isActive: boolean;
  onCapture?: (blob: Blob) => void;
}

export interface UseSnapshotCaptureResult {
  status: SnapshotStatus;
  /** Object URL of the render, once `status` is 'ready'. */
  preview?: string;
  /** Intrinsic dimensions, for holding the preview's aspect ratio. */
  width: number;
  height: number;
  /** Render this somewhere in the tree; it positions itself off-screen. */
  offScreenCard: ReactNode;
  /** True where the platform can hand a PNG to a native share sheet. */
  canShareFile: boolean;
  /** True where the PNG can go straight to the clipboard. */
  canCopyImage: boolean;
  /**
   * Native share sheet where available, clipboard next, download as the last
   * resort. Toasts on the clipboard path, which has no UI of its own.
   */
  shareImage: () => Promise<void>;
}

/**
 * Rasterizes a designed card off-screen and hands back the preview plus the
 * share action. Shared by the dropdown and the modal section so both render
 * from one implementation.
 */
export function useSnapshotCapture({
  card,
  target,
  filename,
  captureOptions,
  isActive,
  onCapture,
}: UseSnapshotCaptureProps): UseSnapshotCaptureResult {
  const [status, setStatus] = useState<SnapshotStatus>('loading');
  const [preview, setPreview] = useState<string>();
  const [canShareFile, setCanShareFile] = useState(false);
  const [canCopyImage, setCanCopyImage] = useState(false);
  const { displayToast } = useToastNotification();
  const blob = useRef<Blob>();
  const previewUrl = useRef<string>();
  const cardRef = useRef<HTMLDivElement>(null);
  const captured = useRef(false);

  const hasCard = !!card;
  const subject = hasCard ? cardRef : target;
  const options =
    captureOptions ?? (hasCard ? CARD_CAPTURE_OPTIONS : undefined);

  const releasePreview = useCallback(() => {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = undefined;
    }
  }, []);

  useEffect(() => {
    setCanShareFile(supportsFileShare());
    setCanCopyImage(supportsImageCopy());
  }, []);

  useEffect(() => releasePreview, [releasePreview]);

  const renderPreview = useCallback(async () => {
    if (!subject) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const result = await captureShareImage(subject, options);

      blob.current = result;
      releasePreview();
      previewUrl.current = URL.createObjectURL(result);
      setPreview(previewUrl.current);
      setStatus('ready');
      onCapture?.(result);
    } catch {
      setStatus('error');
    }
  }, [onCapture, options, releasePreview, subject]);

  // Rasterizing is a long synchronous task, so yield once and let the caller
  // paint its skeleton before it starts — otherwise the press feels dropped.
  // The ref pins it to one capture per activation: callers pass inline card
  // elements, so renderPreview's identity changes on every render.
  useEffect(() => {
    if (!isActive) {
      captured.current = false;
      return undefined;
    }

    if (captured.current) {
      return undefined;
    }

    captured.current = true;
    const timeout = setTimeout(renderPreview);

    return () => clearTimeout(timeout);
  }, [isActive, renderPreview]);

  const shareImage = useCallback(async () => {
    if (!blob.current) {
      return;
    }

    if (canShareFile) {
      const file = new File([blob.current], `${filename}.png`, {
        type: 'image/png',
      });

      try {
        await navigator.share({ files: [file] });
      } catch {
        // The user dismissed the native sheet.
      }
      return;
    }

    if (canCopyImage) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob.current }),
        ]);
        displayToast('✅ Image copied, paste it anywhere');
        return;
      } catch {
        // Permission denied or the gesture expired — fall through to a file.
      }
    }

    downloadShareImage(blob.current, filename);
  }, [canCopyImage, canShareFile, displayToast, filename]);

  const { width = SHARE_IMAGE_WIDTH, height = SHARE_IMAGE_HEIGHT } =
    options ?? {};

  const offScreenCard = isActive && hasCard && (
    <div
      aria-hidden
      className="pointer-events-none fixed left-[-200vw] top-0"
      ref={cardRef}
    >
      {card}
    </div>
  );

  return {
    status,
    preview,
    width,
    height,
    offScreenCard,
    canShareFile,
    canCopyImage,
    shareImage,
  };
}
