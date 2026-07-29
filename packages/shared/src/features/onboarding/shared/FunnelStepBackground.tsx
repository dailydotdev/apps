import type { CSSProperties, ReactElement, ComponentProps } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { EdgeAura } from 'edge-aura/react';
import type { EdgeAuraOptions } from 'edge-aura';
import type { FunnelStep } from '../types/funnel';
import { FunnelStepType, FunnelBackgroundVariant } from '../types/funnel';
import { useIsLightTheme } from '../../../hooks/utils';
import { useViewSize, ViewSize } from '../../../hooks';
import { isFunnelPricingV2 } from '../steps/FunnelPricing/common';
import { OnboardingBackground } from './OnboardingBackground';
import { useOnboardingChrome } from './useOnboardingChrome';

interface StepBackgroundProps extends ComponentProps<'div'> {
  step: FunnelStep;
  // Only the post-signup onboarding funnel gets the aura; `/helloworld` renders
  // the same step types with their original gradients.
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

// Above the funnel's own layers (content is z-2, the docked CTA z-3) so the
// glow spills over the UI at the edges the way a screen-edge light does.
const AURA_STYLE: CSSProperties = { zIndex: 4 };

// How long the ring holds the violet palette before crossfading back. Short
// enough that the flush reads as a reaction to the tap rather than a mood the
// step settles into — the engine's own 350ms crossfade runs at each end of it.
const PULSE_HOLD_MS = 620;

/**
 * The pulse colour. Not the engine's stock `ultraviolet` — that swaps the whole
 * ring for a different mood and reads as a jump cut. These stops keep opal's
 * shape and lean it into lavender, so the 350ms crossfade lands as the same
 * ring flushing purple and settling back.
 */
const PULSE_PALETTE: Array<[number, [number, number, number]]> = [
  [0, [124, 100, 232]],
  [0.2, [156, 118, 250]],
  [0.42, [198, 158, 255]],
  [0.6, [172, 128, 248]],
  [0.82, [128, 104, 226]],
  [1, [124, 100, 232]],
];

// The post-signup onboarding steps. They drop the funnel's per-step purple wash
// for one canvas across the whole flow, so it reads as a single surface: the
// brand gradient by default, the edge aura on the experiment arm.
const onboardingSteps = [
  FunnelStepType.ProfileForm,
  FunnelStepType.EditTags,
  FunnelStepType.ContentTypes,
  FunnelStepType.ReadingReminder,
  FunnelStepType.InstallPwa,
  FunnelStepType.BrowserExtension,
  // Also rendered by the paid funnel — the `isOnboarding` gate below keeps
  // this treatment out of `/helloworld`.
  FunnelStepType.Pricing,
  FunnelStepType.UploadCv,
  FunnelStepType.PlusCards,
  FunnelStepType.VerifyEmail,
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
      // Install PWA's footage (the iOS share sheet) only exists dark, so in the
      // onboarding funnel the step forces a dark surface the way the extension
      // step always has. Onboarding-only: the paid funnel keeps its behavior.
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
  // Aura and dots are one experiment arm; the gradient canvas is the control.
  const { hasAura: isAuraArm } = useOnboardingChrome(isOnboarding);
  const hasAura = isOnboardingStep && isAuraArm;
  const isMobile = useViewSize(ViewSize.MobileXL);
  // Every step change bumps this, and each change fires one ambient swell in
  // the ring — the funnel reacting to the user moving forward rather than
  // sitting there. The engine only needs the value to change; the first bump
  // off 0 pulses as the funnel opens.
  const [stepPulse, setStepPulse] = useState(0);
  // The pulse recolours the RING: the engine crossfades palettes over 350ms, so
  // swapping to the violet set and back reads as the gradient itself flushing
  // purple. A tinted overlay on top looked like the page background changing.
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
        // `band` is the depth of the inward dissolve, not the width of the
        // bright edge — the core line is a separate, absolute thickness. A deep
        // band with a thin core is what reads as light bleeding into the page
        // (Apple Intelligence) rather than a frame drawn around it; a shallow
        // band puts the whole falloff in a few pixels and looks like a border.
        band: isMobile ? 44 : 76,
        // The waves are the ring's undulation, not its size: `band` and the
        // `innerSoftBase` average stay put, and only the VARIANCE grows. Deeper
        // troughs and fatter crests make the dark scallops read as a shape
        // travelling around the ring rather than a even band. Core base stays
        // above ~1.0σ at the thin end, below which the engine warns of
        // 1px-grid shimmer.
        coreSigmaBase: 1.8,
        coreSigmaVar: 0.8,
        innerSoftBase: 1.25,
        innerSoftVar: 0.95,
        // Without this the ring's rounded corner leaves the square screen
        // corner as a dark pocket outside the arc. `cornerFill` renders that
        // pocket as the union of the two adjacent bands — square on the outside
        // against the screen, still rounded on the inside.
        cornerFill: true,
        // Softer inner bend than the stock 11px. With `cornerFill` on, a larger
        // radius also shrinks the outward pocket it has to fill.
        cornerRadius: 28,
      },
      motion: {
        // Three cycles on deliberately non-divisible periods — rotation 13s,
        // hue sway 17s, highlight lap 19s. Nothing shares a factor, so the
        // crests drift in and out of phase and the ring never repeats a shape.
        // (Aurora gradients read as organic for the same reason: layers on
        // co-prime durations that occasionally overlap into a hot spot.)
        rotateIdleS: 13,
        // Faster energy decay (default 1.1/s) so the swell snaps back instead
        // of lingering — a quick breath, not a slow fade.
        decay: 2.1,
        hueDriftDeg: 26,
        hueDriftPeriodS: 17,
        // `min` is the bloom left OUTSIDE the crest. Dropping it far below the
        // default is what turns a uniform band into one dominant travelling
        // wave with quiet stretches either side.
        highlight: { arcDeg: 100, periodS: 19, min: 0.22 },
      },
      input: {
        // The step-change swell is the engine's own amplitude reaction — real
        // physics rather than a CSS filter, so it blooms outward instead of
        // washing the ring white. Pushed near the 1.5 saturation cap so the
        // bloom is unmistakable on tap.
        savedPulseEnergy: 1.25,
      },
      palette: {
        // Palette weight is measured as distance from the page. On a dark
        // background the engine also lifts the faint tail and pre-lifts chroma,
        // which is what gives the ring its body on black — and it defaults to
        // "light", so it has to follow the funnel's theme.
        background: isLightMode ? 'light' : 'dark',
        // Quieter than the stock 0.90/0.35: this is a background for a form,
        // not the centrepiece, so the hues stay milky and the core stops short
        // of full strength.
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
      {/* The aura is a light source, not a backdrop: it sits above the content
          like the reference does, so the ring reads as the screen's own edge
          glowing rather than a gradient the page is printed on. The engine
          renders a fixed, click-through canvas and handles reduced-motion,
          hidden tabs and its own idle frame-rate throttle. */}
      {hasAura && (
        <EdgeAura
          options={auraOptions}
          palette={isPulsing ? PULSE_PALETTE : 'opal'}
          savedAt={stepPulse}
          style={AURA_STYLE}
        />
      )}
      {isOnboardingStep && !hasAura && <OnboardingBackground />}
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
