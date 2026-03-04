import type { ReactElement } from 'react';
import React from 'react';
import { ArenaIcon } from '../../../components/icons/Arena';
import { IconSize } from '../../../components/Icon';
import LogoIcon from '../../../svg/LogoIcon';
import LogoText from '../../../svg/LogoText';
import { ArenaCrownCards } from './ArenaCrownCards';
import { ARENA_COMPARISON_LINE_COLORS } from './arenaComparisonChartConstants';
import { MedalBadgeIcon } from '../../../components/icons/MedalBadge';
import { StarIcon } from '../../../components/icons/Star';
import { TrendingIcon } from '../../../components/icons/Trending';
import { MegaphoneIcon } from '../../../components/icons/Megaphone';
import { HotIcon } from '../../../components/icons/Hot';
import type { CrownData, CrownType } from './types';

interface ArenaDailySocialTool {
  logo: string;
  name: string;
  dIndex: number;
  sentiment: number;
  momentum: number;
  trend: number[];
}

interface ArenaDailySocialCrown {
  type: CrownType;
  label: string;
  stat: string;
  entityName?: string;
  entityLogo?: string;
}

interface ArenaDailySocialCardProps {
  title: string;
  subtitle?: string;
  updatedAtLabel: string;
  sourceUrl: string;
  tools: ArenaDailySocialTool[];
  crowns: ArenaDailySocialCrown[];
  animated?: boolean;
}

const CROWN_VISUALS: Record<
  CrownType,
  Pick<CrownData, 'icon' | 'iconColor' | 'glowColor'>
> = {
  'developers-choice': {
    icon: MedalBadgeIcon,
    iconColor: 'text-accent-cheese-default',
    glowColor: 'var(--theme-accent-cheese-default)',
  },
  'most-loved': {
    icon: StarIcon,
    iconColor: 'text-accent-cabbage-default',
    glowColor: 'var(--theme-accent-cabbage-default)',
  },
  'fastest-rising': {
    icon: TrendingIcon,
    iconColor: 'text-accent-avocado-default',
    glowColor: 'var(--theme-accent-avocado-default)',
  },
  'most-discussed': {
    icon: MegaphoneIcon,
    iconColor: 'text-accent-blueCheese-default',
    glowColor: 'var(--theme-accent-blueCheese-default)',
  },
  'most-controversial': {
    icon: HotIcon,
    iconColor: 'text-accent-ketchup-default',
    glowColor: 'var(--theme-accent-ketchup-default)',
  },
};

