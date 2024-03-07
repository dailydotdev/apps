import React, { ReactElement, useMemo } from 'react';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PublishTimeFormat } from '../../lib/featureValues';

interface DateFormatProps {
  date: string | number | Date;
  type?: TimeFormatType;
  className?: string;
  prefix?: string;
}
export default function DateFormat({
  date,
  type,
  className,
  prefix,
}: DateFormatProps): ReactElement {
  const convertedDate = new Date(date);
  const publishTimeFormat = useFeature(feature.publishTimeFormat);
  const timeFormat =
    publishTimeFormat === PublishTimeFormat.V1 &&
    type !== TimeFormatType.ReadHistory
      ? TimeFormatType.Generic
      : type;

  const renderDate = useMemo(
    () => date && formatDate({ value: date, type: timeFormat }),
    [date, timeFormat],
  );

  return (
    <time
      title={convertedDate.toISOString()}
      className={className}
      dateTime={convertedDate.toISOString()}
    >
      {prefix}
      {renderDate}
    </time>
  );
}
