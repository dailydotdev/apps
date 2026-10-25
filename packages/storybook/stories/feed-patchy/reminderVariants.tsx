import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';
import {
  formatHour,
  ReminderPicker,
} from '@dailydotdev/shared/src/components/onboarding/FeedPatchy/ReminderPicker';
import { cloudinaryPatchyFed } from '@dailydotdev/shared/src/lib/image';
import { funnelStepRail } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelGlassBar';
import { FunnelStepTopBar } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepTopBar';

// Explorations for "after feeding Patchy, the reminder makes no sense and
// I'll do it later is hard to find". Each variant opens on the moment the
// celebration hands over, built from the production picker, headline and
// glass bar, so only the framing and the way out change.

export type ReminderVariant = 'today' | 'why' | 'ask' | 'preset';

export const reminderVariants: Array<{
  id: ReminderVariant;
  label: string;
  note: string;
}> = [
  {
    id: 'today',
    label: 'Today',
    note: 'Production, fed automatically: the picker arrives with no reason given, and the only way out is the small “I’ll do it later” in the top corner.',
  },
  {
    id: 'why',
    label: 'A. Say why, skip under the CTA',
    note: 'Same picker. A “Committed” check carries over from the moment before, the headline asks instead of assuming, and “Not now” sits right under the main button.',
  },
  {
    id: 'ask',
    label: 'B. Yes or no first',
    note: 'One plain question with two equal buttons. The picker only appears for people who say yes.',
  },
  {
    id: 'preset',
    label: 'C. Time already picked',
    note: 'Patchy proposes 09:00; presets change it in one tap and the full ruler is one tap further. “Not now” and “Turn on” share the bar.',
  },
];

const DEFAULT_HOUR = 9;
const presets = [
  { label: 'Morning', hour: 9 },
  { label: 'Lunch', hour: 12 },
  { label: 'Evening', hour: 17 },
];

const zone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Where the step would hand over, so each choice reads as finished. */
const Outcome = ({
  hour,
  onReplay,
}: {
  hour?: number;
  onReplay: () => void;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
    <OnboardingHeadline>
      {hour === undefined ? 'Skipped' : `Reminder at ${formatHour(hour)}`}
    </OnboardingHeadline>
    <p className="text-text-tertiary typo-callout">
      The funnel moves on to the next step here.
    </p>
    <Button variant={ButtonVariant.Secondary} onClick={onReplay}>
      Replay
    </Button>
  </div>
);

const Patchy = ({ size }: { size: number }): ReactElement => (
  <img
    src={cloudinaryPatchyFed}
    alt="Patchy with the Knowledge Bone"
    className="mx-auto w-auto select-none"
    style={{ height: size }}
  />
);

const Committed = (): ReactElement => (
  <span className="mx-auto flex w-fit items-center gap-1.5 rounded-max bg-overlay-float-avocado px-3 py-1 font-bold text-accent-avocado-default typo-footnote">
    ✓ Committed · Day 1
  </span>
);

/** The glass rail, with room for a way out under the main button. */
const Footer = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="sticky bottom-0 z-3">
    <div
      aria-hidden
      className="absolute inset-x-0 -top-2 bottom-0 bg-gradient-to-t from-background-default via-background-default via-65% to-transparent"
    />
    <div
      className={classNames(
        funnelStepRail,
        'relative flex flex-col gap-2 pb-safe-or-6 pt-6',
      )}
    >
      {children}
    </div>
  </div>
);

const Screen = ({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}): ReactElement => (
  <div className="relative flex flex-1 flex-col gap-4">
    <FunnelStepTopBar />
    <div
      className={classNames(funnelStepRail, 'flex flex-1 flex-col gap-5 pt-3')}
    >
      {children}
    </div>
    <Footer>{footer}</Footer>
  </div>
);

interface VariantProps {
  onDone: (hour?: number) => void;
}

const SayWhy = ({ onDone }: VariantProps): ReactElement => {
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [timezone, setTimezone] = useState(zone);

  return (
    <Screen
      footer={
        <>
          <FunnelGlassBar>
            <Button
              className={funnelGlassBarCta}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              onClick={() => onDone(hour)}
            >
              Remind me at {formatHour(hour)}
            </Button>
          </FunnelGlassBar>
          <Button
            className="w-full"
            variant={ButtonVariant.Tertiary}
            onClick={() => onDone()}
          >
            Not now
          </Button>
        </>
      }
    >
      <Committed />
      <div className="flex flex-col gap-2 text-center">
        <OnboardingHeadline>Want Patchy to remind you?</OnboardingHeadline>
        <OnboardingSubheadline>
          One nudge a day, so day 2 actually happens. Pick when it suits you.
        </OnboardingSubheadline>
      </div>
      <Patchy size={110} />
      <ReminderPicker
        hour={hour}
        onChange={setHour}
        timezone={timezone}
        onTimezoneChange={setTimezone}
      />
    </Screen>
  );
};

