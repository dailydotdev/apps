import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { IconSize } from '../../../components/Icon';
import type { CrownData, CrownType } from './types';

interface ArenaCrownCardsProps {
  crowns: CrownData[];
  loading?: boolean;
}

const crownHoverAnimations: Partial<Record<CrownType, string>> = {
  'developers-choice': 'crown-hover-developers-choice',
  'most-loved': 'crown-hover-most-loved',
  'fastest-rising': 'crown-hover-fastest-rising',
  'most-discussed': 'crown-hover-most-discussed',
  'most-controversial': 'crown-hover-most-controversial',
};

/* ── Per-crown icon animation overrides ────────────────────────────── */
const crownIconAnimation: Partial<Record<CrownType, string>> = {
  'most-loved': 'crown-icon-bloom-pulse 1.2s ease-in-out',
};
const DEFAULT_ICON_ANIMATION = 'crown-icon-pop 1.2s ease-out';

const forceReflow = (element: Element): void => {
  element.getBoundingClientRect();
};

const restartAnimation = (
  element: HTMLElement | SVGElement,
  animation: string,
): void => {
  const { style } = element;
  style.animation = 'none';
  forceReflow(element);
  style.animation = animation;
};

/* ── Spark particle tuning ─────────────────────────────────────────── */
const SPARK_CONFIG = {
  count: 7, // number of particles
  radius: 30, // max travel distance in px
  burstPct: 20, // % of animation where the fast burst ends (higher = slower burst)
  burstRatio: 0.65, // fraction of radius reached at burstPct (0-1)
  angleMin: -50, // minimum angle in degrees (0 = straight up, negative = left)
  angleMax: 50, // maximum angle in degrees (positive = right)
  duration: 1.2, // total animation duration in seconds
  staggerMax: 0.08, // max stagger delay between particles in seconds
};

/**
 * Randomizes spark particle trajectories via CSS custom properties
 * and restarts their animations. Called on each mouseenter — no React state needed.
 */
const randomizeSparks = (card: HTMLElement): void => {
  const {
    count,
    radius,
    burstRatio,
    angleMin,
    angleMax,
    duration,
    staggerMax,
  } = SPARK_CONFIG;
  const sparks = card.querySelectorAll<HTMLElement>('.crown-spark');
  const angleRange = angleMax - angleMin;

  sparks.forEach((el, i) => {
    const { style } = el;
    // spread evenly around the ring, jitter ±20% of slot width
    const isFullCircle = angleRange >= 360;
    const slots = isFullCircle ? count : Math.max(count - 1, 1);
    const slotWidth = angleRange / slots;
    const baseAngle = angleMin + (i / slots) * angleRange;
    const jitter = (Math.random() - 0.5) * slotWidth * 0.4;
    const angle = baseAngle + jitter;
    const rad = (angle * Math.PI) / 180;

    // randomize radius ±20%
    const r = radius * (0.95 + Math.random() * 0.05);
    const burstR = r * burstRatio;

    const bx = Math.round(Math.sin(rad) * burstR);
    const by = Math.round(-Math.cos(rad) * burstR);
    const fx = Math.round(Math.sin(rad) * r);
    const fy = Math.round(-Math.cos(rad) * r);

    style.setProperty('--spark-bx', `${bx}px`);
    style.setProperty('--spark-by', `${by}px`);
    style.setProperty('--spark-fx', `${fx}px`);
    style.setProperty('--spark-fy', `${fy}px`);
    style.setProperty(
      '--spark-peak',
      `${(0.7 + Math.random() * 0.3).toFixed(2)}`,
    );
    style.setProperty(
      '--spark-delay',
      `${(Math.random() * staggerMax).toFixed(2)}s`,
    );

    restartAnimation(
      el,
      `crown-spark ${duration}s ease-out var(--spark-delay) forwards`,
    );
  });
};

/**
 * Restarts the icon pop/heartbeat animation via DOM.
 */
const restartIconAnimation = (
  card: HTMLElement,
  crownType: CrownType,
): void => {
  const iconWrapper = card.querySelector<HTMLElement>('.crown-icon-wrapper');
  if (!iconWrapper) {
    return;
  }
  const anim = crownIconAnimation[crownType] ?? DEFAULT_ICON_ANIMATION;
  restartAnimation(iconWrapper, anim);
};

/**
 * Restarts the warm bloom animation for the most-loved crown.
 */
const restartBloom = (card: HTMLElement): void => {
  const bloom = card.querySelector<HTMLElement>('.crown-bloom');
  if (!bloom) {
    return;
  }
  restartAnimation(bloom, 'crown-bloom 1.4s ease-in-out forwards');
};

