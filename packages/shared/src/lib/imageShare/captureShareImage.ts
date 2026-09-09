import type { RefObject } from 'react';
import type { SnapdomOptions } from '@zumer/snapdom';
import {
  markAlphas,
  MARK_HEIGHT,
  markPaths,
  MARK_WIDTH,
  wordmarkAlphas,
  wordmarkFillRules,
  wordmarkPaths,
  WORDMARK_HEIGHT,
  WORDMARK_WIDTH,
} from '../../svg/logoGeometry';

export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

const LOGO_BAR_HEIGHT = 72;
const LOGO_BAR_BORDER = 2;
const LOGO_HEIGHT = 26;
const LOGO_GAP = 8;
const CAPTURE_TIMEOUT_MS = 15000;

export type CaptureTarget = HTMLElement | RefObject<HTMLElement>;

export interface CaptureShareImageOptions
  extends Omit<SnapdomOptions, 'scale' | 'width' | 'height'> {
  width?: number;
  height?: number;
  padding?: number;
  frameBackgroundColor?: string;
  branded?: boolean;
}

interface ShareImageTheme {
  background: string;
  border: string;
  logo: string;
}

const PROBE_STYLE = [
  'position:fixed',
  'top:0',
  'left:0',
  'width:0',
  'height:0',
  'visibility:hidden',
  'pointer-events:none',
  'background-color:var(--theme-background-default)',
  'border-top:1px solid var(--theme-border-subtlest-tertiary)',
  'color:var(--theme-text-primary)',
].join(';');

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

const resolveTheme = (element: HTMLElement): ShareImageTheme => {
  const probe = element.ownerDocument.createElement('div');
  probe.style.cssText = PROBE_STYLE;
  element.appendChild(probe);

  const style = getComputedStyle(probe);
  const theme = {
    background: style.backgroundColor,
    border: style.borderTopColor,
    logo: style.color,
  };

  probe.remove();

  return theme;
};

const fillPaths = (
  context: CanvasRenderingContext2D,
  paths: string[],
  alphas: number[],
  rules?: readonly CanvasFillRule[],
): void => {
  paths.forEach((path, index) => {
    context.globalAlpha = alphas[index] ?? 1;
    context.fill(new Path2D(path), rules?.[index] ?? 'nonzero');
  });

  context.globalAlpha = 1;
};

const drawLogoBar = (
  context: CanvasRenderingContext2D,
  theme: ShareImageTheme,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const barTop = canvasHeight - LOGO_BAR_HEIGHT;

  context.fillStyle = theme.background;
  context.fillRect(0, barTop, canvasWidth, LOGO_BAR_HEIGHT);

  context.fillStyle = theme.border;
  context.fillRect(0, barTop, canvasWidth, LOGO_BAR_BORDER);

  const markScale = LOGO_HEIGHT / MARK_HEIGHT;
  const wordmarkScale = LOGO_HEIGHT / WORDMARK_HEIGHT;
  const markWidth = MARK_WIDTH * markScale;
  const wordmarkWidth = WORDMARK_WIDTH * wordmarkScale;
  const left = (canvasWidth - (markWidth + LOGO_GAP + wordmarkWidth)) / 2;
  const top = barTop + (LOGO_BAR_HEIGHT - LOGO_HEIGHT) / 2;

  context.fillStyle = theme.logo;

  context.save();
  context.translate(left, top);
  context.scale(markScale, markScale);
  fillPaths(context, markPaths, markAlphas);
  context.restore();

  context.save();
  context.translate(left + markWidth + LOGO_GAP, top);
  context.scale(wordmarkScale, wordmarkScale);
  fillPaths(context, wordmarkPaths, wordmarkAlphas, wordmarkFillRules);
  context.restore();
};

export async function captureShareImage(
  target: CaptureTarget,
  options: CaptureShareImageOptions = {},
): Promise<Blob> {
  const element = 'current' in target ? target.current : target;

  if (!element) {
    throw new Error('captureShareImage: target element is not mounted');
  }

  const {
    width = SHARE_IMAGE_WIDTH,
    height = SHARE_IMAGE_HEIGHT,
    padding = 48,
    frameBackgroundColor,
    branded = true,
    ...snapOptions
  } = options;
  const barHeight = branded ? LOGO_BAR_HEIGHT : 0;
  const contentWidth = width - padding * 2;
  const contentHeight = height - padding * 2 - barHeight;

  const rect = element.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    throw new Error('captureShareImage: target element has no size');
  }

  const theme = resolveTheme(element);

  const fitScale = Math.min(
    contentWidth / rect.width,
    contentHeight / rect.height,
  );
  const captureScale = Math.max(1, fitScale);

  const { snapdom } = await import('@zumer/snapdom');
  const result = await withTimeout(
    snapdom(element, {
      embedFonts: true,
      ...snapOptions,
      scale: captureScale,
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

  context.fillStyle = frameBackgroundColor ?? theme.background;
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

  if (branded) {
    drawLogoBar(context, theme, width, height);
  }

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
