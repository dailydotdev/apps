import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArenaIcon } from '../../../components/icons/Arena';
import { InfoIcon } from '../../../components/icons/Info';
import { IconSize } from '../../../components/Icon';
import { ButtonSize } from '../../../components/buttons/Button';
import { ArenaAnimatedCounter } from './ArenaAnimatedCounter';
import Link from '../../../components/utilities/Link';
import { Dropdown } from '../../../components/fields/Dropdown';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { ArenaCrownCards } from './ArenaCrownCards';
import { ArenaHighlightsFeed } from './ArenaHighlightsFeed';
import { ArenaComparisonChart } from './ArenaComparisonChart';
import { arenaEntityOptions } from './queries';
import type { ArenaComparisonMetric, ArenaTab } from './types';
import {
  COMPARISON_METRIC_OPTIONS,
  computeComparisonSeries,
  computeCrowns,
  computeRankings,
  formatDIndex,
  formatVolume,
} from './arenaMetrics';

interface ArenaEntityPageProps {
  entityId: string;
  tab: ArenaTab;
}

const MetricLabel = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip?: string;
}): ReactElement => {
  if (!tooltip) {
    return (
      <span className="font-bold uppercase tracking-wider text-text-disabled typo-caption2">
        {label}
      </span>
    );
  }

  return (
    <Tooltip content={tooltip}>
      <span className="inline-flex cursor-help items-center gap-1 font-bold uppercase tracking-wider text-text-disabled typo-caption2">
        {label}
        <InfoIcon size={IconSize.XXSmall} className="text-text-disabled" />
      </span>
    </Tooltip>
  );
};

const MetricWidget = ({
  label,
  tooltip,
  value,
}: {
  label: string;
  tooltip?: string;
  value: ReactElement;
}): ReactElement => (
  <div className="rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-4 py-3">
    <MetricLabel label={label} tooltip={tooltip} />
    <div className="mt-2 min-h-[2.25rem]">{value}</div>
  </div>
);

