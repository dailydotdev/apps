import React, { CSSProperties, ReactElement, ReactNode, useMemo } from 'react';
import { addDays, differenceInDays, endOfWeek } from 'date-fns';
import { SimpleTooltip } from './tooltips/SimpleTooltip';

const BINS = 3;
const DAYS_IN_WEEK = 7;
const SQUARE_SIZE = 8;
const LINE_HEIGHT = 18;
const MONTH_LABEL_GUTTER_SIZE = 6;
const MONTH_LABEL_SIZE = LINE_HEIGHT + MONTH_LABEL_GUTTER_SIZE;
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const weekdayLabelSize = 50;
const labelStyle: CSSProperties = {
  fill: 'var(--theme-text-primary)',
  fontSize: '13',
  lineHeight: '18',
};

const binsAttributes: React.SVGProps<SVGRectElement>[] = [
  {
    fill: 'var(--theme-border-subtlest-quaternary)',
  },
  {
    fill: 'var(--theme-text-disabled)',
  },
  {
    fill: 'var(--theme-text-quaternary)',
  },
  {
    fill: 'var(--theme-text-primary)',
  },
];

function getRange(count: number): number[] {
  return Array.from(new Array(count), (_, i) => i);
}

function getBins(values: number[]): number[] {
  const uniques = Array.from(new Set(values)).sort((a, b) => a - b);
  if (uniques.length <= BINS) {
    return [...new Array(BINS - uniques.length).fill(0), ...uniques];
  }
  const binSize = Math.floor(uniques.length / BINS);
  return Array.from(
    new Array(BINS),
    (_, i) => uniques[Math.min(binSize * (i + 1), uniques.length - 1)],
  );
}

function getBin(value: number, bins: number[]): number {
  if (!value) {
    return 0;
  }

  if (value > Math.max.apply(null, bins)) {
    return bins.length;
  }

  return bins.findIndex((binMaxValue) => value <= binMaxValue) + 1;
}

export type CalendarHeatmapProps<T extends { date: string }> = {
  gutterSize?: number;
  startDate: Date;
  endDate: Date;
  values: T[];
  valueToCount: (value: T) => number;
  valueToTooltip: (value: T, date: Date) => ReactNode;
};

