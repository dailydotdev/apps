import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { featureReadingReminderPushPrompt } from '@dailydotdev/shared/src/lib/featureManagement';
import { PushNotificationsContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import ReadingReminderToggle from '@dailydotdev/shared/src/components/notifications/ReadingReminderToggle';
import ReadingReminderFeedHero from '@dailydotdev/shared/src/components/marketing/banners/ReadingReminderFeedHero';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import { readingReminderPushPromptCopy } from '@dailydotdev/shared/src/hooks/notifications/useReadingReminderPushPrompt';
import ExtensionProviders from '../extension/_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
import { defaultBootData, getBootMock } from '../../mock/boot';

/**
 * `reading_reminder_push_prompt`, control vs treatment. Shown to people whose
 * reading reminder is paused because they have no push subscription
 * (`deliveryPaused` from the API), on a device that can take push and isn't
 * subscribed. Treatment: the home feed's top hero slot and the reminder row in
 * Settings › Notifications ask them to turn notifications on.
 */

const pausedReminderHandler = graphql.query('PersonalizedDigest', () =>
  HttpResponse.json({
    data: {
      personalizedDigest: [
        {
          preferredDay: 1,
          preferredHour: 9,
          type: 'reading_reminder',
          flags: { sendType: 'daily' },
          deliveryPaused: true,
        },
      ],
    },
  }),
);

const pushNotSubscribed = {
  isPushSupported: true,
  isInitialized: true,
  isSubscribed: false,
  isLoading: false,
  shouldOpenPopup: () => false,
  subscribe: fn(async () => true),
  unsubscribe: fn(async () => undefined),
};

const Arm = ({
  label,
  isOn,
  children,
}: {
  label: string;
  isOn: boolean;
  children: ReactNode;
}): ReactElement => (
  <FeatureOverrides values={{ [featureReadingReminderPushPrompt.id]: isOn }}>
    <section className="flex min-w-0 flex-1 flex-col gap-3">
      <span className="font-bold text-text-tertiary typo-caption1">
        {label}
      </span>
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
        {children}
      </div>
    </section>
  </FeatureOverrides>
);

const meta: Meta = {
  title: 'Experiments/Reading reminder push prompt',
  parameters: { layout: 'padded', msw: { handlers: [pausedReminderHandler] } },
  // Boot with the toolbar's theme, as the boot mock pins the page to light
  beforeEach: ({ globals }) => {
    const theme = globals.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    getBootMock.mockReturnValue({
      ...getBootMock(),
      settings: {
        ...defaultBootData.settings,
        theme: theme === 'dark' ? 'darcula' : 'bright',
      },
    });
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <PushNotificationsContext.Provider value={pushNotSubscribed}>
          <Story />
        </PushNotificationsContext.Provider>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const Settings: Story = {
  name: 'Settings › Notifications',
  render: () => (
    <div className="flex max-w-[60rem] flex-col gap-6 tablet:flex-row">
      <Arm label="Control" isOn={false}>
        <ReadingReminderToggle />
      </Arm>
      <Arm label="Treatment" isOn>
        <ReadingReminderToggle />
      </Arm>
    </div>
  ),
};

export const FeedTopHero: Story = {
  name: 'Feed top hero',
  render: () => (
    <div className="flex max-w-[60rem] flex-col gap-8">
      <section className="flex flex-col gap-3">
        <span className="font-bold text-text-tertiary typo-caption1">
          Treatment, laptop
        </span>
        <TopHero
          title={readingReminderPushPromptCopy.title}
          subtitle={readingReminderPushPromptCopy.heroSubtitle}
          ctaLabel={readingReminderPushPromptCopy.cta}
          onCtaClick={fn()}
          onClose={fn()}
        />
      </section>
      <section className="flex flex-col gap-3">
        <span className="font-bold text-text-tertiary typo-caption1">
          Treatment, phone and tablet
        </span>
        <ReadingReminderFeedHero
          title={readingReminderPushPromptCopy.title}
          subtitle={readingReminderPushPromptCopy.heroSubtitle}
          ctaLabel={readingReminderPushPromptCopy.cta}
          onCtaClick={fn()}
          onClose={fn()}
        />
      </section>
      <span className="text-text-tertiary typo-footnote">
        Control: the slot stays empty for people who already have a reminder.
      </span>
    </div>
  ),
};
