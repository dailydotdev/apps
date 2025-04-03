import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { AllowedTags, TypographyProps } from '../typography/Typography';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { PricingCaptionColor } from '../../graphql/paddle';

interface PlusPlanExtraLabelProps {
  label: string;
  color: PricingCaptionColor;
  className?: string;
  typographyProps?: Omit<TypographyProps<AllowedTags>, 'className'>;
}

export enum PlusLabelColor {
  Success = 'bg-action-upvote-float',
  Help = 'bg-action-help-float',
}

export const captionToColor = {
  [PlusLabelColor.Success]: PlusLabelColor.Success,
  [PlusLabelColor.Help]: PlusLabelColor.Help,
};

export const captionToTypographyColor = {
  [PlusLabelColor.Success]: TypographyColor.StatusSuccess,
  [PlusLabelColor.Help]: TypographyColor.StatusHelp,
};

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
      className={classNames(
        'rounded-10 px-2 py-1',
        captionToColor[color],
        className,
      )}
      bold
    >
      {label}
    </Typography>
  );
}
