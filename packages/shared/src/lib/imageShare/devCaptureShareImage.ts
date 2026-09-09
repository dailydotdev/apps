import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from './captureShareImage';
import { captureShareImage } from './captureShareImage';
import { downloadBlob } from '../blob';

export interface DevCaptureShareImageOptions extends CaptureShareImageOptions {
  download?: boolean;
  filename?: string;
}

export async function devCaptureShareImage(
  target: CaptureTarget,
  options: DevCaptureShareImageOptions = {},
): Promise<Blob> {
  const {
    download = true,
    filename = 'dailydotdev-capture',
    ...captureOptions
  } = options;
  const blob = await captureShareImage(target, captureOptions);

  if (download) {
    downloadBlob({ filename: `${filename}.png`, blob });
  }

  return blob;
}

declare global {
  interface Window {
    captureShareImage?: typeof devCaptureShareImage;
  }
}

export function installCaptureShareImage(): void {
  if (typeof window === 'undefined' || window.captureShareImage) {
    return;
  }

  window.captureShareImage = devCaptureShareImage;
}
