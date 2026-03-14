import type { CrownType } from './types';

export const CROWN_SPARK_COUNT = 7;

export const crownHoverAnimations: Partial<Record<CrownType, string>> = {
  'developers-choice': 'crown-hover-developers-choice',
  'most-loved': 'crown-hover-most-loved',
  'fastest-rising': 'crown-hover-fastest-rising',
  'most-discussed': 'crown-hover-most-discussed',
  'most-controversial': 'crown-hover-most-controversial',
};

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

const SPARK_CONFIG = {
  count: CROWN_SPARK_COUNT,
  radius: 30,
  burstRatio: 0.65,
  angleMin: -50,
  angleMax: 50,
  duration: 1.2,
  staggerMax: 0.08,
};

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
    const isFullCircle = angleRange >= 360;
    const slots = isFullCircle ? count : Math.max(count - 1, 1);
    const slotWidth = angleRange / slots;
    const baseAngle = angleMin + (i / slots) * angleRange;
    const jitter = (Math.random() - 0.5) * slotWidth * 0.4;
    const angle = baseAngle + jitter;
    const rad = (angle * Math.PI) / 180;

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

const restartBloom = (card: HTMLElement): void => {
  const bloom = card.querySelector<HTMLElement>('.crown-bloom');
  if (!bloom) {
    return;
  }

  restartAnimation(bloom, 'crown-bloom 1.4s ease-in-out forwards');
};

const GHOST_CONFIG = {
  count: 5,
  spacing: 6,
  blur: [0.5, 1, 1.8, 2.8, 4],
  opacities: [0.5, 0.38, 0.26, 0.15, 0.07],
  stretch: [1.08, 1.14, 1.2, 1.28, 1.36],
  lungeDist: [7, 11],
  lungeAngle: [38, 52],
  duration: 0.9,
};

const restartRocket = (card: HTMLElement, glowColor: string): void => {
  const iconWrapper = card.querySelector<HTMLElement>('.crown-icon-wrapper');
  if (!iconWrapper) {
    return;
  }

  iconWrapper.querySelectorAll('.crown-ghost').forEach((el) => el.remove());

  const svg = iconWrapper.querySelector<SVGElement>(':scope > svg');
  if (!svg) {
    return;
  }

  svg.style.animation = 'none';
  forceReflow(svg);

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

  const trailDx = -Math.cos(angleRad);
  const trailDy = Math.sin(angleRad);
  const trailAngleDeg = angleDeg + 180;

  for (let i = 0; i < count; i += 1) {
    const ghost = svg.cloneNode(true) as SVGElement;
    ghost.classList.add('crown-ghost');
    const { style } = ghost;
    style.position = 'absolute';
    style.inset = '0';
    style.pointerEvents = 'none';
    style.opacity = '0';
    style.color = glowColor;

    const ghostBlur = blur[i] ?? blur[blur.length - 1];
    const ghostStretch = stretch[i] ?? stretch[stretch.length - 1];
    style.filter = `blur(${ghostBlur}px)`;
    style.transformOrigin = '50% 50%';

    const offset = spacing * (i + 1);
    style.setProperty('--ghost-tx', `${(trailDx * offset).toFixed(1)}px`);
    style.setProperty('--ghost-ty', `${(trailDy * offset).toFixed(1)}px`);
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

  iconWrapper.style.setProperty(
    '--rocket-dx',
    `${(Math.cos(angleRad) * dist).toFixed(1)}px`,
  );
  iconWrapper.style.setProperty(
    '--rocket-dy',
    `${(-Math.sin(angleRad) * dist).toFixed(1)}px`,
  );

  restartAnimation(
    iconWrapper,
    `crown-icon-rocket ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
  );

  svg.style.transformOrigin = '15% 75%';
  svg.style.animation = `crown-arrow-extend ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`;

  setTimeout(() => {
    iconWrapper.querySelectorAll('.crown-ghost').forEach((el) => el.remove());
  }, duration * 1000 + 50);
};

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

export const runCrownMouseEnterAnimation = (
  card: HTMLElement,
  crownType: CrownType,
  glowColor: string,
): void => {
  if (crownType === 'fastest-rising') {
    restartRocket(card, glowColor);
    return;
  }

  if (crownType === 'most-discussed') {
    restartSoundPulse(card);
    return;
  }

  if (crownType === 'most-controversial') {
    restartFlame(card);
    return;
  }

  if (crownType === 'developers-choice') {
    restartMedal(card);
    return;
  }

  restartIconAnimation(card, crownType);

  if (crownType === 'most-loved') {
    restartBloom(card);
    return;
  }

  randomizeSparks(card);
};
