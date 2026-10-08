import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepBackground';
import type { FunnelStep } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  featureOnboardingChrome,
  OnboardingChromeVariant,
} from '@dailydotdev/shared/src/lib/featureManagement';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { SettingsContextData } from '@dailydotdev/shared/src/contexts/SettingsContext';
import SettingsContext, {
  ThemeMode,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

// Scaffolding for the commitment screen explorations. The phone chrome is the
// production funnel's own, composed the way FunnelStepper does on /onboarding:
// FunnelStepBackground around the step, then FunnelStepCtaWrapper drawing the
// logo top bar, the skip and the glass CTA bar. Only the middle of each screen
// is a prototype.

// FunnelStepBackground reads the theme to decide whether to invert a step
// that is forced dark; a reminder-type step never is, so Auto is enough.
const settings = {
  loadedSettings: true,
  themeMode: ThemeMode.Auto,
} as unknown as SettingsContextData;

/** Stand-in for the step FunnelStepper would hand the background. */
const step = {
  id: 'commitment',
  type: FunnelStepType.ReadingReminder,
  parameters: { headline: '' },
  transitions: [],
} as unknown as FunnelStep;

const motionCss = `
@keyframes csRise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
@keyframes csHalo {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes csFloat {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
}
@keyframes csSwallow {
  to { opacity: 0; transform: scale(0.55); }
}
.cs-float img { animation: csFloat 2.8s ease-in-out infinite; }
@keyframes csBubble {
  from { opacity: 0; transform: translateY(6px) scale(0.9); }
  to { opacity: 1; transform: none; }
}
/* Confetti: each piece flies out on its own vector, tumbles, then falls
   and fades. Fired once, never looped. */
@keyframes csConfetti {
  0% { opacity: 1; transform: translate(0, 0) rotate(0) scale(0.6); }
  25% { opacity: 1; transform: translate(calc(var(--cs-dx) * 0.7), calc(var(--cs-dy) * 0.8)) rotate(calc(var(--cs-spin) * 0.4)) scale(1); }
  100% { opacity: 0; transform: translate(var(--cs-dx), calc(var(--cs-dy) + 140px)) rotate(var(--cs-spin)) scale(0.8); }
}
.light .cs-spark { background-color: var(--theme-accent-cheese-bolder); }
.cs-confetti { animation: csConfetti var(--cs-duration, 1.4s) cubic-bezier(0.2, 0.7, 0.3, 1) var(--cs-delay, 0ms) both; }
/* Ghost drag: the bone dips toward the dog and comes back. Two passes. */
@keyframes csGhost {
  0%, 100% { transform: translateY(0); }
  45% { transform: translateY(72px) scale(1.06); }
  60% { transform: translateY(72px) scale(1.06); }
}
.cs-ghost img { animation: csGhost 1.6s cubic-bezier(0.45, 0, 0.2, 1) 2; }
/* The funnel's CTA rail, held back while a screen plays its opening. */
.cs-phone .sticky.bottom-0 { transition: opacity 600ms ease-out; }
.cs-intro .sticky.bottom-0 { opacity: 0; pointer-events: none; }
.cs-bubble { animation: csBubble 320ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: 0 100%; }
.cs-swallow img { animation: csSwallow 220ms ease-in forwards; }
@keyframes csDigit {
  from { opacity: 0; transform: translateY(45%); filter: blur(3px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes csSheet {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: none; }
}
.cs-digit { display: inline-block; animation: csDigit 260ms cubic-bezier(0.16, 1, 0.3, 1) both; }
/* Backwards only: holding the end state would override the fade-out after. */
.cs-sheet { animation: csSheet 560ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
.cs-rise { animation: csRise 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.cs-halo { animation: csHalo 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
/* Press feedback: 0.96, never lower, and only on things you actually press. */
.cs-press { transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.cs-press:active { transform: scale(0.96); }
.cs-touch { touch-action: none; user-select: none; -webkit-user-select: none; }
@media (prefers-reduced-motion: reduce) {
  .cs-rise, .cs-halo, .cs-bubble, .cs-digit, .cs-sheet { animation-duration: 1ms; }
  .cs-float img, .cs-ghost img, .cs-confetti { animation: none; }
  .cs-confetti { opacity: 0; }
  .cs-press { transition: none; }
}
`;

export const Motion = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: motionCss }} />
);

// Golden confetti, fired once when a commitment lands. Deterministic so every
// replay looks the same; three shapes and four tones so it reads as a shower
// and not a grid.
const CONFETTI = Array.from({ length: 28 }, (_, index) => {
  const angle = -Math.PI * (0.15 + (0.7 * index) / 27) + (index % 3) * 0.08;
  return {
    id: index,
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    distance: 90 + (index % 5) * 26,
    spin: 240 + (index % 7) * 90,
    delay: (index % 4) * 40,
    duration: 1200 + (index % 5) * 120,
    shape: index % 3,
    tone: index % 4,
  };
});

