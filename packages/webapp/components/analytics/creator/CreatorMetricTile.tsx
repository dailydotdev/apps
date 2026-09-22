import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import type {
  CreatorMetric,
  CreatorPerformancePeriod,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { getMetricDelta, metricScopeLabel, unknownValueLabel } from './common';

interface CreatorMetricTileProps {
  label: string;
  info: string;
  icon: ReactNode;
  metric: CreatorMetric;
  period: CreatorPerformancePeriod;
  /** Why the number is unknown, shown instead of a zero. */
  unknownReason: string;
}

const deltaColor = (percentage: number): TypographyColor => {
  if (percentage > 0) {
    return TypographyColor.StatusSuccess;
  }

  return percentage < 0
    ? TypographyColor.StatusError
    : TypographyColor.Tertiary;
};

const DeltaChip = ({
  metric,
}: {
  metric: CreatorMetric;
}): ReactElement | null => {
  const delta = getMetricDelta(metric);

  if (delta.kind === 'none') {
    return null;
  }

  if (delta.kind === 'new') {
    return (
      <Tooltip content="Nothing in the previous period to compare against">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.StatusSuccess}
          bold
        >
          New
        </Typography>
      </Tooltip>
    );
  }

  const { percentage } = delta;

  return (
    <Typography
      type={TypographyType.Footnote}
      color={deltaColor(percentage)}
      bold
    >
      {percentage > 0 && '+'}
      {percentage}%
    </Typography>
  );
};

export const CreatorMetricTile = ({
  label,
  info,
  icon,
  metric,
  period,
  unknownReason,
}: CreatorMetricTileProps): ReactElement => {
  const isUnknown = metric.value === null;

  return (
    <DataTile
      label={label}
      info={info}
      icon={icon}
      value={
        isUnknown ? (
          <Tooltip content={unknownReason}>
            <span
              className="text-text-tertiary"
              // The dash is decorative; the reason is the actual content.
              aria-label={unknownReason}
            >
              {unknownValueLabel}
            </span>
          </Tooltip>
        ) : (
          metric.value
        )
      }
      subtitle={
        <span className="flex flex-row items-center gap-2">
          {!isUnknown && <DeltaChip metric={metric} />}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {metricScopeLabel(metric, period)}
          </Typography>
        </span>
      }
    />
  );
};
