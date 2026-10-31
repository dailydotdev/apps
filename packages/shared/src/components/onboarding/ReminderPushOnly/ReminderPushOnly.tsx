import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '../../../features/onboarding/shared/FunnelStepCtaWrapper';
import { OnboardingHeadline, OnboardingSubheadline } from '../common';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  getHourTimezone,
  getUserInitialTimezone,
} from '../../../lib/timezones';
import { formatHour } from '../FeedPatchy/ReminderPicker';
import { ReEnableNotifications } from '../FeedPatchy/ReEnableNotifications';
import type { ReminderOutcome } from '../FeedPatchy/useFeedPatchyReminder';
import { useFeedPatchyReminder } from '../FeedPatchy/useFeedPatchyReminder';
import type { ReminderPush } from './ReminderPreview';
import { getPreviewPlatform, ReminderPreview } from './ReminderPreview';
import { clockOfHour, isTwelveHourClock } from './regionalClock';

/** Names this arm in every event, next to the control. */
const VARIANT = 'push_only';

/** The control step's preselected hour, saved without asking. */
const REMINDER_HOUR = 9;

/** The reading reminder push as daily-api sends it, with a top pick. */
const SHOWCASE_PUSH: ReminderPush = {
  title: 'Top pick for you',
  body: 'Why Shopify Migrated From React Native',
};

const longDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

/**
 * The reading reminder step as one ask: the push exactly as it will land, at
 * the default hour, and a button that saves the reminder and turns
 * notifications on. The time can be changed later in settings.
 */
export const ReminderPushOnly = ({
  onComplete,
}: {
  onComplete: () => void;
}): ReactElement => {
  const reminder = useFeedPatchyReminder(VARIANT);
  const { user } = useAuthContext();
  const [platform] = useState(getPreviewPlatform);
  const [isTwelveHour] = useState(isTwelveHourClock);
  const [isPrompting, setIsPrompting] = useState(false);
  const [outcome, setOutcome] = useState<ReminderOutcome>();
  const timezone = getUserInitialTimezone({
    userTimezone: user?.timezone,
    update: true,
  });
  const time = formatHour(REMINDER_HOUR, isTwelveHour);
  const isDenied = outcome === 'denied';

  const firstReminder = new Date();
  if (REMINDER_HOUR <= getHourTimezone(timezone)) {
    firstReminder.setDate(firstReminder.getDate() + 1);
  }

  const onTurnOn = async () => {
    if (isDenied) {
      onComplete();
      return;
    }
    setIsPrompting(true);
    // The time is saved before the ask, so a failed ask still leaves it.
    const answer = await reminder
      .onSchedule(REMINDER_HOUR, timezone)
      .catch((): ReminderOutcome => 'dismissed');
    setIsPrompting(false);
    if (answer === 'denied') {
      setOutcome(answer);
      return;
    }
    onComplete();
  };

  const onSkip = () => {
    reminder.onSkip();
    onComplete();
  };

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: isDenied ? 'Continue' : 'Turn on notifications' }}
      loading={isPrompting}
      onClick={onTurnOn}
      docked={
        !isDenied && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={onSkip}
            disabled={isPrompting}
            className="w-full"
          >
            Skip for now
          </Button>
        )
      }
      containerClassName="flex w-full flex-1 flex-col"
    >
      <div
        className={classNames(
          funnelStepRail,
          'flex flex-1 flex-col items-center gap-6 pb-6 pt-3',
        )}
      >
        <div className="flex w-full flex-col items-center gap-3">
          <OnboardingHeadline
            // Balanced so a two-line headline never leaves one word alone.
            style={{ textWrap: 'balance' } as CSSProperties}
          >
            {isDenied ? 'Notifications are off' : 'Get your daily top pick'}
          </OnboardingHeadline>
          <OnboardingSubheadline>
            {isDenied
              ? `Your ${time} reminder is saved. Turn notifications on to get it.`
              : `One notification a day at ${time}. Change the time anytime in settings.`}
          </OnboardingSubheadline>
        </div>
        {isDenied ? (
          <ReEnableNotifications />
        ) : (
          <ReminderPreview
            platform={platform}
            {...clockOfHour(REMINDER_HOUR, isTwelveHour)}
            date={longDate(firstReminder)}
            push={SHOWCASE_PUSH}
          />
        )}
      </div>
    </FunnelStepCtaWrapper>
  );
};
