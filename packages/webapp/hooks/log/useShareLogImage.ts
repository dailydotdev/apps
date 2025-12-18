import { useCallback } from 'react';

type ShareResult = 'shared' | 'downloaded' | 'cancelled' | 'error';

interface UseShareLogImageReturn {
  /**
   * Share an image blob using Web Share API if supported,
   * or fallback to downloading the image.
   */
  shareImage: (
    blob: Blob,
    filename: string,
    text: string,
  ) => Promise<ShareResult>;
  /**
   * Check if Web Share API with file sharing is supported.
   */
  canShareFiles: () => boolean;
}

/**
 * Hook for sharing Log images via Web Share API or download fallback.
 *
 * @example
 * ```tsx
 * const { shareImage, canShareFiles } = useShareLogImage();
 *
 * const handleShare = async () => {
 *   const blob = await fetchImage();
 *   await shareImage(blob, 'my-log.png', 'Check out my developer stats!');
 * };
 * ```
 */
export function useShareLogImage(): UseShareLogImageReturn {
  /**
   * Check if the browser supports sharing files via Web Share API.
   */
  const canShareFiles = useCallback((): boolean => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      return false;
    }

    // Check if file sharing is supported
    if (!navigator.canShare) {
      return false;
    }

    // Test with a dummy file
    try {
      const testFile = new File(['test'], 'test.png', { type: 'image/png' });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  }, []);

  /**
   * Share an image blob using Web Share API if supported,
   * or fallback to downloading the image.
   */
  const shareImage = useCallback(
    async (blob: Blob, filename: string, text: string): Promise<ShareResult> => {
      const file = new File([blob], filename, { type: 'image/png' });

      // Try Web Share API with files
      if (canShareFiles()) {
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
      } catch (err) {
        console.error('Failed to download image:', err);
        return 'error';
      }
    },
    [canShareFiles],
  );

  return { shareImage, canShareFiles };
}

export default useShareLogImage;
