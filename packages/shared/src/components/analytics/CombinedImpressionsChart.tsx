import React from 'react';
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
import type { TickProp } from 'recharts/types/util/types';
import { largeNumberFormat } from '../../lib';

type ImpressionNode = {
  name: string;
  value: number;
  isBoosted: boolean;
};

export interface CombinedImpressionsChartProps {
  data: ImpressionNode[] | undefined;
}

const tickProp: TickProp = {
  fill: 'var(--theme-text-tertiary)',
  fontSize: '0.6875rem',
};

export const CombinedImpressionsChart = ({
  data,
}: CombinedImpressionsChartProps): ReactElement => {
  return (
    <div className="h-40 w-full">
      {!!data && (
        <ResponsiveContainer>
          <BarChart
            width={500}
            height={400}
            data={data}
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
                  <strong>{largeNumberFormat(payload?.[0]?.value || 0)}</strong>{' '}
                  impressions on {label}
                </div>
              )}
            />
            <Bar
              dataKey="value"
              radius={10}
              activeBar={{ fill: 'var(--theme-text-primary)' }}
            >
              {data.map((entry) => {
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
