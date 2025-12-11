import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogData } from '../types';
import { ARCHETYPES } from '../types';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

const BUILD_UP_LINES = [
  { text: "We've analyzed your patterns...", emoji: '🔍' },
  { text: "We've tracked your journey...", emoji: '📊' },
  { text: "We've decoded your style...", emoji: '🧬' },
  { text: 'And now we know WHO you are...', emoji: '✨' },
];

// Particle explosion component
function Particle({
  delay,
  angle,
}: {
  delay: number;
  angle: number;
}): ReactElement {
  const distance = 150 + Math.random() * 100;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const colors = ['#ff6b35', '#f7c948', '#e637bf', '#c6f135', '#4d9dff'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: 8 + Math.random() * 8,
        height: 8 + Math.random() * 8,
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{
        x,
        y,
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 1 + Math.random() * 0.5,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

export default function CardArchetypeReveal({
  data,
  isActive,
}: CardProps): ReactElement {
  const [phase, setPhase] = useState<'buildup' | 'pause' | 'reveal'>('buildup');
  const [buildUpIndex, setBuildUpIndex] = useState(-1);
  const [showParticles, setShowParticles] = useState(false);
  const archetype = ARCHETYPES[data.archetype];

  useEffect(() => {
    if (!isActive) {
      setPhase('buildup');
      setBuildUpIndex(-1);
      setShowParticles(false);
      return () => {
        // Cleanup when inactive
      };
    }

    // Build up sequence
    const timers: NodeJS.Timeout[] = [];

    BUILD_UP_LINES.forEach((_, index) => {
      timers.push(setTimeout(() => setBuildUpIndex(index), 600 + index * 1200));
    });

    // Pause phase
    timers.push(
      setTimeout(() => setPhase('pause'), 600 + BUILD_UP_LINES.length * 1200),
    );

    // Reveal phase
    timers.push(
      setTimeout(() => {
        setPhase('reveal');
        setShowParticles(true);
      }, 600 + BUILD_UP_LINES.length * 1200 + 1500),
    );

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <>
      <div className={cardStyles.archetypeContainer}>
        <AnimatePresence mode="wait">
          {/* Build up phase */}
          {phase === 'buildup' && (
            <motion.div
              key="buildup"
              className={cardStyles.buildupContainer}
              exit={{ opacity: 0 }}
            >
              {BUILD_UP_LINES.map((line, index) => (
                <motion.div
                  key={`${line.emoji}-${line.text}`}
                  className={cardStyles.buildupLine}
                  initial={{ opacity: 0, x: -20 }}
                  animate={buildUpIndex >= index ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <span className={cardStyles.buildupEmoji}>{line.emoji}</span>
                  <span>{line.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pause - dramatic dots */}
          {phase === 'pause' && (
            <motion.div
              key="pause"
              className={cardStyles.pauseContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 2 }}
            >
              <div className={cardStyles.pauseDots}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.3 }}
                  >
                    •
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* THE REVEAL */}
          {phase === 'reveal' && (
            <motion.div
              key="reveal"
              className={cardStyles.revealContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Particle explosion */}
              {showParticles && (
                <div className={cardStyles.particleCenter}>
                  {[...Array(24)].map((_, i) => {
                    const angle = (i / 24) * Math.PI * 2;
                    return (
                      <Particle
                        key={`particle-${angle}-${i * 0.02}`}
                        delay={i * 0.02}
                        angle={angle}
                      />
                    );
                  })}
                </div>
              )}

              {/* Emoji with dramatic entrance */}
              <motion.div
                className={cardStyles.archetypeEmoji}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 10,
                  delay: 0.1,
                }}
              >
                {archetype.emoji}
              </motion.div>

              {/* Name with screen shake effect via CSS */}
              <motion.div
                className={cardStyles.archetypeName}
                style={{ color: archetype.color }}
                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  delay: 0.3,
                  type: 'spring',
                  stiffness: 150,
                  damping: 12,
                }}
              >
                {archetype.name.toUpperCase()}
              </motion.div>

              {/* Description */}
              <motion.p
                className={cardStyles.archetypeDescription}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                &quot;{archetype.description}&quot;
              </motion.p>

              {/* Stat */}
              <motion.div
                className={cardStyles.archetypeStat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <span className={cardStyles.archetypeStatIcon}>⚡</span>
                <span>{data.archetypeStat}</span>
              </motion.div>

              {/* Share button */}
              <ShareStatButton
                delay={1.7}
                isActive={phase === 'reveal'}
                statText={`I'm a ${archetype.name.toUpperCase()} ${
                  archetype.emoji
                } on daily.dev!\n\n"${archetype.description}"\n\n⚡ ${
                  data.archetypeStat
                }\n\nWhat's your developer archetype?`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
