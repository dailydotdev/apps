import type { ReactElement, ComponentProps } from 'react';
import React from 'react';
import classNames from 'classnames';

export enum StepBackgroundVariant {
  Default = 'default',
  Blank = 'blank',
}

interface StepBackgroundProps extends ComponentProps<'div'> {
  variant: StepBackgroundVariant;
}

const variantToClassName: Record<StepBackgroundVariant, string> = {
  [StepBackgroundVariant.Default]: `background: linear-gradient(0deg, var(--Colors-Background-default, #0E1217), var(--Colors-Background-default, #0E1217)),
radial-gradient(100% 22.49% at 100% -16.88%, #7147ED 0%, rgba(113, 71, 237, 0) 100%),
radial-gradient(100% 22.49% at 0% -16.88%, #CE3DF3 0%, rgba(206, 61, 243, 0) 100%);
`,
  [StepBackgroundVariant.Blank]: 'bg-background-default',
};

export const StepBackground = ({
  children,
  className,
  variant,
}: StepBackgroundProps): ReactElement => {
  const bgClassName = variantToClassName[variant];
  return (
    <div className={classNames(bgClassName, className, '')}>{children}</div>
  );
};
