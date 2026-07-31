import type { CSSProperties, ReactElement, ComponentProps } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import type { EdgeAuraOptions } from 'edge-aura';
import type { FunnelStep } from '../types/funnel';
import { FunnelStepType, FunnelBackgroundVariant } from '../types/funnel';
import { useIsLightTheme } from '../../../hooks/utils';
import { useViewSize, ViewSize } from '../../../hooks';
import { isFunnelPricingV2 } from '../steps/FunnelPricing/common';
import { useOnboardingChrome } from './useOnboardingChrome';

// Dynamic so the canvas engine stays out of the control cohort's bundle and the
// extension's — this module renders on every funnel step.
const EdgeAura = dynamic(
  () => import('edge-aura/react').then((mod) => mod.EdgeAura),
  { ssr: false },
);

interface StepBackgroundProps extends ComponentProps<'div'> {
  step: FunnelStep;
  isOnboarding?: boolean;
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

// Above the funnel's own layers (content z-2, docked CTA z-3).
const AURA_STYLE: CSSProperties = { zIndex: 4 };

// The engine's own 350ms crossfade runs at each end of this hold.
const PULSE_HOLD_MS = 620;

// Opal's shape leaned into lavender, so the crossfade reads as the same ring
// flushing rather than a swap to the stock `ultraviolet`.
const PULSE_PALETTE: Array<[number, [number, number, number]]> = [
  [0, [124, 100, 232]],
  [0.2, [156, 118, 250]],
  [0.42, [198, 158, 255]],
  [0.6, [172, 128, 248]],
  [0.82, [128, 104, 226]],
  [1, [124, 100, 232]],
];

// Steps that drop the funnel's per-step wash for one surface across the flow.
const onboardingSteps = [
  FunnelStepType.ProfileForm,
  FunnelStepType.EditTags,
  FunnelStepType.ContentTypes,
  FunnelStepType.ReadingReminder,
  FunnelStepType.InstallPwa,
  FunnelStepType.BrowserExtension,
  // Also rendered by the paid funnel; the `isOnboarding` gate covers these.
  FunnelStepType.Pricing,
  FunnelStepType.UploadCv,
  FunnelStepType.PlusCards,
];

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
const tallTopGradientSteps = [FunnelStepType.EditTags];
const alwaysDarkSteps = [
  FunnelStepType.Signup,
  FunnelStepType.Checkout,
  FunnelStepType.OrganicSignup,
  FunnelStepType.HeroLanding,
  FunnelStepType.BrowserExtension,
];
export const FunnelStepBackground = ({
  children,
  className,
  step,
  isOnboarding,
}: StepBackgroundProps): ReactElement => {
  const isLightMode = useIsLightTheme();
  const isPricingV2 =
    step.type === FunnelStepType.Pricing && isFunnelPricingV2(step.parameters);

  const isStepForcedTo = useMemo(
    () => ({
      // The iOS share-sheet footage only exists dark.
      dark:
        alwaysDarkSteps.includes(step.type) ||
        (!!isOnboarding && step.type === FunnelStepType.InstallPwa),
      light: isPricingV2,
    }),
    [isOnboarding, isPricingV2, step.type],
  );

  const bgClassName = useMemo(() => {
    const variant = getVariantFromStep(step);
    return (
      variantToClassName[variant] ??
      variantToClassName[FunnelBackgroundVariant.Default]
    );
  }, [step]);

  const isOnboardingStep =
    !!isOnboarding && onboardingSteps.includes(step.type);
  // Aura and dots are one experiment arm; the flat surface is the control.
  const { hasAura: isAuraArm } = useOnboardingChrome(isOnboarding);
  const hasAura = isOnboardingStep && isAuraArm;
  const isMobile = useViewSize(ViewSize.MobileXL);
  // The engine only needs the value to change to fire a swell.
  const [stepPulse, setStepPulse] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  useEffect(() => {
    setStepPulse((count) => count + 1);
    setIsPulsing(true);
    const timeout = setTimeout(() => setIsPulsing(false), PULSE_HOLD_MS);

    return () => clearTimeout(timeout);
  }, [step.id]);
  const auraOptions = useMemo<EdgeAuraOptions>(
    () => ({
      geometry: {
        band: isMobile ? 44 : 76,
        coreSigmaBase: 1.8,
        coreSigmaVar: 0.8,
        innerSoftBase: 1.25,
        innerSoftVar: 0.95,
        // Else the square screen corner is left dark outside the ring's arc.
        cornerFill: true,
        cornerRadius: 28,
      },
      motion: {
        // Co-prime periods, so the crests never settle into a repeating shape.
        rotateIdleS: 13,
        hueDriftPeriodS: 17,
        highlight: { arcDeg: 100, periodS: 19, min: 0.22 },
        decay: 2.1,
        hueDriftDeg: 26,
      },
      input: {
        savedPulseEnergy: 1.25,
      },
      palette: {
        // The engine defaults to 'light', so it has to follow the funnel.
        background: isLightMode ? 'light' : 'dark',
        ringAlpha: 0.7,
        pastel: 0.5,
      },
    }),
    [isLightMode, isMobile],
  );
  const shouldShowBg =
    !isPricingV2 &&
    !isOnboardingStep &&
    !hiddenBgSteps.some((type) => type === step.type);

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
      {/* Above the content, so the ring reads as the screen's own edge glowing.
          The engine's canvas is fixed and click-through. */}
      {hasAura && (
        <EdgeAura
          options={auraOptions}
          palette={isPulsing ? PULSE_PALETTE : 'opal'}
          savedAt={stepPulse}
          style={AURA_STYLE}
        />
      )}
      {shouldShowBg && (
        <div
          aria-hidden
          className={classNames(
            tallTopGradientSteps.includes(step.type)
              ? 'bg-gradient-funnel-onboarding-tall'
              : bgClassName,
            className,
            'absolute left-0 top-0 z-1 h-full w-full transition-colors duration-150',
          )}
        />
      )}
    </div>
  );
};
