import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { InviteFriendsStep } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelInviteFriends';
import type { FunnelStepInviteFriends } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';

const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
} as unknown as LoggedUser;

const LogContext = getLogContextStatic();

// Renders the unguarded step: the production `FunnelInviteFriends` export is
// additionally gated on the `onboarding_invite_reward` flag + a logged-in
// user (verified in Jest), which Storybook can't provide deterministically.
const StepProviders = ({
  children,
  referredUsersCount,
}: {
  children: React.ReactNode;
  referredUsersCount: number;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  // Seed the generic referral campaign so `useReferralCampaign` resolves
  // without network access.
  queryClient.setQueryData(
    generateQueryKey(RequestKey.ReferralCampaigns, mockUser, {
      referralOrigin: ReferralCampaignKey.Generic,
    }),
    {
      referredUsersCount,
      referralCountLimit: 5,
      referralToken: 'storybook-token',
      url: 'https://dly.to/storybook',
    },
  );
  // Mock the short-URL resolution so copy/social actions don't hit network.
  queryClient.setQueryData(['shortUrl'], 'https://dly.to/storybook');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: mockUser,
          shouldShowLogin: false,
          isLoggedIn: true,
          isAuthReady: true,
          showLogin: fn(),
          closeLogin: fn(),
          logout: fn(),
          updateUser: fn(),
          tokenRefreshed: true,
          getRedirectUri: fn(),
          loadingUser: false,
          loadedUserFromCache: true,
          refetchBoot: fn(),
          squads: [],
          isAndroidApp: false,
        }}
      >
        <LogContext.Provider
          value={{
            logEvent: fn(),
            logEventStart: fn(),
            logEventEnd: fn(),
            sendBeacon: () => false,
          }}
        >
          {children}
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

interface StoryArgs extends FunnelStepInviteFriends {
  referredUsersCount: number;
}

const meta: Meta<StoryArgs> = {
  title: 'Components/Onboarding/Steps/InviteFriends',
  component: InviteFriendsStep,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  argTypes: {
    referredUsersCount: {
      control: { type: 'number', min: 0, max: 5 },
      description:
        'Mocked `referredUsersCount` from the generic referral campaign; 3+ shows the celebration state',
    },
  },
  tags: ['autodocs'],
  render: ({ referredUsersCount, ...props }) => (
    <StepProviders referredUsersCount={referredUsersCount}>
      <FunnelStepBackground step={props}>
        <div className="flex min-h-dvh flex-col">
          <InviteFriendsStep {...props} />
        </div>
      </FunnelStepBackground>
    </StepProviders>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

const commonProps: FunnelStepInviteFriends = {
  id: 'invite-friends',
  type: FunnelStepType.InviteFriends,
  parameters: {},
  transitions: [
    {
      on: FunnelStepTransitionType.Complete,
      destination: COMPLETED_STEP_ID,
    },
    {
      on: FunnelStepTransitionType.Skip,
      destination: COMPLETED_STEP_ID,
    },
  ],
  isActive: true,
  onTransition: fn(),
};

export const ZeroJoined: Story = {
  args: {
    ...commonProps,
    referredUsersCount: 0,
  },
};

export const OneJoined: Story = {
  args: {
    ...commonProps,
    referredUsersCount: 1,
  },
};

export const TargetReachedCelebration: Story = {
  args: {
    ...commonProps,
    referredUsersCount: 3,
  },
};

// The reward framing is a step parameter so it can be A/B-tested straight from
// the backend funnel JSON — this is the "3 months" arm.
export const RewardThreeMonths: Story = {
  args: {
    ...commonProps,
    referredUsersCount: 0,
    parameters: {
      reward: '3 months',
    },
  },
};

// Without a `skip` transition in the funnel JSON the in-step skip button is
// hidden — the backend contract requires funnels to always define one.
export const WithoutSkipTransition: Story = {
  args: {
    ...commonProps,
    referredUsersCount: 0,
    transitions: [
      {
        on: FunnelStepTransitionType.Complete,
        destination: COMPLETED_STEP_ID,
      },
    ],
  },
};
