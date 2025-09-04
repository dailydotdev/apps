import React, { useCallback, useMemo } from 'react';
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
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import type { TickProp } from 'recharts/types/util/types';
import { utcToZonedTime } from 'date-fns-tz';
import { largeNumberFormat } from '../../lib';
import type { Post } from '../../graphql/posts';
import {
  postAnalyticsHistoryLimit,
  postAnalyticsHistoryQuery,
} from '../../graphql/posts';
import { canViewPostAnalytics } from '../../lib/user';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCampaigns } from '../../features/boost/useCampaigns';
import { dateFormatInTimezone, DEFAULT_TIMEZONE } from '../../lib/timezones';

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

  const { data: campaigns } = useCampaigns({
    entityId: post?.id,
    first: postAnalyticsHistoryLimit,
  });

  const userTimezone = user?.timezone || DEFAULT_TIMEZONE;

  const boostedRanges = useMemo(() => {
    return campaigns?.pages.reduce(
      (acc, page) => {
        page.edges.forEach(({ node: campaign }) => {
          acc.push({
            // extract all ranges for start/end day for post's boosts
            from: startOfDay(utcToZonedTime(campaign.createdAt, userTimezone)),
            to: endOfDay(
              utcToZonedTime(new Date(campaign.endedAt), userTimezone),
            ),
          });
        });

        return acc;
      },
      [] as {
        from: Date;
        to: Date;
      }[],
    );
  }, [campaigns, userTimezone]);

  const { data: postAnalyticsHistory } = useQuery({
    ...postAnalyticsHistoryQuery({ id: post?.id }),
    enabled: canViewPostAnalytics({ post, user }),
    select: useCallback(
      (data): ImpressionNode[] => {
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
            isBoosted: boostedRanges.some((range) => {
              const isAfterStart = new Date(date) >= range.from;
              const isBeforeEnd = new Date(date) <= range.to;

              return isAfterStart && isBeforeEnd;
            }),
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
      [boostedRanges, userTimezone],
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
                <div className="TooltipContent z-tooltip max-w-full rounded-10 bg-text-primary px-3 py-1 text-surface-invert typo-subhead">
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
