import type { ReactElement, ReactNode } from 'react';
import React, { useId, useMemo, useState } from 'react';
import classNames from 'classnames';
import { CoreIcon, InfoIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { boostDashboardInfo } from '@dailydotdev/shared/src/features/boost/common';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { clicksInfo } from '../../flows/after-boost/CampaignView';

// The analytics head of Boost manager, in the Ads Manager's shape: a strip of
// metric tabs over one chart of the picked metric by day. The boost days are
// drawn from the campaigns' totals, spread over the days each one ran, and
// the tabs sum the same days. Combined analytics reuses the panel for the
// organic side.

export const DAYS = 14;
const oneDay = 24 * 60 * 60 * 1000;

/** One day of raw counts, keyed by whatever the metrics read */
export type Day = { date: Date; values: Record<string, number> };

export interface MetricDef {
  id: string;
  label: string;
  info: string;
  icon?: ReactNode;
  isPercent?: boolean;
  /** The metric out of a day's counts, or out of the summed counts */
  of: (values: Record<string, number>) => number;
}

/** The last 14 days, oldest first, each filled by `fill` */
export const lastDays = (
  fill: (date: Date, index: number) => Record<string, number>,
): Day[] => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(today.getTime() - (DAYS - 1 - index) * oneDay);

    return { date, values: fill(date, index) };
  });
};

/** Each campaign's totals spread over the days it ran, with a little wobble */
export const dailySeries = (campaigns: Campaign[]): Day[] =>
  lastDays((date, index) => {
    const values = { impressions: 0, clicks: 0, users: 0, spend: 0 };

    campaigns.forEach(({ createdAt, endedAt, flags }) => {
      const start = new Date(createdAt).getTime();
      const end = Math.min(new Date(endedAt).getTime(), Date.now());
      const dayStart = date.getTime() - oneDay / 2;
      if (dayStart + oneDay <= start || dayStart > end) {
        return;
      }

      const days = Math.max(1, Math.ceil((end - start) / oneDay));
      const wobble = 0.85 + 0.3 * Math.abs(Math.sin(index * 1.7 + start));
      values.impressions += ((flags.impressions ?? 0) / days) * wobble;
      values.clicks += ((flags.clicks ?? 0) / days) * wobble;
      values.users += ((flags.users ?? 0) / days) * wobble;
      values.spend += ((flags.spend ?? 0) / days) * wobble;
    });

    return values;
  });

/** Every count summed over the days */
export const sumDays = (days: Day[]): Record<string, number> =>
  days.reduce<Record<string, number>>((sum, { values }) => {
    Object.entries(values).forEach(([key, value]) => {
      sum[key] = (sum[key] ?? 0) + value;
    });

    return sum;
  }, {});

const counted =
  (key: string) =>
  (values: Record<string, number>): number =>
    values[key] ?? 0;

const ctr = (values: Record<string, number>): number =>
  values.impressions ? ((values.clicks ?? 0) / values.impressions) * 100 : 0;

export const boostMetrics: MetricDef[] = [
  {
    id: 'impressions',
    label: 'Impressions',
    info: boostDashboardInfo.impressions,
    of: counted('impressions'),
  },
  {
    id: 'clicks',
    label: 'Clicks on post',
    info: clicksInfo,
    of: counted('clicks'),
  },
  {
    id: 'ctr',
    label: 'CTR',
    info: 'Clicks on post out of impressions.',
    isPercent: true,
    of: ctr,
  },
  {
    id: 'users',
    label: 'Users',
    info: boostDashboardInfo.users,
    of: counted('users'),
  },
  {
    id: 'spend',
    label: 'Spend',
    info: boostDashboardInfo.spend,
    icon: <CoreIcon size={IconSize.Small} />,
    of: counted('spend'),
  },
];

export const formatMetric = (metric: MetricDef, value: number): string =>
  metric.isPercent
    ? `${value.toFixed(2)}%`
    : (largeNumberFormat(Math.round(value)) ?? '0');

/** The chart's top, rounded up so the four gridlines land on round numbers */
const niceTop = (max: number): number => {
  const step = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(step));
  const nice =
    [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(
      (n) => n * magnitude >= step,
    ) ?? 10;

  return nice * magnitude * 4;
};

