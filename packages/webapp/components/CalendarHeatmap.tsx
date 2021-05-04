import React, { CSSProperties, ReactElement, ReactNode, useMemo } from 'react';
import { addDays, differenceInDays, endOfWeek } from 'date-fns';

export type CalendarHeatmapProps<T extends { date: string }> = {
  gutterSize?: number;
  startDate: Date;
  endDate: Date;
  values: T[];
  valueToCount: (value: T) => number;
};

const BINS = 3;
const DAYS_IN_WEEK = 7;
const SQUARE_SIZE = 8;
const MONTH_LABEL_GUTTER_SIZE = 6;
const MONTH_LABEL_SIZE = 18 + MONTH_LABEL_GUTTER_SIZE;
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
  fill: 'var(--theme-label-primary)',
  fontSize: '13',
  lineHeight: '18',
};

const binsAttributes: React.SVGProps<SVGRectElement>[] = [
  {
    stroke: 'var(--theme-divider-quaternary)',
    strokeWidth: 1,
  },
  {
    fill: 'var(--theme-label-disabled)',
  },
  {
    fill: 'var(--theme-label-quaternary)',
  },
  {
    fill: 'var(--theme-label-primary)',
  },
];

function getRange(count: number): number[] {
  return Array.from(new Array(count), (_, i) => i);
}

function getBin(value: number, maxValue: number, minValue: number): number {
  if (!value) {
    return 0;
  }
  if (maxValue === minValue) {
    return BINS;
  }
  const binSize = Math.ceil(maxValue - minValue + 1) / BINS;
  return Math.floor((value - minValue) / binSize) + 1;
}

export default function CalendarHeatmap<T extends { date: string }>({
  startDate,
  endDate,
  gutterSize = 2,
  values,
  valueToCount,
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
  const height = weekWidth + (MONTH_LABEL_SIZE - gutterSize) + weekdayLabelSize;

  const computedValues = useMemo<Record<number, { count: number; date: Date }>>(
    () =>
      values.reduce((acc, value) => {
        const date = new Date(value.date);
        const index = differenceInDays(date, startDateWithEmptyDays);
        if (index < 0) {
          return acc;
        }
        acc[index] = {
          count: valueToCount(value),
          date,
        };
        return acc;
      }, {}),
    [values, valueToCount, startDate, endDate],
  );
  const [maxValue, minValue] = useMemo<[number, number]>(
    () =>
      Object.values(computedValues).reduce(
        (acc, value) => [
          Math.max(acc[0], value.count),
          Math.min(acc[1], value.count),
        ],
        [0, Infinity],
      ),
    [computedValues],
  );

  const getMonthLabelCoordinates = (weekIndex: number): [number, number] => [
    weekIndex * squareSizeWithGutter,
    MONTH_LABEL_SIZE - MONTH_LABEL_GUTTER_SIZE,
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
    const attrs = binsAttributes[getBin(value?.count, maxValue, minValue)];
    return (
      <rect
        key={index}
        width={SQUARE_SIZE}
        height={SQUARE_SIZE}
        x={x}
        y={y}
        rx="3"
        data-count={value?.count}
        {...attrs}
      />
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
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${weekdayLabelSize}, 0)`}>
        {renderMonthLabels()}
      </g>
      <g transform={`translate(${SQUARE_SIZE}, ${MONTH_LABEL_SIZE})`}>
        {renderWeekdayLabels()}
      </g>
      <g transform={`translate(${weekdayLabelSize}, ${MONTH_LABEL_SIZE})`}>
        {renderAllWeeks()}
      </g>
    </svg>
  );
}
