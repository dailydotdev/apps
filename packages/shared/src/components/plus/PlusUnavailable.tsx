import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { SitesIcon } from '../icons';
import {
  TypographyType,
  TypographyColor,
  Typography,
} from '../typography/Typography';
import type { WithClassNameProps } from '../utilities/common';

export type PlusUnavailableProps = WithClassNameProps;

export const PlusUnavailable = ({
  className,
}: PlusUnavailableProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex flex-1 flex-col items-center justify-center gap-4 text-center',
        className,
      )}
    >
      <SitesIcon size={IconSize.XXXLarge} />
      <Typography
        type={TypographyType.Callout}
        bold
        color={TypographyColor.Primary}
      >
        Unfortunately, this service is not available in your region.
      </Typography>
    </div>
  );
};
