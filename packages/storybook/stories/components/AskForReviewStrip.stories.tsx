import React, { ReactElement, ReactNode, useState } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { AskForReviewStripView } from '@dailydotdev/shared/src/components/postReview/AskForReviewStrip';
import type { ReviewDestination } from '@dailydotdev/shared/src/lib/askForReview';
import { Button, ButtonSize, ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const withProviders = (Story: () => ReactElement): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider
      user={{
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        username: 'testuser',
      }}
      updateUser={fn()}
      tokenRefreshed
      getRedirectUri={fn()}
      loadingUser={false}
      loadedUserFromCache
      refetchBoot={fn()}
      isFetched
      squads={[]}
      firstLoad
      isAndroidApp={false}
    >
      <Story />
    </AuthContextProvider>
  </QueryClientProvider>
);

const PLACEHOLDER_IMAGE =
  'https://media.daily.dev/image/upload/s--GWqpMG8r--/f_auto/v1732802237/Streak_together_with_a_friend_1_1_pwoill';

const makeDest = (
  id: ReviewDestination['id'],
  label: string,
  href: string,
): ReviewDestination => ({
  id,
  label,
  href,
  headline: 'Help fellow devs find daily.dev 💜',
  body: `Take 10 seconds to rate daily.dev on ${label}.`,
  ctaText: `Rate on ${label}`,
  image: PLACEHOLDER_IMAGE,
});

const DESTINATIONS: ReviewDestination[] = [
  makeDest('chrome_web_store', 'Chrome Web Store', '#chrome'),
  makeDest('edge_addons', 'Edge Add-ons', '#edge'),
  makeDest('firefox_addons', 'Firefox Add-ons', '#firefox'),
  makeDest('app_store', 'App Store', '#appstore'),
  makeDest('play_store', 'Play Store', '#playstore'),
  makeDest('twitter_share', 'X', '#twitter'),
];

const Wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="mx-auto max-w-[69.25rem] p-4">{children}</div>
);

const meta: Meta<typeof AskForReviewStripView> = {
  title: 'Components/AskForReviewStrip',
  component: AskForReviewStripView,
  decorators: [withProviders],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  args: {
    destination: DESTINATIONS[0],
    streakValue: 3,
    variantEnabled: true,
    streakThreshold: 3,
    cooldownDays: 14,
    onAction: fn(),
    onClose: fn(),
  },
  argTypes: {
    destination: {
      control: 'select',
      options: DESTINATIONS.map((d) => d.id),
      mapping: Object.fromEntries(DESTINATIONS.map((d) => [d.id, d])),
    },
  },
  render: (args) => (
    <Wrapper>
      <AskForReviewStripView {...args} />
    </Wrapper>
  ),
};

export default meta;
type Story = StoryObj<typeof AskForReviewStripView>;

export const ChromeWebStore: Story = {
  name: 'Default (routes to Chrome Web Store on Yes)',
  args: { destination: DESTINATIONS[0] },
};

export const EdgeAddons: Story = {
  name: 'Edge Add-ons destination',
  args: { destination: DESTINATIONS[1] },
};

export const FirefoxAddons: Story = {
  name: 'Firefox Add-ons destination',
  args: { destination: DESTINATIONS[2] },
};

export const AppStore: Story = {
  name: 'App Store destination (iOS)',
  args: { destination: DESTINATIONS[3] },
};

export const PlayStore: Story = {
  name: 'Play Store destination (Android)',
  args: { destination: DESTINATIONS[4] },
};

export const TwitterFallback: Story = {
  name: 'X share fallback (unsupported browser)',
  args: { destination: DESTINATIONS[5] },
};

export const HighStreak: Story = {
  name: 'Long streak copy',
  args: { destination: DESTINATIONS[0], streakValue: 42 },
};

export const DemoPanel: Story = {
  name: 'Demo panel (all states, controls)',
  render: () => {
    const [destination, setDestination] = useState<ReviewDestination>(
      DESTINATIONS[0],
    );
    const [streakValue, setStreakValue] = useState(3);
    const [closed, setClosed] = useState(false);

    return (
      <div className="flex flex-col gap-4 bg-background-subtle p-6">
        <div className="flex flex-wrap items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
          <span className="mr-2 text-text-tertiary typo-footnote">
            Destination:
          </span>
          {DESTINATIONS.map((dest) => (
            <Button
              key={dest.id}
              type="button"
              size={ButtonSize.XSmall}
              variant={
                destination.id === dest.id
                  ? ButtonVariant.Primary
                  : ButtonVariant.Float
              }
              onClick={() => {
                setDestination(dest);
                setClosed(false);
              }}
            >
              {dest.label}
            </Button>
          ))}
          <span className="ml-4 mr-2 text-text-tertiary typo-footnote">
            Streak:
          </span>
          {[3, 5, 7, 30].map((value) => (
            <Button
              key={value}
              type="button"
              size={ButtonSize.XSmall}
              variant={
                streakValue === value
                  ? ButtonVariant.Primary
                  : ButtonVariant.Float
              }
              onClick={() => {
                setStreakValue(value);
                setClosed(false);
              }}
            >
              {value} days
            </Button>
          ))}
          <Button
            type="button"
            className="ml-auto"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            onClick={() => setClosed(false)}
            disabled={!closed}
          >
            Reset
          </Button>
        </div>

        {closed ? (
          <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-6 text-center text-text-tertiary typo-body">
            Strip dismissed. Click Reset to show again.
          </div>
        ) : (
          <Wrapper>
            <AskForReviewStripView
              destination={destination}
              streakValue={streakValue}
              variantEnabled
              streakThreshold={3}
              cooldownDays={14}
              onAction={fn()}
              onClose={() => setClosed(true)}
            />
          </Wrapper>
        )}
      </div>
    );
  },
};
