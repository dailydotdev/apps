import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { AchievementRarityTier, rarityColors } from './achievementRarity';

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

type Ray = {
  key: string;
  left: string;
  top: string;
  rotation: number;
  delay: number;
  sizeScale: number;
  intensity: number;
};

type RaritySparklesSize = 'default' | 'compact';

const PARTICLE_COUNT = 14;
const EMERALD_RAY_CYCLE_SECONDS = 12;
const CORNER_INSET = 'clamp(2px, 2.8%, 5px)';
const CORNER_INSET_FROM_END = `calc(100% - ${CORNER_INSET})`;

const EMERALD_RAY_SEQUENCE = [
  { key: 'top-left-border', left: '0%', top: '16%', rotation: 270 },
  { key: 'top-left', left: CORNER_INSET, top: CORNER_INSET, rotation: 315 },
  { key: 'top-middle', left: '50%', top: '0%', rotation: 0 },
  {
    key: 'top-right',
    left: CORNER_INSET_FROM_END,
    top: CORNER_INSET,
    rotation: 45,
  },
  { key: 'top-right-border', left: '100%', top: '16%', rotation: 90 },
  { key: 'right-middle', left: '100%', top: '50%', rotation: 90 },
  { key: 'bottom-right-border', left: '100%', top: '84%', rotation: 90 },
  {
    key: 'bottom-right',
    left: CORNER_INSET_FROM_END,
    top: CORNER_INSET_FROM_END,
    rotation: 135,
  },
  { key: 'bottom-middle', left: '50%', top: '100%', rotation: 180 },
  {
    key: 'bottom-left',
    left: CORNER_INSET,
    top: CORNER_INSET_FROM_END,
    rotation: 225,
  },
  { key: 'bottom-left-border', left: '0%', top: '84%', rotation: 270 },
  { key: 'left-middle', left: '0%', top: '50%', rotation: 270 },
] as const;

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

const generateRays = (): Ray[] => {
  const step = EMERALD_RAY_CYCLE_SECONDS / EMERALD_RAY_SEQUENCE.length;
  return EMERALD_RAY_SEQUENCE.map((ray, index) => ({
    ...ray,
    delay: step * index,
    sizeScale: 0.76 + seededRandom(index * 29 + 7) * 0.68,
    intensity: 0.56 + seededRandom(index * 43 + 11) * 0.32,
  }));
};

const getParticleStyle = (p: Particle): React.CSSProperties => {
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
}
@keyframes rarity-emerald-ray-outward {
  0% {
    opacity: 0;
    transform: translate(-50%, -100%) rotate(var(--rrot)) scaleY(0.24);
  }
  5% {
    opacity: var(--ralpha);
    transform: translate(-50%, -100%) rotate(var(--rrot)) scaleY(1.12);
  }
  12% {
    opacity: calc(var(--ralpha) * 0.46);
    transform: translate(-50%, -100%) rotate(var(--rrot)) scaleY(0.84);
  }
  24%, 100% {
    opacity: 0;
    transform: translate(-50%, -100%) rotate(var(--rrot)) scaleY(0.28);
  }
}`;

export const RaritySparkles = ({
  tier,
  size = 'default',
}: {
  tier: AchievementRarityTier;
  size?: RaritySparklesSize;
}): ReactElement => {
  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);
  const emeraldRays = useMemo(
    () => (tier === AchievementRarityTier.Emerald ? generateRays() : []),
    [tier],
  );
  const rayLengthScale = size === 'compact' ? 0.62 : 1;
  const rayWidthScale = size === 'compact' ? 0.66 : 1;
  const rayBlurScale = size === 'compact' ? 0.74 : 1;

  if (tier === AchievementRarityTier.Bronze) {
    return <></>;
  }

  const color = rarityColors[tier];

  return (
    <>
      <style>{keyframesStyle}</style>
      {emeraldRays.map((ray) => (
        <span
          key={`emerald-ray-${ray.key}`}
          style={
            {
              position: 'absolute',
              left: ray.left,
              top: ray.top,
              pointerEvents: 'none',
            } as React.CSSProperties
          }
        >
          <span
            style={
              {
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 2.2 * ray.sizeScale * rayWidthScale,
                height: 25 * ray.sizeScale * rayLengthScale,
                borderRadius: 999,
                opacity: 0,
                '--rrot': `${ray.rotation}deg`,
                '--ralpha': ray.intensity,
                background: `linear-gradient(180deg, rgba(${color},0) 0%, rgba(${color},${
                  ray.intensity * 0.36
                }) 55%, rgba(${color},${ray.intensity}) 100%)`,
                transform: `translate(-50%, -100%) rotate(${ray.rotation}deg)`,
                transformOrigin: '50% 100%',
                animation: `rarity-emerald-ray-outward ${EMERALD_RAY_CYCLE_SECONDS}s linear ${ray.delay}s infinite`,
                filter: `blur(${0.62 * ray.sizeScale * rayBlurScale}px)`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
      {particles.map((p) => (
        <span
          key={`${p.edge}-${p.pos}`}
          style={
            {
              ...getParticleStyle(p),
              '--rdx': `${p.dx}px`,
              '--rdy': `${p.dy}px`,
              backgroundColor: `rgba(${color},0.8)`,
              animation: `rarity-particle ${p.duration}s ease-out ${p.delay}s infinite`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
};
