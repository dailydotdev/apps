import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { AllowedTags, TypographyProps } from '../typography/Typography';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface PlusPlanExtraLabelProps {
  label: string;
  color: PlusLabelColor;
  className?: string;
  typographyProps?: Omit<TypographyProps<AllowedTags>, 'className'>;
}

export enum PlusLabelColor {
  Success = 'bg-action-upvote-float',
  Help = 'bg-action-help-float',
}

export function PlusPlanExtraLabel({
  label,
  color,
  className,
  typographyProps = {},
}: PlusPlanExtraLabelProps): ReactElement {
  return (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      {...typographyProps}
      className={classNames('rounded-10 px-2 py-1', color, className)}
      bold
    >
      {label}
    </Typography>
  );
}
