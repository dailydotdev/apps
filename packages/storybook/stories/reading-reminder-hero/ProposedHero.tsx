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
import { MoonIcon } from '@dailydotdev/shared/src/components/icons/Moon';
import { SunIcon } from '@dailydotdev/shared/src/components/icons/Sun';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';

// The proposed "Never miss a learning day" hero: the production slot and
// frame, centered on every width, theme tokens instead of fixed dark colors,
// Patchy instead of the cat, the hour the reader is reading at now, and push
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

/** The mockup's three presets, with the current hour in place of the nearest. */
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

// Served from Storybook's public folder until it is uploaded to
// media.daily.dev.
export const PATCHY_ART = 'reading-reminder-hero/patchy-reading.webp';

interface ProposedHeroProps {
  step: HeroStep;
  /** The hour the reader sees the card, in their timezone, rounded down. */
  readingHour: number;
  onSend?: (hour: number) => void;
  onPickTime?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  actions: ReactNode;
}

const dayIcon = (hour: number): ReactElement =>
  hour >= 6 && hour < 18 ? <SunIcon /> : <MoonIcon />;

/** Each step's copy and actions, shared by the feed card and the laptop card. */
const heroContent = (
  {
    step,
    readingHour,
    onSend,
    onPickTime,
    onRetry,
  }: Omit<ProposedHeroProps, 'onClose' | 'className'>,
  size: ButtonSize,
): HeroContent => {
  const time = longHour(readingHour);
  const status = 'flex h-8 items-center gap-1 typo-callout';

  switch (step) {
    case 'picking':
      return {
        title: 'When do you like to read?',
        subtitle:
          "Pick a time for one top pick a day. Skipped on days you've read.",
        actions: hourChoices(readingHour).map((hour) => (
          <Button
            key={hour}
            type="button"
            size={size}
            icon={dayIcon(hour)}
            variant={
              hour === readingHour ? ButtonVariant.Primary : ButtonVariant.Float
            }
            onClick={() => onSend?.(hour)}
          >
            {shortHour(hour)}
          </Button>
        )),
      };
    case 'asking':
      return {
        title: 'Allow notifications',
        subtitle: `So your top pick can reach you at ${time}. Nothing is saved until you allow them.`,
        actions: (
          <span className={classNames(status, 'text-text-tertiary')}>
            <BellIcon /> Waiting for your answer…
          </span>
        ),
      };
    case 'saved':
      return {
        title: "You're all set",
        subtitle: `Your first top pick arrives tomorrow at ${time}. Skipped on days you've read.`,
        actions: (
          <span
            className={classNames(
              status,
              'font-bold text-accent-avocado-default',
            )}
          >
            <VIcon /> Reminder saved
          </span>
        ),
      };
    case 'denied':
      return {
        title: 'Notifications are blocked',
        subtitle:
          "Without them your top pick can't reach you. Turn them on in your browser settings, then try again.",
        actions: (
          <Button
            type="button"
            size={size}
            variant={ButtonVariant.Primary}
            onClick={onRetry}
          >
            Try again
          </Button>
        ),
      };
    case 'paused':
      return {
        title: "Your reminder is on, but we can't reach you",
        subtitle: 'Turn on notifications to get your daily reading reminder.',
        actions: (
          <Button
            type="button"
            size={size}
            variant={ButtonVariant.Primary}
            onClick={onRetry}
          >
            Turn on notifications
          </Button>
        ),
      };
    default:
      return {
        title: 'Make reading a daily habit',
        subtitle: `One top pick a day at ${time}, when you're reading now. Skipped on days you've read.`,
        actions: (
          <>
            <Button
              type="button"
              size={size}
              variant={ButtonVariant.Primary}
              onClick={() => onSend?.(readingHour)}
            >
              Send it at {shortHour(readingHour)}
            </Button>
            <Button
              type="button"
              size={size}
              variant={ButtonVariant.Tertiary}
              onClick={onPickTime}
            >
              Other time
            </Button>
          </>
        ),
      };
  }
};

export const ProposedHero = ({
  onClose,
  className,
  ...props
}: ProposedHeroProps): ReactElement => {
  const { title, subtitle, actions } = heroContent(props, ButtonSize.Medium);

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
              alt="Patchy reading a book"
              className={classNames(
                'mb-3 size-32 object-contain transition-transform tablet:mb-2 tablet:size-16',
                props.step === 'saved' && 'scale-110',
              )}
            />
            <h3 className="font-bold text-text-primary typo-title3">{title}</h3>
            <p className="mt-1 max-w-[22rem] text-text-tertiary typo-callout tablet:max-w-[40rem]">
              {subtitle}
            </p>
            <div className="mt-4 flex min-h-10 items-center gap-2">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * The laptop version, in the top-hero strip TopHero sits in today: the same
 * frame and about the same height, centered, with Patchy beside the title.
 * The strip splits in two when Weekly picks or the CV card also shows.
 */
export const ProposedTopHero = ({
  onClose,
  className,
  ...props
}: ProposedHeroProps): ReactElement => {
  const { title, subtitle, actions } = heroContent(props, ButtonSize.Small);

  return (
    <section
      className={classNames(
        'relative flex w-full flex-col items-center overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-default px-8 py-3 text-center',
        className,
      )}
    >
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
        <img
          src={PATCHY_ART}
          alt="Patchy reading a book"
          className="-my-1 size-12 object-contain"
        />
        <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
      </div>
      <p className="text-text-tertiary typo-footnote">{subtitle}</p>
      <div className="mt-3 flex min-h-8 items-center gap-2">{actions}</div>
    </section>
  );
};

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
