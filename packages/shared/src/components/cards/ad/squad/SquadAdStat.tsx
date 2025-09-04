import React from 'react';
import { largeNumberFormat } from '../../../../lib';
import {
  Typography,
  TypographyTag,
  TypographyType,
  TypographyColor,
} from '../../../typography/Typography';
import type { WithClassNameProps } from '../../../utilities';

export const SquadAdStat = ({
  label,
  value,
  className,
}: { label: string; value: number } & WithClassNameProps) => (
  <Typography
    className={className}
    tag={TypographyTag.Span}
    type={TypographyType.Footnote}
    color={TypographyColor.Primary}
  >
    <strong className="mr-1">{largeNumberFormat(value)}</strong>
    <Typography tag={TypographyTag.Span} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
  </Typography>
);