/* ── Ghost-trail config (fastest-rising) ─────────────────────────────── */
const GHOST_CONFIG = {
  count: 5, // number of afterimage clones
  spacing: 6, // px between each ghost along the trail axis
  blur: [0.5, 1, 1.8, 2.8, 4], // blur per ghost layer in px
  opacities: [0.5, 0.38, 0.26, 0.15, 0.07], // opacity per ghost layer
  stretch: [1.08, 1.14, 1.2, 1.28, 1.36], // scaleY stretch per ghost (elongation along trail)
  lungeDist: [7, 11], // min/max lunge distance in px
  lungeAngle: [38, 52], // min/max lunge angle in degrees from horizontal
  duration: 0.9, // animation duration in seconds
};

/**
 * Creates ghost-clone afterimages of the icon trailing behind the lunge
 * direction. Clones the actual SVG element so the trail perfectly matches
 * the icon shape. Clones are cleaned up after the animation completes.
 */
const restartRocket = (card: HTMLElement, glowColor: string): void => {
  const iconWrapper = card.querySelector<HTMLElement>('.crown-icon-wrapper');
  if (!iconWrapper) {
    return;
  }

  // Clean up any leftover ghosts from a previous hover
  iconWrapper.querySelectorAll('.crown-ghost').forEach((el) => el.remove());

  // Find the original SVG (not a ghost clone)
  const svg = iconWrapper.querySelector<SVGElement>(':scope > svg');
  if (!svg) {
    return;
  }

  // Reset SVG animation so it can restart cleanly
  svg.style.animation = 'none';
  forceReflow(svg);

  // Randomize lunge direction
  const {
    count,
    spacing,
    blur,
    opacities,
    stretch,
    lungeDist,
    lungeAngle,
    duration,
  } = GHOST_CONFIG;
  const angleDeg =
    lungeAngle[0] + Math.random() * (lungeAngle[1] - lungeAngle[0]);
  const angleRad = (angleDeg * Math.PI) / 180;
  const dist = lungeDist[0] + Math.random() * (lungeDist[1] - lungeDist[0]);

  // Trail direction is opposite to lunge (lower-left)
  const trailDx = -Math.cos(angleRad);
  const trailDy = Math.sin(angleRad);

  // Trail angle for stretching ghosts along the motion axis
  const trailAngleDeg = angleDeg + 180;

  // Create ghost clones
  for (let i = 0; i < count; i += 1) {
    const ghost = svg.cloneNode(true) as SVGElement;
    ghost.classList.add('crown-ghost');
    const { style } = ghost;
    style.position = 'absolute';
    style.inset = '0';
    style.pointerEvents = 'none';
    style.opacity = '0';
    style.color = glowColor;

    // Per-ghost blur and stretch (elongation along trail axis)
    const ghostBlur = blur[i] ?? blur[blur.length - 1];
    const ghostStretch = stretch[i] ?? stretch[stretch.length - 1];
    style.filter = `blur(${ghostBlur}px)`;
    // Stretch along the trail direction using rotate-scale-rotate
    style.transformOrigin = '50% 50%';

    // Offset along the trail axis
    const offset = spacing * (i + 1);
    const tx = (trailDx * offset).toFixed(1);
    const ty = (trailDy * offset).toFixed(1);
    style.setProperty('--ghost-tx', `${tx}px`);
    style.setProperty('--ghost-ty', `${ty}px`);
    style.setProperty('--ghost-peak', `${opacities[i] ?? 0.05}`);
    style.setProperty('--ghost-stretch', `${ghostStretch}`);
    style.setProperty('--ghost-angle', `${trailAngleDeg.toFixed(0)}deg`);
    style.setProperty('--ghost-delay', `${(i * 0.025).toFixed(3)}s`);

    iconWrapper.appendChild(ghost);

    restartAnimation(
      ghost,
      `crown-ghost ${duration}s ease-out var(--ghost-delay) forwards`,
    );
  }

  // Animate the icon itself (lunge + snap back)
  const dx = (Math.cos(angleRad) * dist).toFixed(1);
  const dy = (-Math.sin(angleRad) * dist).toFixed(1);
  iconWrapper.style.setProperty('--rocket-dx', `${dx}px`);
  iconWrapper.style.setProperty('--rocket-dy', `${dy}px`);

  restartAnimation(
    iconWrapper,
    `crown-icon-rocket ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
  );

  // Stretch the arrow along its ~45° axis, anchored at the line's starting point
  svg.style.transformOrigin = '15% 75%';
  svg.style.animation = `crown-arrow-extend ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`;

  // Clean up ghosts after animation
  setTimeout(() => {
    iconWrapper.querySelectorAll('.crown-ghost').forEach((el) => el.remove());
  }, duration * 1000 + 50);
};

/**
 * Animates the megaphone's existing arc paths to create a ripple.
 * Some icon variants include overlapping arc groups, so we animate
 * all matching arc paths together to avoid "extra arc" artifacts.
 */
const restartSoundPulse = (card: HTMLElement): void => {
  const iconWrapper = card.querySelector<HTMLElement>('.crown-icon-wrapper');
  if (!iconWrapper) {
    return;
  }

  const svg = iconWrapper.querySelector<SVGElement>(':scope > svg');
  if (!svg) {
    return;
  }

  svg.style.overflow = 'visible';

  iconWrapper.style.animation = 'none';
  const nestedArcPaths = Array.from(
    svg.querySelectorAll<SVGPathElement>('g > g > path'),
  );

  if (nestedArcPaths.length && !svg.dataset.megaphonePrepared) {
    const topLevelPaths = Array.from(
      svg.querySelectorAll<SVGPathElement>(':scope > g > path'),
    );

    const duplicateArcPath = topLevelPaths[0];
    if (duplicateArcPath) {
      duplicateArcPath.style.opacity = '0';
    }

    const mergedBodyPath = topLevelPaths.find((path) => {
      const d = path.getAttribute('d') ?? '';
      return /[zZ]\s*M/.test(d);
    });
    if (mergedBodyPath) {
      const d = mergedBodyPath.getAttribute('d') ?? '';
      const splitIndex = d.search(/[zZ]\s*M/);
      if (splitIndex >= 0) {
        const nextMoveIndex = d.indexOf('M', splitIndex);
        if (nextMoveIndex >= 0) {
          mergedBodyPath.setAttribute('d', d.slice(nextMoveIndex));
        }
      }
    }

    svg.dataset.megaphonePrepared = 'true';
  }

  const arcGroupPaths = nestedArcPaths.length
    ? nestedArcPaths
    : Array.from(svg.querySelectorAll<SVGPathElement>('path'));

  arcGroupPaths.forEach((el) => {
    el.style.removeProperty('animation');
  });
  forceReflow(svg);

  iconWrapper.style.animation = 'crown-icon-megaphone 0.8s ease-out';
  if (!arcGroupPaths.length) {
    return;
  }

  const orderedArcPaths = [...arcGroupPaths].sort((a, b) => {
    const aLength = a.getAttribute('d')?.length ?? 0;
    const bLength = b.getAttribute('d')?.length ?? 0;
    return bLength - aLength;
  });
  const earlyCount = Math.ceil(orderedArcPaths.length / 2);

  orderedArcPaths.forEach((el, i) => {
    const delay = i < earlyCount ? 0 : 0.1;
    const { style } = el;
    style.transformBox = 'fill-box';
    style.transformOrigin = '0% 50%';
    style.animation = `crown-sound-ripple 0.8s ease-out ${delay.toFixed(2)}s`;
  });

  const soundParticles = iconWrapper.querySelectorAll<HTMLElement>(
    '.crown-sound-particle',
  );
  soundParticles.forEach((el, i) => {
    const { style } = el;
    const side = i % 2 === 0 ? -1 : 1;
    const startX = 9 + Math.random() * 4;
    const arcBandY = -4.5;
    const sideOffset = 1.8 + Math.random() * 1.8;
    const startY = arcBandY + side * sideOffset;
    const endX = startX + 3 + Math.random() * 4;
    const endY = startY + side * (0.4 + Math.random() * 1.4);
    const delay = 0.04 + i * 0.02 + Math.random() * 0.03;
    const peak = 0.24 + Math.random() * 0.12;

    style.setProperty('--sound-particle-sx', `${startX.toFixed(1)}px`);
    style.setProperty('--sound-particle-sy', `${startY.toFixed(1)}px`);
    style.setProperty('--sound-particle-ex', `${endX.toFixed(1)}px`);
    style.setProperty('--sound-particle-ey', `${endY.toFixed(1)}px`);
    style.setProperty('--sound-particle-peak', peak.toFixed(2));
    restartAnimation(
      el,
      `crown-sound-particle 0.65s ease-out ${delay.toFixed(2)}s`,
    );
  });
};

/**
 * Flame microinteraction for most-controversial:
 * subtle flicker on the icon, soft heat glow pulse, and tiny ember drift.
 */
const restartFlame = (card: HTMLElement): void => {
  const iconWrapper = card.querySelector<HTMLElement>('.crown-icon-wrapper');
  if (!iconWrapper) {
    return;
  }

  restartAnimation(
    iconWrapper,
    'crown-icon-flame 1.1s cubic-bezier(0.32, 0.02, 0.22, 1)',
  );

  const flameGlow = iconWrapper.querySelector<HTMLElement>('.crown-flame-glow');
  if (flameGlow) {
    restartAnimation(flameGlow, 'crown-flame-glow 1.1s ease-out');
  }

  const embers =
    iconWrapper.querySelectorAll<HTMLElement>('.crown-flame-ember');
  embers.forEach((el, i) => {
    const { style } = el;
    const side = i % 2 === 0 ? -1 : 1;
    const startX = side * (1.5 + Math.random() * 4.5);
    const startY = -0.5 + Math.random() * 3.5;
    const endX = startX + side * (1 + Math.random() * 3.5);
    const endY = -11 - Math.random() * 7;
    const peak = 0.42 + Math.random() * 0.22;
    const delay = 0.02 + i * 0.02 + Math.random() * 0.03;

    style.setProperty('--flame-ember-sx', `${startX.toFixed(1)}px`);
    style.setProperty('--flame-ember-sy', `${startY.toFixed(1)}px`);
    style.setProperty('--flame-ember-ex', `${endX.toFixed(1)}px`);
    style.setProperty('--flame-ember-ey', `${endY.toFixed(1)}px`);
    style.setProperty('--flame-ember-peak', peak.toFixed(2));
    restartAnimation(
      el,
      `crown-flame-ember 1.45s ease-out ${delay.toFixed(2)}s`,
    );
  });
};

/**
 * Developers-choice microinteraction:
 * medal tilt/rebound + quick rim sweep + two tiny glints.
 */
const restartMedal = (card: HTMLElement): void => {
  const iconWrapper = card.querySelector<HTMLElement>('.crown-icon-wrapper');
  if (!iconWrapper) {
    return;
  }

  restartAnimation(
    iconWrapper,
    'crown-icon-medal 0.95s cubic-bezier(0.22, 1, 0.36, 1)',
  );

  const sheen = iconWrapper.querySelector<HTMLElement>('.crown-medal-sheen');
  if (sheen) {
    restartAnimation(sheen, 'crown-medal-sheen 0.7s ease-out');
  }

  const glints =
    iconWrapper.querySelectorAll<HTMLElement>('.crown-medal-glint');
  glints.forEach((el, i) => {
    const { style } = el;
    const delay = 0.06 + i * 0.08;
    const x = i === 0 ? 7.5 : -7;
    const y = i === 0 ? -6.5 : 4.5;

    style.setProperty('--medal-glint-x', `${x}px`);
    style.setProperty('--medal-glint-y', `${y}px`);
    restartAnimation(
      el,
      `crown-medal-glint 0.46s ease-out ${delay.toFixed(2)}s`,
    );
  });

  const particles = iconWrapper.querySelectorAll<HTMLElement>(
    '.crown-medal-particle',
  );
  const medalCenterX = -2;
  const medalCenterY = -5;
  particles.forEach((el, i) => {
    const { style } = el;
    const slot = 360 / Math.max(particles.length, 1);
    const jitter = (Math.random() - 0.5) * slot * 0.45;
    const angleDeg = i * slot + jitter;
    const angleRad = (angleDeg * Math.PI) / 180;
    const startR = 2 + Math.random() * 2;
    const endR = 18 + Math.random() * 10;
    const sx = Math.cos(angleRad) * startR + medalCenterX;
    const sy = Math.sin(angleRad) * startR + medalCenterY;
    const ex = Math.cos(angleRad) * endR + medalCenterX;
    const ey = Math.sin(angleRad) * endR + medalCenterY;
    const delay = 0.01 + i * 0.01 + Math.random() * 0.015;
    const peak = 0.62 + Math.random() * 0.24;

    style.setProperty('--medal-particle-sx', `${sx.toFixed(1)}px`);
    style.setProperty('--medal-particle-sy', `${sy.toFixed(1)}px`);
    style.setProperty('--medal-particle-ex', `${ex.toFixed(1)}px`);
    style.setProperty('--medal-particle-ey', `${ey.toFixed(1)}px`);
    style.setProperty('--medal-particle-peak', peak.toFixed(2));
    restartAnimation(
      el,
      `crown-medal-particle 1.05s ease-out ${delay.toFixed(2)}s`,
    );
  });
};

const Placeholder = ({ className }: { className?: string }): ReactElement => (
  <div
    className={classNames(
      'animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

const CrownCard = ({
  crown,
  loading,
}: {
  crown: CrownData;
  loading?: boolean;
}): ReactElement => {
  const hasEntity = !loading && !!crown.entity;
  const hoverClass = hasEntity ? crownHoverAnimations[crown.type] : undefined;

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasEntity) {
        return;
      }
      if (crown.type === 'fastest-rising') {
        restartRocket(e.currentTarget, crown.glowColor);
      } else if (crown.type === 'most-discussed') {
        restartSoundPulse(e.currentTarget);
      } else if (crown.type === 'most-controversial') {
        restartFlame(e.currentTarget);
      } else if (crown.type === 'developers-choice') {
        restartMedal(e.currentTarget);
      } else {
        restartIconAnimation(e.currentTarget, crown.type);
        if (crown.type === 'most-loved') {
          restartBloom(e.currentTarget);
        } else {
          randomizeSparks(e.currentTarget);
        }
      }
    },
    [hasEntity, crown.glowColor, crown.type],
  );

  return (
    <div
      className={classNames(
        'group relative flex min-w-[170px] flex-1 flex-col items-center gap-2 overflow-hidden rounded-16 border p-3 tablet:min-w-[180px] tablet:gap-3 tablet:p-5',
        'border-border-subtlest-tertiary transition-shadow duration-300',
        hoverClass,
      )}
      style={
        hasEntity
          ? {
              boxShadow: `0 0 30px color-mix(in srgb, ${crown.glowColor} 12%, transparent), inset 0 1px 0 color-mix(in srgb, ${crown.glowColor} 19%, transparent)`,
            }
          : undefined
      }
      onMouseEnter={handleMouseEnter}
    >
      {/* Animated gradient glow that breathes */}
      {hasEntity && (
        <div
          className="group-hover:!opacity-30 pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-300"
          style={{
            backgroundColor: crown.glowColor,
            animation: 'pulse 3s ease-in-out infinite',
            opacity: 0.15,
          }}
        />
      )}

      {/* Crown icon + label */}
      <div className="flex flex-col items-center gap-1">
        <div className="crown-icon-wrapper relative transition-transform duration-300">
          <crown.icon
            size={IconSize.Large}
            secondary={hasEntity}
            className={classNames(
              hasEntity ? crown.iconColor : 'text-text-quaternary',
            )}
          />
          {/* Spark particles — burst from icon visual center on hover */}
          {hasEntity &&
            crown.type !== 'most-loved' &&
            crown.type !== 'fastest-rising' &&
            crown.type !== 'most-discussed' &&
            crown.type !== 'most-controversial' &&
            crown.type !== 'developers-choice' && (
              <div className="z-10 pointer-events-none absolute inset-0">
                {Array.from({ length: SPARK_CONFIG.count }, (_, i) => (
                  <div
                    key={i}
                    className="crown-spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
                    style={{ backgroundColor: crown.glowColor }}
                  />
                ))}
              </div>
            )}
          {/* Flame glow + embers for most-controversial */}
          {hasEntity && crown.type === 'most-controversial' && (
            <>
              <div
                className="crown-flame-glow pointer-events-none absolute left-1/2 top-[45%] h-[165%] w-[165%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
                style={{
                  background: `radial-gradient(circle, color-mix(in srgb, ${crown.glowColor} 48%, var(--theme-accent-cheese-default)) 0%, color-mix(in srgb, ${crown.glowColor} 30%, transparent) 42%, transparent 72%)`,
                }}
              />
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="crown-flame-ember absolute left-1/2 top-[52%] h-[3px] w-[3px] rounded-full opacity-0"
                    style={{
                      backgroundColor:
                        i % 2 === 0
                          ? 'var(--theme-accent-cheese-default)'
                          : crown.glowColor,
                      boxShadow:
                        i % 2 === 0
                          ? '0 0 4px color-mix(in srgb, var(--theme-accent-cheese-default) 85%, transparent)'
                          : `0 0 4px color-mix(in srgb, ${crown.glowColor} 85%, transparent)`,
                    }}
                  />
                ))}
              </div>
            </>
          )}
          {/* Medal sheen + glints for developers-choice */}
          {hasEntity && crown.type === 'developers-choice' && (
            <>
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                <div
                  className="crown-medal-sheen absolute left-1/2 top-1/2 h-[155%] w-[42%] -translate-x-[170%] -translate-y-1/2 rotate-[18deg] opacity-0"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--theme-accent-cheese-default) 85%, white) 50%, transparent 100%)',
                    filter: 'blur(1px)',
                  }}
                />
              </div>
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 2 }, (_, i) => (
                  <div
                    key={i}
                    className="crown-medal-glint absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full opacity-0"
                    style={{
                      backgroundColor: 'var(--theme-accent-cheese-default)',
                      boxShadow:
                        '0 0 4px color-mix(in srgb, var(--theme-accent-cheese-default) 90%, white)',
                    }}
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 16 }, (_, i) => (
                  <div
                    key={i}
                    className="crown-medal-particle z-10 absolute left-1/2 top-1/2 h-[4px] w-[4px] rounded-full opacity-0"
                    style={{
                      backgroundColor:
                        i % 3 === 0
                          ? 'white'
                          : 'var(--theme-accent-cheese-default)',
                      boxShadow:
                        '0 0 8px color-mix(in srgb, var(--theme-accent-cheese-default) 98%, white)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
          {/* Subtle ripple-side particles for megaphone */}
          {hasEntity && crown.type === 'most-discussed' && (
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="crown-sound-particle absolute left-1/2 top-1/2 h-[2px] w-[2px] rounded-full opacity-0"
                  style={{ backgroundColor: crown.glowColor }}
                />
              ))}
            </div>
          )}
          {/* Warm bloom — radial glow from icon center on hover */}
          {hasEntity && crown.type === 'most-loved' && (
            <div
              className="crown-bloom pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
              style={{
                width: '260%',
                height: '260%',
                background: `radial-gradient(circle, color-mix(in srgb, ${crown.glowColor} 50%, white) 0%, color-mix(in srgb, ${crown.glowColor} 30%, transparent) 40%, transparent 70%)`,
              }}
            />
          )}
        </div>
        <span
          className="text-center tracking-wider typo-caption2 tablet:typo-caption1"
          style={hasEntity ? { color: crown.glowColor } : undefined}
        >
          {crown.label}
        </span>
      </div>

      {/* Tool info */}
      <div className="flex h-7 items-center gap-1.5 tablet:h-8 tablet:gap-2">
        {loading ? (
          <>
            <Placeholder className="h-6 w-6 shrink-0 rounded-8 tablet:h-8 tablet:w-8" />
            <Placeholder className="h-4 w-16 tablet:h-5 tablet:w-20" />
          </>
        ) : (
          <>
            <img
              src={crown.entity?.logo}
              alt={crown.entity?.name}
              className="h-6 w-6 shrink-0 rounded-8 bg-surface-float object-cover tablet:h-8 tablet:w-8"
            />
            <span className="truncate font-bold text-text-primary typo-callout">
              {crown.entity?.name}
            </span>
          </>
        )}
      </div>

      {/* Stat line */}
      <div className="flex h-5 items-center">
        {loading ? (
          <Placeholder className="h-4 w-16" />
        ) : (
          <span className="text-text-tertiary typo-caption1">{crown.stat}</span>
        )}
      </div>
    </div>
  );
};

export const ArenaCrownCards = ({
  crowns,
  loading,
}: ArenaCrownCardsProps): ReactElement => (
  <>
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes crown-icon-pop {
            0% { transform: scale(1) rotate(0deg); }
            15% { transform: scale(1.18) rotate(-8deg); }
            30% { transform: scale(1.05) rotate(2deg); }
            45% { transform: scale(1.1) rotate(-3deg); }
            60% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes crown-spark {
            0% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
            ${SPARK_CONFIG.burstPct}% { opacity: var(--spark-peak, 0.9); transform: translate(calc(-50% + var(--spark-bx, 0px)),calc(-50% + var(--spark-by, -16px))) scale(0.7); }
            100% { transform: translate(calc(-50% + var(--spark-fx, 0px)),calc(-50% + var(--spark-fy, -26px))) scale(0); opacity: 0; }
          }
          .crown-spark { opacity: 0; }
          @keyframes crown-icon-bloom-pulse {
            0% { transform: scale(1); }
            30% { transform: scale(1.1); }
            60% { transform: scale(1); }
            100% { transform: scale(1); }
          }
          @keyframes crown-bloom {
            0% { transform: translate(-50%,-50%) scale(0.2); opacity: 0; }
            20% { opacity: 1; }
            45% { transform: translate(-50%,-50%) scale(0.9); opacity: 0.85; }
            100% { transform: translate(-50%,-50%) scale(1.15); opacity: 0; }
          }
          .crown-bloom { opacity: 0; }
          .crown-hover-most-loved:hover {
            box-shadow:
              0 0 40px color-mix(in srgb, var(--theme-accent-cabbage-default) 22%, transparent),
              inset 0 1px 0 color-mix(in srgb, var(--theme-accent-cabbage-default) 30%, transparent) !important;
          }
          @keyframes crown-icon-rocket {
            0% { transform: translate(0, 0); }
            18% { transform: translate(var(--rocket-dx, 3px), var(--rocket-dy, -3px)); }
            45% { transform: translate(var(--rocket-dx, 3px), var(--rocket-dy, -3px)); }
            75% { transform: translate(0, 0); }
            100% { transform: translate(0, 0); }
          }
          @keyframes crown-arrow-extend {
            0% { transform: rotate(-45deg) scaleY(1) scaleX(1) rotate(45deg); }
            15% { transform: rotate(-45deg) scaleY(1.25) scaleX(0.95) rotate(45deg); }
            50% { transform: rotate(-45deg) scaleY(1.25) scaleX(0.95) rotate(45deg); }
            80% { transform: rotate(-45deg) scaleY(1) scaleX(1) rotate(45deg); }
            100% { transform: rotate(-45deg) scaleY(1) scaleX(1) rotate(45deg); }
          }
          @keyframes crown-ghost {
            0% {
              transform: translate(0, 0) rotate(var(--ghost-angle, 225deg)) scaleY(1) rotate(calc(var(--ghost-angle, 225deg) * -1));
              opacity: 0;
            }
            12% {
              transform: translate(var(--ghost-tx, -3px), var(--ghost-ty, 3px)) rotate(var(--ghost-angle, 225deg)) scaleY(var(--ghost-stretch, 1.2)) rotate(calc(var(--ghost-angle, 225deg) * -1));
              opacity: var(--ghost-peak, 0.3);
            }
            55% {
              transform: translate(var(--ghost-tx, -3px), var(--ghost-ty, 3px)) rotate(var(--ghost-angle, 225deg)) scaleY(var(--ghost-stretch, 1.2)) rotate(calc(var(--ghost-angle, 225deg) * -1));
              opacity: var(--ghost-peak, 0.3);
            }
            100% {
              transform: translate(var(--ghost-tx, -3px), var(--ghost-ty, 3px)) rotate(var(--ghost-angle, 225deg)) scaleY(var(--ghost-stretch, 1.2)) rotate(calc(var(--ghost-angle, 225deg) * -1));
              opacity: 0;
            }
          }
          @keyframes crown-icon-megaphone {
            0% { transform: rotate(0deg) translateX(0); }
            18% { transform: rotate(-5deg) translateX(-2px); }
            40% { transform: rotate(2deg) translateX(1px); }
            60% { transform: rotate(0deg) translateX(0); }
            100% { transform: rotate(0deg) translateX(0); }
          }
          @keyframes crown-sound-ripple {
            0% { transform: rotate(-53deg) translateX(0) scale(1) rotate(53deg); opacity: 1; }
            65% { transform: rotate(-53deg) translateX(6px) scale(1.08) rotate(53deg); opacity: 0; }
            99.9% { transform: rotate(-53deg) translateX(6px) scale(1.08) rotate(53deg); opacity: 0; }
            100% { transform: rotate(-53deg) translateX(0) scale(1) rotate(53deg); opacity: 1; }
          }
          @keyframes crown-sound-particle {
            0% {
              transform: translate(var(--sound-particle-sx, 10px), var(--sound-particle-sy, 0px)) scale(0.8);
              opacity: 0;
            }
            28% {
              transform: translate(var(--sound-particle-sx, 10px), var(--sound-particle-sy, 0px)) scale(1);
              opacity: var(--sound-particle-peak, 0.3);
            }
            100% {
              transform: translate(var(--sound-particle-ex, 14px), var(--sound-particle-ey, 0px)) scale(0.65);
              opacity: 0;
            }
          }
          @keyframes crown-icon-flame {
            0% { transform: translate(0, 0) rotate(0deg) scaleX(1) scaleY(1); }
            16% { transform: translate(-0.5px, -1.2px) rotate(-1.8deg) scaleX(0.96) scaleY(1.1); }
            33% { transform: translate(0.6px, -1.8px) rotate(1.3deg) scaleX(1.04) scaleY(1.13); }
            50% { transform: translate(-0.4px, -0.9px) rotate(-0.9deg) scaleX(0.98) scaleY(1.07); }
            72% { transform: translate(0.5px, -1.5px) rotate(1.1deg) scaleX(1.03) scaleY(1.1); }
            100% { transform: translate(0, 0) rotate(0deg) scaleX(1) scaleY(1); }
          }
          @keyframes crown-flame-glow {
            0% { transform: translate(-50%,-50%) scale(0.85); opacity: 0; }
            30% { transform: translate(-50%,-50%) scale(1.04); opacity: 0.38; }
            65% { transform: translate(-50%,-50%) scale(1.14); opacity: 0.24; }
            100% { transform: translate(-50%,-50%) scale(1.14); opacity: 0; }
          }
          @keyframes crown-flame-ember {
            0% {
              transform: translate(var(--flame-ember-sx, 0px), var(--flame-ember-sy, 0px)) scale(0.7);
              opacity: 0;
            }
            25% {
              transform: translate(var(--flame-ember-sx, 0px), var(--flame-ember-sy, 0px)) scale(1);
              opacity: var(--flame-ember-peak, 0.5);
            }
            55% {
              transform: translate(
                calc(var(--flame-ember-sx, 0px) + (var(--flame-ember-ex, 2px) - var(--flame-ember-sx, 0px)) * 0.45),
                calc(var(--flame-ember-sy, 0px) + (var(--flame-ember-ey, -10px) - var(--flame-ember-sy, 0px)) * 0.45)
              ) scale(0.78);
              opacity: calc(var(--flame-ember-peak, 0.5) * 0.7);
            }
            100% {
              transform: translate(var(--flame-ember-ex, 2px), var(--flame-ember-ey, -10px)) scale(0.4);
              opacity: 0;
            }
          }
          @keyframes crown-icon-medal {
            0% { transform: rotate(0deg) scale(1); }
            20% { transform: rotate(-6deg) scale(1.06); }
            44% { transform: rotate(2.2deg) scale(1.02); }
            64% { transform: rotate(-1deg) scale(1.01); }
            100% { transform: rotate(0deg) scale(1); }
          }
          @keyframes crown-medal-sheen {
            0% {
              transform: translate(-170%, -50%) rotate(18deg);
              opacity: 0;
            }
            20% {
              opacity: 0.5;
            }
            70% {
              transform: translate(20%, -50%) rotate(18deg);
              opacity: 0.35;
            }
            100% {
              transform: translate(65%, -50%) rotate(18deg);
              opacity: 0;
            }
          }
          @keyframes crown-medal-glint {
            0% {
              transform: translate(var(--medal-glint-x, 0px), var(--medal-glint-y, 0px)) scale(0.5);
              opacity: 0;
            }
            45% {
              transform: translate(var(--medal-glint-x, 0px), var(--medal-glint-y, 0px)) scale(1.2);
              opacity: 0.75;
            }
            100% {
              transform: translate(var(--medal-glint-x, 0px), var(--medal-glint-y, 0px)) scale(0.7);
              opacity: 0;
            }
          }
          @keyframes crown-medal-particle {
            0% {
              transform: translate(var(--medal-particle-sx, 0px), var(--medal-particle-sy, 0px)) scale(0.5);
              opacity: 0;
            }
            35% {
              transform: translate(var(--medal-particle-sx, 0px), var(--medal-particle-sy, 0px)) scale(1);
              opacity: var(--medal-particle-peak, 0.78);
            }
            58% {
              transform: translate(
                calc(var(--medal-particle-sx, 0px) + (var(--medal-particle-ex, 0px) - var(--medal-particle-sx, 0px)) * 0.5),
                calc(var(--medal-particle-sy, 0px) + (var(--medal-particle-ey, 0px) - var(--medal-particle-sy, 0px)) * 0.5)
              ) scale(0.82);
              opacity: calc(var(--medal-particle-peak, 0.78) * 0.6);
            }
            100% {
              transform: translate(var(--medal-particle-ex, 0px), var(--medal-particle-ey, 0px)) scale(0.38);
              opacity: 0;
            }
          }
          .crown-hover-most-discussed:hover {
            box-shadow:
              0 0 40px color-mix(in srgb, var(--theme-accent-blueCheese-default) 22%, transparent),
              inset 0 1px 0 color-mix(in srgb, var(--theme-accent-blueCheese-default) 30%, transparent) !important;
          }
          .crown-hover-developers-choice:hover {
            box-shadow:
              0 0 40px color-mix(in srgb, var(--theme-accent-cheese-default) 22%, transparent),
              inset 0 1px 0 color-mix(in srgb, var(--theme-accent-cheese-default) 30%, transparent) !important;
          }
          .crown-hover-most-controversial:hover {
            box-shadow:
              0 0 40px color-mix(in srgb, var(--theme-accent-ketchup-default) 22%, transparent),
              inset 0 1px 0 color-mix(in srgb, var(--theme-accent-ketchup-default) 30%, transparent) !important;
          }
          .crown-hover-fastest-rising:hover {
            box-shadow:
              0 0 40px color-mix(in srgb, var(--theme-accent-avocado-default) 22%, transparent),
              inset 0 1px 0 color-mix(in srgb, var(--theme-accent-avocado-default) 30%, transparent) !important;
          }
        `,
      }}
    />
    <div className="flex gap-3 overflow-x-auto pb-2 tablet:grid tablet:grid-cols-5 tablet:overflow-visible">
      {crowns.map((crown) => (
        <CrownCard key={crown.type} crown={crown} loading={loading} />
      ))}
    </div>
  </>
);
