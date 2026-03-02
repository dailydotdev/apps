import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { RankedTool } from './types';
import { ArenaSparkline } from './ArenaSparkline';
import { ArenaSentimentBar } from './ArenaSentimentBar';
import { ArenaAnimatedCounter } from './ArenaAnimatedCounter';
import { formatDIndex, formatVolume } from './arenaMetrics';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { InfoIcon } from '../../../components/icons/Info';
import { IconSize } from '../../../components/Icon';
import { RankBadge } from '../../../components/cards/Leaderboard/RankBadge';

interface ArenaRankingsProps {
  tools: RankedTool[];
  loading?: boolean;
}

const Placeholder = ({ className }: { className?: string }): ReactElement => (
  <div
    className={classNames(
      'animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

const getMomentumDisplay = (
  momentum: number,
): { text: string; color: string; cssColor: string } => {
  if (momentum > 0) {
    return {
      text: `+${momentum}%`,
      color: 'text-accent-avocado-default',
      cssColor: 'var(--theme-accent-avocado-default)',
    };
  }
  if (momentum < 0) {
    return {
      text: `${momentum}%`,
      color: 'text-accent-ketchup-default',
      cssColor: 'var(--theme-accent-ketchup-default)',
    };
  }
  return {
    text: '0%',
    color: 'text-text-quaternary',
    cssColor: 'var(--theme-text-quaternary)',
  };
};

const ChevronIcon = ({ expanded }: { expanded: boolean }): ReactElement => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={classNames(
      'shrink-0 text-text-quaternary transition-transform duration-200 laptop:hidden',
      expanded && 'rotate-180',
    )}
  >
    <path
      d="M4 6l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RankingRow = ({
  tool,
  rank,
  loading,
  expanded,
  onToggle,
}: {
  tool: RankedTool;
  rank: number;
  loading?: boolean;
  expanded: boolean;
  onToggle: () => void;
}): ReactElement => {
  const momentum = getMomentumDisplay(tool.momentum);

  return (
    <div
      className={classNames(
        'group relative border-b border-border-subtlest-tertiary transition-all duration-500 hover:bg-surface-hover',
        rank <= 3 && 'bg-surface-float',
      )}
      style={{
        order: rank,
        transition: 'transform 0.5s ease, background-color 0.3s ease',
      }}
    >
      {/* Main row — clickable on mobile to expand */}
      <button
        type="button"
        className="flex min-h-[52px] w-full items-center gap-3 py-3 pl-2 pr-4 text-left laptop:cursor-default"
        onClick={onToggle}
      >
        {/* Rank */}
        <RankBadge
          rank={rank}
          className="relative flex w-8 shrink-0 items-center justify-center laptop:w-10"
        />

        {/* Tool info */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 laptop:w-[140px] laptop:flex-none laptop:shrink-0">
          {loading ? (
            <>
              <Placeholder className="h-7 w-7 shrink-0 rounded-8" />
              <Placeholder className="h-4 w-20" />
            </>
          ) : (
            <>
              <img
                src={tool.entity.logo}
                alt={tool.entity.name}
                className="h-7 w-7 shrink-0 rounded-8 bg-surface-float object-cover"
              />
              <span className="truncate font-bold text-text-primary typo-callout">
                {tool.entity.name}
              </span>
            </>
          )}
        </div>

        {/* D-Index */}
        <div className="flex shrink-0 items-center laptop:min-w-[80px]">
          {loading ? (
            <Placeholder className="h-5 w-12" />
          ) : (
            <ArenaAnimatedCounter
              value={tool.dIndex}
              format={formatDIndex}
              className="font-bold tabular-nums text-text-primary typo-callout"
            />
          )}
        </div>

        {/* Volume — laptop+ inline */}
        <div className="hidden min-w-[60px] shrink-0 items-center laptop:flex">
          {loading ? (
            <Placeholder className="h-4 w-10" />
          ) : (
            <span className="text-text-tertiary typo-caption1">
              {formatVolume(tool.volume24h)}
            </span>
          )}
        </div>

        {/* Sentiment — tablet+ inline */}
        <div className="hidden min-w-[100px] shrink-0 items-center tablet:flex laptop:flex">
          {loading ? (
            <Placeholder className="h-4 w-20" />
          ) : (
            <ArenaSentimentBar value={tool.sentimentDisplay} />
          )}
        </div>

        {/* Momentum — laptop+ inline */}
        <div className="hidden min-w-[80px] shrink-0 items-center laptop:flex">
          {loading ? (
            <Placeholder className="h-4 w-14" />
          ) : (
            <span
              className={classNames('font-bold typo-caption1', momentum.color)}
            >
              {momentum.text}
            </span>
          )}
        </div>

        {/* Sparkline — laptop+ inline */}
        <div className="ml-auto hidden items-center laptop:flex">
          {loading ? (
            <Placeholder className="h-6 w-16" />
          ) : (
            <ArenaSparkline data={tool.sparkline} color={momentum.cssColor} />
          )}
        </div>

        {/* Expand chevron — mobile/tablet only */}
        {!loading && <ChevronIcon expanded={expanded} />}
      </button>

      {/* Expanded detail panel — mobile/tablet only */}
      {expanded && !loading && (
        <div className="bg-surface-float/50 flex flex-col gap-3 border-t border-border-subtlest-tertiary px-4 py-3 laptop:hidden">
          <div className="grid grid-cols-3 gap-3 tablet:grid-cols-2">
            {/* Sentiment — shown on mobile (hidden on tablet since it's inline) */}
            <div className="flex flex-col gap-1 tablet:hidden">
              <span className="font-bold uppercase tracking-wider text-text-disabled typo-caption2">
                Sentiment
              </span>
              <ArenaSentimentBar value={tool.sentimentDisplay} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold uppercase tracking-wider text-text-disabled typo-caption2">
                24h Vol
              </span>
              <span className="text-text-tertiary typo-caption1">
                {formatVolume(tool.volume24h)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold uppercase tracking-wider text-text-disabled typo-caption2">
                Momentum
              </span>
              <span
                className={classNames(
                  'font-bold typo-caption1',
                  momentum.color,
                )}
              >
                {momentum.text}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold uppercase tracking-wider text-text-disabled typo-caption2">
              7d Trend
            </span>
            <ArenaSparkline
              data={tool.sparkline}
              width={200}
              height={32}
              color={momentum.cssColor}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EmergingRow = ({
  tool,
  loading,
}: {
  tool: RankedTool;
  loading?: boolean;
}): ReactElement => (
  <div className="flex items-center gap-2.5 px-4 py-2.5 opacity-50">
    {loading ? (
      <>
        <Placeholder className="h-6 w-6 rounded-8" />
        <Placeholder className="h-4 w-20" />
      </>
    ) : (
      <>
        <img
          src={tool.entity.logo}
          alt={tool.entity.name}
          className="opacity-60 h-6 w-6 rounded-8 bg-surface-float object-cover"
        />
        <span className="text-text-tertiary typo-callout">
          {tool.entity.name}
        </span>
      </>
    )}
    {!loading && (
      <span className="ml-auto text-text-tertiary typo-caption2">
        Not enough data yet
      </span>
    )}
  </div>
);

const HeaderWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}): ReactElement => (
  <Tooltip content={tooltip}>
    <span className="inline-flex cursor-help items-center gap-1">
      {label}
      <InfoIcon size={IconSize.XXSmall} className="text-text-disabled" />
    </span>
  </Tooltip>
);

const PLACEHOLDER_ROW_COUNT = 6;

const PlaceholderRow = ({ rank }: { rank: number }): ReactElement => (
  <div
    className={classNames(
      'flex min-h-[52px] items-center gap-3 border-b border-border-subtlest-tertiary py-3 pl-2 pr-4',
      rank <= 3 && 'bg-surface-float',
    )}
  >
    <div className="flex w-8 shrink-0 items-center justify-center laptop:w-10">
      <Placeholder className="h-5 w-5" />
    </div>
    <div className="flex min-w-0 flex-1 items-center gap-2.5 laptop:w-[140px] laptop:flex-none laptop:shrink-0">
      <Placeholder className="h-7 w-7 shrink-0 rounded-8" />
      <Placeholder className="h-4 w-20" />
    </div>
    <div className="shrink-0 laptop:min-w-[80px]">
      <Placeholder className="h-5 w-12" />
    </div>
    <div className="hidden min-w-[60px] shrink-0 laptop:block">
      <Placeholder className="h-4 w-10" />
    </div>
    <div className="hidden min-w-[100px] shrink-0 tablet:block">
      <Placeholder className="h-4 w-20" />
    </div>
    <div className="hidden min-w-[80px] shrink-0 laptop:block">
      <Placeholder className="h-4 w-14" />
    </div>
    <div className="ml-auto hidden laptop:block">
      <Placeholder className="h-6 w-16" />
    </div>
    <div className="w-4 shrink-0 laptop:hidden" />
  </div>
);

export const ArenaRankings = ({
  tools,
  loading,
}: ArenaRankingsProps): ReactElement => {
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);
  const established = tools.filter((t) => !t.isEmerging);
  const emerging = tools.filter((t) => t.isEmerging);
  const showPlaceholderRows = loading && established.length === 0;

  return (
    <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtlest-tertiary py-2.5 pl-2 pr-4">
        <span className="w-8 shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:w-10">
          &nbsp;
        </span>
        <span className="flex-1 font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:w-[140px] laptop:flex-none laptop:shrink-0">
          Tool
        </span>
        <span className="shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:min-w-[80px]">
          <HeaderWithTooltip
            label="D-Index"
            tooltip="Developer sentiment score combining mention volume and sentiment strength"
          />
        </span>
        <span className="hidden min-w-[60px] shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:block">
          <HeaderWithTooltip
            label="24h Vol"
            tooltip="Total developer mentions in the last 24 hours"
          />
        </span>
        <span className="hidden min-w-[100px] shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2 tablet:block">
          <HeaderWithTooltip
            label="Sentiment"
            tooltip="How positively developers talk about this tool (0–100)"
          />
        </span>
        <span className="hidden min-w-[80px] shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:block">
          <HeaderWithTooltip
            label="Momentum"
            tooltip="D-Index change compared to the previous 24-hour window"
          />
        </span>
        <span className="ml-auto hidden font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:block">
          7d Trend
        </span>
        {/* Spacer for chevron column on mobile */}
        <span className="w-4 shrink-0 laptop:hidden" />
      </div>

      {/* Ranked rows */}
      <div className="flex flex-col">
        {showPlaceholderRows
          ? Array.from({ length: PLACEHOLDER_ROW_COUNT }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <PlaceholderRow key={i} rank={i + 1} />
            ))
          : established.map((tool, idx) => (
              <RankingRow
                key={tool.entity.entity}
                tool={tool}
                rank={idx + 1}
                loading={loading}
                expanded={expandedEntity === tool.entity.entity}
                onToggle={() =>
                  setExpandedEntity((prev) =>
                    prev === tool.entity.entity ? null : tool.entity.entity,
                  )
                }
              />
            ))}
      </div>

      {/* Emerging section */}
      {emerging.length > 0 && (
        <>
          <div className="flex items-center border-t border-border-subtlest-tertiary px-4 py-2">
            <span className="font-bold uppercase tracking-wider text-text-disabled typo-caption2">
              Emerging
            </span>
          </div>
          {emerging.map((tool) => (
            <EmergingRow
              key={tool.entity.entity}
              tool={tool}
              loading={loading}
            />
          ))}
        </>
      )}
    </div>
  );
};
