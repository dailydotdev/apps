import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { ArenaIcon } from '../../../components/icons/Arena';
import { HomeIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Dropdown } from '../../../components/fields/Dropdown';
import type { ArenaTab } from './types';
import { ARENA_TABS } from './config';
import {
  COMPARISON_METRIC_OPTIONS,
  computeComparisonSeries,
  computeRankings,
  computeCrowns,
} from './arenaMetrics';
import { ArenaCrownCards } from './ArenaCrownCards';
import { ArenaRankings } from './ArenaRankings';
import { ArenaHighlightsFeed } from './ArenaHighlightsFeed';
import { ArenaComparisonChart } from './ArenaComparisonChart';
import { arenaOptions } from './queries';
import Link from '../../../components/utilities/Link';

interface ArenaPageProps {
  activeTab: ArenaTab;
  onTabChange?: (tab: ArenaTab) => void;
  headerAside?: ReactElement;
}

const LiveIndicator = (): ReactElement => (
  <div className="flex items-center gap-1.5">
    <span className="inline-block h-2 w-2 animate-scale-down-pulse rounded-full bg-accent-avocado-default shadow-[0_0_6px_var(--theme-accent-avocado-default)]" />
    <span className="text-accent-avocado-default typo-caption2">Live</span>
  </div>
);

export const ArenaPage = ({
  activeTab,
  onTabChange,
  headerAside,
}: ArenaPageProps): ReactElement => {
  const { data, isFetching } = useQuery(arenaOptions({ groupId: activeTab }));
  const [rankingsView, setRankingsView] = useState<'table' | 'comparison'>(
    'table',
  );
  const [comparisonMetric, setComparisonMetric] =
    useState<(typeof COMPARISON_METRIC_OPTIONS)[number]['value']>('d-index');

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

  const crowns = useMemo(() => computeCrowns(rankings), [rankings]);
  const loading = isFetching && !data;
  const comparisonSeries = useMemo(() => {
    if (!data?.sentimentTimeSeries) {
      return [];
    }

    return computeComparisonSeries({
      nodes: data.sentimentTimeSeries.entities.nodes,
      rankings,
      metric: comparisonMetric,
      resolutionSeconds: data.sentimentTimeSeries.resolutionSeconds,
    });
  }, [comparisonMetric, data?.sentimentTimeSeries, rankings]);

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow bg-accent-cabbage-default/10 absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="animate-float-slow-reverse bg-accent-onion-default/[0.08] absolute -right-32 -top-16 h-64 w-64 rounded-full blur-3xl" />
        <div className="animate-float-slow-delayed bg-accent-water-default/[0.06] absolute -bottom-20 left-1/3 h-48 w-48 rounded-full blur-3xl" />
      </div>

      <header className="px-4 pt-6 laptop:px-6 laptop:pt-10 laptopL:px-0">
        <nav
          aria-label="breadcrumbs"
          className="hidden h-10 items-center gap-0.5 laptop:flex"
        >
          <ol className="flex items-center gap-0.5">
            <li className="flex items-center gap-0.5">
              <Button
                variant={ButtonVariant.Tertiary}
                icon={<HomeIcon secondary />}
                tag="a"
                href={process.env.NEXT_PUBLIC_WEBAPP_URL}
                size={ButtonSize.XSmall}
              />
              <span aria-hidden>/</span>
            </li>
            <li className="flex items-center gap-0.5">
              <Link href="/agents">
                <a className="rounded-8 px-2 py-1.5 text-text-secondary transition-colors typo-callout hover:text-text-primary">
                  Agentic Hub
                </a>
              </Link>
              <span aria-hidden>/</span>
            </li>
            <li
              className="flex items-center gap-1 px-2 font-bold text-text-primary typo-callout"
              aria-current="page"
            >
              The Arena
            </li>
          </ol>
        </nav>
        <div className="flex flex-col gap-3 laptop:flex-row laptop:items-start">
          <div className="flex items-center gap-3">
            <ArenaIcon size={IconSize.XXLarge} className="text-text-primary" />
            <div className="flex flex-col">
              <h1 className="font-bold text-text-primary typo-title2 laptop:typo-title1">
                The Arena
              </h1>
              <p className="text-text-tertiary typo-footnote">
                Where AI tools fight for developer love
              </p>
            </div>
          </div>
          {headerAside && <div className="laptop:ml-auto">{headerAside}</div>}
        </div>
      </header>

      <nav className="sticky top-0 z-3 mt-4 flex items-center gap-1 border-b border-border-subtlest-tertiary bg-background-default px-4 laptop:px-6 laptopL:px-0">
        {ARENA_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange?.(tab.value)}
            className={classNames(
              'relative rounded-t-12 px-4 py-2.5 font-bold transition-colors typo-callout',
              activeTab === tab.value
                ? 'bg-surface-float text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {tab.label}
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-4 bg-text-primary" />
            )}
          </button>
        ))}
        <div className="ml-auto">
          <LiveIndicator />
        </div>
      </nav>

      <div className="flex flex-col gap-4 px-4 py-6 laptop:px-6 laptopL:px-0">
        <section>
          <ArenaCrownCards crowns={crowns} tab={activeTab} loading={loading} />
        </section>

        <section className="-my-1 flex items-center justify-start">
          <ButtonGroup>
            <Button
              type="button"
              variant={
                rankingsView === 'table'
                  ? ButtonVariant.Float
                  : ButtonVariant.Tertiary
              }
              size={ButtonSize.Small}
              onClick={() => setRankingsView('table')}
            >
              Table
            </Button>
            <Button
              type="button"
              variant={
                rankingsView === 'comparison'
                  ? ButtonVariant.Float
                  : ButtonVariant.Tertiary
              }
              size={ButtonSize.Small}
              onClick={() => setRankingsView('comparison')}
            >
              Comparison
            </Button>
          </ButtonGroup>
        </section>

        <div className="flex flex-col gap-6 laptopL:grid laptopL:grid-cols-[3fr_2fr]">
          <section className="min-w-0">
            {rankingsView === 'comparison' ? (
              <ArenaComparisonChart
                series={comparisonSeries}
                metric={comparisonMetric}
                tab={activeTab}
                loading={loading}
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
            ) : (
              <ArenaRankings
                tools={rankings}
                tab={activeTab}
                loading={loading}
              />
            )}
          </section>
          <aside className="relative">
            <div className="laptopL:absolute laptopL:inset-0">
              <ArenaHighlightsFeed
                key={activeTab}
                items={data?.sentimentHighlights?.items ?? []}
                tab={activeTab}
                loading={loading}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
