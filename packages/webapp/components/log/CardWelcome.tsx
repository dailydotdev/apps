import type { ReactElement } from 'react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useLogDataOverride } from '../../contexts/LogDataOverrideContext';
import { validateLogData } from '../../lib/validateLogData';
import type { LogData } from '../../types/log';
import styles from './Log.module.css';
import type { BaseCardProps } from './types';

// Animation timing constants (in seconds, relative to mount)
const NAME_START = 0.2;
const TITLE_START = 0.5;
const TAGLINE_DELAY = 1.3;
const INSTRUCTIONS_DELAY = 1.9;
const CTA_DELAY = 2.5;

export default function CardWelcome({
  isTouchDevice,
  isLoading,
}: BaseCardProps): ReactElement {
  const { user } = useAuthContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { displayToast } = useToastNotification();
  const { setOverrideData } = useLogDataOverride();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get the user's first name (or username as fallback)
  const displayName = user?.name?.split(' ')[0] || user?.username || 'Dev';

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      // Check file type
      if (file.type !== 'application/json') {
        displayToast('Please upload a valid JSON file');
        return;
      }

      setIsUploading(true);

      try {
        // Read file contents
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate the data structure
        const validation = validateLogData(data);
        if (!validation.valid) {
          displayToast(`Invalid log data format: ${validation.errors[0]}`);
          return;
        }

        // Store the data in memory
        setOverrideData(data as LogData);
        displayToast('Log data uploaded successfully!');
      } catch (error) {
        if (error instanceof SyntaxError) {
          displayToast('Invalid JSON file format');
        } else {
          displayToast('Failed to upload log data');
        }
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [displayToast, setOverrideData],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Before mount, hide elements that should animate in
  const hidden = { opacity: 0, y: 20 };
  const visible = { opacity: 1, y: 0 };

  return (
    <div className={styles.cardContent}>
      {/* Main headline - appears first */}
      <div className={styles.headlineStack}>
        {/* Personalized greeting */}
        <motion.div
          className={styles.headlineRow}
          initial={hidden}
          animate={isMounted ? visible : hidden}
          transition={{ delay: NAME_START, type: 'spring', stiffness: 100 }}
        >
          <span className={styles.welcomeName}>Hey {displayName}!</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={hidden}
          animate={isMounted ? visible : hidden}
          transition={{ delay: TITLE_START, type: 'spring', stiffness: 100 }}
        >
          <span className={styles.headlineSmall}>Welcome to</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={hidden}
          animate={isMounted ? visible : hidden}
          transition={{
            delay: TITLE_START + 0.15,
            type: 'spring',
            stiffness: 100,
          }}
        >
          <span className={styles.headlineMedium}>LOG</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            isMounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
          }
          transition={{
            delay: TITLE_START + 0.3,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <span className={styles.headlineBig}>2025</span>
        </motion.div>
      </div>

      {/* Tagline - appears after title */}
      <motion.p
        className={styles.welcomeTagline}
        initial={hidden}
        animate={isMounted ? visible : hidden}
        transition={{ delay: TAGLINE_DELAY, duration: 0.5 }}
      >
        Discover what kind of developer you really are.
      </motion.p>

      {/* Navigation instructions - appears after tagline (fade only) */}
      <motion.p
        className={styles.welcomeInstructions}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted ? 1 : 0 }}
        transition={{ delay: INSTRUCTIONS_DELAY, duration: 0.5 }}
      >
        {isTouchDevice ? 'Tap' : 'Click'} the sides to navigate
        <span className={styles.instructionHint}>👈 back · next 👉</span>
      </motion.p>

      {/* CTA prompt - appears last (fade only) */}
      <motion.div
        className={styles.welcomeCta}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted ? 1 : 0 }}
        transition={{ delay: CTA_DELAY, duration: 0.5 }}
      >
        {/* Loading state */}
        <div
          className={styles.loadingState}
          style={{
            opacity: isLoading || isUploading ? 1 : 0,
            pointerEvents: isLoading || isUploading ? 'auto' : 'none',
          }}
        >
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>
            {isUploading
              ? 'Processing your log data...'
              : 'Preparing your year in review...'}
          </span>
        </div>

        {/* Ready state */}
        <motion.div
          className={styles.readyState}
          style={{
            opacity: isLoading || isUploading ? 0 : 1,
            pointerEvents: isLoading || isUploading ? 'none' : 'auto',
          }}
          animate={
            !isLoading && !isUploading && isMounted ? { x: [0, 10, 0] } : {}
          }
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <span className={styles.ctaText}>
            {isTouchDevice ? 'Tap ' : 'Click '} right to begin{' '}
            <ArrowIcon size={IconSize.XSmall} className={styles.ctaArrow} />
          </span>
        </motion.div>
      </motion.div>

      {/* Upload option - appears after CTA (fade only) */}
      <motion.div
        className={styles.welcomeUpload}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted && !isLoading ? 1 : 0 }}
        transition={{ delay: CTA_DELAY + 0.5, duration: 0.5 }}
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          pointerEvents: isLoading || isUploading ? 'none' : 'auto',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={handleUploadClick}
          className={styles.uploadButton}
          type="button"
          disabled={isLoading || isUploading}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1.25rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          <UploadIcon size={IconSize.XSmall} />
          Upload custom log data (JSON)
        </button>
      </motion.div>
    </div>
  );
}
