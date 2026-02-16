import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { AchievementRarityTier } from './achievementRarity';
import { rarityColors } from './achievementRarity';

type Edge = 'top' | 'right' | 'bottom' | 'left';

type Particle = {
  edge: Edge;
  pos: number;
  dx: number;
  dy: number;
  delay: number;
  duration: number;
  size: number;
};

const PARTICLE_COUNT = 14;

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const generateParticles = (count: number): Particle[] => {
  const edges: Edge[] = ['top', 'right', 'bottom', 'left'];
  return Array.from({ length: count }, (_, i) => {
    const edge = edges[i % 4];
    const pos = seededRandom(i * 7 + 3) * 100;
    const drift = (seededRandom(i * 13 + 1) - 0.5) * 4;
    const dist = 8 + seededRandom(i * 11 + 5) * 8;

    let dx = drift;
    let dy = drift;
    if (edge === 'top') {
      dy = -dist;
    } else if (edge === 'bottom') {
      dy = dist;
    } else if (edge === 'left') {
      dx = -dist;
    } else {
      dx = dist;
    }

    return {
      edge,
      pos,
      dx,
      dy,
      delay: seededRandom(i * 17 + 2) * 4,
      duration: 2 + seededRandom(i * 19 + 7) * 2,
      size: 1 + seededRandom(i * 23 + 11) * 1.5,
    };
  });
};

const getParticleStyle = (
  p: Particle,
): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: p.size,
    height: p.size,
    borderRadius: '50%',
    animationDelay: `${p.delay}s`,
    animationDuration: `${p.duration}s`,
    pointerEvents: 'none',
  };

  if (p.edge === 'top') {
    return { ...base, top: -1, left: `${p.pos}%` };
  }
  if (p.edge === 'bottom') {
    return { ...base, bottom: -1, left: `${p.pos}%` };
  }
  if (p.edge === 'left') {
    return { ...base, left: -1, top: `${p.pos}%` };
  }
  return { ...base, right: -1, top: `${p.pos}%` };
};

const keyframesStyle = `
@keyframes rarity-particle {
  0% { opacity: 0; transform: translate(0, 0); }
  15% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(var(--rdx), var(--rdy)); }
}`;

export const RaritySparkles = ({
  tier,
}: {
  tier: AchievementRarityTier;
}): ReactElement => {
  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);
  const color = rarityColors[tier];

  return (
    <>
      <style>{keyframesStyle}</style>
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            ...getParticleStyle(p),
            '--rdx': `${p.dx}px`,
            '--rdy': `${p.dy}px`,
            backgroundColor: `rgba(${color},0.8)`,
            animation: `rarity-particle ${p.duration}s ease-out ${p.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};
