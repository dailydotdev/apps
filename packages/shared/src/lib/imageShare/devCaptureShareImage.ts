import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from './captureShareImage';
import { captureShareImage } from './captureShareImage';
import { downloadShareImage } from './downloadShareImage';

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
    filename = 'daily-capture',
    ...captureOptions
  } = options;
  const blob = await captureShareImage(target, captureOptions);

  if (download) {
    downloadShareImage(blob, filename);
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
