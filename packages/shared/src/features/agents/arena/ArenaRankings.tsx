import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { RankedTool } from './types';
import { ArenaSparkline } from './ArenaSparkline';
import { ArenaSentimentBar } from './ArenaSentimentBar';
import { ArenaAnimatedCounter } from './ArenaAnimatedCounter';
import { formatDIndex, formatVolume } from './dindex';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { InfoIcon } from '../../../components/icons/Info';
import { IconSize } from '../../../components/Icon';

interface ArenaRankingsProps {
  tools: RankedTool[];
  loading?: boolean;
}

const RANK_MEDALS = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];

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
): { text: string; color: string } => {
  if (momentum > 0) {
    return {
      text: `\u25B2 +${momentum}%`,
      color: 'text-accent-avocado-default',
    };
  }
  if (momentum < 0) {
    return {
      text: `\u25BC ${momentum}%`,
      color: 'text-accent-ketchup-default',
    };
  }
  return { text: '\u2501 0%', color: 'text-text-quaternary' };
};

const RankingRow = ({
  tool,
  rank,
  loading,
}: {
  tool: RankedTool;
  rank: number;
  loading?: boolean;
}): ReactElement => {
  const momentum = getMomentumDisplay(tool.momentum);
  const medal = RANK_MEDALS[rank - 1] || '';
  const isHot = !loading && tool.volume24h > 500;

  return (
    <div
      className={classNames(
        'group relative flex min-h-[52px] items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3 transition-all duration-500 hover:bg-surface-hover',
        rank <= 3 && 'bg-surface-float',
      )}
      style={{
        order: rank,
        transition: 'transform 0.5s ease, background-color 0.3s ease',
      }}
    >
      {/* Activity heat - left border glow */}
      {isHot && (
        <div
          className="absolute bottom-0 left-0 top-0 w-0.5 animate-pulse rounded-full"
          style={{ backgroundColor: tool.entity.brandColor }}
        />
      )}

      {/* Rank */}
      <div className="flex w-10 shrink-0 items-center justify-center">
        {medal ? (
          <span className="text-lg">{medal}</span>
        ) : (
          <span className="font-bold text-text-quaternary typo-callout">
            {rank}
          </span>
        )}
      </div>

      {/* Tool info */}
      <div className="flex w-[140px] shrink-0 items-center gap-2.5">
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
      <div className="flex min-w-[80px] shrink-0 items-center">
        {loading ? (
          <Placeholder className="h-5 w-12" />
        ) : (
          <ArenaAnimatedCounter
            value={tool.dIndex}
            format={formatDIndex}
            className="font-bold tabular-nums text-text-primary typo-title3"
          />
        )}
      </div>

      {/* Sentiment */}
      <div className="hidden min-w-[100px] shrink-0 items-center tablet:flex">
        {loading ? (
          <Placeholder className="h-4 w-20" />
        ) : (
          <ArenaSentimentBar value={tool.sentimentDisplay} />
        )}
      </div>

      {/* Momentum */}
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

      {/* Volume */}
      <div className="hidden min-w-[60px] shrink-0 items-center laptop:flex">
        {loading ? (
          <Placeholder className="h-4 w-10" />
        ) : (
          <span className="text-text-tertiary typo-caption1">
            {formatVolume(tool.volume24h)}
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div className="ml-auto hidden items-center laptop:flex">
        {loading ? (
          <Placeholder className="h-6 w-16" />
        ) : (
          <ArenaSparkline
            data={tool.sparkline}
            color={tool.entity.brandColor}
          />
        )}
      </div>
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
  <div className="flex items-center gap-3 px-4 py-2.5 opacity-50">
    <div className="w-10 shrink-0" />
    <div className="flex items-center gap-2.5">
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
    </div>
    {!loading && (
      <span className="ml-auto text-text-disabled typo-caption2">
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
      'flex min-h-[52px] items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3',
      rank <= 3 && 'bg-surface-float',
    )}
  >
    <div className="flex w-10 shrink-0 items-center justify-center">
      <Placeholder className="h-5 w-5" />
    </div>
    <div className="flex w-[140px] shrink-0 items-center gap-2.5">
      <Placeholder className="h-7 w-7 shrink-0 rounded-8" />
      <Placeholder className="h-4 w-20" />
    </div>
    <div className="min-w-[80px] shrink-0">
      <Placeholder className="h-5 w-12" />
    </div>
    <div className="hidden min-w-[100px] shrink-0 tablet:block">
      <Placeholder className="h-4 w-20" />
    </div>
    <div className="hidden min-w-[80px] shrink-0 laptop:block">
      <Placeholder className="h-4 w-14" />
    </div>
    <div className="hidden min-w-[60px] shrink-0 laptop:block">
      <Placeholder className="h-4 w-10" />
    </div>
    <div className="ml-auto hidden laptop:block">
      <Placeholder className="h-6 w-16" />
    </div>
  </div>
);

export const ArenaRankings = ({
  tools,
  loading,
}: ArenaRankingsProps): ReactElement => {
  const established = tools.filter((t) => !t.isEmerging);
  const emerging = tools.filter((t) => t.isEmerging);
  const showPlaceholderRows = loading && established.length === 0;

  return (
    <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtlest-secondary px-4 py-2.5">
        <span className="w-10 shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2">
          #
        </span>
        <span className="w-[140px] shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2">
          Tool
        </span>
        <span className="min-w-[80px] shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2">
          <HeaderWithTooltip
            label="D-Index"
            tooltip="Developer sentiment score combining mention volume and sentiment strength"
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
        <span className="hidden min-w-[60px] shrink-0 font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:block">
          <HeaderWithTooltip
            label="24h Vol"
            tooltip="Total developer mentions in the last 24 hours"
          />
        </span>
        <span className="ml-auto hidden font-bold uppercase tracking-wider text-text-disabled typo-caption2 laptop:block">
          7d Trend
        </span>
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
              />
            ))}
      </div>

      {/* Emerging section */}
      {emerging.length > 0 && (
        <>
          <div className="flex items-center gap-3 border-t border-border-subtlest-secondary px-4 py-2">
            <span className="font-bold uppercase tracking-wider text-text-disabled typo-caption2">
              Emerging
            </span>
            <div className="h-px flex-1 bg-border-subtlest-tertiary" />
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
