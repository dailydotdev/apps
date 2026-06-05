import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { GiftIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useGivebackContext } from '../GivebackContext';
import { usePrefersReducedMotion } from '../useGivebackMotion';
import { formatDonationAmount } from '../utils';

const COIN_COLORS = [
  'bg-accent-cheese-default',
  'bg-accent-avocado-default',
  'bg-accent-cabbage-default',
  'bg-accent-bacon-default',
  'bg-accent-blueCheese-default',
];

const PARTICLE_COUNT = 16;

interface Particle {
  key: string;
  tx: number;
  ty: number;
  size: number;
  delay: number;
  color: string;
}

// Deterministic-ish spray around a circle so the burst reads as a fountain of
// coins rather than random noise.
const buildParticles = (seed: number): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + (seed % 7) * 0.3;
    const distance = 120 + ((index * 37 + seed * 13) % 150);
    return {
      key: `${seed}-${index}-${distance}`,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 40,
      size: 8 + ((index * 5 + seed) % 9),
      delay: (index % 6) * 28,
      color: COIN_COLORS[index % COIN_COLORS.length],
    };
  });

export const GivebackCelebration = (): ReactElement | null => {
  const { celebration, dismissCelebration } = useGivebackContext();
  const reducedMotion = usePrefersReducedMotion();

  const id = celebration?.id ?? 0;
  const isMilestone = Boolean(
    celebration && (celebration.milestone || celebration.complete),
  );

  const particles = useMemo(() => buildParticles(id), [id]);

  useEffect(() => {
    if (!celebration) {
      return undefined;
    }

    const visibleFor = isMilestone ? 2600 : 1900;
    const timer = window.setTimeout(dismissCelebration, visibleFor);
    return () => window.clearTimeout(timer);
    // Re-run only when a new celebration is triggered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!celebration) {
    return null;
  }

  const bannerLabel = celebration.complete
    ? 'Goal reached. Thank you.'
    : `${celebration.milestone}% funded`;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-max flex items-center justify-center overflow-hidden px-4"
    >
      <div
        key={id}
        className="bg-accent-cabbage-default/20 absolute size-72 rounded-full blur-3xl motion-safe:animate-glow-pulse"
      />

      {!reducedMotion && (
        <div key={`coins-${id}`} className="absolute inset-0">
          {particles.map((particle) => (
            <span
              key={particle.key}
              className={classNames(
                'absolute left-1/2 top-1/2 rounded-full motion-safe:animate-reaction-burst',
                particle.color,
              )}
              style={
                {
                  width: particle.size,
                  height: particle.size,
                  animationDelay: `${particle.delay}ms`,
                  '--burst-tx': `${particle.tx}px`,
                  '--burst-ty': `${particle.ty}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div
        key={`card-${id}`}
        className="relative flex flex-col items-center gap-2 rounded-24 border border-accent-cabbage-default bg-background-default px-8 py-6 text-center shadow-2-cabbage motion-safe:animate-reward-pop"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-accent-cabbage-flat text-accent-cabbage-default">
          <GiftIcon size={IconSize.Large} />
        </span>
        <Typography
          bold
          tag={TypographyTag.Span}
          type={TypographyType.LargeTitle}
          color={TypographyColor.StatusSuccess}
          className="tabular-nums"
        >
          +{formatDonationAmount(celebration.amount, celebration.currency)}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          added to the pot
        </Typography>
        {isMilestone && (
          <span className="mt-1 rounded-10 bg-accent-cabbage-flat px-3 py-1">
            <Typography
              bold
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Brand}
            >
              {bannerLabel}
            </Typography>
          </span>
        )}
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {`You unlocked ${formatDonationAmount(
          celebration.amount,
          celebration.currency,
        )} for your causes.${isMilestone ? ` ${bannerLabel}.` : ''}`}
      </div>
    </div>
  );
};
