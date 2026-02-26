import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { ArenaIcon } from '../../../components/icons/Arena';
import { IconSize } from '../../../components/Icon';
import type { ArenaTab } from './types';
import { ARENA_TABS } from './config';
import { computeRankings, computeCrowns } from './dindex';
import { ArenaCrownCards } from './ArenaCrownCards';
import { ArenaRankings } from './ArenaRankings';
import { ArenaHighlightsFeed } from './ArenaHighlightsFeed';
import { arenaOptions } from './queries';

interface ArenaPageProps {
  initialTab?: ArenaTab;
  onTabChange?: (tab: ArenaTab) => void;
}

const LiveIndicator = (): ReactElement => (
  <div className="flex items-center gap-1.5">
    <span className="inline-block h-2 w-2 animate-scale-down-pulse rounded-full bg-accent-avocado-default shadow-[0_0_6px_var(--theme-accent-avocado-default)]" />
    <span className="text-accent-avocado-default typo-caption2">Live</span>
  </div>
);

export const ArenaPage = ({
  initialTab = 'coding-agents',
  onTabChange,
}: ArenaPageProps): ReactElement => {
  const [activeTab, setActiveTab] = useState<ArenaTab>(initialTab);
  const { data, isFetching } = useQuery(arenaOptions({ groupId: activeTab }));

  const timeSeries = data?.sentimentTimeSeries;

  const rankings = useMemo(
    () =>
      timeSeries ? computeRankings(timeSeries.entities.nodes, activeTab) : [],
    [timeSeries, activeTab],
  );

  const crowns = useMemo(() => computeCrowns(rankings), [rankings]);

  const loading = isFetching && !data;

  const handleTabChange = (tab: ArenaTab): void => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col">
      {/* Animated ambient glows that drift — clipped to prevent mobile overflow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="bg-accent-cabbage-default/10 absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            animation: 'float-slow 20s ease-in-out infinite',
          }}
        />
        <div
          className="bg-accent-onion-default/[0.08] absolute -right-32 -top-16 h-64 w-64 rounded-full blur-3xl"
          style={{
            animation: 'float-slow 25s ease-in-out infinite reverse',
          }}
        />
        <div
          className="bg-accent-water-default/[0.06] absolute -bottom-20 left-1/3 h-48 w-48 rounded-full blur-3xl"
          style={{
            animation: 'float-slow 18s ease-in-out infinite 5s',
          }}
        />
      </div>

      {/* Inline keyframes for custom animations */}
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float-slow {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(15px, -10px) scale(1.05); }
              66% { transform: translate(-10px, 8px) scale(0.95); }
            }
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `,
        }}
      />

      {/* Header */}
      <header className="px-4 pt-6 laptop:px-6 laptop:pt-10 laptopL:px-0">
        <div className="flex items-center gap-3">
          <ArenaIcon size={IconSize.XLarge} className="text-text-primary" />
          <div className="flex flex-col">
            <h1 className="font-bold text-text-primary typo-title2 laptop:typo-title1">
              The Arena
            </h1>
            <p className="text-text-tertiary typo-footnote">
              Where AI tools fight for developer love
            </p>
          </div>
        </div>
      </header>

      {/* Tab switcher */}
      <nav className="sticky top-0 z-3 mt-4 flex items-center gap-1 border-b border-border-subtlest-tertiary bg-background-default px-4 laptop:px-6 laptopL:px-0">
        {ARENA_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
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

      {/* Content */}
      <div className="flex flex-col gap-6 px-4 py-6 laptop:px-6 laptopL:px-0">
        {/* Crown cards — full width */}
        <section>
          <ArenaCrownCards crowns={crowns} loading={loading} />
        </section>

        {/* Side-by-side: Rankings + Highlights feed */}
        <div className="flex flex-col gap-6 laptopL:grid laptopL:grid-cols-[3fr_2fr]">
          <section className="min-w-0">
            <ArenaRankings tools={rankings} loading={loading} />
          </section>
          <aside className="relative">
            <div className="laptopL:absolute laptopL:inset-0">
              <ArenaHighlightsFeed
                key={activeTab}
                items={data?.sentimentHighlights?.items ?? []}
                loading={loading}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
