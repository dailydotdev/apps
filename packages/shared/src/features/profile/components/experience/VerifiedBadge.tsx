import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

export const VerifiedBadge = (): ReactElement => {
  return (
    <div
      className={classNames(
        'my-auto rounded-4 px-1.5 py-[1px]',
        'bg-accent-avocado-flat',
      )}
    >
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.StatusSuccess}
      >
        Verified
      </Typography>
    </div>
  );
};
