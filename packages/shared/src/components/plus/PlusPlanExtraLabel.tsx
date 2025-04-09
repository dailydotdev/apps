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
import { PricingCaptionColor } from '../../graphql/paddle';

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

const captionToColor: Record<PricingCaptionColor, PlusLabelColor> = {
  [PricingCaptionColor.Success]: PlusLabelColor.Success,
  [PricingCaptionColor.Help]: PlusLabelColor.Help,
};

const captionToTypographyColor: Record<PricingCaptionColor, TypographyColor> = {
  [PricingCaptionColor.Success]: TypographyColor.StatusSuccess,
  [PricingCaptionColor.Help]: TypographyColor.StatusHelp,
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
        captionToTypographyColor[color],
        className,
      )}
      bold
    >
      {label}
    </Typography>
  );
}
