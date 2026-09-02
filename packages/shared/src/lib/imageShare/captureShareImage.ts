import type { RefObject } from 'react';
import type { SnapdomOptions } from '@zumer/snapdom';

export type CaptureTarget = HTMLElement | RefObject<HTMLElement>;

export interface CaptureShareImageOptions extends SnapdomOptions {
  width: number;
  height: number;
  padding?: number;
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const CAPTURE_TIMEOUT_MS = 15000;

// A cross-origin image without CORS headers leaves snapdom's inliner pending
// forever, which would otherwise spin the trigger button indefinitely.
const withTimeout = <T>(promise: Promise<T>): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error('captureShareImage: capture timed out')),
        CAPTURE_TIMEOUT_MS,
      );
    }),
  ]);

const resolveFrameBackground = (): string => {
  const rootStyle = getComputedStyle(document.documentElement);
  const rootBackground = rootStyle.backgroundColor;

  if (rootBackground && rootBackground !== TRANSPARENT) {
    return rootBackground;
  }

  const themeBackground = rootStyle
    .getPropertyValue('--theme-background-default')
    .trim();

  if (themeBackground) {
    return themeBackground;
  }

  return getComputedStyle(document.body).backgroundColor;
};

export async function captureShareImage(
  target: CaptureTarget,
  options: CaptureShareImageOptions,
): Promise<Blob> {
  const element = target instanceof HTMLElement ? target : target.current;

  if (!element) {
    throw new Error('captureShareImage: target element is not mounted');
  }

  const { width, height, padding = 48, ...snapOptions } = options;
  const contentWidth = width - padding * 2;
  const contentHeight = height - padding * 2;

  const rect = element.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    throw new Error('captureShareImage: target element has no size');
  }

  const fitScale = Math.min(
    contentWidth / rect.width,
    contentHeight / rect.height,
  );
  const captureScale = Math.max(1, fitScale);

  const { snapdom } = await import('@zumer/snapdom');
  const result = await withTimeout(
    snapdom(element, {
      embedFonts: true,
      scale: captureScale,
      ...snapOptions,
    }),
  );
  const source = await result.toCanvas();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('captureShareImage: canvas 2d context unavailable');
  }

  context.fillStyle = resolveFrameBackground();
  context.fillRect(0, 0, canvas.width, canvas.height);

  const drawScale = Math.min(
    contentWidth / source.width,
    contentHeight / source.height,
  );
  const drawWidth = source.width * drawScale;
  const drawHeight = source.height * drawScale;

  context.imageSmoothingQuality = 'high';
  context.drawImage(
    source,
    (canvas.width - drawWidth) / 2,
    padding + (contentHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('captureShareImage: failed to encode PNG'));
      }
    }, 'image/png');
  });
}
