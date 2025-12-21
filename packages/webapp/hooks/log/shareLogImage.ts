export type ShareResult = 'shared' | 'downloaded' | 'cancelled' | 'error';

/**
 * Share an image blob using Web Share API if supported,
 * or fallback to downloading the image.
 *
 * @example
 * ```tsx
 * const handleShare = async () => {
 *   const blob = await fetchImage();
 *   await shareLogImage(blob, 'my-log.png', 'Check out my developer stats!');
 * };
 * ```
 */
export async function shareLogImage(
  blob: Blob,
  filename: string,
  text: string,
): Promise<ShareResult> {
  const file = new File([blob], filename, { type: 'image/png' });

  // Try Web Share API with files
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'My Developer Log 2025',
        text,
      });
      return 'shared';
    } catch (err) {
      // User cancelled or error
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Fall through to download fallback
    }
  }

  // Fallback: Download the image
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
    return 'error';
  }
}
