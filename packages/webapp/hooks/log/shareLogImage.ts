import { apiUrl } from '@dailydotdev/shared/src/lib/config';

export type ShareResult =
  | 'shared'
  | 'downloaded'
  | 'cancelled'
  | 'image_failed';

export interface ShareLogOptions {
  /** User ID for authentication */
  userId: string;
  /** Card type for image generation */
  cardType: string;
  /** Text to share with the image (mobile only) */
  shareText: string;
  /** Preloaded image cache */
  imageCache?: Map<string, Blob>;
  /** Callback when image is fetched (for caching) */
  onImageFetched?: (cardType: string, blob: Blob) => void;
}

/**
 * Download the image to the user's device.
 */
function downloadImage(blob: Blob, filename: string): ShareResult {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return 'downloaded';
  } catch {
    return 'image_failed';
  }
}

/**
 * Fetch the share image from the API.
 */
export async function fetchLogImage(
  cardType: string,
  userId: string,
): Promise<Blob | null> {
  try {
    const response = await fetch(
      `${apiUrl}/log/images?card=${encodeURIComponent(
        cardType,
      )}&userId=${encodeURIComponent(userId)}`,
      { credentials: 'include' },
    );

    if (!response.ok) {
      return null;
    }

    return response.blob();
  } catch {
    return null;
  }
}

/**
 * Share an image on Android/iOS using Web Share API.
 */
async function shareImageMobile(
  blob: Blob,
  filename: string,
  text: string,
): Promise<ShareResult> {
  const file = new File([blob], filename, { type: 'image/png' });

  if (!navigator.canShare?.({ files: [file] })) {
    // Fallback to download if share not supported
    return downloadImage(blob, filename);
  }

  try {
    await navigator.share({
      files: [file],
      text,
    });
    return 'shared';
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return 'cancelled';
    }
    // Fallback to download on other errors
    return downloadImage(blob, filename);
  }
}

/**
 * Check if we're on Android or iOS.
 */
function isMobileDevice(): boolean {
  const { userAgent } = navigator;
  return /android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent);
}

/**
 * Main share function that handles the complete flow:
 * - Android/iOS: Share image with text (no title)
 * - Desktop: Download image
 * - If image generation fails: Returns 'image_failed' so caller can show toast
 *
 * @example
 * ```tsx
 * const result = await shareLog({
 *   userId: user.id,
 *   cardType: 'total-impact',
 *   shareText: 'I read 847 posts on daily.dev in 2025!',
 *   imageCache,
 *   onImageFetched: (cardType, blob) => cache.set(cardType, blob),
 * });
 *
 * if (result === 'image_failed') {
 *   displayToast("Our image generator took a coffee break ☕ Screenshot it!");
 * }
 * ```
 */
export async function shareLog(options: ShareLogOptions): Promise<ShareResult> {
  const { userId, cardType, shareText, imageCache, onImageFetched } = options;

  // Check cache first
  let blob = imageCache?.get(cardType) ?? null;

  // Fetch if not cached
  if (!blob) {
    blob = await fetchLogImage(cardType, userId);
    if (blob && onImageFetched) {
      onImageFetched(cardType, blob);
    }
  }

  // If no image, report failure
  if (!blob) {
    return 'image_failed';
  }

  const filename = `daily-log-2025-${cardType}.png`;

  // Mobile: share with text, Desktop: download
  if (isMobileDevice()) {
    return shareImageMobile(blob, filename, shareText);
  }

  return downloadImage(blob, filename);
}
