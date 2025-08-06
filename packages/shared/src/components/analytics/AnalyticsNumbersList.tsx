import type { ReactElement } from 'react';
import React from 'react';
import { ArrowIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';

export const AnalyticsNumbersList = (): ReactElement => {
  return (
    <ul className="flex flex-col gap-2">
      <li className="flex h-8 items-center gap-2">
        <ArrowIcon secondary size={IconSize.Small} />{' '}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="flex-1"
        >
          Upvotes
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          149
        </Typography>
      </li>
      <li className="flex h-8 items-center gap-2">
        <ArrowIcon secondary size={IconSize.Small} />{' '}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="flex-1"
        >
          Upvotes
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          149
        </Typography>
      </li>
      <li className="flex h-8 items-center gap-2">
        <ArrowIcon secondary size={IconSize.Small} />{' '}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="flex-1"
        >
          Upvotes
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          149
        </Typography>
      </li>
    </ul>
  );
};