const confettiTone = [
  'bg-accent-cheese-default',
  'bg-accent-bun-default',
  'bg-accent-cheese-subtle',
  // White sparks on dark; on a light page they turn deep gold, or they vanish.
  'cs-spark bg-white',
];

const confettiShape = [
  'h-3.5 w-2 rounded-2',
  'size-2.5 rounded-full',
  'h-2 w-4 rounded-2',
];

export const Confetti = ({
  origin,
  spread = 1,
}: {
  /** Where the burst starts, inside the nearest positioned parent. */
  origin: { left: string; top: string };
  spread?: number;
}): ReactElement => (
  <span aria-hidden className="pointer-events-none absolute z-2" style={origin}>
    {CONFETTI.map(
      ({ id, cos, sin, distance, spin, delay, duration, shape, tone }) => (
        <span
          key={id}
          className={classNames(
            'cs-confetti absolute -left-1 -top-1 shadow-[0_0_6px_rgba(255,200,60,0.6)]',
            confettiShape[shape],
            confettiTone[tone],
          )}
          style={
            {
              '--cs-dx': `${Math.round(cos * distance * spread)}px`,
              '--cs-dy': `${Math.round(sin * distance * spread)}px`,
              '--cs-spin': `${spin}deg`,
              '--cs-delay': `${delay}ms`,
              '--cs-duration': `${duration}ms`,
            } as CSSProperties
          }
        />
      ),
    )}
  </span>
);

// The nine-step signup funnel plus this screen, slotted in sixth: straight
// after the reading reminder, where the habit has just been scheduled.
export const COMMITMENT_STEP_INDEX = 5;
const progress = {
  chapters: [{ steps: 10 }],
  position: { chapter: 0, step: COMMITMENT_STEP_INDEX },
  isOnboarding: true,
};

export interface ScreenProps {
  /** The gesture is done; the CTA may now advance. */
  onCommit: () => void;
}

export interface PhoneProps {
  /** The `onboarding_chrome` experiment arm: control is the flat surface. */
  chrome?: OnboardingChromeVariant;
  headline: ReactNode;
  subheadline?: ReactNode;
  cta: { idle: string; done: string };
  /** When false the CTA sits disabled until the gesture completes. */
  isDone: boolean;
  /** Drops the "Not now" skip from the top bar. */
  hasSkip?: boolean;
  /** Holds the CTA rail back while a screen plays its opening. */
  isIntro?: boolean;
  onCta?: () => void;
  skipLabel?: string;
  onSkip?: () => void;
  children: ReactNode;
}

/**
 * The screen at the real viewport. Every story renders it inside a device-sized
 * iframe, so the funnel's own breakpoints and `min-h-dvh` apply as on a device.
 */
export const Screen = ({
  isIntro = false,
  children,
}: {
  isIntro?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'cs-phone flex min-h-dvh flex-col bg-background-default text-text-primary',
      isIntro && 'cs-intro',
    )}
  >
    {children}
  </div>
);

/** Feed Patchy inside the production funnel chrome. */
export const Phone = ({
  chrome = OnboardingChromeVariant.Control,
  headline,
  subheadline,
  cta,
  isDone,
  hasSkip = true,
  isIntro = false,
  onCta,
  skipLabel = 'Not now',
  onSkip,
  children,
}: PhoneProps): ReactElement => {
  return (
    <FeatureOverrides values={{ [featureOnboardingChrome.id]: chrome }}>
      <SettingsContext.Provider value={settings}>
        <Screen isIntro={isIntro}>
          {/* Same tree as FunnelStepper: section, background, progress, the
            width-capped column, then the step's own flex column. */}
          <section className="flex min-h-dvh flex-col">
            <FunnelStepBackground step={step} isOnboarding>
              <FunnelProgressContext.Provider value={progress}>
                {/* Full width, as onboarding renders the reading-reminder step
                  whose slot this takes (stepsFullWidthOnboarding). */}
                <div className="mx-auto flex w-full flex-1 flex-col">
                  <div className="flex flex-1 flex-col">
                    <FunnelStepCtaWrapper
                      isGlass
                      cta={{ label: isDone ? cta.done : cta.idle }}
                      disabled={!isDone}
                      onClick={onCta}
                      skip={
                        hasSkip
                          ? { cta: skipLabel, onClick: onSkip }
                          : undefined
                      }
                      containerClassName="flex w-full flex-1 flex-col"
                    >
                      <div
                        className={classNames(
                          funnelStepRail,
                          'flex flex-1 flex-col items-center gap-6 pb-6 pt-3',
                          // A tall tablet or desktop viewport centres the scene
                          // instead of stretching it down to the CTA.
                          'tablet:justify-center',
                        )}
                      >
                        <div className="flex w-full flex-col items-center gap-3">
                          <OnboardingHeadline>{headline}</OnboardingHeadline>
                          {subheadline && (
                            <OnboardingSubheadline>
                              {subheadline}
                            </OnboardingSubheadline>
                          )}
                        </div>
                        {children}
                      </div>
                    </FunnelStepCtaWrapper>
                  </div>
                </div>
              </FunnelProgressContext.Provider>
            </FunnelStepBackground>
          </section>
        </Screen>
      </SettingsContext.Provider>
    </FeatureOverrides>
  );
};

