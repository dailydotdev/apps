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
import { largeNumberFormat } from '../../lib';

const generateData = () => {
  const data = [];
  const today = new Date();

  for (let i = 44; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      name: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: Math.floor(Math.random() * (2800 - 100 + 1)) + 100,
      isBoosted: Math.random() > 0.5,
    });
  }

  return data;
};

const data = generateData();

export const ImpressionsChart = (): ReactElement => {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer>
        <BarChart
          width={500}
          height={400}
          data={data}
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
            {data.map((entry) => {
              return (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={
                    entry.isBoosted
                      ? 'var(--theme-brand-default)'
                      : 'var(--theme-accent-blueCheese-default)'
                  }
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
