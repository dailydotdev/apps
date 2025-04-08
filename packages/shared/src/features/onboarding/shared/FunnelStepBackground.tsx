import type { ReactElement, ComponentProps } from 'react';
import React from 'react';
import classNames from 'classnames';

export enum FunnelBackgroundVariant {
  Blank = 'blank',
  Default = 'default',
  Light = 'light',
  Bottom = 'bottom',
  Top = 'top',
  CircleTop = 'circleTop',
  CircleBottom = 'circleBottom',
  Hourglass = 'hourglass',
}

interface StepBackgroundProps extends ComponentProps<'div'> {
  /**
   * @default `FunnelBackgroundVariant.Default`
   */
  variant?: FunnelBackgroundVariant;
}

const variantToClassName: Record<FunnelBackgroundVariant, string> = {
  [FunnelBackgroundVariant.Blank]: 'bg-background-default',
  [FunnelBackgroundVariant.Default]: `bg-gradient-funnel-default`,
  [FunnelBackgroundVariant.Light]: 'bg-gradient-funnel-light',
  [FunnelBackgroundVariant.Top]: 'bg-gradient-funnel-top',
  [FunnelBackgroundVariant.Bottom]: 'bg-gradient-funnel-top rotate-180',
  [FunnelBackgroundVariant.CircleTop]: 'bg-gradient-funnel-circle',
  [FunnelBackgroundVariant.CircleBottom]:
    'bg-gradient-funnel-circle rotate-180',
  [FunnelBackgroundVariant.Hourglass]: 'bg-gradient-funnel-hourglass',
};

export const FunnelStepBackground = ({
  children,
  className,
  variant = FunnelBackgroundVariant.Default,
}: StepBackgroundProps): ReactElement => {
  const bgClassName = variantToClassName[variant];
  return (
    <div className="relative min-h-dvh bg-background-default">
      <div className="relative z-2">{children}</div>
      <div
        aria-hidden
        className={classNames(
          bgClassName,
          className,
          'radialProgress absolute left-0 top-0 z-1 h-full w-full',
        )}
      />
    </div>
  );
};
