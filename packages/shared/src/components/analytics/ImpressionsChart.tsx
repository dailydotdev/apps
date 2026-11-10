import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export type ImpressionsChartProps = {
  post: Pick<Post, 'id' | 'author'> | undefined;
  showOrganic?: boolean;
  showPromoted?: boolean;
};

type ImpressionNode = PostAnalyticsHistoryDay<{
  organic: number;
  promoted: number;
}>;

const toImpressionNode = (item?: PostAnalyticsHistory) => ({
  organic: Math.max((item?.impressions ?? 0) - (item?.impressionsAds ?? 0), 0),
  promoted: item?.impressionsAds ?? 0,
});

export const ImpressionsChart = ({
  post,
  showOrganic = true,
  showPromoted = true,
}: ImpressionsChartProps): ReactElement => {
  const { user } = useAuthContext();
  const userTimezone = user?.timezone || DEFAULT_TIMEZONE;

  const { data: postAnalyticsHistory } = useQuery({
    ...postAnalyticsHistoryQuery({ id: post?.id }),
    enabled: canViewPostAnalytics({ post, user }),
    select: useCallback(
      (data: Connection<PostAnalyticsHistory>): ImpressionNode[] =>
        buildPostAnalyticsHistoryDays({
          data,
          timezone: userTimezone,
          toNode: toImpressionNode,
        }),
      [userTimezone],
    ),
  });

  return (
    <div className="h-40 w-full">
      {!!postAnalyticsHistory && (
        <ResponsiveContainer>
          <BarChart
            width={500}
            height={400}
            data={postAnalyticsHistory}
            margin={{
              top: 10,
              right: 0,
              left: -20,
              bottom: 0,
            }}
            barSize={4}
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
              axisLine={{
                stroke: 'transparent',
              }}
              tickFormatter={(value) => largeNumberFormat(value) ?? ''}
              tickLine={false}
              tick={historyChartTickProp}
              interval={1}
            />
            <Tooltip
              cursor={false}
              content={({ payload, label }) => {
                const node = payload[0]?.payload as ImpressionNode | undefined;
                const organic = showOrganic ? (node?.organic ?? 0) : 0;
                const promoted = showPromoted ? (node?.promoted ?? 0) : 0;

                return (
                  <div className="TooltipContent z-tooltip max-w-full rounded-10 bg-text-primary px-3 py-1 text-surface-invert typo-subhead">
                    <strong>{largeNumberFormat(organic + promoted)}</strong>{' '}
                    impressions on {label}
                    {!!promoted && !!organic && (
                      <div>
                        <strong>{largeNumberFormat(promoted)}</strong> promoted
                      </div>
                    )}
                  </div>
                );
              }}
            />
            {showOrganic && (
              <Bar
                dataKey="organic"
                stackId="impressions"
                radius={10}
                fill="var(--theme-brand-default)"
                activeBar={{ fill: 'var(--theme-text-primary)' }}
              />
            )}
            {showPromoted && (
              <Bar
                dataKey="promoted"
                stackId="impressions"
                radius={10}
                fill="var(--theme-accent-blueCheese-default)"
                activeBar={{ fill: 'var(--theme-text-primary)' }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
