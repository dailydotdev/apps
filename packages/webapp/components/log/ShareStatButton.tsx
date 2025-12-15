import type { ReactElement } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = 'https://app.daily.dev/log';

  // Determine if button should be visible (active + delay passed)
  const isVisible = isActive && showButton;

  // Handle delayed appearance
  useEffect(() => {
    if (!isActive) {
      setShowButton(false);
      setShowOptions(false);
      return () => {};
    }

    const timer = setTimeout(() => {
      setShowButton(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isActive, delay]);

  const handleShare = useCallback(
    async (platform: 'twitter' | 'linkedin' | 'copy') => {
      const fullText = `${statText}\n\nDiscover your developer stats:\n→ ${shareUrl}`;

      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              fullText,
            )}`,
            '_blank',
          );
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareUrl,
            )}`,
            '_blank',
          );
          break;
        case 'copy':
          try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Fallback - ignore
          }
          break;
        default:
          break;
      }
      setShowOptions(false);
    },
    [statText],
  );

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isVisible) {
        return;
      } // Ignore clicks when hidden
      setShowOptions(!showOptions);
    },
    [showOptions, isVisible],
  );

  const handleOptionClick = useCallback(
    (e: React.MouseEvent, platform: 'twitter' | 'linkedin' | 'copy') => {
      e.stopPropagation();
      handleShare(platform);
    },
    [handleShare],
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
      {/* Share options - appears above button */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            className={cardStyles.shareStatOptions}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
          >
            <motion.button
              className={`${cardStyles.shareStatOption} ${cardStyles.shareStatOptionTwitter}`}
              onClick={(e) => handleOptionClick(e, 'twitter')}
              whileTap={{ scale: 0.95 }}
            >
              𝕏
            </motion.button>
            <motion.button
              className={`${cardStyles.shareStatOption} ${cardStyles.shareStatOptionLinkedIn}`}
              onClick={(e) => handleOptionClick(e, 'linkedin')}
              whileTap={{ scale: 0.95 }}
            >
              in
            </motion.button>
            <motion.button
              className={`${cardStyles.shareStatOption} ${cardStyles.shareStatOptionCopy}`}
              onClick={(e) => handleOptionClick(e, 'copy')}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? '✓' : '📋'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={cardStyles.shareStatButton}
        onClick={handleButtonClick}
        whileTap={isVisible ? { scale: 0.95 } : undefined}
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
      >
        <span className={cardStyles.shareStatIcon}>↗</span>
        <span>Share This</span>
      </motion.button>
    </motion.div>
  );
}