const dayLabel = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** A smooth line through the points, as cubic curves */
const curveThrough = (points: [number, number][]): string =>
  points.reduce((path, [x, y], index) => {
    if (index === 0) {
      return `M${x},${y}`;
    }

    const [px, py] = points[index - 1];
    const mid = (x - px) / 2;

    return `${path} C${px + mid},${py} ${x - mid},${y} ${x},${y}`;
  }, '');

const WIDTH = 640;
const HEIGHT = 160;

export enum ChartColor {
  Boosted = 'var(--theme-accent-blueCheese-default)',
  Organic = 'var(--theme-accent-cabbage-default)',
  Agents = 'var(--theme-accent-avocado-default)',
}

/** One series of a chart; several stack, the first at the bottom */
export interface ChartLayer {
  label: string;
  color: ChartColor;
  days: Day[];
}

const LayerGradient = ({
  id,
  color,
}: {
  id: string;
  color: ChartColor;
}): ReactElement => (
  <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={0.32} />
    <stop offset="100%" stopColor={color} stopOpacity={0.04} />
  </linearGradient>
);

const barClassNames: Record<ChartColor, string> = {
  [ChartColor.Organic]: 'bg-accent-cabbage-default',
  [ChartColor.Boosted]: 'bg-accent-blueCheese-default',
  [ChartColor.Agents]: 'bg-accent-avocado-default',
};

const dotClassNames = barClassNames;

