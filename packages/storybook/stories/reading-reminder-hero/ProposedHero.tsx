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
import { readingReminderPushPromptCopy } from '@dailydotdev/shared/src/hooks/notifications/useReadingReminderPushPrompt';

// The proposed "Never miss a learning day" hero: the production slots and
// layouts (centered on phones, a row on tablets, TopHero's row on laptop),
// theme tokens instead of fixed dark colors, Patchy instead of the cat, the
// hour the reader is reading at now, and push asked before saving.

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

/**
 * The hour the card offers: the current one, except between midnight and
 * 5 AM, where it offers 9 AM. Late-night reminders are rare and get fewer
 * taps, and 9 AM is the hour most readers keep.
 */
export const offeredHour = (readingHour: number): number =>
  readingHour < 5 ? 9 : readingHour;

/** The mockup's three presets, with the offered hour in place of the nearest. */
export const hourChoices = (readingHour: number): number[] => {
  const offered = offeredHour(readingHour);
  const presets = [9, 13, 20];
  if (presets.includes(offered)) {
    return presets;
  }
  const nearest = presets.reduce((best, hour) =>
    Math.abs(hour - offered) < Math.abs(best - offered) ? hour : best,
  );
  return presets
    .map((hour) => (hour === nearest ? offered : hour))
    .sort((a, b) => a - b);
};

// Served from Storybook's public folder until it is uploaded to
// media.daily.dev.
export const PATCHY_ART = 'reading-reminder-hero/patchy-reading.webp';

