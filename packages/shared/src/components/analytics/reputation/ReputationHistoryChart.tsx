import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TickProp } from 'recharts/types/util/types';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { largeNumberFormat } from '../../../lib';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type { ReputationHistoryPoint } from '../../../graphql/reputation';
import { formatSignedAmount } from './common';

const tickProp: TickProp = {
  fill: 'var(--theme-text-tertiary)',
  fontSize: '0.6875rem',
};

const SYNC_ID = 'reputation-history';

// Compact "2.6K" labels collapse neighboring ticks into the same text.
const formatTick = (value: number): string =>
  value < 100000
    ? value.toLocaleString('en-US')
    : (largeNumberFormat(value) ?? '');

// Round steps (1, 2 or 5 times a power of ten) around the balance line, so
// the axis reads 8,500 / 8,600 / 8,700 instead of whatever the data hits.
const getBalanceTicks = (balances: number[]): number[] => {
  if (!balances.length) {
    return [0];
  }

  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const rough = Math.max((max - min) / 3, 1);
  const power = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10].map((factor) => factor * power).find((s) => s >= rough) ??
    10 * power;
  const start = Math.max(Math.floor(min / step) * step, 0);
  const end = Math.max(Math.ceil(max / step) * step, start + step);
  const ticks: number[] = [];

  for (let value = start; value <= end; value += step) {
    ticks.push(value);
  }

  return ticks;
};

interface ChartPoint extends ReputationHistoryPoint {
  label: string;
  tick: string;
  lostNegative: number;
}

// Long periods come back as weekly or monthly points; the spacing between
// two points tells which, so "Jul 1" is never read as a single day.
const bucketFormats = [
  { minDays: 28, label: 'MMMM yyyy', tick: 'MMM yyyy' },
  { minDays: 7, label: "'Week of' MMM d, yyyy", tick: 'MMM d' },
  { minDays: 0, label: 'MMM d, yyyy', tick: 'MMM d' },
];

const getBucketFormat = (history: ReputationHistoryPoint[]) => {
  const spacing =
    history.length > 1
      ? differenceInCalendarDays(
          parseISO(history[1].date),
          parseISO(history[0].date),
        )
      : 1;

  return (
    bucketFormats.find(({ minDays }) => spacing >= minDays) ??
    bucketFormats[bucketFormats.length - 1]
  );
};

const TooltipContent = ({
  point,
}: {
  point?: ChartPoint;
}): ReactElement | null => {
  if (!point) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-10 bg-text-primary px-3 py-1.5 text-surface-invert typo-footnote">
      <strong>{point.label}</strong>
      <span className="tabular-nums">
        {point.balance.toLocaleString('en-US')} reputation
      </span>
      {(point.gained > 0 || point.lost > 0) && (
        <span className="tabular-nums">
          {point.gained > 0 && formatSignedAmount(point.gained)}
          {point.gained > 0 && point.lost > 0 && ' / '}
          {point.lost > 0 && formatSignedAmount(-point.lost)}
        </span>
      )}
    </div>
  );
};

interface ReputationHistoryChartProps {
  history: ReputationHistoryPoint[];
}

export const ReputationHistoryChart = ({
  history,
}: ReputationHistoryChartProps): ReactElement => {
  const data = useMemo<ChartPoint[]>(() => {
    const formats = getBucketFormat(history);

    return history.map((point) => {
      const date = parseISO(point.date);

      return {
        ...point,
        label: format(date, formats.label),
        tick: format(date, formats.tick),
        lostNegative: -point.lost,
      };
    });
  }, [history]);
  const hasMovement = data.some((point) => point.gained || point.lost);
  const ticks = useMemo(
    () => getBalanceTicks(data.map((point) => point.balance)),
    [data],
  );

  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-12 border border-border-subtlest-tertiary px-4 text-center">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          No reputation changes in this period
        </Typography>
      </div>
    );
  }

  const xAxis = (
    <XAxis
      dataKey="tick"
      axisLine={false}
      tickLine={false}
      tick={tickProp}
      minTickGap={48}
    />
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="h-40 w-full">
        <ResponsiveContainer>
          <AreaChart
            data={data}
            syncId={SYNC_ID}
            margin={{ top: 8, right: 0, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="reputationArea" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--theme-accent-onion-default)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--theme-accent-onion-default)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--theme-border-subtlest-tertiary)"
              vertical={false}
            />
            {hasMovement ? <XAxis dataKey="tick" hide /> : xAxis}
            <YAxis
              domain={[ticks[0], ticks[ticks.length - 1]]}
              ticks={ticks}
              axisLine={false}
              tickLine={false}
              tick={tickProp}
              tickFormatter={formatTick}
            />
            <Tooltip
              cursor={{ stroke: 'var(--theme-border-subtlest-secondary)' }}
              content={({ payload }) => (
                <TooltipContent point={payload?.[0]?.payload as ChartPoint} />
              )}
            />
            <Area
              type="linear"
              dataKey="balance"
              stroke="var(--theme-accent-onion-default)"
              strokeWidth={2}
              fill="url(#reputationArea)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {hasMovement && (
        <div className="h-20 w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              syncId={SYNC_ID}
              stackOffset="sign"
              margin={{ top: 4, right: 0, left: -12, bottom: 0 }}
              barCategoryGap="20%"
            >
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={tickProp}
                tickCount={3}
                allowDecimals={false}
              />
              <ReferenceLine
                y={0}
                stroke="var(--theme-border-subtlest-tertiary)"
              />
              <Tooltip cursor={false} content={() => null} />
              <Bar
                dataKey="gained"
                stackId="net"
                fill="var(--status-success)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="lostNegative"
                stackId="net"
                fill="var(--status-error)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
              {xAxis}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