export function CalendarHeatmap<T extends { date: string }>({
  startDate,
  endDate,
  gutterSize = 2,
  values,
  valueToCount,
  valueToTooltip,
}: CalendarHeatmapProps<T>): ReactElement {
  const squareSizeWithGutter = SQUARE_SIZE + gutterSize;

  const numEmptyDaysAtEnd = DAYS_IN_WEEK - 1 - endDate.getDay();
  const numEmptyDaysAtStart = startDate.getDay();
  const startDateWithEmptyDays = addDays(startDate, -numEmptyDaysAtStart);

  const dateDifferenceInDays = differenceInDays(endDate, startDate);

  const numDaysRoundedToWeek =
    dateDifferenceInDays + numEmptyDaysAtStart + numEmptyDaysAtEnd;
  const weekCount = Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);

  const weekWidth = DAYS_IN_WEEK * squareSizeWithGutter;

  const width =
    weekCount * squareSizeWithGutter - (gutterSize - weekdayLabelSize);
  const height = weekWidth + (MONTH_LABEL_SIZE - gutterSize);

  const bins = useMemo<number[]>(
    () => getBins(values.map(valueToCount)),
    [values, valueToCount],
  );
  const computedValues = useMemo<
    Record<number, { count: number; date: Date; bin: number; originalValue: T }>
  >(
    () =>
      values.reduce((acc, value) => {
        const date = new Date(value.date);
        const index = differenceInDays(date, startDateWithEmptyDays);
        if (index < 0) {
          return acc;
        }
        const count = valueToCount(value);
        acc[index] = {
          count,
          bin: getBin(count, bins),
          date,
          originalValue: value,
        };
        return acc;
      }, {}),
    [values, startDateWithEmptyDays, valueToCount, bins],
  );

  const getMonthLabelCoordinates = (weekIndex: number): [number, number] => [
    weekIndex * squareSizeWithGutter,
    (MONTH_LABEL_SIZE - MONTH_LABEL_GUTTER_SIZE) / 2 + 1,
  ];

  const renderMonthLabels = (): ReactNode => {
    const weekRange = getRange(weekCount - 2);
    return weekRange.map((weekIndex) => {
      const date = endOfWeek(
        addDays(startDateWithEmptyDays, weekIndex * DAYS_IN_WEEK),
      );
      const [x, y] = getMonthLabelCoordinates(weekIndex);
      return date.getDate() >= DAYS_IN_WEEK &&
        date.getDate() <= 2 * DAYS_IN_WEEK - 1 ? (
        <text key={weekIndex} x={x} y={y} style={labelStyle}>
          {MONTH_LABELS[date.getMonth()]}
        </text>
      ) : null;
    });
  };

  const getWeekdayLabelCoordinates = (dayIndex: number): [number, number] => [
    0,
    (dayIndex + 1) * SQUARE_SIZE + dayIndex * gutterSize,
  ];

  const renderWeekdayLabels = (): ReactNode => {
    return DAY_LABELS.map((weekdayLabel, dayIndex) => {
      const [x, y] = getWeekdayLabelCoordinates(dayIndex);
      return weekdayLabel.length ? (
        <text key={`${x}${y}`} x={x} y={y} style={labelStyle}>
          {weekdayLabel}
        </text>
      ) : null;
    });
  };

  const getSquareCoordinates = (dayIndex: number): [number, number] => [
    0,
    dayIndex * squareSizeWithGutter,
  ];

  const renderSquare = (dayIndex: number, index: number): ReactNode => {
    const indexOutOfRange =
      index < numEmptyDaysAtStart ||
      index >= numEmptyDaysAtStart + dateDifferenceInDays;
    if (indexOutOfRange) {
      return null;
    }
    const [x, y] = getSquareCoordinates(dayIndex);
    const value = computedValues[index];
    const bin = value?.bin || 0;
    const attrs = binsAttributes[bin];
    return (
      <SimpleTooltip
        key={index}
        content={valueToTooltip(
          value?.originalValue,
          addDays(startDateWithEmptyDays, index),
        )}
        duration={0}
        delay={[0, 70]}
        container={{
          paddingClassName: 'py-3 px-4',
          roundedClassName: 'rounded-3',
        }}
      >
        <g>
          <rect
            key={index}
            width={SQUARE_SIZE}
            height={SQUARE_SIZE}
            x={x}
            y={y}
            rx="3"
            {...attrs}
          />
          {!bin && (
            <rect
              width={SQUARE_SIZE - 2}
              height={SQUARE_SIZE - 2}
              x={x + 1}
              y={y + 1}
              rx="2"
              fill="var(--theme-background-default)"
            />
          )}
        </g>
      </SimpleTooltip>
    );
  };

  const renderWeek = (weekIndex: number): ReactNode => {
    return (
      <g
        key={weekIndex}
        transform={`translate(${weekIndex * squareSizeWithGutter}, 0)`}
      >
        {getRange(DAYS_IN_WEEK).map((dayIndex) =>
          renderSquare(dayIndex, weekIndex * DAYS_IN_WEEK + dayIndex),
        )}
      </g>
    );
  };

  const renderAllWeeks = (): ReactNode =>
    getRange(weekCount).map((weekIndex) => renderWeek(weekIndex));

  return (
    <svg
      width={width}
      viewBox={`0 0 ${width} ${height}`}
      onMouseDown={(e) => e.preventDefault()}
    >
      <g transform={`translate(${weekdayLabelSize}, 0)`}>
        {renderMonthLabels()}
      </g>
      <g transform={`translate(0, ${MONTH_LABEL_SIZE})`}>
        {renderWeekdayLabels()}
      </g>
      <g transform={`translate(${weekdayLabelSize}, ${MONTH_LABEL_SIZE})`}>
        {renderAllWeeks()}
      </g>
    </svg>
  );
}
