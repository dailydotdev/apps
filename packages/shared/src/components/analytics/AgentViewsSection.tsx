import type { ReactElement } from 'react';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Typography, TypographyType } from '../typography/Typography';
import { DataTile } from '../DataTile';
import { Button } from '../buttons/Button';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/common';
import { ArrowIcon } from '../icons';
import { largeNumberFormat } from '../../lib/numberFormat';
import type { AnalyticsNumberList } from './common';
import { AnalyticsNumbersList } from './AnalyticsNumbersList';
import { LegendToggle } from './LegendToggle';
import type { AgentViewsHistoryItem, AgentViewsValues } from './agentViews';
import {
  AgentViewsSeries,
  agentViewsTotalSeries,
  agentViewsVendorSeries,
} from './agentViews';

const AgentViewsChart = dynamic(
  () => import('./AgentViewsChart').then((mod) => mod.AgentViewsChart),
  {
    loading: () => <div className="h-40 w-full" />,
  },
);

const AgentDot = ({
  colorClassName,
}: {
  colorClassName: string;
}): ReactElement => (
  <span className={classNames('size-2 rounded-full', colorClassName)} />
);

export type AgentViewsSectionProps = {
  analytics: AgentViewsValues | undefined;
  history: AgentViewsHistoryItem[] | undefined;
  readsInfo: string;
  crawlsInfo: string;
};

export const AgentViewsSection = ({
  analytics,
  history,
  readsInfo,
  crawlsInfo,
}: AgentViewsSectionProps): ReactElement => {
  const [showReads, setShowReads] = useState(true);
  const [showCrawls, setShowCrawls] = useState(true);
  const [visibleSeries, setVisibleSeries] = useState<AgentViewsSeries[]>([
    AgentViewsSeries.Total,
  ]);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const toggleSeries = (key: AgentViewsSeries) => {
    if (key === AgentViewsSeries.Total) {
      setVisibleSeries([AgentViewsSeries.Total]);

      return;
    }

    setVisibleSeries((current) => {
      const vendors = current.filter((item) => item !== AgentViewsSeries.Total);
      const next = vendors.includes(key)
        ? vendors.filter((item) => item !== key)
        : [...vendors, key];

      return next.length ? next : [AgentViewsSeries.Total];
    });
  };

  const breakdown: AnalyticsNumberList = agentViewsVendorSeries.map(
    ({ key, label, dotClassName, botKey }) => {
      const reads = largeNumberFormat(analytics?.[key] ?? 0);

      return {
        icon: <AgentDot colorClassName={dotClassName} />,
        label,
        value: botKey
          ? `${reads} reads · ${largeNumberFormat(
              analytics?.[botKey] ?? 0,
            )} crawls`
          : `${reads} reads`,
      };
    },
  );

  return (
    <>
      <div className="flex gap-4">
        <DataTile
          label="AI agent reads"
          value={analytics?.agentViews ?? 0}
          info={readsInfo}
          className={{
            container: 'flex-1',
          }}
        />
        <DataTile
          label="AI crawler visits"
          value={analytics?.agentViewsBot ?? 0}
          info={crawlsInfo}
          className={{
            container: 'flex-1',
          }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Typography type={TypographyType.Footnote} bold>
          AI agents in the last 45 days
        </Typography>
        <div className="ml-auto flex flex-wrap gap-2">
          <LegendToggle
            label="Reads"
            dotClassName="bg-text-secondary"
            shapeClassName="h-0.5 w-3 rounded-full"
            isActive={showReads}
            isLocked={showReads && !showCrawls}
            onToggle={() => setShowReads((current) => !current)}
          />
          <LegendToggle
            label="Crawls"
            dotClassName="border-text-secondary"
            shapeClassName="w-3 border-t-2 border-dashed"
            isActive={showCrawls}
            isLocked={showCrawls && !showReads}
            onToggle={() => setShowCrawls((current) => !current)}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {[agentViewsTotalSeries, ...agentViewsVendorSeries].map((series) => (
          <LegendToggle
            key={series.key}
            label={series.label}
            dotClassName={series.dotClassName}
            isActive={visibleSeries.includes(series.key)}
            isLocked={
              series.key === AgentViewsSeries.Total &&
              visibleSeries.includes(AgentViewsSeries.Total)
            }
            onToggle={() => toggleSeries(series.key)}
          />
        ))}
      </div>
      <AgentViewsChart
        history={history}
        visibleSeries={visibleSeries}
        showReads={showReads}
        showCrawls={showCrawls}
      />
      <Button
        className="w-full justify-between"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Medium}
        icon={
          <ArrowIcon className={showBreakdown ? 'rotate-180' : 'rotate-90'} />
        }
        iconPosition={ButtonIconPosition.Right}
        aria-expanded={showBreakdown}
        onClick={() => setShowBreakdown((current) => !current)}
      >
        {showBreakdown ? 'Hide' : 'Show'} total per agent
      </Button>
      {showBreakdown && <AnalyticsNumbersList data={breakdown} />}
    </>
  );
};