const AreaChart = ({
  layers,
  metric,
}: {
  layers: ChartLayer[];
  metric: MetricDef;
}): ReactElement => {
  const gradientId = useId();
  const { days } = layers[0];
  const stacked = layers.reduce<number[][]>((tops, { days: layerDays }) => {
    const below = tops[tops.length - 1];

    return [
      ...tops,
      layerDays.map(
        (day, index) => (below?.[index] ?? 0) + metric.of(day.values),
      ),
    ];
  }, []);
  const top = niceTop(Math.max(...stacked[stacked.length - 1]) * 1.1 || 1);
  const step = WIDTH / (days.length - 1);
  const pointsOf = (values: number[]): [number, number][] =>
    values.map((value, index) => [
      index * step,
      HEIGHT - (value / top) * HEIGHT,
    ]);
  const ticks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div className="flex gap-2">
      <div className="flex h-40 shrink-0 flex-col justify-between text-right text-text-quaternary typo-caption2">
        {ticks.map((tick) => (
          <span key={tick} className="-my-1.5 tabular-nums">
            {formatMetric(metric, top * tick)}
          </span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-40 w-full overflow-visible"
          aria-hidden
        >
          <defs>
            {layers.map(({ label, color }, index) => (
              <LayerGradient
                key={label}
                id={`${gradientId}-${index}`}
                color={color}
              />
            ))}
          </defs>
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={WIDTH}
              y1={HEIGHT - tick * HEIGHT}
              y2={HEIGHT - tick * HEIGHT}
              stroke="var(--theme-border-subtlest-tertiary)"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {layers.map(({ label, color }, index) => {
            const upper = pointsOf(stacked[index]);
            const lower = index
              ? pointsOf(stacked[index - 1]).reverse()
              : [
                  [WIDTH, HEIGHT],
                  [0, HEIGHT],
                ];
            const line = curveThrough(upper);
            const base = index
              ? curveThrough(lower as [number, number][]).replace('M', 'L')
              : `L${WIDTH},${HEIGHT} L0,${HEIGHT}`;

            return (
              <React.Fragment key={label}>
                <path
                  d={`${line} ${base} Z`}
                  fill={`url(#${gradientId}-${index})`}
                />
                <path
                  d={line}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              </React.Fragment>
            );
          })}
        </svg>
        <div className="flex justify-between text-text-quaternary typo-caption2">
          {days
            .filter((_, index) => index % 2 === 1)
            .map(({ date }) => (
              <span key={date.toISOString()}>{dayLabel(date)}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

const MetricTab = ({
  label,
  info,
  value,
  icon,
  isSelected,
  barClassName,
  onClick,
}: {
  label: string;
  info: string;
  value: string;
  icon?: ReactNode;
  isSelected: boolean;
  barClassName: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    role="tab"
    aria-selected={isSelected}
    onClick={onClick}
    className={classNames(
      'relative flex min-w-36 flex-1 shrink-0 flex-col gap-1 px-4 py-3 text-left transition-colors tablet:min-w-0 tablet:px-6',
      isSelected
        ? 'bg-surface-float'
        : 'bg-background-default text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
    )}
  >
    {isSelected && (
      <span
        className={classNames('absolute inset-x-0 top-0 h-0.5', barClassName)}
      />
    )}
    <span
      className={classNames(
        'flex items-center gap-1 typo-footnote',
        isSelected && 'font-bold',
      )}
    >
      <span className="truncate">{label}</span>
      <Tooltip content={info} enableMobileClick>
        <span className="text-text-disabled">
          <InfoIcon size={IconSize.Size16} />
        </span>
      </Tooltip>
    </span>
    <span className="flex items-center gap-1 font-bold tabular-nums typo-title3">
      {icon}
      {value}
    </span>
  </button>
);

/** The metric strip and the chart of the picked metric, over the last 14 days */
export const MetricsPanel = ({
  metrics,
  days,
  layers: stackedLayers,
  color = ChartColor.Boosted,
  className = 'border-b border-border-subtlest-tertiary',
  initialMetric,
  initialHidden = [],
}: {
  metrics: MetricDef[];
  /** One series, or `layers` to stack several */
  days?: Day[];
  layers?: ChartLayer[];
  color?: ChartColor;
  className?: string;
  /** The metric it opens on, the first one otherwise */
  initialMetric?: string;
  /** Layers it opens muted, by label */
  initialHidden?: string[];
}): ReactElement => {
  const [metricId, setMetricId] = useState(initialMetric ?? metrics[0].id);
  const layers = useMemo(
    () => stackedLayers ?? [{ label: 'All', color, days: days ?? [] }],
    [stackedLayers, color, days],
  );
  const [hidden, setHidden] = useState(initialHidden);
  const shown = useMemo(
    () => layers.filter(({ label }) => !hidden.includes(label)),
    [layers, hidden],
  );
  const totals = useMemo(
    () => sumDays(shown.flatMap((layer) => layer.days)),
    [shown],
  );
  const onToggleLayer = (label: string) =>
    setHidden((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  const picked = metrics.find(({ id }) => id === metricId) ?? metrics[0];

  return (
    <section className={classNames('flex flex-col', className)}>
      <div
        role="tablist"
        aria-label="Metric"
        className="no-scrollbar flex gap-px overflow-x-auto border-b border-border-subtlest-tertiary bg-border-subtlest-tertiary tablet:grid tablet:auto-cols-fr tablet:grid-flow-col"
      >
        {metrics.map((metric) => (
          <MetricTab
            key={metric.id}
            label={metric.label}
            info={metric.info}
            value={formatMetric(metric, metric.of(totals))}
            icon={metric.icon}
            isSelected={picked.id === metric.id}
            barClassName={
              shown.length > 1
                ? 'bg-text-primary'
                : barClassNames[shown[0].color]
            }
            onClick={() => setMetricId(metric.id)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4 px-4 py-5 tablet:px-6">
        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <strong className="mr-auto typo-callout">{picked.label}</strong>
          {layers.length > 1 &&
            layers.map((layer) => {
              const isHidden = hidden.includes(layer.label);

              return (
                <button
                  key={layer.label}
                  type="button"
                  aria-pressed={!isHidden}
                  // One series always stays on the chart
                  disabled={!isHidden && shown.length === 1}
                  onClick={() => onToggleLayer(layer.label)}
                  className={classNames(
                    'flex items-center gap-1.5 rounded-8 px-1.5 py-0.5 transition-colors typo-footnote hover:bg-surface-hover disabled:cursor-default disabled:hover:bg-transparent',
                    isHidden && 'text-text-quaternary',
                  )}
                >
                  <span
                    className={classNames(
                      'size-2 rounded-full',
                      isHidden
                        ? 'border border-border-subtlest-primary'
                        : dotClassNames[layer.color],
                    )}
                  />
                  <span className={classNames(isHidden && 'line-through')}>
                    {layer.label}
                  </span>
                  <strong className="tabular-nums">
                    {formatMetric(picked, picked.of(sumDays(layer.days)))}
                  </strong>
                </button>
              );
            })}
          <span className="text-text-tertiary typo-footnote">
            Last {DAYS} days
          </span>
        </span>
        <AreaChart layers={shown} metric={picked} />
      </div>
    </section>
  );
};
