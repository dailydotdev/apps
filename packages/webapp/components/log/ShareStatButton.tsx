import type { ReactElement } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import cardStyles from './Cards.module.css';

interface ShareStatButtonProps {
  /** Delay before the button appears (in seconds) */
  delay?: number;
  /** The stat text to share */
  statText: string;
  /** Whether the button should be visible */
  isActive: boolean;
}

export default function ShareStatButton({
  delay = 2.0,
  statText,
  isActive,
}: ShareStatButtonProps): ReactElement {
  const [showButton, setShowButton] = useState(false);

  const shareUrl = 'https://app.daily.dev/log';

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
      if (!isVisible) {
        return;
      }

      const fullText = `${statText}\n\nDiscover your developer stats:\n→ ${shareUrl}`;

      // Try Web Share API first
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
    },
    [statText, isVisible],
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
        whileTap={isVisible ? { scale: 0.95 } : undefined}
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
      >
        <span className={cardStyles.shareStatIcon}>
          <ShareIcon secondary />
        </span>
        <span>Share this</span>
      </motion.button>
    </motion.div>
  );
}