export const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default px-6 pb-24 pt-8 text-text-primary tablet:px-10">
    <Motion />
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-12">
      {children}
    </div>
  </div>
);

export const PageHeader = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
    <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
      {eyebrow}
    </span>
    <h1 className="max-w-[40ch] typo-mega3">{title}</h1>
    {children && (
      <div className="flex max-w-[76ch] flex-col gap-3 text-text-tertiary typo-body">
        {children}
      </div>
    )}
  </header>
);

/* ── Devices ─────────────────────────────────────────────────────────── */

export const devices = {
  phone: { width: 390, height: 844, label: 'iPhone, 390 × 844' },
  small: { width: 375, height: 667, label: 'iPhone SE, 375 × 667' },
  ipad: { width: 820, height: 1180, label: 'iPad Air, portrait · 820 × 1180' },
  web: { width: 1440, height: 900, label: 'Web · 1440 × 900' },
};

export type Device = keyof typeof devices;

const BEZEL = { phone: 10, small: 10, ipad: 18, web: 0 };
const BROWSER_BAR = 44;

/**
 * Loads a full-viewport story in an iframe the size of a real device, so every
 * media query and `useViewSize` check sees that device's width. Scaled down to
 * fit the canvas; the iframe still lays out at full size.
 */
export const DeviceFrame = ({
  device,
  storyId,
  theme,
  label: labelOverride,
  args,
}: {
  device: Device;
  storyId: string;
  theme?: string;
  /** Replaces the device's size label above the frame. */
  label?: string;
  /** Story args for the framed story, in Storybook's URL form (`a:1;b:2`). */
  args?: string;
}): ReactElement => {
  const { width, height } = devices[device];
  const label = labelOverride ?? devices[device].label;
  const bezel = BEZEL[device];
  const bar = device === 'web' ? BROWSER_BAR : 0;
  const outerWidth = width + bezel * 2;
  const outerHeight = height + bezel * 2 + bar;
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const element = host.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / outerWidth));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [outerWidth]);

  const src = `iframe.html?id=${storyId}&viewMode=story${
    theme ? `&globals=theme:${theme}` : ''
  }${args ? `&args=${args}` : ''}`;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between">
        <span className="text-text-tertiary typo-footnote">{label}</span>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          onClick={() => setRun((current) => current + 1)}
        >
          Replay
        </Button>
      </div>
      <div ref={host} className="w-full">
        <div
          style={{ width: outerWidth * scale, height: outerHeight * scale }}
          className="mx-auto"
        >
          <div
            style={{
              width: outerWidth,
              height: outerHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              padding: bezel,
            }}
            className={classNames(
              'flex flex-col overflow-hidden border-2 border-border-subtlest-tertiary bg-background-default shadow-3',
              device === 'web' ? 'rounded-16' : 'rounded-[3rem]',
            )}
          >
            {device === 'web' && (
              <div
                className="flex shrink-0 items-center gap-4 border-b border-border-subtlest-tertiary bg-surface-float px-4"
                style={{ height: bar }}
              >
                <span className="flex gap-2" aria-hidden>
                  <span className="size-3 rounded-full bg-accent-ketchup-default" />
                  <span className="size-3 rounded-full bg-accent-cheese-default" />
                  <span className="size-3 rounded-full bg-accent-avocado-default" />
                </span>
                <span className="mx-auto w-1/3 rounded-8 bg-background-default px-3 py-1 text-center text-text-tertiary typo-footnote">
                  app.daily.dev/onboarding
                </span>
              </div>
            )}
            <iframe
              key={run}
              title={label}
              src={src}
              // A page of phones only boots the ones scrolled into view.
              loading="lazy"
              width={width}
              height={height}
              className={classNames(
                'block shrink-0 border-0',
                device === 'ipad' && 'rounded-[2rem]',
                (device === 'phone' || device === 'small') &&
                  'rounded-[2.25rem]',
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
