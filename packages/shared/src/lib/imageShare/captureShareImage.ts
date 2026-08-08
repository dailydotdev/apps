import type { RefObject } from 'react';
import { createElement } from 'react';
import type { SnapdomOptions } from '@zumer/snapdom';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';

export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

const LOGO_BAR_HEIGHT = 72;
const LOGO_BAR_BORDER = 2;
const LOGO_HEIGHT = 26;
const LOGO_GAP = 8;
const LOGO_ICON_RATIO = 35 / 20;
const LOGO_TEXT_RATIO = 77 / 20;

export type CaptureTarget = HTMLElement | RefObject<HTMLElement>;

export interface CaptureShareImageOptions extends SnapdomOptions {
  padding?: number;
  frameBackgroundColor?: string;
  branded?: boolean;
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

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

const svgToImage = async (markup: string): Promise<HTMLImageElement> => {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await image.decode();

  return image;
};

const drawLogoBar = async (
  context: CanvasRenderingContext2D,
): Promise<void> => {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const rootStyle = getComputedStyle(document.documentElement);
  const themeColor = rootStyle.getPropertyValue('--theme-text-primary').trim();
  const color = themeColor || getComputedStyle(document.body).color;
  const barBackground = rootStyle
    .getPropertyValue('--theme-background-default')
    .trim();
  const barBorder = rootStyle
    .getPropertyValue('--theme-border-subtlest-tertiary')
    .trim();

  const barTop = SHARE_IMAGE_HEIGHT - LOGO_BAR_HEIGHT;

  if (barBackground) {
    context.fillStyle = barBackground;
    context.fillRect(0, barTop, SHARE_IMAGE_WIDTH, LOGO_BAR_HEIGHT);
  }

  if (barBorder) {
    context.fillStyle = barBorder;
    context.fillRect(0, barTop, SHARE_IMAGE_WIDTH, LOGO_BAR_BORDER);
  }

  const toSizedMarkup = (markup: string, width: number): string =>
    markup
      .replace('<svg ', `<svg width="${width}" height="${LOGO_HEIGHT}" `)
      .replace(/var\(--theme-text-primary\)/g, color);

  const iconWidth = LOGO_HEIGHT * LOGO_ICON_RATIO;
  const textWidth = LOGO_HEIGHT * LOGO_TEXT_RATIO;
  const [icon, text] = await Promise.all([
    svgToImage(
      toSizedMarkup(renderToStaticMarkup(createElement(LogoIcon)), iconWidth),
    ),
    svgToImage(
      toSizedMarkup(renderToStaticMarkup(createElement(LogoText)), textWidth),
    ),
  ]);

  const totalWidth = iconWidth + LOGO_GAP + textWidth;
  const x = (SHARE_IMAGE_WIDTH - totalWidth) / 2;
  const y = barTop + (LOGO_BAR_HEIGHT - LOGO_HEIGHT) / 2;

  context.drawImage(icon, x, y, iconWidth, LOGO_HEIGHT);
  context.drawImage(text, x + iconWidth + LOGO_GAP, y, textWidth, LOGO_HEIGHT);
};

export async function captureShareImage(
  target: CaptureTarget,
  options: CaptureShareImageOptions = {},
): Promise<Blob> {
  const element = target instanceof HTMLElement ? target : target.current;

  if (!element) {
    throw new Error('captureShareImage: target element is not mounted');
  }

  const {
    padding = 48,
    frameBackgroundColor,
    branded = true,
    ...snapOptions
  } = options;
  const barHeight = branded ? LOGO_BAR_HEIGHT : 0;
  const contentWidth = SHARE_IMAGE_WIDTH - padding * 2;
  const contentHeight = SHARE_IMAGE_HEIGHT - padding * 2 - barHeight;

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
  const result = await snapdom(element, {
    embedFonts: true,
    scale: captureScale,
    ...snapOptions,
  });
  const source = await result.toCanvas();

  const canvas = document.createElement('canvas');
  canvas.width = SHARE_IMAGE_WIDTH;
  canvas.height = SHARE_IMAGE_HEIGHT;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('captureShareImage: canvas 2d context unavailable');
  }

  context.fillStyle = frameBackgroundColor ?? resolveFrameBackground();
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
    await drawLogoBar(context);
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
