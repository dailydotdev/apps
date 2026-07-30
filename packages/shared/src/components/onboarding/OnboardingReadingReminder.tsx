import type { KeyboardEvent, ReactElement } from 'react';
import React, { useRef } from 'react';
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

/**
 * The post-signup funnel's reading-reminder screen. The paid funnel keeps
 * `ReadingReminder` — a separate component rather than a flag, because the two
 * differ in more than styling: this one's Submit and skip live in the funnel's
 * docked CTA rail, so the step owns the state (`useReadingReminder`) and passes
 * it in, while the paid funnel's screen renders its own buttons.
 */
const readingReminderOptions = [
  { label: '09:00', hint: 'With coffee', emoji: '☕️', value: '9' },
  { label: '12:00', hint: 'Over lunch', emoji: '🥪', value: '12' },
  { label: '17:00', hint: 'Winding down', emoji: '🛋️', value: '17' },
  { label: 'Custom', hint: 'Pick a time', emoji: '⏰', value: 'custom' },
];

interface OnboardingReadingReminderProps {
  headline?: string;
  state: ReadingReminderState;
}

export const OnboardingReadingReminder = ({
  headline,
  state,
}: OnboardingReadingReminderProps): ReactElement => {
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
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // The APG radio pattern, which native inputs would have given for free: the
  // group is ONE tab stop (only the checked option is tabbable) and the arrows
  // move selection. Without this the four options were four tab stops and the
  // arrow keys did nothing.
  const onOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offset = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[
      event.key
    ];

    if (!offset) {
      return;
    }

    event.preventDefault();
    const current = readingReminderOptions.findIndex(
      ({ value }) => value === timeOption,
    );
    const { length } = readingReminderOptions;
    const next = (current + offset + length) % length;
    setTimeOption(readingReminderOptions[next].value);
    optionRefs.current[next]?.focus();
  };

  return (
    <>
      {/* gap-6, the funnel's standard headline-to-subheadline step. */}
      <div className="flex w-full flex-col items-center gap-6">
        <OnboardingHeadline>
          {headline || 'When do you need that reading nudge?'}
        </OnboardingHeadline>
        {/* Supporting copy under the headline, where people already look for
            context — before they choose rather than after. The paid funnel says
            the same thing in a green success Alert below the options. */}
        <OnboardingSubheadline>
          Devs who turn this on build a reading habit that sticks.
        </OnboardingSubheadline>
      </div>

      {/* One per row, full width, with the selection control on the right — the
          same anatomy as the content-type cards, so the funnel has a single way
          of saying "pick this". */}
      <div
        role="radiogroup"
        aria-label="Reading reminder time"
        className="flex w-full flex-col gap-2"
      >
        {readingReminderOptions.map(({ label, hint, emoji, value }, index) => {
          const isSelected = timeOption === value;

          return (
            <button
              key={value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onKeyDown={onOptionKeyDown}
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
              {/* An always-present ring that fills on selection, matching the
                  content-type cards. */}
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
