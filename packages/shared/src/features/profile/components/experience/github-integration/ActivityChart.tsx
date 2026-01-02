import type { ReactElement } from 'react';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ActivityData } from './types';

interface ActivityChartProps {
  data: ActivityData[];
  height?: number;
}

const ACTIVITY_COLORS = {
  commits: 'var(--theme-accent-onion-default)',
  pullRequests: 'var(--theme-accent-water-default)',
  reviews: 'var(--theme-accent-cheese-default)',
  issues: 'var(--theme-accent-bacon-default)',
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps): ReactElement | null => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="z-tooltip rounded-10 bg-text-primary px-3 py-2 text-surface-invert">
      <p className="mb-1 typo-footnote">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center gap-2 typo-caption1"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.dataKey}:</span>
          <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ActivityChart({
  data,
  height = 160,
}: ActivityChartProps): ReactElement {
  const chartData = data.map((item) => ({
    ...item,
    name: formatDate(item.date),
  }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          barSize={8}
          barGap={1}
        >
          <CartesianGrid
            strokeDasharray="0"
            stroke="var(--theme-divider-tertiary)"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: 'var(--theme-text-tertiary)',
              fontSize: '0.6875rem',
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: 'var(--theme-text-tertiary)',
              fontSize: '0.6875rem',
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Legend
            wrapperStyle={{
              fontSize: '0.75rem',
              paddingTop: '8px',
            }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="commits"
            fill={ACTIVITY_COLORS.commits}
            radius={[2, 2, 0, 0]}
            name="Commits"
          />
          <Bar
            dataKey="pullRequests"
            fill={ACTIVITY_COLORS.pullRequests}
            radius={[2, 2, 0, 0]}
            name="PRs"
          />
          <Bar
            dataKey="reviews"
            fill={ACTIVITY_COLORS.reviews}
            radius={[2, 2, 0, 0]}
            name="Reviews"
          />
          <Bar
            dataKey="issues"
            fill={ACTIVITY_COLORS.issues}
            radius={[2, 2, 0, 0]}
            name="Issues"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
