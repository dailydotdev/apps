import type { ReactNode } from 'react';
import classed from '../../../lib/classed';

export interface LeaderboardListContainerProps {
  title: string;
  titleHref?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  header?: ReactNode;
}

export const LeaderboardCard = classed(
  'div',
  'flex flex-1 flex-col border-b border-border-subtlest-tertiary p-4 tablet:rounded-12 tablet:border tablet:bg-surface-float',
);

export interface TopRankStyle {
  iconColor: string;
  glowColor: string;
  hoverClass: string;
}

export const TOP_RANK_STYLES: TopRankStyle[] = [
  {
    iconColor: 'text-accent-cheese-default',
    glowColor: 'var(--theme-accent-cheese-default)',
    hoverClass: 'leaderboard-rank-gold',
  },
  {
    iconColor: 'text-text-tertiary',
    glowColor: 'var(--theme-text-tertiary)',
    hoverClass: 'leaderboard-rank-silver',
  },
  {
    iconColor: 'text-accent-bacon-default',
    glowColor: 'var(--theme-accent-bacon-default)',
    hoverClass: 'leaderboard-rank-bronze',
  },
];

const forceReflow = (element: Element): void => {
  element.getBoundingClientRect();
};

export const runSparkAnimation = (
  container: HTMLElement,
  selector: string,
  glowColor: string,
  radius: number,
): void => {
  const sparks = container.querySelectorAll<HTMLElement>(selector);
  sparks.forEach((el, i) => {
    const { style } = el;
    const slot = 360 / Math.max(sparks.length, 1);
    const jitter = (Math.random() - 0.5) * slot * 0.4;
    const angle = i * slot + jitter;
    const rad = (angle * Math.PI) / 180;
    const r = radius + Math.random() * (radius * 0.4);

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

export const runIconPopAnimation = (
  container: HTMLElement,
  wrapperClass: string,
): void => {
  const iconWrapper = container.querySelector<HTMLElement>(`.${wrapperClass}`);
  if (!iconWrapper) {
    return;
  }

  iconWrapper.style.animation = 'none';
  forceReflow(iconWrapper);
  iconWrapper.style.animation = 'crown-icon-pop 0.8s ease-out';
};