export const ArenaEntityPage = ({
  entityId,
  tab,
}: ArenaEntityPageProps): ReactElement => {
  const [comparisonMetric, setComparisonMetric] =
    useState<ArenaComparisonMetric>('d-index');

  const { data, isFetching } = useQuery(
    arenaEntityOptions({ groupId: tab, entityId }),
  );
  const rankings = useMemo(
    () =>
      data?.sentimentTimeSeries && data.sentimentGroup
        ? computeRankings(
            data.sentimentTimeSeries.entities.nodes,
            data.sentimentGroup.entities,
            data.sentimentTimeSeries.resolutionSeconds,
          )
        : [],
    [data?.sentimentTimeSeries, data?.sentimentGroup],
  );
  const selectedEntity = rankings.find(
    (item) => item.entity.entity === entityId,
  );
  const rank = selectedEntity
    ? rankings.findIndex(
        (item) => item.entity.entity === selectedEntity.entity.entity,
      ) + 1
    : 0;
  const crowns = computeCrowns(rankings).filter(
    (crown) => crown.entity?.entity === entityId,
  );
  const highlights = data?.sentimentHighlights.items ?? [];
  const selectedNode = data?.sentimentTimeSeries.entities.nodes.find(
    (node) => node.entity === entityId,
  );
  const comparisonSeries =
    selectedEntity && selectedNode && data
      ? computeComparisonSeries({
          nodes: [selectedNode],
          rankings: [selectedEntity],
          metric: comparisonMetric,
          resolutionSeconds: data.sentimentTimeSeries.resolutionSeconds,
          topN: 1,
        })
      : [];

  const isLoading = isFetching && !data;
  let momentumClass = 'text-text-quaternary';
  if (selectedEntity?.momentum && selectedEntity.momentum > 0) {
    momentumClass = 'text-accent-avocado-default';
  } else if (selectedEntity?.momentum && selectedEntity.momentum < 0) {
    momentumClass = 'text-accent-ketchup-default';
  }
  const momentumText = selectedEntity
    ? `${selectedEntity.momentum > 0 ? '+' : ''}${selectedEntity.momentum}%`
    : '0%';

  if (!selectedEntity) {
    return (
      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-4 py-6 laptop:px-6 laptop:py-10 laptopL:px-0">
        <header className="pb-4">
          <div className="flex flex-col gap-3 laptop:flex-row laptop:items-start">
            <div className="flex items-center gap-3">
              <ArenaIcon
                size={IconSize.XXLarge}
                className="text-text-primary"
              />
              <div className="flex flex-col">
                <h1 className="font-bold text-text-primary typo-title2 laptop:typo-title1">
                  The Arena
                </h1>
                <p className="text-text-tertiary typo-footnote">
                  Where AI tools fight for developer love
                </p>
              </div>
            </div>
            <div className="laptop:ml-auto">
              <Link href="/agents/arena">
                <a className="text-text-link typo-callout">
                  &larr; Back to Arena
                </a>
              </Link>
            </div>
          </div>
        </header>
        <div className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5">
          <h2 className="font-bold text-text-primary typo-title3">
            Agent not found
          </h2>
          <p className="mt-2 text-text-tertiary typo-callout">
            We could not find this entity in the Arena rankings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow bg-accent-cabbage-default/10 absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="animate-float-slow-reverse bg-accent-onion-default/[0.08] absolute -right-32 -top-16 h-64 w-64 rounded-full blur-3xl" />
        <div className="animate-float-slow-delayed bg-accent-water-default/[0.06] absolute -bottom-20 left-1/3 h-48 w-48 rounded-full blur-3xl" />
      </div>

      <nav className="sticky top-0 z-3 mt-4 flex items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-4 py-2.5 laptop:px-6 laptopL:px-0">
        <Link href="/agents/arena">
          <a className="mr-1 whitespace-nowrap text-text-link typo-callout">
            &larr; Back
          </a>
        </Link>
        <img
          src={selectedEntity.entity.logo}
          alt={selectedEntity.entity.name}
          className="h-7 w-7 rounded-8 bg-surface-float object-cover"
        />
        <span className="truncate font-bold text-text-primary typo-callout">
          {selectedEntity.entity.name}
        </span>
        <span className="text-text-tertiary typo-caption1">
          #{rank} in {tab === 'llms' ? 'LLMs' : 'Coding Agents'}
        </span>
      </nav>

      <div className="flex flex-col gap-4 px-4 py-6 laptop:px-6 laptopL:px-0">
        <section className="grid grid-cols-2 gap-3 laptop:grid-cols-4">
          <MetricWidget
            label="D-Index"
            tooltip="Developer sentiment score combining mention volume and sentiment strength"
            value={
              <span className="font-bold tabular-nums text-text-primary typo-title3">
                <ArenaAnimatedCounter
                  value={selectedEntity.dIndex}
                  format={formatDIndex}
                />
              </span>
            }
          />
          <MetricWidget
            label="24h Vol"
            tooltip="Total developer mentions in the last 24 hours"
            value={
              <span className="font-bold text-text-tertiary typo-title3">
                {formatVolume(selectedEntity.volume24h)}
              </span>
            }
          />
          <MetricWidget
            label="Sentiment"
            tooltip="How positively developers talk about this tool (0-100)"
            value={
              <span className="font-bold text-text-primary typo-title3">
                {selectedEntity.sentimentDisplay}
              </span>
            }
          />
          <MetricWidget
            label="Momentum"
            tooltip="D-Index change compared to the previous 24-hour window"
            value={
              <span className={`font-bold typo-title3 ${momentumClass}`}>
                {momentumText}
              </span>
            }
          />
        </section>

        {crowns.length > 0 && (
          <section>
            <h2 className="mb-2 font-bold text-text-primary typo-callout">
              Current Crown{crowns.length > 1 ? 's' : ''}
            </h2>
            <ArenaCrownCards
              crowns={crowns}
              tab={tab}
              loading={isLoading}
              compact
              hideEntityName
            />
          </section>
        )}

        <div className="flex flex-col gap-6 laptopL:grid laptopL:grid-cols-[3fr_2fr]">
          <section className="min-w-0">
            <ArenaComparisonChart
              series={comparisonSeries}
              metric={comparisonMetric}
              title="Last 7 days trend"
              tab={tab}
              tall
              fixedTabletLayout
              loading={isLoading}
              metricControl={
                <div className="w-full tablet:w-[10rem]">
                  <Dropdown
                    selectedIndex={COMPARISON_METRIC_OPTIONS.findIndex(
                      (option) => option.value === comparisonMetric,
                    )}
                    options={COMPARISON_METRIC_OPTIONS.map(
                      (option) => option.label,
                    )}
                    onChange={(_, index) =>
                      setComparisonMetric(
                        COMPARISON_METRIC_OPTIONS[index].value,
                      )
                    }
                    buttonSize={ButtonSize.Small}
                    placeholder="Metric"
                  />
                </div>
              }
            />
          </section>
          <aside className="relative">
            <div className="laptopL:absolute laptopL:inset-0">
              <ArenaHighlightsFeed
                items={highlights}
                tab={tab}
                loading={isLoading}
                responsiveLimit={false}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