export const ArenaDailySocialCard = ({
  title,
  subtitle,
  updatedAtLabel,
  sourceUrl,
  tools,
  crowns,
  animated = true,
}: ArenaDailySocialCardProps): ReactElement => {
  const fallbackTool: ArenaDailySocialTool = {
    logo: '',
    name: 'N/A',
    dIndex: 0,
    sentiment: 50,
    momentum: 0,
    trend: [0, 0, 0, 0, 0, 0, 0],
  };
  const rankedTools = [...tools].sort((a, b) => b.dIndex - a.dIndex);
  const chartTools = rankedTools.slice(0, 5);
  const safeChartTools = chartTools.length > 0 ? chartTools : [fallbackTool];
  const crownCards: CrownData[] = crowns.map((crown) => ({
    type: crown.type,
    icon: CROWN_VISUALS[crown.type].icon,
    iconColor: CROWN_VISUALS[crown.type].iconColor,
    glowColor: CROWN_VISUALS[crown.type].glowColor,
    label: crown.label,
    entity: crown.entityName
      ? {
          entity: crown.entityName.toLowerCase().replace(/\s+/g, '-'),
          name: crown.entityName,
          logo: crown.entityLogo ?? '',
        }
      : null,
    stat: crown.stat,
  }));
  const pointCount = Math.max(
    ...safeChartTools.map((tool) => tool.trend.length),
    1,
  );
  const allValues = chartTools.flatMap((tool) => tool.trend);
  const chartValues = allValues.length > 0 ? allValues : [0];
  const minValue = Math.min(...chartValues, 0);
  const maxRawValue = Math.max(...chartValues, 100);
  const maxValue = maxRawValue === minValue ? minValue + 1 : maxRawValue;

  const chartWidth = 760;
  const chartHeight = 180;
  const padding = { top: 16, right: 120, bottom: 26, left: 30 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;
  const yTicks = 4;

  const getX = (index: number): number =>
    padding.left + (index / Math.max(pointCount - 1, 1)) * graphWidth;
  const getY = (value: number): number =>
    padding.top + ((maxValue - value) / (maxValue - minValue)) * graphHeight;
  const labelTop = padding.top + 8;
  const labelBottom = chartHeight - padding.bottom - 6;
  const labelGap = 14;
  const chartLabelYByIndex = (() => {
    const positioned = safeChartTools
      .map((tool, lineIndex) => {
        const lastIndex = tool.trend.length - 1;
        const lastValue = tool.trend[lastIndex] ?? 0;
        return {
          lineIndex,
          y: getY(lastValue) - 3,
        };
      })
      .sort((a, b) => a.y - b.y);

    if (positioned.length === 0) {
      return [];
    }

    const labelYs = positioned.map(() => labelTop);
    let lastLabelY = labelTop - labelGap;
    positioned.forEach((item, index) => {
      labelYs[index] = Math.max(item.y, lastLabelY + labelGap);
      lastLabelY = labelYs[index];
    });

    const overflow = lastLabelY - labelBottom;
    const adjustedForBottom = labelYs.map((labelY) =>
      overflow > 0 ? labelY - overflow : labelY,
    );
    const topUnderflow = labelTop - adjustedForBottom[0];
    const normalizedLabelYs = adjustedForBottom.map((labelY) =>
      topUnderflow > 0 ? labelY + topUnderflow : labelY,
    );

    const byIndex = new Array(safeChartTools.length).fill(labelTop);
    positioned.forEach((item, index) => {
      byIndex[item.lineIndex] = normalizedLabelYs[index];
    });

    return byIndex;
  })();

  return (
    <div
      className="relative h-[42.1875rem] w-[75rem] overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default text-text-primary"
      id="arena_daily_social_card"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="opacity-25 absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,var(--theme-accent-cabbage-default)_0%,transparent_55%),radial-gradient(90%_70%_at_100%_10%,var(--theme-accent-onion-default)_0%,transparent_60%),radial-gradient(80%_70%_at_50%_100%,var(--theme-accent-water-default)_0%,transparent_55%)]" />
        <div
          className={`bg-accent-cabbage-default/25 absolute -left-16 top-20 h-72 w-72 rounded-full blur-3xl ${
            animated ? 'animate-float-slow' : ''
          }`}
        />
        <div
          className={`bg-accent-onion-default/20 absolute right-8 top-16 h-80 w-80 rounded-full blur-3xl ${
            animated ? 'animate-float-slow-reverse' : ''
          }`}
        />
        <div
          className={`bg-accent-water-default/20 absolute -bottom-24 left-1/4 h-96 w-96 rounded-full blur-3xl ${
            animated ? 'animate-float-slow-delayed' : ''
          }`}
        />
        <div className="via-accent-cheese-default/20 absolute -right-40 top-1/3 h-40 w-[52rem] -rotate-12 bg-gradient-to-r from-transparent to-transparent blur-2xl" />
        <div className="opacity-60 absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--theme-static-transparent)_0%,var(--theme-background-default)_70%)]" />
      </div>

      <div className="relative flex h-full flex-col gap-4 p-6">
        <header className="bg-surface-float/70 relative overflow-hidden rounded-18 p-5">
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ArenaIcon
                size={IconSize.Medium}
                secondary
                className="text-text-primary"
              />
              <span className="font-bold text-text-primary typo-callout">
                The Arena
              </span>
              <span className="text-text-quaternary">×</span>
              <LogoIcon className={{ container: 'h-4 w-auto' }} />
              <LogoText className={{ container: 'h-3.5 w-auto' }} />
            </div>
            <div className="text-text-secondary typo-footnote">
              {updatedAtLabel}
            </div>
          </div>

          <h1 className="relative mt-4 max-w-[50rem] text-text-primary typo-mega2">
            {title}
          </h1>
          {subtitle && (
            <p className="relative mt-1 text-text-secondary typo-callout">
              {subtitle}
            </p>
          )}
        </header>

        <div className="mx-auto -mt-1 w-full max-w-[62rem]">
          <ArenaCrownCards
            crowns={crownCards}
            animated={animated}
            forceGrid
            compact
          />
        </div>

        <div className="flex-1">
          <div className="bg-surface-float/70 relative overflow-hidden rounded-16 border border-border-subtlest-tertiary p-4 shadow-2">
            <div className="from-accent-water-default/5 to-accent-onion-default/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold text-text-primary typo-callout">
                D-Index trend (7d)
              </span>
            </div>

            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-auto w-full"
            >
              {Array.from({ length: yTicks }, (_, index) => {
                const y = padding.top + (index / (yTicks - 1)) * graphHeight;
                const tickValue =
                  maxValue - (index / (yTicks - 1)) * (maxValue - minValue);
                return (
                  <g key={`tick-${tickValue}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + graphWidth}
                      y2={y}
                      stroke="var(--theme-border-subtlest-tertiary)"
                      strokeDasharray="4 6"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-text-tertiary typo-caption2"
                    >
                      {Math.round(tickValue)}
                    </text>
                  </g>
                );
              })}

              {safeChartTools.map((tool, lineIndex) => {
                const color =
                  ARENA_COMPARISON_LINE_COLORS[
                    lineIndex % ARENA_COMPARISON_LINE_COLORS.length
                  ];
                const path = tool.trend.reduce((acc, value, index) => {
                  const command = index === 0 ? 'M' : 'L';
                  return `${acc}${command}${getX(index)},${getY(value)}`;
                }, '');
                const lastIndex = tool.trend.length - 1;
                const lastValue = tool.trend[lastIndex] ?? 0;

                return (
                  <g key={tool.name}>
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.25}
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx={getX(lastIndex)}
                      cy={getY(lastValue)}
                      r={3.5}
                      fill={color}
                    />
                    <text
                      x={getX(lastIndex) + 10}
                      y={chartLabelYByIndex[lineIndex]}
                      textAnchor="start"
                      className="font-bold typo-caption2"
                      fill={color}
                      style={{
                        paintOrder: 'stroke',
                        stroke: 'var(--theme-background-default)',
                        strokeWidth: 3,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      }}
                    >
                      {tool.name}
                    </text>
                  </g>
                );
              })}

              {Array.from({ length: pointCount }, (_, index) => (
                <text
                  key={`x-${index}`}
                  x={getX(index)}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="fill-text-tertiary typo-caption2"
                >
                  {index === pointCount - 1
                    ? 'Now'
                    : `${pointCount - index - 1}d ago`}
                </text>
              ))}
            </svg>
          </div>
        </div>

        <div className="text-right text-text-tertiary typo-footnote">
          {sourceUrl}
        </div>
      </div>
    </div>
  );
};
