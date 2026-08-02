import type { KeyboardEvent, ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';
import { Radio } from '../fields/Radio';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { Button, ButtonVariant } from '../buttons/Button';
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
  { label: '09:00 ☕️', value: '9' },
  { label: '12:00 🥪', value: '12' },
  { label: '17:00 🛋️', value: '17' },
  { label: 'Custom️', value: 'custom' },
];

const funnelOptions = [
  { label: '09:00', hint: 'With coffee', emoji: '☕️', value: '9' },
  { label: '12:00', hint: 'Over lunch', emoji: '🥪', value: '12' },
  { label: '17:00', hint: 'Winding down', emoji: '🛋️', value: '17' },
  { label: 'Custom', hint: 'Pick a time', emoji: '⏰', value: 'custom' },
];

interface ReadingReminderProps {
  headline?: string;
  state: ReadingReminderState;
  /** The funnel docks Submit and skip in its CTA rail, so this arm renders none. */
  isOnboarding?: boolean;
}

export const ReadingReminder = ({
  headline,
  state,
  isOnboarding,
}: ReadingReminderProps): ReactElement => {
  const {
    customTimeIndex,
    isEditingTimezone,
    loading,
    onSkip,
    onSubmit,
    setCustomTimeIndex,
    setIsEditingTimezone,
    setTimeOption,
    setUserTimeZone,
    timeOption,
    userTimeZone,
  } = state;
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const timezone = isEditingTimezone ? (
    <TimezoneDropdown
      userTimeZone={userTimeZone}
      setUserTimeZone={setUserTimeZone}
    />
  ) : null;

  if (!isOnboarding) {
    return (
      <>
        <div className="flex flex-col items-center gap-4">
          <p className="text-center typo-mega1">⏰</p>
          <h2 className="typo-bold text-center typo-large-title">
            {headline || 'When do you need that reading nudge?'}
          </h2>
          <p className="text-center text-text-quaternary typo-callout">
            Your timezone: {userTimeZone}{' '}
            {timezone ?? (
              <ClickableText
                className="ml-3 inline-flex"
                onClick={() => setIsEditingTimezone(true)}
              >
                edit timezone
              </ClickableText>
            )}
          </p>
        </div>
        <Radio
          className={{ container: 'mt-4 tablet:mt-10' }}
          name="reading_reminder"
          value={timeOption}
          options={ReadingReminderOptions}
          onChange={(value) => setTimeOption(value)}
        />
        {timeOption === 'custom' && (
          <HourDropdown
            hourIndex={customTimeIndex}
            setHourIndex={setCustomTimeIndex}
            className={{ container: 'mt-3' }}
          />
        )}
        <Alert
          className="mt-4 tablet:mt-10"
          title="Consistency pays off."
          type={AlertType.Success}
        >
          <AlertParagraph className="text-text-secondary">
            Devs who enable notifications build a habit and become more
            knowledgeable
          </AlertParagraph>
        </Alert>
        <div className="mt-4 flex w-full flex-col-reverse gap-3 tablet:mt-10 tablet:w-auto tablet:flex-row tablet:gap-5">
          <Button onClick={onSkip} variant={ButtonVariant.Secondary}>
            I&apos;ll do it later
          </Button>
          <Button
            onClick={onSubmit}
            variant={ButtonVariant.Primary}
            loading={loading}
          >
            Submit
          </Button>
        </div>
      </>
    );
  }

  // APG radio pattern: one tab stop for the group, arrows move selection.
  const onOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offset = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[
      event.key
    ];

    if (!offset) {
      return;
    }

    event.preventDefault();
    const current = funnelOptions.findIndex(
      ({ value }) => value === timeOption,
    );
    const { length } = funnelOptions;
    const next = (current + offset + length) % length;
    setTimeOption(funnelOptions[next].value);
    optionRefs.current[next]?.focus();
  };

  return (
    <>
      <div className="flex w-full flex-col items-center gap-6">
        <OnboardingHeadline>
          {headline || 'When do you need that reading nudge?'}
        </OnboardingHeadline>
        <OnboardingSubheadline>
          Devs who turn this on build a reading habit that sticks.
        </OnboardingSubheadline>
      </div>

      <div
        role="radiogroup"
        aria-label="Reading reminder time"
        className="flex w-full flex-col gap-2"
      >
        {funnelOptions.map(({ label, hint, emoji, value }, index) => {
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
              <span
                aria-hidden
                className={classNames(
                  'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                  isSelected
                    ? 'bg-accent-cabbage-default text-white'
                    : 'border border-border-subtlest-primary group-hover:border-accent-cabbage-default',
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

      <Typography
        className="text-center"
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
      >
        Times are in {userTimeZone}{' '}
        {timezone ?? (
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
