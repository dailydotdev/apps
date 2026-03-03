interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartLayout {
  width: number;
  height: number;
  yAxisLabelX: number;
  yTickCount: number;
  xTickStep: number;
  padding: ChartPadding;
}

export const getChartLayout = (
  isTablet: boolean,
  tall?: boolean,
): ChartLayout => {
  let height = 300;
  if (isTablet) {
    height = tall ? 360 : 340;
  }

  return {
    width: isTablet ? 760 : 420,
    height,
    yAxisLabelX: isTablet ? 14 : 18,
    yTickCount: isTablet ? 4 : 3,
    xTickStep: isTablet ? 1 : 2,
    padding: {
      top: isTablet ? 20 : 16,
      right: 20,
      bottom: isTablet ? 52 : 56,
      left: isTablet ? 52 : 58,
    },
  };
};

export const getXAxisTickLabel = (
  index: number,
  pointCount: number,
  compact?: boolean,
): string => {
  if (pointCount <= 1 || index === pointCount - 1) {
    return 'Now';
  }

  const days = pointCount - 1 - index;
  return compact ? `${days}d` : `${days}d ago`;
};

export const getLinePath = (
  values: number[],
  getX: (index: number) => number,
  getY: (value: number) => number,
): string =>
  values.reduce((path, value, index) => {
    const prefix = index === 0 ? 'M' : 'L';
    return `${path}${prefix}${getX(index)},${getY(value)}`;
  }, '');

export const getTooltipPosition = ({
  cursorX,
  cursorY,
  chartWidth,
  chartHeight,
  tooltipWidth = 220,
  tooltipHeight = 150,
  offsetX = 18,
  offsetY = 18,
}: {
  cursorX: number;
  cursorY: number;
  chartWidth: number;
  chartHeight: number;
  tooltipWidth?: number;
  tooltipHeight?: number;
  offsetX?: number;
  offsetY?: number;
}): { x: number; y: number } => {
  let rawX = cursorX + offsetX;
  let rawY = cursorY + offsetY;

  if (rawX + tooltipWidth + 8 > chartWidth) {
    rawX = cursorX - tooltipWidth - offsetX;
  }

  if (rawY + tooltipHeight + 8 > chartHeight) {
    rawY = cursorY - tooltipHeight - offsetY;
  }

  return {
    x: Math.max(8, Math.min(rawX, chartWidth - tooltipWidth - 8)),
    y: Math.max(8, Math.min(rawY, chartHeight - tooltipHeight - 8)),
  };
};
