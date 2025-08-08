import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import type { AnalyticsNumberList } from './common';

export const AnalyticsNumbersList = ({
  data,
}: {
  data: AnalyticsNumberList;
}): ReactElement => {
  return (
    <ul className="flex flex-col gap-2">
      {data.map(({ icon, label, value }) => {
        return (
          <li className="flex h-8 items-center gap-2" key={label}>
            {React.cloneElement(icon, {
              size: IconSize.Small,
              className: 'text-text-secondary',
            })}
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="flex-1"
            >
              {label}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
            >
              {value}
            </Typography>
          </li>
        );
      })}
    </ul>
  );
};