interface ProposedHeroProps {
  step: HeroStep;
  /** The hour the reader sees the card, in their timezone, rounded down. */
  readingHour: number;
  /** The hour they chose, when it isn't the current one. */
  savedHour?: number;
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

// The frame, close button and action row every card shares, on every width:
// the top-hero strip's frame (TopHero, the CV and Weekly picks cards).
const frame =
  'overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-default';
const actionRow = 'flex min-h-8 flex-wrap items-center gap-2';

const Close = ({ onClose }: { onClose: () => void }): ReactElement => (
  <CloseButton
    type="button"
    size={ButtonSize.Small}
    className="absolute right-2 top-2 z-2"
    aria-label="Close banner"
    onClick={onClose}
  />
);

const dayIcon = (hour: number): ReactElement =>
  hour >= 6 && hour < 18 ? <SunIcon /> : <MoonIcon />;

/** Each step's copy and actions, shared by the feed card and the laptop card. */
const heroContent = ({
  step,
  readingHour,
  savedHour = offeredHour(readingHour),
  onSend,
  onPickTime,
  onRetry,
}: Omit<ProposedHeroProps, 'onClose' | 'className'>): HeroContent => {
  // One button size on every width, so the card reads the same everywhere.
  const size = ButtonSize.Small;
  const offered = offeredHour(readingHour);
  const time = shortHour(savedHour);
  // The current hour is under way, so only a later one can still come today.
  const day = savedHour > readingHour ? 'today' : 'tomorrow';
  const status = 'flex h-8 items-center gap-1 typo-callout';

  switch (step) {
    case 'picking':
      return {
        title: 'When do you like to read?',
        subtitle:
          'Pick a time for one top pick a day. Skipped on days you’ve read.',
        actions: hourChoices(readingHour).map((hour) => (
          <Button
            key={hour}
            type="button"
            size={size}
            icon={dayIcon(hour)}
            variant={
              hour === offered ? ButtonVariant.Primary : ButtonVariant.Float
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
        title: 'You’re all set',
        subtitle: `Your first top pick arrives ${day} at ${time}. Skipped on days you’ve read.`,
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
          'Without them your top pick can’t reach you. Turn them on in your settings, then try again.',
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
        title: readingReminderPushPromptCopy.title,
        subtitle: readingReminderPushPromptCopy.heroSubtitle,
        actions: (
          <Button
            type="button"
            size={size}
            variant={ButtonVariant.Primary}
            onClick={onRetry}
          >
            {readingReminderPushPromptCopy.cta}
          </Button>
        ),
      };
    default:
      return {
        title: 'Make reading a daily habit',
        subtitle:
          offered === readingHour
            ? `One top pick a day at ${time}, when you’re reading now. Skipped on days you’ve read.`
            : `One top pick a day at ${time}. Skipped on days you’ve read.`,
        actions: (
          <>
            <Button
              type="button"
              size={size}
              variant={ButtonVariant.Primary}
              onClick={() => onSend?.(offered)}
            >
              Send it at {shortHour(offered)}
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
  const { title, subtitle, actions } = heroContent(props);

  return (
    <section className={classNames('mb-4 w-full', feedStyles.cards, className)}>
      <div className={classNames(frame, 'relative')}>
        {onClose && <Close onClose={onClose} />}
        {/* Today's layout: stacked and centered on phones, a row from tablet
            up with the copy on the left and the art on the right
            (ReadingReminderFeedHero). */}
        <div className="flex flex-col tablet:min-h-[13.125rem] tablet:flex-row tablet:items-stretch">
          <div className="flex flex-1 flex-col items-center px-5 pb-6 text-center tablet:items-start tablet:justify-center tablet:p-6 tablet:text-left">
            <h3 className="font-bold text-text-primary typo-title3 tablet:typo-title2">
              {title}
            </h3>
            <p className="mt-1 max-w-[22rem] text-text-tertiary typo-callout tablet:max-w-none">
              {subtitle}
            </p>
            <div
              className={classNames(
                actionRow,
                'mt-4 justify-center tablet:justify-start',
              )}
            >
              {actions}
            </div>
          </div>
          <div className="order-first flex items-center justify-center px-5 pb-3 pt-5 tablet:order-last tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]">
            <img
              src={PATCHY_ART}
              alt="Patchy reading a book"
              className="h-32 w-auto object-contain tablet:h-auto tablet:w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * The laptop version, in the top-hero strip TopHero sits in today, laid out
 * like TopHero: the same frame, art on the left, copy and buttons beside it.
 * Bold title first and the line under it second, which TopHero's props
 * (small title over a bold subtitle) can't express. The strip splits in two
 * when Weekly picks or the CV card also shows.
 */
export const ProposedTopHero = ({
  onClose,
  className,
  ...props
}: ProposedHeroProps): ReactElement => {
  const { title, subtitle, actions } = heroContent(props);

  return (
    <section
      className={classNames(
        frame,
        'relative flex w-full items-center gap-4 py-2 pl-3 pr-8 tablet:gap-5',
        className,
      )}
    >
      <img
        src={PATCHY_ART}
        alt="Patchy reading a book"
        className="h-24 w-28 shrink-0 self-center object-contain tablet:h-28 tablet:w-32"
      />
      <div className="flex min-w-0 max-w-[18rem] flex-1 flex-col items-start gap-3">
        <div className="flex flex-col">
          <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
          <p className="mt-0.5 text-text-tertiary typo-footnote">{subtitle}</p>
        </div>
        <div className={actionRow}>{actions}</div>
      </div>
      {onClose && <Close onClose={onClose} />}
    </section>
  );
};

export type PromptPlatform = 'web' | 'ios' | 'android';

const promptCopy: Record<
  PromptPlatform,
  { text: ReactNode; block: string; allow: string }
> = {
  web: {
    text: (
      <>
        <strong>app.daily.dev</strong> wants to show notifications
      </>
    ),
    block: 'Block',
    allow: 'Allow',
  },
  ios: {
    text: (
      <>
        <strong>“daily.dev” Would Like to Send You Notifications</strong>
        <br />
        Notifications may include alerts, sounds and icon badges.
      </>
    ),
    block: 'Don’t Allow',
    allow: 'Allow',
  },
  android: {
    text: (
      <>
        Allow <strong>daily.dev</strong> to send you notifications?
      </>
    ),
    block: 'Don’t allow',
    allow: 'Allow',
  },
};

/**
 * A stand-in for the system permission prompt, which only exists on a
 * device: the browser's on the web, iOS's in the iOS app, and Android's in
 * the Android app (a Chrome shell, so Chrome asks first on older Android).
 */
export const PermissionPrompt = ({
  platform = 'web',
  onAllow,
  onBlock,
}: {
  platform?: PromptPlatform;
  onAllow: () => void;
  onBlock: () => void;
}): ReactElement => {
  const { text, block, allow } = promptCopy[platform];

  return (
    <div
      className={classNames(
        'absolute z-3 flex w-72 flex-col gap-3 border border-border-subtlest-secondary bg-background-popover p-4 shadow-2',
        platform === 'web'
          ? 'left-3 top-3 rounded-12'
          : 'left-1/2 top-1/3 -translate-x-1/2 rounded-16 text-center',
      )}
    >
      <p className="text-text-primary typo-callout">{text}</p>
      <div
        className={classNames(
          'flex gap-2',
          platform === 'web' ? 'justify-end' : 'justify-center',
        )}
      >
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          onClick={onBlock}
        >
          {block}
        </Button>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={onAllow}
        >
          {allow}
        </Button>
      </div>
    </div>
  );
};
