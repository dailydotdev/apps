import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { addDays, subDays } from 'date-fns';
import type { TickProp } from 'recharts/types/util/types';
import { largeNumberFormat } from '../../lib';
import type { Post, PostAnalyticsHistory } from '../../graphql/posts';
import {
  postAnalyticsHistoryLimit,
  postAnalyticsHistoryQuery,
} from '../../graphql/posts';
import { canViewPostAnalytics } from '../../lib/user';
import { useAuthContext } from '../../contexts/AuthContext';
import { dateFormatInTimezone, DEFAULT_TIMEZONE } from '../../lib/timezones';
import type { Connection } from '../../graphql/common';

export type ImpressionsChartProps = {
  post: Pick<Post, 'id' | 'author'> | undefined;
};

type ImpressionNode = {
  name: string;
  value: number;
  isBoosted: boolean;
};

const tickProp: TickProp = {
  fill: 'var(--theme-text-tertiary)',
  fontSize: '0.6875rem',
};

export const ImpressionsChart = ({
  post,
}: ImpressionsChartProps): ReactElement => {
  const { user } = useAuthContext();
  const userTimezone = user?.timezone || DEFAULT_TIMEZONE;

  const { data: postAnalyticsHistory } = useQuery({
    ...postAnalyticsHistoryQuery({ id: post?.id }),
    enabled: canViewPostAnalytics({ post, user }),
    select: useCallback(
      (data: Connection<PostAnalyticsHistory>): ImpressionNode[] => {
        if (!data) {
          return [];
        }

        const impressionsMap = data?.edges?.reduce((acc, { node: item }) => {
          const date = dateFormatInTimezone(
            new Date(item.date),
            'yyyy-MM-dd',
            userTimezone,
          );

          acc[date] = {
            name: new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            value: item.impressions,
            // if any boost was active on this date
            isBoosted: item.impressionsAds > 0,
          };

          return acc;
        }, {} as Record<string, ImpressionNode>);

        const historyCutOffDate = subDays(
          new Date(),
          postAnalyticsHistoryLimit - 1,
        );

        const impressionsData: ImpressionNode[] = [];

        for (let i = 0; i < postAnalyticsHistoryLimit; i += 1) {
          const paddedDate = addDays(historyCutOffDate, i);
          const date = dateFormatInTimezone(
            paddedDate,
            'yyyy-MM-dd',
            userTimezone,
          );

          if (impressionsMap[date]) {
            impressionsData.push(impressionsMap[date]);
          } else {
            impressionsData.push({
              name: paddedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              value: 0,
              isBoosted: false,
            });
          }
        }

        return impressionsData;
      },
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
              stroke="#A8B3CF"
              strokeOpacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={{
                stroke: 'transparent',
              }}
              tickLine={false}
              tick={tickProp}
            />
            <YAxis
              axisLine={{
                stroke: 'transparent',
              }}
              tickFormatter={(value) => largeNumberFormat(value)}
              tickLine={false}
              tick={tickProp}
              interval={1}
            />
            <Tooltip
              cursor={false}
              content={({ payload, label }) => (
                <div className="TooltipContent z-tooltip rounded-10 bg-text-primary text-surface-invert typo-subhead max-w-full px-3 py-1">
                  <strong>{largeNumberFormat(payload[0]?.value || 0)}</strong>{' '}
                  impressions on {label}
                </div>
              )}
            />
            <Bar
              dataKey="value"
              radius={10}
              activeBar={{ fill: 'var(--theme-text-primary)' }}
            >
              {postAnalyticsHistory.map((entry) => {
                return (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      !entry.isBoosted
                        ? 'var(--theme-brand-default)'
                        : 'var(--theme-accent-blueCheese-default)'
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
