import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export enum WidgetVariant {
  Default = 'default',
  Minimal = 'minimal',
}

interface WidgetCardProps extends ComponentProps<'section'> {
  heading?: string;
  className?: string;
  variant?: WidgetVariant;
}

export const WidgetCard = ({
  heading,
  className,
  children,
  variant = WidgetVariant.Default,
  ...attrs
}: WidgetCardProps): ReactElement => {
  const isDefaultVariant = variant === WidgetVariant.Default;

  return (
    <section
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary',
        className,
      )}
      {...attrs}
    >
      <header
        className={classNames(
          isDefaultVariant
            ? 'border-b border-b-border-subtlest-tertiary'
            : 'px-4 pt-4',
        )}
      >
        <Typography
          bold={!isDefaultVariant}
          className={classNames(isDefaultVariant && 'my-0.5 px-4 py-3')}
          color={
            isDefaultVariant
              ? TypographyColor.Tertiary
              : TypographyColor.Primary
          }
          tag={TypographyTag.H4}
          type={isDefaultVariant ? TypographyType.Body : TypographyType.Callout}
        >
          {heading}
        </Typography>
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
};
