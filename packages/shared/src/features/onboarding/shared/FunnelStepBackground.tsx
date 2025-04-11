import type { ReactElement, ComponentProps } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { FunnelStep } from '../types/funnel';
import { FunnelStepType, FunnelBackgroundVariant } from '../types/funnel';

interface StepBackgroundProps extends ComponentProps<'div'> {
  step: FunnelStep;
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

const getVariantFromStep = (step: FunnelStep): FunnelBackgroundVariant => {
  if (!step) {
    return FunnelBackgroundVariant.Default;
  }

  const { parameters } = step;

  if (parameters.backgroundType) {
    return parameters.backgroundType;
  }

  if (step.type === FunnelStepType.Loading) {
    return FunnelBackgroundVariant.Hourglass;
  }

  if (step.type === FunnelStepType.SocialProof) {
    return FunnelBackgroundVariant.Top;
  }

  if (step.type === FunnelStepType.Fact) {
    return parameters?.reverse
      ? FunnelBackgroundVariant.Top
      : FunnelBackgroundVariant.Bottom;
  }

  return FunnelBackgroundVariant.Default;
};

export const FunnelStepBackground = ({
  children,
  className,
  step,
}: StepBackgroundProps): ReactElement => {
  const bgClassName = useMemo(() => {
    const variant = getVariantFromStep(step);
    return (
      variantToClassName[variant] ??
      variantToClassName[FunnelBackgroundVariant.Default]
    );
  }, [step]);
  return (
    <div className="relative min-h-dvh bg-background-default">
      <div className="relative z-2">{children}</div>
      <div
        aria-hidden
        className={classNames(
          bgClassName,
          className,
          'absolute left-0 top-0 z-1 h-full w-full transition-colors duration-150',
        )}
      />
    </div>
  );
};
