import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';
import { cloudinaryPatchyWaiting } from '@dailydotdev/shared/src/lib/image';

// The proposed "Never miss a learning day" hero: the production slot and
// frame, centered on every width, theme tokens instead of fixed dark colors,
// Patchy instead of the cat, the hour the reader already reads at, and push
// asked for before the reminder is saved.

export type HeroStep =
  | 'offer'
  | 'picking'
  | 'asking'
  | 'saved'
  | 'denied'
  | 'paused';

/** 20 → "8 PM", 9 → "9 AM". */
export const shortHour = (hour: number): string =>
  `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;

/** 20 → "8:00 PM". */
export const longHour = (hour: number): string =>
  `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;

/** The mockup's three presets, with the reader's own hour in place of the nearest. */
export const hourChoices = (readingHour: number): number[] => {
  const presets = [9, 13, 20];
  if (presets.includes(readingHour)) {
    return presets;
  }
  const nearest = presets.reduce((best, hour) =>
    Math.abs(hour - readingHour) < Math.abs(best - readingHour) ? hour : best,
  );
  return presets
    .map((hour) => (hour === nearest ? readingHour : hour))
    .sort((a, b) => a - b);
};

// Placeholder until the reading Patchy from the mockup is uploaded.
export const PATCHY_ART = cloudinaryPatchyWaiting;

interface ProposedHeroProps {
  step: HeroStep;
  /** The hour the reader reads at most, from their reading history. */
  readingHour: number;
  onSend?: (hour: number) => void;
  onPickTime?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

const Copy = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: ReactNode;
}): ReactElement => (
  <>
    <h3 className="font-bold text-text-primary typo-title3">{title}</h3>
    <p className="mt-1 max-w-[22rem] text-text-tertiary typo-callout tablet:max-w-[40rem]">
      {subtitle}
    </p>
  </>
);

export const ProposedHero = ({
  step,
  readingHour,
  onSend,
  onPickTime,
  onRetry,
  onClose,
  className,
}: ProposedHeroProps): ReactElement => {
  const time = longHour(readingHour);

  const body = (() => {
    switch (step) {
      case 'picking':
        return (
          <>
            <Copy
              title="When do you like to read?"
              subtitle="Pick a time for one top pick a day. Skipped on days you've read."
            />
            <div className="mt-4 flex gap-2">
              {hourChoices(readingHour).map((hour) => (
                <Button
                  key={hour}
                  type="button"
                  size={ButtonSize.Small}
                  variant={
                    hour === readingHour
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => onSend?.(hour)}
                >
                  {shortHour(hour)}
                </Button>
              ))}
            </div>
          </>
        );
      case 'asking':
        return (
          <>
            <Copy
              title="Allow notifications"
              subtitle={`So your top pick can reach you at ${time}. Nothing is saved until you allow them.`}
            />
            <span className="mt-4 flex h-10 items-center gap-2 text-text-tertiary typo-callout">
              <BellIcon /> Waiting for your answer…
            </span>
          </>
        );
      case 'saved':
        return (
          <>
            <Copy
              title="You're all set"
              subtitle={`Your first top pick arrives at ${time}. Skipped on days you've read.`}
            />
            <span className="mt-4 flex h-10 items-center gap-1 font-bold text-accent-avocado-default typo-callout">
              <VIcon /> Reminder saved
            </span>
          </>
        );
      case 'denied':
        return (
          <>
            <Copy
              title="Notifications are blocked"
              subtitle="Without them your top pick can't reach you. Turn them on in your browser settings, then try again."
            />
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              className="mt-4"
              onClick={onRetry}
            >
              Try again
            </Button>
          </>
        );
      case 'paused':
        return (
          <>
            <Copy
              title="Your reminder is on, but we can't reach you"
              subtitle="Turn on notifications to get your daily reading reminder."
            />
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              className="mt-4"
              onClick={onRetry}
            >
              Turn on notifications
            </Button>
          </>
        );
      default:
        return (
          <>
            <Copy
              title="Make reading a daily habit"
              subtitle={`One top pick a day at ${time}, when you usually read. Skipped on days you've read.`}
            />
            <div className="mt-4 flex items-center gap-2">
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                onClick={() => onSend?.(readingHour)}
              >
                Send it at {shortHour(readingHour)}
              </Button>
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                onClick={onPickTime}
              >
                Other time
              </Button>
            </div>
          </>
        );
    }
  })();

  return (
    <section
      className={classNames('mb-4 w-full pb-0', feedStyles.cards, className)}
    >
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
        <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-background-default">
          <div className="top-hero-glow pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-40 blur-3xl" />
          {onClose && (
            <CloseButton
              className="absolute right-2 top-2 z-2"
              size={ButtonSize.Small}
              aria-label="Close banner"
              onClick={onClose}
            />
          )}
          <div className="relative flex flex-col items-center px-5 pb-6 pt-5 text-center tablet:px-6 tablet:pb-5 tablet:pt-4">
            <img
              src={PATCHY_ART}
              alt="Patchy"
              className={classNames(
                'mb-3 size-32 object-contain transition-transform tablet:mb-2 tablet:size-16',
                step === 'saved' && 'scale-110',
              )}
            />
            {body}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * The laptop version, in the top-hero strip TopHero sits in today: the same
 * frame and about the same height, centered, with Patchy beside the title.
 */
export const ProposedTopHero = ({
  readingHour,
  onSend,
  onPickTime,
  onClose,
}: Pick<
  ProposedHeroProps,
  'readingHour' | 'onSend' | 'onPickTime' | 'onClose'
>): ReactElement => (
  <section className="relative flex w-full flex-col items-center overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-default px-8 py-3 text-center">
    {onClose && (
      <CloseButton
        type="button"
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2 shrink-0"
        aria-label="Close banner"
        onClick={onClose}
      />
    )}
    <div className="flex items-center gap-2">
      <img src={PATCHY_ART} alt="Patchy" className="size-10 object-contain" />
      <h3 className="font-bold text-text-primary typo-callout">
        Make reading a daily habit
      </h3>
    </div>
    <p className="text-text-tertiary typo-footnote">
      One top pick a day at {longHour(readingHour)}, when you usually read.
      Skipped on days you&apos;ve read.
    </p>
    <div className="mt-3 flex items-center gap-2">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        onClick={() => onSend?.(readingHour)}
      >
        Send it at {shortHour(readingHour)}
      </Button>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        onClick={onPickTime}
      >
        Other time
      </Button>
    </div>
  </section>
);

/** A stand-in for the browser or iOS permission prompt, which only exists on a device. */
export const PermissionPrompt = ({
  onAllow,
  onBlock,
}: {
  onAllow: () => void;
  onBlock: () => void;
}): ReactElement => (
  <div className="absolute left-3 top-3 z-3 flex w-72 flex-col gap-3 rounded-12 border border-border-subtlest-secondary bg-background-popover p-4 shadow-2">
    <p className="text-text-primary typo-callout">
      <strong>app.daily.dev</strong> wants to show notifications
    </p>
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        onClick={onBlock}
      >
        Block
      </Button>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        onClick={onAllow}
      >
        Allow
      </Button>
    </div>
  </div>
);
