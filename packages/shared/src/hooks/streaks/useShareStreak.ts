import { useCallback, useState } from 'react';
import { useCopyLink } from '../useCopy';
import { useGetShortUrl } from '../utils/useGetShortUrl';
import { ShareProvider } from '../../lib/share';
import { shouldUseNativeShare } from '../../lib/func';
import type { ReferralCampaignKey } from '../../lib/referral';

export interface ShareStreakResult {
  provider: ShareProvider;
  /** Whether the streak image rode along in the native share sheet. */
  withImage: boolean;
}

export interface UseShareStreakProps {
  link: string;
  text: string;
  cid?: ReferralCampaignKey;
  /**
   * Rendered streak image (produced by the backend screenshot service from
   * `/image-generator/streak/[userId]`). Optional on purpose: the image is a
   * separable upgrade, and the link+text share must keep working whenever the
   * image is missing, still generating, or the platform can't share files.
   */
  imageUrl?: string;
  imageFileName?: string;
  onShare?: (result: ShareStreakResult) => void;
}

export interface UseShareStreak {
  isSharing: boolean;
  onShareStreak: () => Promise<void>;
}

const STREAK_IMAGE_TYPE = 'image/png';

const fetchStreakImage = async (
  url: string,
  fileName: string,
): Promise<File | null> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return new File([blob], fileName, { type: blob.type || STREAK_IMAGE_TYPE });
  } catch (err) {
    return null;
  }
};

// `canShare` is not implemented everywhere `share` is (notably older iOS and
// several in-app browsers), so treat a missing implementation as "no files".
const canShareFiles = (files: File[]): boolean => {
  const nav = globalThis?.navigator;

  return typeof nav?.canShare === 'function' && nav.canShare({ files });
};

export const useShareStreak = ({
  link,
  text,
  cid,
  imageUrl,
  imageFileName = 'daily-dev-streak.png',
  onShare,
}: UseShareStreakProps): UseShareStreak => {
  const [isSharing, setIsSharing] = useState(false);
  const [, copyLink] = useCopyLink();
  const { getShortUrl } = useGetShortUrl();

  const onShareStreak = useCallback(async () => {
    setIsSharing(true);

    try {
      const shortLink = cid ? await getShortUrl(link, cid) : link;

      if (imageUrl && shouldUseNativeShare()) {
        const file = await fetchStreakImage(imageUrl, imageFileName);

        if (file && canShareFiles([file])) {
          try {
            await navigator.share({
              text: `${text}\n${shortLink}`,
              files: [file],
            });
            onShare?.({ provider: ShareProvider.Native, withImage: true });

            return;
          } catch (err) {
            // User dismissed the sheet or the platform refused the payload —
            // fall through to the link share rather than dead-ending.
          }
        }
      }

      if (shouldUseNativeShare()) {
        try {
          await navigator.share({ text: `${text}\n${shortLink}` });
          onShare?.({ provider: ShareProvider.Native, withImage: false });
        } catch (err) {
          // Sharing was dismissed; nothing to report.
        }

        return;
      }

      await copyLink({ link: shortLink });
      onShare?.({ provider: ShareProvider.CopyLink, withImage: false });
    } finally {
      setIsSharing(false);
    }
  }, [
    cid,
    copyLink,
    getShortUrl,
    imageFileName,
    imageUrl,
    link,
    onShare,
    text,
  ]);

  return { isSharing, onShareStreak };
};
