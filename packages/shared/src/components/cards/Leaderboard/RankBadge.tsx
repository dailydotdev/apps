import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { MedalBadgeIcon } from '../../icons/MedalBadge';
import { IconSize } from '../../Icon';

const RANK_STYLES = [
  {
    iconColor: 'text-accent-cheese-default',
    glowColor: 'var(--theme-accent-cheese-default)',
  },
  {
    iconColor: 'text-text-tertiary',
    glowColor: 'var(--theme-text-tertiary)',
  },
  {
    iconColor: 'text-accent-bacon-default',
    glowColor: 'var(--theme-accent-bacon-default)',
  },
];

const SPARK_COUNT = 5;

const forceReflow = (element: Element): void => {
  element.getBoundingClientRect();
};

const runAnimation = (container: HTMLElement, glowColor: string): void => {
  const iconWrapper = container.querySelector<HTMLElement>(
    '.rank-badge-wrapper',
  );
  if (iconWrapper) {
    iconWrapper.style.animation = 'none';
    forceReflow(iconWrapper);
    iconWrapper.style.animation = 'crown-icon-pop 0.8s ease-out';
  }

  const sparks = container.querySelectorAll<HTMLElement>('.rank-badge-spark');
  sparks.forEach((el, i) => {
    const { style } = el;
    const slot = 360 / Math.max(sparks.length, 1);
    const jitter = (Math.random() - 0.5) * slot * 0.4;
    const angle = i * slot + jitter;
    const rad = (angle * Math.PI) / 180;
    const r = 16 + Math.random() * 6;

    style.setProperty('--spark-fx', `${Math.round(Math.sin(rad) * r)}px`);
    style.setProperty('--spark-fy', `${Math.round(-Math.cos(rad) * r)}px`);
    style.backgroundColor = glowColor;

    style.animation = 'none';
    forceReflow(el);
    style.animation = `leaderboard-medal-spark 0.7s ease-out ${(
      Math.random() * 0.06
    ).toFixed(2)}s forwards`;
  });
};

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps): ReactElement {
  const style = RANK_STYLES[rank - 1];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !style) {
      return undefined;
    }

    const groupParent = container.closest('.group');
    if (!groupParent) {
      return undefined;
    }

    const handler = (): void => {
      runAnimation(container, style.glowColor);
    };

    groupParent.addEventListener('mouseenter', handler);
    return () => {
      groupParent.removeEventListener('mouseenter', handler);
    };
  }, [style]);

  if (!style) {
    return (
      <div className={className}>
        <span className="font-bold text-text-quaternary typo-callout">
          {rank}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: style.glowColor }}
      />
      <div className="rank-badge-wrapper relative transition-transform duration-300">
        <MedalBadgeIcon
          size={IconSize.Small}
          secondary
          className={style.iconColor}
        />
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: SPARK_COUNT }, (_, i) => (
            <div
              key={i}
              className="rank-badge-spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full opacity-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
