import type { ReactElement } from 'react';
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import classNames from 'classnames';
import type { SentimentDataPoint } from '../../lib/toolsMockData';

export interface ToolSentimentChartProps {
  data: SentimentDataPoint[];
  className?: string;
}

const tickStyle = {
  fill: 'var(--theme-text-tertiary)',
  fontSize: '0.6875rem',
};

export const ToolSentimentChart = ({
  data,
  className,
}: ToolSentimentChartProps): ReactElement => {
  return (
    <div className={classNames('flex flex-col', className)}>
      <h2 className="mb-4 font-bold text-text-primary typo-title3">
        Sentiment over time
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--theme-border-subtlest-tertiary)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={tickStyle}
              interval="preserveStartEnd"
            />
            <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--theme-background-subtle)',
                border: '1px solid var(--theme-border-subtlest-tertiary)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--theme-text-primary)' }}
              itemStyle={{ color: 'var(--theme-text-secondary)' }}
            />
            <Area
              type="monotone"
              dataKey="positive"
              stackId="1"
              stroke="var(--theme-accent-avocado-default)"
              fill="var(--theme-accent-avocado-default)"
              fillOpacity={0.6}
              name="Positive"
            />
            <Area
              type="monotone"
              dataKey="neutral"
              stackId="1"
              stroke="var(--theme-accent-cheese-default)"
              fill="var(--theme-accent-cheese-default)"
              fillOpacity={0.6}
              name="Neutral"
            />
            <Area
              type="monotone"
              dataKey="negative"
              stackId="1"
              stroke="var(--theme-accent-ketchup-default)"
              fill="var(--theme-accent-ketchup-default)"
              fillOpacity={0.6}
              name="Negative"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-accent-avocado-default" />
          <span className="text-text-tertiary typo-footnote">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-accent-cheese-default" />
          <span className="text-text-tertiary typo-footnote">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-accent-ketchup-default" />
          <span className="text-text-tertiary typo-footnote">Negative</span>
        </div>
      </div>
    </div>
  );
};
