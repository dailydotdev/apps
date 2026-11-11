import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { largeNumberFormat } from '../../lib';
import type { Post, PostAnalyticsHistory } from '../../graphql/posts';
import { postAnalyticsHistoryQuery } from '../../graphql/posts';
import { canViewPostAnalytics } from '../../lib/user';
import { useAuthContext } from '../../contexts/AuthContext';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import type { Connection } from '../../graphql/common';
import type { PostAnalyticsHistoryDay } from './postAnalyticsHistory';
import {
  buildPostAnalyticsHistoryDays,
  historyChartTickProp,
} from './postAnalyticsHistory';
import type { AgentViewsSeries } from './agentViews';
import { agentViewsSeries } from './agentViews';

export type AgentViewsChartProps = {
  post: Pick<Post, 'id' | 'author'> | undefined;
  visibleSeries: AgentViewsSeries[];
  showReads?: boolean;
  showCrawls?: boolean;
};

type AgentViewsNode = PostAnalyticsHistoryDay<Record<string, number>>;

const toAgentViewsNode = (item?: PostAnalyticsHistory) =>
  agentViewsSeries.reduce(
    (acc, { key, botKey }) => {
      acc[key] = item?.[key] ?? 0;

      if (botKey) {
        acc[botKey] = item?.[botKey] ?? 0;
      }

      return acc;
    },
    {} as Record<string, number>,
  );

export const AgentViewsChart = ({
  post,
  visibleSeries,
  showReads = true,
  showCrawls = true,
}: AgentViewsChartProps): ReactElement => {
  const { user } = useAuthContext();
  const userTimezone = user?.timezone || DEFAULT_TIMEZONE;

  const { data: agentViewsHistory } = useQuery({
    ...postAnalyticsHistoryQuery({ id: post?.id }),
    enabled: canViewPostAnalytics({ post, user }),
    select: useCallback(
      (data: Connection<PostAnalyticsHistory>): AgentViewsNode[] =>
        buildPostAnalyticsHistoryDays({
          data,
          timezone: userTimezone,
          toNode: toAgentViewsNode,
        }),
      [userTimezone],
    ),
  });

  const series = agentViewsSeries.filter(({ key }) =>
    visibleSeries.includes(key),
  );

  return (
    <div className="h-40 w-full">
      {!!agentViewsHistory && (
        <ResponsiveContainer>
          <LineChart
            width={500}
            height={400}
            data={agentViewsHistory}
            margin={{
              top: 10,
              right: 0,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="#A8B3CE"
              strokeOpacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={{
                stroke: 'transparent',
              }}
              tickLine={false}
              tick={historyChartTickProp}
            />
            <YAxis
              allowDecimals={false}
              axisLine={{
                stroke: 'transparent',
              }}
              tickFormatter={(value) => largeNumberFormat(value) ?? ''}
              tickLine={false}
              tick={historyChartTickProp}
            />
            <Tooltip
              cursor={false}
              content={({ payload, label }) => {
                const node = payload[0]?.payload as AgentViewsNode | undefined;

                return (
                  <div className="TooltipContent z-tooltip max-w-full rounded-10 bg-text-primary px-3 py-1 text-surface-invert typo-subhead">
                    <div>{label}</div>
                    {series.map(({ key, label: seriesLabel, botKey }) => {
                      const parts = [
                        showReads &&
                          `${largeNumberFormat(node?.[key] ?? 0)} reads`,
                        showCrawls &&
                          !!botKey &&
                          `${largeNumberFormat(node?.[botKey] ?? 0)} crawls`,
                      ].filter(Boolean);

                      if (!parts.length) {
                        return null;
                      }

                      return (
                        <div key={key}>
                          {seriesLabel}: {parts.join(' · ')}
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            {showReads &&
              series.map(({ key, color }) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            {showCrawls &&
              series
                .filter(({ botKey }) => !!botKey)
                .map(({ botKey, color }) => (
                  <Line
                    key={botKey}
                    dataKey={botKey}
                    type="monotone"
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
