import type { ReactElement } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { shareLog } from '../../hooks/log/shareLogImage';
import styles from './Log.module.css';

interface ShareStatButtonProps {
  /** Delay before the button appears (in seconds) */
  delay?: number;
  /** The text to share */
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

export default function ShareStatButton({
  delay = 2.0,
  statText,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: ShareStatButtonProps): ReactElement {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
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

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isVisible || isLoading || !user?.id || !cardType) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await shareLog({
          userId: user.id,
          cardType,
          shareText: statText,
          imageCache,
          onImageFetched,
        });

        if (result === 'image_failed') {
          displayToast(
            'Image generator returned 500. Time for a manual screenshot! 📸',
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      isVisible,
      isLoading,
      user?.id,
      cardType,
      statText,
      imageCache,
      onImageFetched,
      displayToast,
    ],
  );

  // Always render container to reserve space, animate visibility
  return (
    <motion.div
      className={styles.shareStatContainer}
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
        className={styles.shareStatButton}
        onClick={handleShare}
        whileTap={isVisible && !isLoading ? { scale: 0.95 } : undefined}
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
        disabled={isLoading}
        style={isLoading ? { opacity: 0.7, cursor: 'wait' } : undefined}
      >
        <span className={styles.shareStatIcon}>
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
