import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import type { AnalyticsNumberList } from './common';
import { Tooltip } from '../tooltip/Tooltip';
import { InfoIcon } from '../icons';

export const AnalyticsNumbersList = ({
  data,
}: {
  data: AnalyticsNumberList;
}): ReactElement => {
  return (
    <ul className="flex flex-col gap-2">
      {data.map(({ icon, label, value, tooltip }) => {
        return (
          <li className="flex h-8 items-center gap-2" key={label}>
            {React.cloneElement(icon, {
              size: IconSize.Small,
              className: 'text-text-secondary',
            })}
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              {label}
            </Typography>
            {tooltip && (
              <Tooltip content={tooltip} className="max-w-40 text-center">
                <div>
                  <InfoIcon
                    className="text-text-disabled"
                    size={IconSize.Size16}
                  />
                </div>
              </Tooltip>
            )}
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
              className="ml-auto"
            >
              {value}
            </Typography>
          </li>
        );
      })}
    </ul>
  );
};
