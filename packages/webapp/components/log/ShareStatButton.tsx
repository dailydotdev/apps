import type { ReactElement } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { shareLogImage } from '../../hooks/log/shareLogImage';
import cardStyles from './Cards.module.css';

interface ShareStatButtonProps {
  /** Delay before the button appears (in seconds) */
  delay?: number;
  /** The stat text to share */
  statText: string;
  /** Whether the button should be visible */
  isActive: boolean;
  /** Card type for image generation */
  cardType?: string;
  /** Preloaded image cache from parent */
  imageCache?: Map<string, Blob>;
  /** Callback when image is preloaded on-demand */
  onImageFetched?: (cardType: string, blob: Blob) => void;
}

const shareUrl = 'https://app.daily.dev/log';

export default function ShareStatButton({
  delay = 2.0,
  statText,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: ShareStatButtonProps): ReactElement {
  const { user, tokenRefreshed } = useAuthContext();
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if button should be visible (active + delay passed)
  const isVisible = isActive && showButton;

  // Handle delayed appearance
  useEffect(() => {
    if (!isActive) {
      setShowButton(false);
      return () => {};
    }

    const timer = setTimeout(() => {
      setShowButton(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isActive, delay]);

  /**
   * Fetch the share image from the API.
   */
  const fetchShareImage = useCallback(async (): Promise<Blob | null> => {
    if (!user?.id || !cardType || !tokenRefreshed) {
      return null;
    }

    try {
      const response = await fetch(
        `${apiUrl}/log/images?card=${encodeURIComponent(
          cardType,
        )}&userId=${encodeURIComponent(user.id)}`,
        {
          credentials: 'include',
        },
      );

      if (!response.ok) {
        return null;
      }

      return response.blob();
    } catch {
      return null;
    }
  }, [user?.id, cardType, tokenRefreshed]);

  /**
   * Fall back to text-only sharing.
   */
  const shareTextOnly = useCallback(async () => {
    const fullText = `${statText}\n\nDiscover your developer stats:\n→ ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Developer Log 2025',
          text: fullText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or error - fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      // Ignore clipboard errors
    }
  }, [statText]);

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isVisible || isLoading) {
        return;
      }

      // If no cardType provided or user not authenticated, fall back to text share
      if (!cardType || !user?.id) {
        await shareTextOnly();
        return;
      }

      // Check if image is in cache
      let blob = imageCache?.get(cardType) ?? null;

      // If not cached, fetch on demand
      if (!blob) {
        setIsLoading(true);
        try {
          blob = await fetchShareImage();
          if (blob && onImageFetched) {
            onImageFetched(cardType, blob);
          }
        } finally {
          setIsLoading(false);
        }
      }

      // If we have the image, share it
      if (blob) {
        const filename = `daily-log-2025-${cardType}.png`;
        const shareText = `${statText}\n\nDiscover your developer stats:\n→ ${shareUrl}`;

        const result = await shareLogImage(blob, filename, shareText);

        // If sharing failed or was cancelled, don't fall back to text
        // The user can try again
        if (result === 'error') {
          // Fall back to text-only share
          await shareTextOnly();
        }
      } else {
        // Fall back to text-only share if image fetch failed
        await shareTextOnly();
      }
    },
    [
      statText,
      isVisible,
      isLoading,
      cardType,
      user?.id,
      imageCache,
      fetchShareImage,
      shareTextOnly,
      onImageFetched,
    ],
  );

  // Always render container to reserve space, animate visibility
  return (
    <motion.div
      className={cardStyles.shareStatContainer}
      initial={false}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
      }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <motion.button
        className={cardStyles.shareStatButton}
        onClick={handleShare}
        whileTap={isVisible && !isLoading ? { scale: 0.95 } : undefined}
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
        disabled={isLoading}
        style={isLoading ? { opacity: 0.7, cursor: 'wait' } : undefined}
      >
        <span className={cardStyles.shareStatIcon}>
          {isLoading ? (
            <Loader innerClassName="before:!border-pepper-90 after:!border-t-pepper-90 !w-4 !h-4" />
          ) : (
            <ShareIcon secondary />
          )}
        </span>
        <span>{isLoading ? 'Loading...' : 'Share this'}</span>
      </motion.button>
    </motion.div>
  );
}
