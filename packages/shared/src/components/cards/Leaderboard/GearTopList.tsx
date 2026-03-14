import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { GearCategory, PopularGearItem } from '../../../graphql/user/gear';
import {
  GEAR_CATEGORY_LABELS,
  GEAR_CATEGORY_STYLES,
} from '../../../graphql/user/gear';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { IconSize } from '../../Icon';
import { RankBadge } from './RankBadge';

const HEADER_SPARK_COUNT = 6;

const forceReflow = (element: Element): void => {
  element.getBoundingClientRect();
};

const runSparkAnimation = (
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

const runIconPopAnimation = (
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

const GearCategoryHeader = ({
  category,
}: {
  category: GearCategory;
}): ReactElement => {
  const style = GEAR_CATEGORY_STYLES[category];
  const CategoryIcon = style.icon;
  const label = GEAR_CATEGORY_LABELS[category];

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const header = e.currentTarget;
      runIconPopAnimation(header, 'gear-category-icon-wrapper');
      runSparkAnimation(header, '.gear-header-spark', style.glowColor, 20);
    },
    [style.glowColor],
  );

  return (
    <div
      className="group/header mb-3 flex items-center gap-3"
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative flex items-center justify-center">
        <div
          className="group-hover/header:opacity-25 pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-lg transition-opacity duration-300"
          style={{ backgroundColor: style.glowColor }}
        />
        <div className="gear-category-icon-wrapper relative transition-transform duration-300">
          <CategoryIcon
            size={IconSize.XLarge}
            secondary
            className={style.iconColor}
          />
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: HEADER_SPARK_COUNT }, (_, i) => (
              <div
                key={i}
                className="gear-header-spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full opacity-0"
              />
            ))}
          </div>
        </div>
      </div>
      <h3 className="font-bold text-text-primary typo-title2">{label}</h3>
    </div>
  );
};

interface GearTopListProps extends CommonLeaderboardProps<PopularGearItem[]> {
  category?: GearCategory;
}

const RANK_HOVER_CLASSES = [
  'gear-rank-gold',
  'gear-rank-silver',
  'gear-rank-bronze',
];

export function GearTopList({
  items,
  footer,
  category,
  ...props
}: GearTopListProps): ReactElement {
  const header = category ? (
    <GearCategoryHeader category={category} />
  ) : undefined;

  return (
    <LeaderboardList {...props} footer={footer} header={header}>
      {items?.map((item, i) => {
        const isTop3 = i < 3;
        const hoverClass = RANK_HOVER_CLASSES[i];

        return (
          <li
            key={item.gearId}
            className={classNames(
              'group flex items-center gap-2 rounded-8 py-2 pr-3 transition-all duration-300 hover:bg-surface-hover',
              isTop3 && 'relative bg-surface-float',
              isTop3 && i === 0 && 'border-accent-cheese-default/20 border',
              hoverClass,
            )}
          >
            <RankBadge
              rank={i + 1}
              className="relative flex w-8 shrink-0 items-center justify-center"
            />
            <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-callout">
              {item.name}
            </span>
            <span className="ml-2 shrink-0 text-text-quaternary typo-caption2">
              {largeNumberFormat(item.userCount)}{' '}
              {item.userCount === 1 ? 'user' : 'users'}
            </span>
          </li>
        );
      })}
    </LeaderboardList>
  );
}
