import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

interface SectionEyebrowProps {
  label: string;
  className?: string;
  trailing?: ReactNode;
}

export const SectionEyebrow = ({
  label,
  className,
  trailing,
}: SectionEyebrowProps): ReactElement => (
  <div
    className={classNames(
      'mb-4 mt-6 flex items-baseline justify-between border-b border-border-subtlest-tertiary pb-2',
      className,
    )}
  >
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
      bold
      className="uppercase tracking-[0.16em]"
    >
      {label}
    </Typography>
    {trailing ? (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {trailing}
      </Typography>
    ) : null}
  </div>
);
