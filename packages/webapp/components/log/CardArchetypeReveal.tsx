import type { ReactElement } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogData } from '../../types/log';
import { ARCHETYPES } from '../../types/log';
import styles from './Log.module.css';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
}

const BUILD_UP_LINES = [
  { text: "We've seen how you read...", icon: '👁️' },
  { text: 'We know when you read...', icon: '🕐' },
  { text: "We've tracked what you love...", icon: '💜' },
  { text: 'Now let us reveal...', icon: '✨' },
];

// ============================================
// TIMING CONFIGURATION (adjust these to tune the experience)
// ============================================
const TIMING = {
  // Build-up phase
  buildupInitialDelay: 400, // ms before first line appears
  buildupLineInterval: 900, // ms between each line
  // Derived: total buildup = 400 + (4 * 900) = 4000ms (4s)

  // "WHO ARE YOU?" phase
  whoAreYouDuration: 1400, // ms to show this text

  // Get total buildup time (for calculating subsequent phases)
  get buildupTotal() {
    return (
      this.buildupInitialDelay +
      BUILD_UP_LINES.length * this.buildupLineInterval
    );
  },
};

// Enhanced particle with trails
function GlowParticle({
  delay,
  angle,
  color,
}: {
  delay: number;
  angle: number;
  color: string;
}): ReactElement {
  const distance = 180 + Math.random() * 120;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const size = 4 + Math.random() * 8;

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        background: color,
        borderRadius: '50%',
        boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`,
      }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{
        x,
        y,
        scale: [0, 1.5, 0.5, 0],
        opacity: [1, 1, 0.8, 0],
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.5,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

// Sparkle effect for the reveal
function Sparkle({
  x,
  y,
  delay,
  color,
}: {
  x: number;
  y: number;
  delay: number;
  color: string;
}): ReactElement {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 4,
        height: 4,
        background: color,
        borderRadius: '50%',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 0.8,
        delay,
        repeat: Infinity,
        repeatDelay: 2 + Math.random() * 2,
      }}
    />
  );
}

export default function CardArchetypeReveal({
  data,
  isActive,
}: CardProps): ReactElement {
  const [phase, setPhase] = useState<'buildup' | 'whoAreYou' | 'reveal'>(
    'buildup',
  );
  const [buildUpIndex, setBuildUpIndex] = useState(-1);
  const [showParticles, setShowParticles] = useState(false);
  const [, setImageLoaded] = useState(false);
  const archetype = ARCHETYPES[data.archetype];

  // Preload the image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = archetype.imageUrl;
  }, [archetype.imageUrl]);

  // Generate particles with archetype colors
  const particles = useMemo(() => {
    const colors = [
      archetype.color,
      '#ff6b35',
      '#f7c948',
      '#e637bf',
      '#c6f135',
    ];
    return [...Array(36)].map((_, i) => ({
      angle: (i / 36) * Math.PI * 2,
      delay: i * 0.015,
      color: colors[i % colors.length],
    }));
  }, [archetype.color]);

  // Generate sparkles
  const sparkles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      x: Math.random() * 280 - 140,
      y: Math.random() * 280 - 140,
      delay: i * 0.1,
      color: i % 2 === 0 ? archetype.color : '#fff',
    }));
  }, [archetype.color]);

  useEffect(() => {
    if (!isActive) {
      setPhase('buildup');
      setBuildUpIndex(-1);
      setShowParticles(false);
      return () => {
        // Cleanup when inactive
      };
    }

    const timers: NodeJS.Timeout[] = [];

    // Build up sequence
    BUILD_UP_LINES.forEach((_, index) => {
      timers.push(
        setTimeout(
          () => setBuildUpIndex(index),
          TIMING.buildupInitialDelay + index * TIMING.buildupLineInterval,
        ),
      );
    });

    // "WHO ARE YOU?" dramatic moment (after buildup completes)
    timers.push(setTimeout(() => setPhase('whoAreYou'), TIMING.buildupTotal));

    // THE REVEAL
    timers.push(
      setTimeout(() => {
        setPhase('reveal');
        setShowParticles(true);
      }, TIMING.buildupTotal + TIMING.whoAreYouDuration),
    );

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        <div className={cardStyles.archetypeContainer}>
          <AnimatePresence mode="wait">
            {/* Build up phase */}
            {phase === 'buildup' && (
              <motion.div
                key="buildup"
                className={cardStyles.buildupContainer}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {BUILD_UP_LINES.map((line, index) => (
                  <motion.div
                    key={`${line.icon}-${line.text}`}
                    className={cardStyles.archetypeBuildupLine}
                    initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                    animate={
                      buildUpIndex >= index
                        ? { opacity: 1, x: 0, filter: 'blur(0px)' }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <motion.span
                      className={cardStyles.archetypeBuildupIcon}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={
                        buildUpIndex >= index ? { scale: 1, rotate: 0 } : {}
                      }
                      transition={{
                        duration: 0.5,
                        delay: 0.2,
                        type: 'spring',
                        stiffness: 200,
                      }}
                    >
                      {line.icon}
                    </motion.span>
                    <span>{line.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* WHO ARE YOU? dramatic moment */}
            {phase === 'whoAreYou' && (
              <motion.div
                key="whoAreYou"
                className={cardStyles.whoAreYouContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 3, filter: 'blur(20px)' }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={cardStyles.whoAreYouText}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 12,
                  }}
                >
                  <span className={cardStyles.whoAreYouSmall}>WHO</span>
                  <span className={cardStyles.whoAreYouLarge}>ARE</span>
                  <span className={cardStyles.whoAreYouSmall}>YOU?</span>
                </motion.div>
              </motion.div>
            )}

            {/* THE GRAND REVEAL */}
            {phase === 'reveal' && (
              <motion.div
                key="reveal"
                className={cardStyles.archetypeRevealContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Particle explosion */}
                {showParticles && (
                  <div className={cardStyles.particleCenter}>
                    {particles.map((p) => (
                      <GlowParticle
                        key={`particle-${p.angle}-${p.delay}`}
                        delay={p.delay}
                        angle={p.angle}
                        color={p.color}
                      />
                    ))}
                  </div>
                )}

                {/* Sparkles around the image */}
                <div className={cardStyles.sparklesContainer}>
                  {sparkles.map((s) => (
                    <Sparkle
                      key={`sparkle-${s.x}-${s.y}`}
                      x={s.x}
                      y={s.y}
                      delay={1 + s.delay}
                      color={s.color}
                    />
                  ))}
                </div>

                {/* Main archetype image with dramatic entrance */}
                <motion.div
                  className={cardStyles.archetypeImageWrapper}
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 180,
                    damping: 12,
                    delay: 0.1,
                  }}
                >
                  <motion.div
                    className={cardStyles.archetypeImageGlowRing}
                    style={{ borderColor: archetype.color }}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                  <motion.img
                    src={archetype.imageUrl}
                    alt={archetype.name}
                    className={cardStyles.archetypeImage}
                    initial={{ filter: 'brightness(2) saturate(0)' }}
                    animate={{ filter: 'brightness(1) saturate(1)' }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </motion.div>

                {/* Archetype name with screen shake effect */}
                <motion.div
                  className={cardStyles.archetypeNameBadge}
                  style={
                    {
                      '--archetype-color': archetype.color,
                    } as React.CSSProperties
                  }
                  initial={{ opacity: 0, y: 60, scale: 0.3 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.4,
                    type: 'spring',
                    stiffness: 120,
                    damping: 10,
                  }}
                >
                  <span
                    className={cardStyles.archetypeNameText}
                    style={{ color: archetype.color }}
                  >
                    {archetype.name.toUpperCase()}
                  </span>
                </motion.div>

                {/* Description with fade */}
                <motion.p
                  className={cardStyles.archetypeRevealDescription}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  &quot;{archetype.description}&quot;
                </motion.p>

                {/* Stat badge */}
                <motion.div
                  className={cardStyles.archetypeStatBadge}
                  initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                  animate={{ opacity: 1, scale: 1, rotate: -1 }}
                  transition={{ delay: 1.1, duration: 0.5, type: 'spring' }}
                >
                  <span className={cardStyles.archetypeStatBadgeText}>
                    {data.archetypeStat}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={1.8}
        isActive={phase === 'reveal'}
        statText={`I'm ${
          ['A', 'E', 'I', 'O', 'U'].includes(archetype.name[0]) ? 'an' : 'a'
        } ${archetype.name.toUpperCase()} on daily.dev!\n\n"${
          archetype.description
        }"\n\n⚡ ${data.archetypeStat}\n\nWhat's your developer archetype?`}
      />
    </>
  );
}
