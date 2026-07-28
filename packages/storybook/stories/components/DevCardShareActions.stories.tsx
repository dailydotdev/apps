import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { fn } from 'storybook/test';

const permalink = 'https://app.daily.dev/testuser';

interface DevCardActionRowProps {
  /**
   * Mirrors `share_devcard` + the `sharing_visibility` master gate in
   * `DevCardStep2`. Off = the download-only action row currently in production.
   */
  canShare: boolean;
  onShare: () => void;
}

// Mirrors the action row under the DevCard preview in
// `packages/webapp/components/layouts/SettingsLayout/Customization/DevCard/DevCardStep2.tsx`.
// The step itself lives in `webapp`, which storybook does not depend on, so the
// row is reproduced here to review spacing and the share affordance.
const DevCardActionRow = ({
  canShare,
  onShare,
}: DevCardActionRowProps): React.ReactElement => {
  const downloadButton = (
    <Button
      className={canShare ? 'grow-0' : 'mx-auto mt-4 grow-0 self-start'}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
    >
      Download DevCard
    </Button>
  );

  if (!canShare) {
    return <section className="flex flex-col">{downloadButton}</section>;
  }

  return (
    <section className="flex flex-col">
      <div className="mt-4 flex flex-row items-center justify-center gap-3">
        {downloadButton}
        <ShareActions
          link={permalink}
          text="Check out my DevCard on daily.dev"
          emailTitle="My daily.dev DevCard"
          cid={ReferralCampaignKey.ShareProfile}
          label="Share DevCard"
          buttonVariant={ButtonVariant.Secondary}
          buttonSize={ButtonSize.Medium}
          onShare={onShare}
        />
      </div>
    </section>
  );
};

const meta: Meta<typeof DevCardActionRow> = {
  title: 'Components/Share/DevCardShareActions',
  component: DevCardActionRow,
  args: {
    canShare: true,
    onShare: fn(),
  },
  argTypes: {
    canShare: {
      control: 'boolean',
      description:
        'share_devcard flag + sharing_visibility master gate. Off = download only.',
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      // Mock the short-URL resolution so copy/social actions don't hit network.
      queryClient.setQueryData(['shortUrl'], 'https://dly.to/abc123');

      const LogContext = getLogContextStatic();

      const mockUser = {
        id: '1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
        providers: ['google'],
        createdAt: '2024-01-01T00:00:00.000Z',
        permalink,
      } as unknown as LoggedUser;

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
              <div className="flex min-h-60 items-center justify-center">
                <Story />
              </div>
            </LogContext.Provider>
          </AuthContext.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof DevCardActionRow>;

// Flag on, desktop: primary Download plus a secondary share trigger that opens
// the share popover. Click the share icon, then "Copy link" for the copying
// state (the icon flips to its filled variant while the toast is up).
export const Desktop: Story = {};

// Flag off — the production action row: a single centered Download button.
export const FlagOff: Story = {
  name: 'Flag off (download only)',
  args: { canShare: false },
};

// Narrow canvas so the mobile breakpoint applies: a single tap goes straight to
// the native share sheet (or copies when native share is unavailable).
export const Mobile: Story = {
  name: 'Mobile viewport (tap to share)',
  parameters: { viewport: { defaultViewport: 'mobile2' } },
};
