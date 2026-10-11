import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { funnelStepRail } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import NotificationsBell from '@dailydotdev/shared/src/components/notifications/NotificationsBell';
import ReadingReminderToggle from '@dailydotdev/shared/src/components/notifications/ReadingReminderToggle';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import Alert, {
  AlertParagraph,
  AlertType,
} from '@dailydotdev/shared/src/components/widgets/Alert';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BellDisabledIcon } from '@dailydotdev/shared/src/components/icons/Bell/Disabled';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { FeedStandIn, Screen } from './shell';
import type { NotifyPlatform, Permission, PromptAnswer } from './notifications';
import {
  platforms,
  reminderPush,
  ReEnableCard,
  SystemPrompt,
  SystemStyles,
} from './notifications';
import { formatHour } from './reminder';

// A proposal, not production: what someone sees when they open daily.dev
// after turning notifications off while their reading reminder is on. Today
// nothing tells them, and the reminder, push only, is lost. Patchy belongs to
// onboarding; everything after it speaks plainly, as the product does.

/** Where the person is in the screen. */
type Step = 'ask' | 'steps' | 'on' | 'in-app' | 'stop';

const copy = (
  step: Step,
  hour: number,
): { headline: string; subheadline: string } => {
  const time = formatHour(hour);
  return {
    ask: {
      headline: 'Notifications are off',
      subheadline: `Your ${time} reading reminder isn’t arriving on this device.`,
    },
    steps: {
      headline: 'Turn them back on',
      subheadline: `A few taps in your settings and your ${time} reminder is back. daily.dev picks it up as soon as you do.`,
    },
    on: {
      headline: 'Notifications are back on',
      subheadline: `Your reading reminder arrives at ${time}.`,
    },
    'in-app': {
      headline: 'Your reminder moves to notifications',
      subheadline: `From ${time}, it waits in your notifications for the next time you open daily.dev.`,
    },
    stop: {
      headline: 'Reminder off',
      subheadline: 'Turn it back on anytime in Settings › Notifications.',
    },
  }[step];
};

export const PushOffScreen = ({
  platform,
  permission,
  hour = 9,
}: {
  platform: NotifyPlatform;
  /** `ask`: the system can still prompt. `blocked`: only settings can undo. */
  permission: Permission;
  hour?: number;
}): ReactElement => {
  const [step, setStep] = useState<Step>('ask');
  const [isPrompting, setIsPrompting] = useState(false);
  const [isInFeed, setIsInFeed] = useState(false);
  const { headline, subheadline } = copy(step, hour);
  const isDone = step === 'on' || step === 'in-app' || step === 'stop';

  const turnOn = () => {
    if (permission === 'blocked' || !platforms[platform].canPrompt) {
      setStep('steps');
      return;
    }
    setIsPrompting(true);
  };

  const onAnswer = (answer: PromptAnswer) => {
    setIsPrompting(false);
    if (answer === 'allow') {
      setStep('on');
    } else if (answer === 'block') {
      setStep('steps');
    }
  };

  return (
    <Screen>
      <SystemStyles />
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <LogoIcon className={{ container: 'h-6' }} />
          <CloseButton
            size={ButtonSize.Small}
            aria-label="Not now"
            onClick={() => setIsInFeed(true)}
          />
        </header>
        <div
          className={classNames(
            funnelStepRail,
            'flex flex-1 flex-col items-center gap-6 pb-6 pt-6 tablet:justify-center',
          )}
        >
          <div key={step} className="cs-rise flex flex-col items-center gap-3">
            <OnboardingHeadline>{headline}</OnboardingHeadline>
            <OnboardingSubheadline>{subheadline}</OnboardingSubheadline>
          </div>
          {step === 'steps' ? (
            <div className="cs-sheet w-full">
              <ReEnableCard platform={platform} />
            </div>
          ) : (
            <span className="flex size-24 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
              {step === 'ask' ? (
                <BellDisabledIcon size={IconSize.XXLarge} />
              ) : (
                <BellIcon size={IconSize.XXLarge} />
              )}
            </span>
          )}
          <div className="mt-auto flex w-full flex-col items-center gap-3 pb-safe-or-6">
            {isDone ? (
              <Button
                variant={ButtonVariant.Primary}
                className="w-full"
                onClick={() => setIsInFeed(true)}
              >
                Back to my feed
              </Button>
            ) : (
              <>
                {step === 'ask' && (
                  <Button
                    variant={ButtonVariant.Primary}
                    className="w-full"
                    disabled={isPrompting}
                    onClick={turnOn}
                  >
                    Turn notifications back on
                  </Button>
                )}
                <Button
                  variant={ButtonVariant.Float}
                  className="w-full"
                  disabled={isPrompting}
                  onClick={() => setStep('in-app')}
                >
                  Remind me in daily.dev instead
                </Button>
                <ClickableText
                  disabled={isPrompting}
                  onClick={() => setStep('stop')}
                >
                  Stop the daily reminder
                </ClickableText>
              </>
            )}
          </div>
        </div>
      </div>
      {isPrompting && <SystemPrompt platform={platform} onAnswer={onAnswer} />}
      {isInFeed && <FeedStandIn />}
    </Screen>
  );
};

/* ── The in-app fallback, from production parts ─────────────────────── */

/** The reminder as an in-app notification, in the production row. */
export const reminderNotification = {
  type: NotificationType.System,
  icon: NotificationIconType.Timer,
  title: `<b>${reminderPush.title}</b>`,
  description: reminderPush.body,
  referenceId: 'reading-reminder',
  targetUrl: '/',
  avatars: [],
  attachments: [],
  numTotalAvatars: 0,
  isUnread: true,
};

export const InAppReminderRow = (): ReactElement => (
  <NotificationItem {...reminderNotification} createdAt={new Date()} />
);

/** The header bell, with or without the reminder waiting in it. */
export const ReminderBell = ({ unread }: { unread: number }): ReactElement => (
  <NotificationsContextProvider unreadCount={unread} isNotificationsReady>
    <NotificationsBell />
  </NotificationsContextProvider>
);

/** Production's Settings › Notifications row, exactly as it renders today. */
export const SettingsToday = (): ReactElement => <ReadingReminderToggle />;

/** The same row, told that push is off here, with a way to choose in-app. */
export const SettingsProposed = (): ReactElement => {
  const [channel, setChannel] = useState('in-app');

  return (
    <div className="flex flex-col gap-4">
      <ReadingReminderToggle />
      <Alert type={AlertType.Warning} title="Push is off on this device">
        <AlertParagraph>
          Reminders can’t reach you here. Turn notifications on, or get them
          inside daily.dev instead.
        </AlertParagraph>
      </Alert>
      <div className="flex flex-col gap-2">
        <span className="font-bold text-text-primary typo-callout">
          Where your reminder arrives
        </span>
        <Radio
          name="reminder-channel"
          value={channel}
          onChange={setChannel}
          options={[
            { label: 'Push notification (off on this device)', value: 'push' },
            { label: 'In daily.dev, in your notifications', value: 'in-app' },
          ]}
        />
      </div>
    </div>
  );
};
