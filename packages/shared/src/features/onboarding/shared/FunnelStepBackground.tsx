import type { ReactElement, ComponentProps } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { FunnelStep } from '../types/funnel';
import { FunnelStepType, FunnelBackgroundVariant } from '../types/funnel';
import { useIsLightTheme } from '../../../hooks/utils';

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

const alwaysDarkSteps = [
  FunnelStepType.SocialProof,
  FunnelStepType.Loading,
  FunnelStepType.Signup,
  FunnelStepType.Checkout,
  FunnelStepType.PaymentSuccessful,
];

export const FunnelStepBackground = ({
  children,
  className,
  step,
}: StepBackgroundProps): ReactElement => {
  const isLightMode = useIsLightTheme();

  const isForcedDarkThemeStep = useMemo(
    () => alwaysDarkSteps.includes(step.type),
    [step.type],
  );

  const bgClassName = useMemo(() => {
    const variant = getVariantFromStep(step);
    return (
      variantToClassName[variant] ??
      variantToClassName[FunnelBackgroundVariant.Default]
    );
  }, [step]);

  return (
    <div
      className={classNames(
        'relative flex flex-1 flex-col bg-background-default',
        isForcedDarkThemeStep && isLightMode && 'invert',
      )}
    >
      <div className="relative z-2 flex flex-1 flex-col">{children}</div>
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
