import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import { BellIcon } from '../../icons/Bell';
import { MoonIcon } from '../../icons/Moon';
import { SunIcon } from '../../icons/Sun';
import { VIcon } from '../../icons/V';
import feedStyles from '../../Feed.module.css';
import { ReEnableNotifications } from '../../onboarding/FeedPatchy/ReEnableNotifications';
import { cloudinaryPatchyReading } from '../../../lib/image';
import {
  formatReminderHour,
  getOfferedReminderHour,
  getReminderHourChoices,
} from '../../../lib/readingReminderHour';
import type { ReadingReminderHabitHero as HabitHero } from '../../../hooks/notifications/useReadingReminderFeedHero';
import { readingReminderPushPromptCopy } from '../../../hooks/notifications/useReadingReminderPushPrompt';

interface ReadingReminderHabitHeroProps {
  hero: HabitHero;
  onClose: () => void;
  className?: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  actions: ReactNode;
  details?: ReactNode;
}

const frame =
  'overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-default';
const actionRow = 'flex min-h-8 flex-wrap items-center gap-2';
const status = 'flex h-8 items-center gap-1 typo-callout';

const getDayIcon = (hour: number): ReactElement =>
  hour >= 6 && hour < 18 ? <SunIcon /> : <MoonIcon />;

const getOfferSubtitle = (
  { currentHour, hasReminderCopy }: HabitHero,
  offered: number,
): string => {
  const time = formatReminderHour(offered);
  const when = offered === currentHour ? `, when you’re reading now` : '';

  if (hasReminderCopy) {
    return `Turn on your daily reading reminder: one top pick at ${time}${when}. Skipped on days you’ve read.`;
  }

  return `One top pick a day at ${time}${when}. Skipped on days you’ve read.`;
};

const getHeroContent = (hero: HabitHero): HeroContent => {
  const { step, currentHour, onSend, onPickTime, onRetry } = hero;
  const offered = getOfferedReminderHour(currentHour);
  const savedHour = hero.savedHour ?? offered;
  const time = formatReminderHour(savedHour);
  // The current hour's run has already gone out, so only a later one can
  // still come today.
  const day = savedHour > currentHour ? 'today' : 'tomorrow';

  switch (step) {
    case 'picking':
      return {
        title: 'When do you like to read?',
        subtitle:
          'Pick a time for one top pick a day. Skipped on days you’ve read.',
        actions: getReminderHourChoices(currentHour).map((hour) => (
          <Button
            key={hour}
            type="button"
            size={ButtonSize.Small}
            icon={getDayIcon(hour)}
            variant={
              hour === offered ? ButtonVariant.Primary : ButtonVariant.Float
            }
            onClick={() => onSend(hour, 'picked')}
          >
            {formatReminderHour(hour)}
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
          'Without them your top pick can’t reach you. Turn them on, then try again.',
        details: <ReEnableNotifications className="mt-3" />,
        actions: (
          <Button
            type="button"
            size={ButtonSize.Small}
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
            size={ButtonSize.Small}
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
        subtitle: getOfferSubtitle(hero, offered),
        actions: (
          <>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={() => onSend(offered, 'now')}
            >
              Send it at {formatReminderHour(offered)}
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
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

const Close = ({ onClose }: { onClose: () => void }): ReactElement => (
  <CloseButton
    type="button"
    size={ButtonSize.Small}
    className="absolute right-2 top-2 z-2"
    aria-label="Close banner"
    onClick={onClose}
  />
);

/** Phones and tablets: inline at the top of the feed. */
export const ReadingReminderHabitFeedHero = ({
  hero,
  onClose,
  className,
}: ReadingReminderHabitHeroProps): ReactElement => {
  const { title, subtitle, actions, details } = getHeroContent(hero);

  return (
    <section className={classNames('mb-4 w-full', feedStyles.cards, className)}>
      <div className={classNames(frame, 'relative')}>
        <Close onClose={onClose} />
        <div className="flex flex-col tablet:min-h-[12.625rem] tablet:flex-row tablet:items-stretch">
          <div className="flex flex-1 flex-col items-center px-5 pb-6 text-center tablet:items-start tablet:justify-center tablet:p-6 tablet:text-left">
            <h3 className="font-bold text-text-primary typo-title3 tablet:typo-title2">
              {title}
            </h3>
            <p className="mt-1 max-w-[22rem] text-text-tertiary typo-callout tablet:max-w-none">
              {subtitle}
            </p>
            {details}
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
              src={cloudinaryPatchyReading}
              alt="Patchy reading a book"
              className="h-32 w-auto object-contain tablet:h-auto tablet:w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/** Laptop: in the top-hero strip, laid out like TopHero. */
export const ReadingReminderHabitTopHero = ({
  hero,
  onClose,
  className,
}: ReadingReminderHabitHeroProps): ReactElement => {
  const { title, subtitle, actions, details } = getHeroContent(hero);

  return (
    <section
      className={classNames(
        frame,
        'relative flex w-full items-center gap-4 py-2 pl-3 pr-8 tablet:gap-5',
        className,
      )}
    >
      <img
        src={cloudinaryPatchyReading}
        alt="Patchy reading a book"
        className="h-24 w-28 shrink-0 self-center object-contain tablet:h-28 tablet:w-32"
      />
      <div className="flex min-w-0 max-w-[18rem] flex-1 flex-col items-start gap-3">
        <div className="flex w-full flex-col">
          <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
          <p className="mt-0.5 text-text-tertiary typo-footnote">{subtitle}</p>
          {details}
        </div>
        <div className={actionRow}>{actions}</div>
      </div>
      <Close onClose={onClose} />
    </section>
  );
};
