import React, { ReactElement, ReactNode } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { CookieConsent } from '@dailydotdev/shared/src/features/onboarding/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Continent } from '@dailydotdev/shared/src/lib/geo';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

type Parameters = {
    isGdprCovered: boolean;
}

// Create mock helpers for Storybook
const withQueryClient = (
  Story: () => ReactElement,
  { parameters }: { parameters: Parameters },
): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider
      user={{
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        username: 'testuser',
      }}
      updateUser={fn()}
      tokenRefreshed={true}
      getRedirectUri={fn()}
      loadingUser={false}
      loadedUserFromCache={true}
      refetchBoot={fn()}
      isFetched={true}
      squads={[]}
      firstLoad={true}
      geo={parameters.isGdprCovered ? {
        continent: Continent.Europe,
        region: 'DE',
      } : {
        continent: Continent.NorthAmerica,
        region: 'US',
      }}
      isAndroidApp={false}
    >
      <Story />
    </AuthContextProvider>
  </QueryClientProvider>
);

const meta: Meta<typeof CookieConsent> = {
  title: 'Components/Onboarding/Shared/CookieConsent',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27354-25851&m=dev',
    },
    controls: {
      expanded: true,
    },
  },
  component: CookieConsent,
  decorators: [withQueryClient],
  args: {
    onAccepted: () => {
      console.log('accepted');
    },
    onModalClose: () => {
      console.log('modal closed');
    },
    onHideBanner: () => {
      console.log('banner hidden');
    },
  },
};

export default meta;
type Story = StoryObj<typeof CookieConsent>;

// Create a simple div wrapper
const Wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="max-w-96">{children}</div>
);

export const GdprVersion: Story = {
  name: 'GDPR Version',
  parameters: {
    isGdprCovered: true,
  },
};

export const NonGdprVersion: Story = {
  name: 'Non-GDPR Version',
  parameters: {
    isGdprCovered: false,
  },
};
