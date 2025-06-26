import type { ReactElement, ComponentProps } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { FunnelStep } from '../types/funnel';
import { FunnelStepType, FunnelBackgroundVariant } from '../types/funnel';
import { useIsLightTheme } from '../../../hooks/utils';
import { isV2 } from '../steps/FunnelPricing/FunnelPricingV2';

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
  [FunnelBackgroundVariant.Cheese]: 'bg-accent-cheese-flat',
  [FunnelBackgroundVariant.BlueCheese]: 'bg-accent-blueCheese-flat',
  [FunnelBackgroundVariant.Onion]: 'bg-accent-onion-flat',
  [FunnelBackgroundVariant.Water]: 'bg-accent-water-flat',
  [FunnelBackgroundVariant.Burger]: 'bg-accent-burger-flat',
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
    return FunnelBackgroundVariant.Blank;
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

const hiddenBgSteps = [FunnelStepType.Checkout];
const alwaysDarkSteps = [
  FunnelStepType.Signup,
  FunnelStepType.Checkout,
  FunnelStepType.OrganicSignup,
  FunnelStepType.BrowserExtension,
];

export const FunnelStepBackground = ({
  children,
  className,
  step,
}: StepBackgroundProps): ReactElement => {
  const isLightMode = useIsLightTheme();
  const isPricingV2 =
    step.type === FunnelStepType.Pricing && isV2(step.parameters);

  const isStepForcedTo = useMemo(
    () => ({
      dark: alwaysDarkSteps.includes(step.type),
      light: isPricingV2,
    }),
    [isPricingV2, step.type],
  );

  const bgClassName = useMemo(() => {
    const variant = getVariantFromStep(step);
    return (
      variantToClassName[variant] ??
      variantToClassName[FunnelBackgroundVariant.Default]
    );
  }, [step]);

  const shouldShowBg =
    !isPricingV2 && !hiddenBgSteps.some((type) => type === step.type);

  const needInvertedColors =
    (isStepForcedTo.dark && isLightMode) ||
    (isStepForcedTo.light && !isLightMode);

  return (
    <div
      className={classNames(
        'relative flex flex-1 flex-col bg-background-default',
        needInvertedColors && 'invert',
      )}
    >
      <div className="relative z-2 flex flex-1 flex-col">{children}</div>
      {shouldShowBg && (
        <div
          aria-hidden
          className={classNames(
            bgClassName,
            className,
            'absolute left-0 top-0 z-1 h-full w-full transition-colors duration-150',
          )}
        />
      )}
    </div>
  );
};