const AskFirst = ({ onDone }: VariantProps): ReactElement => {
  const [isPicking, setIsPicking] = useState(false);
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [timezone, setTimezone] = useState(zone);

  if (!isPicking) {
    return (
      <Screen
        footer={
          <div className="flex flex-col gap-2">
            <Button
              size={ButtonSize.Large}
              variant={ButtonVariant.Primary}
              onClick={() => setIsPicking(true)}
            >
              Yes, remind me
            </Button>
            <Button
              size={ButtonSize.Large}
              variant={ButtonVariant.Float}
              onClick={() => onDone()}
            >
              No thanks
            </Button>
          </div>
        }
      >
        <Committed />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Patchy size={200} />
          <div className="flex flex-col gap-2">
            <OnboardingHeadline>
              Should Patchy remind you to read every day?
            </OnboardingHeadline>
            <OnboardingSubheadline>
              One short nudge a day, at a time you choose.
            </OnboardingSubheadline>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          <FunnelGlassBar>
            <Button
              className={funnelGlassBarCta}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              onClick={() => onDone(hour)}
            >
              Remind me at {formatHour(hour)}
            </Button>
          </FunnelGlassBar>
          <Button
            className="w-full"
            variant={ButtonVariant.Tertiary}
            onClick={() => onDone()}
          >
            Not now
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2 text-center">
        <OnboardingHeadline>When suits you best?</OnboardingHeadline>
        <OnboardingSubheadline>
          The time you usually have five minutes.
        </OnboardingSubheadline>
      </div>
      <ReminderPicker
        hour={hour}
        onChange={setHour}
        timezone={timezone}
        onTimezoneChange={setTimezone}
      />
    </Screen>
  );
};

const Preset = ({ onDone }: VariantProps): ReactElement => {
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [timezone, setTimezone] = useState(zone);
  const [isRuler, setIsRuler] = useState(false);

  return (
    <Screen
      footer={
        <FunnelGlassBar>
          <Button
            className="!px-4"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Tertiary}
            onClick={() => onDone()}
          >
            Not now
          </Button>
          <Button
            className={funnelGlassBarCta}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            onClick={() => onDone(hour)}
          >
            Turn on
          </Button>
        </FunnelGlassBar>
      }
    >
      <Committed />
      <Patchy size={150} />
      <div className="flex flex-col gap-2 text-center">
        <OnboardingHeadline>
          Patchy will nudge you daily at {formatHour(hour)}
        </OnboardingHeadline>
        <OnboardingSubheadline>
          A small reminder so your streak doesn’t slip. Change it any time.
        </OnboardingSubheadline>
      </div>
      {isRuler ? (
        <ReminderPicker
          hour={hour}
          onChange={setHour}
          timezone={timezone}
          onTimezoneChange={setTimezone}
          isCompact
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full gap-1 rounded-14 bg-surface-float p-1">
            {presets.map((preset) => (
              <button
                key={preset.hour}
                type="button"
                onClick={() => setHour(preset.hour)}
                className={classNames(
                  'flex flex-1 flex-col items-center rounded-10 py-2 transition-colors',
                  preset.hour === hour
                    ? 'bg-background-default text-text-primary shadow-2'
                    : 'text-text-tertiary',
                )}
              >
                <span className="font-bold typo-callout">{preset.label}</span>
                <span className="tabular-nums typo-footnote">
                  {formatHour(preset.hour)}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsRuler(true)}
            className="text-text-link typo-footnote"
          >
            Another time
          </button>
        </div>
      )}
    </Screen>
  );
};

const variants: Record<
  Exclude<ReminderVariant, 'today'>,
  (props: VariantProps) => ReactElement
> = { why: SayWhy, ask: AskFirst, preset: Preset };

export const ReminderVariantScreen = ({
  variant,
}: {
  variant: Exclude<ReminderVariant, 'today'>;
}): ReactElement => {
  const [result, setResult] = useState<{ hour?: number } | null>(null);
  const [run, setRun] = useState(0);
  const Variant = variants[variant];

  if (result) {
    return (
      <Outcome
        hour={result.hour}
        onReplay={() => {
          setResult(null);
          setRun((current) => current + 1);
        }}
      />
    );
  }

  return <Variant key={run} onDone={(hour) => setResult({ hour })} />;
};
