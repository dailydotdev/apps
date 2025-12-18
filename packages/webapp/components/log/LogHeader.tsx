import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  VolumeIcon,
  VolumeOffIcon,
} from '@dailydotdev/shared/src/components/icons';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import type { CardConfig } from '../../hooks/log';
import styles from './Log.module.css';

interface LogHeaderProps {
  cards: CardConfig[];
  currentCard: number;
  isMuted: boolean;
  onMuteToggle: () => void;
  onCardClick: (index: number) => void;
}

export default function LogHeader({
  cards,
  currentCard,
  isMuted,
  onMuteToggle,
  onCardClick,
}: LogHeaderProps): React.ReactElement {
  const router = useRouter();

  return (
    <header className={styles.header}>
      {/* Instagram-style progress bars at top */}
      <div className={styles.progressBars}>
        {cards.map((card, index) => {
          const isCompleted = index < currentCard;
          const isCurrent = index === currentCard;

          return (
            <button
              key={card.id}
              type="button"
              className={styles.progressBarWrapper}
              onClick={() => onCardClick(index)}
              aria-label={`Go to card ${index + 1}`}
            >
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressBarFill}
                  initial={false}
                  animate={{
                    width: isCompleted || isCurrent ? '100%' : '0%',
                  }}
                  transition={{
                    // Only animate the current bar, others change instantly
                    duration: isCurrent ? 0.3 : 0,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation row with back button, centered logo, and mute toggle */}
      <div className={styles.headerNav}>
        <div className={styles.headerLeft}>
          <Button
            icon={<ArrowIcon className="-rotate-90" />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={() => router.push('/')}
            className={styles.backButton}
          />
        </div>
        <div className={styles.logoCenter}>
          <Logo position={LogoPosition.Empty} linkDisabled />
        </div>
        <div className={styles.headerRight}>
          <Button
            icon={isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onMuteToggle}
            className={styles.muteButton}
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          />
        </div>
      </div>
    </header>
  );
}
