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
import { addDays, format, subDays } from 'date-fns';
import { largeNumberFormat } from '../../lib';
import type { Post } from '../../graphql/posts';
import {
  postAnalyticsHistoryLimit,
  postAnalyticsHistoryQuery,
} from '../../graphql/posts';

export type ImpressionsChartProps = {
  post: Pick<Post, 'id'> | undefined;
};

type ImpressionNode = {
  name: string;
  value: number;
  isBoosted: boolean;
};

export const ImpressionsChart = ({
  post,
}: ImpressionsChartProps): ReactElement => {
  const { data: postAnalyticsHistory } = useQuery({
    ...postAnalyticsHistoryQuery({ id: post?.id }),
    select: useCallback((data): ImpressionNode[] => {
      if (!data) {
        return [];
      }

      const impressionsMap = data?.edges?.reduce((acc, { node: item }) => {
        const date = format(new Date(item.date), 'yyyy-MM-dd');

        acc[date] = {
          name: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          value: item.impressions,
          isBoosted: false,
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
        const date = format(paddedDate, 'yyyy-MM-dd');

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
    }, []),
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
              left: 0,
              bottom: 5,
            }}
            barCategoryGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={7} />
            <YAxis
              interval={1}
              tickFormatter={(value) => largeNumberFormat(value)}
            />
            <Tooltip
              cursor={false}
              content={({ payload, label }) => (
                <div className="TooltipContent z-tooltip max-w-full rounded-10 bg-text-primary px-3 py-1 text-surface-invert typo-subhead">
                  <strong>{payload[0]?.value}</strong> impressions on {label}
                </div>
              )}
            />
            <Bar dataKey="value" radius={10}>
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
