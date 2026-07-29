import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';
import { VIcon } from '../icons';
import { IconSize } from '../Icon';
import { TimezoneDropdown } from '../widgets/TimezoneDropdown';
import { HourDropdown } from '../fields/HourDropdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { ReadingReminderState } from './useReadingReminder';
import { OnboardingHeadline, OnboardingSubheadline } from './common';

const ReadingReminderOptions = [
  { label: '09:00', hint: 'With coffee', emoji: '☕️', value: '9' },
  { label: '12:00', hint: 'Over lunch', emoji: '🥪', value: '12' },
  { label: '17:00', hint: 'Winding down', emoji: '🛋️', value: '17' },
  { label: 'Custom', hint: 'Pick a time', emoji: '⏰', value: 'custom' },
];

interface ReadingReminderProps {
  headline?: string;
  // The actions live in the funnel's docked CTA rail, so the state is owned by
  // the step through `useReadingReminder` and passed back in here.
  state: ReadingReminderState;
}

export const ReadingReminder = ({
  headline,
  state,
}: ReadingReminderProps): ReactElement => {
  const {
    customTimeIndex,
    isEditingTimezone,
    setCustomTimeIndex,
    setIsEditingTimezone,
    setTimeOption,
    setUserTimeZone,
    timeOption,
    userTimeZone,
  } = state;

  return (
    <>
      {/* gap-6, the funnel's standard headline-to-subheadline step. */}
      <div className="flex w-full flex-col items-center gap-6">
        <OnboardingHeadline>
          {headline || 'When do you need that reading nudge?'}
        </OnboardingHeadline>
        {/* The reassurance used to be a green success Alert below the options —
            the wrong semantic (nothing succeeded) and, sat in a coloured box
            with a tick, it read as a generated callout. As supporting copy under
            the headline it does the same job in the place people already look
            for context, before they choose rather than after. */}
        <OnboardingSubheadline>
          Devs who turn this on build a reading habit that sticks.
        </OnboardingSubheadline>
      </div>

      {/* One per row, full width, with the selection control on the right —
          the same anatomy as the content-type cards, so the funnel has a single
          way of saying "pick this". A two-up grid halved the target and left
          the times reading as chips rather than options. */}
      <div
        role="radiogroup"
        aria-label="Reading reminder time"
        className="flex w-full flex-col gap-2"
      >
        {ReadingReminderOptions.map(({ label, hint, emoji, value }) => {
          const isSelected = timeOption === value;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTimeOption(value)}
              className={classNames(
                'group flex w-full items-center gap-3 rounded-14 border p-3 text-left transition-all duration-200',
                'hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none',
                isSelected
                  ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                  : 'border-border-subtlest-tertiary hover:bg-surface-hover',
              )}
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float typo-callout"
              >
                {emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <Typography bold type={TypographyType.Callout}>
                  {label}
                </Typography>
                <Typography
                  color={TypographyColor.Tertiary}
                  type={TypographyType.Caption1}
                >
                  {hint}
                </Typography>
              </span>
              {/* The affordance the plain tiles were missing: an always-present
                  ring that fills on selection, matching the content-type cards. */}
              <span
                aria-hidden
                className={classNames(
                  'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                  isSelected
                    ? 'bg-accent-cabbage-default text-white'
                    : 'border border-border-subtlest-secondary group-hover:border-accent-cabbage-default',
                )}
              >
                {isSelected && <VIcon secondary size={IconSize.XXSmall} />}
              </span>
            </button>
          );
        })}
      </div>

      {timeOption === 'custom' && (
        <HourDropdown
          hourIndex={customTimeIndex}
          setHourIndex={setCustomTimeIndex}
          className={{ container: 'w-full' }}
        />
      )}

      {/* Below the choice, where it answers "which clock is this?" rather than
          competing with the headline. */}
      <Typography
        className="text-center"
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
      >
        Times are in {userTimeZone}{' '}
        {isEditingTimezone ? (
          <TimezoneDropdown
            userTimeZone={userTimeZone}
            setUserTimeZone={setUserTimeZone}
          />
        ) : (
          <ClickableText
            className="ml-1 inline-flex"
            onClick={() => setIsEditingTimezone(true)}
          >
            change
          </ClickableText>
        )}
      </Typography>
    </>
  );
};
