import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { GrowthBookProvider } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import type {
  LoggedUser,
  PublicProfile,
} from '@dailydotdev/shared/src/lib/user';

/**
 * Shared scaffolding for every sharing story (ShareActions, ProfileShareButton
 * and the Overview review page) so the mock user, the seeded short link and the
 * toast surface are defined once.
 */

export const mockUser = {
  id: 'u1',
  name: 'Ido Shamun',
  username: 'idoshamun',
  email: 'ido@daily.dev',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2020-01-01T00:00:00.000Z',
  permalink: 'https://app.daily.dev/idoshamun',
} as unknown as LoggedUser;

export const profile = {
  ...mockUser,
  bio: 'Co-founder of daily.dev. Building the homepage millions of developers open every morning.',
  cover:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/cover',
  reputation: 4210,
  isPlus: true,
} as unknown as PublicProfile;

export const userStats = {
  upvotes: 1240,
  numFollowers: 8300,
  numFollowing: 210,
};

export const SHORT_LINK = 'https://dly.to/abc123';

const createQueryClient = (): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  // Seed the short-URL resolution so copy/social actions never hit network.
  const { queryKey } = getShortLinkProps(
    profile.permalink,
    ReferralCampaignKey.ShareProfile,
    mockUser,
  );
  queryClient.setQueryData(queryKey, SHORT_LINK);
  queryClient.setQueryData(['shortUrl'], SHORT_LINK);

  return queryClient;
};

const authValue = {
  user: mockUser,
  isLoggedIn: true,
  isAuthReady: true,
  tokenRefreshed: true,
  shouldShowLogin: false,
  showLogin: fn(),
  closeLogin: fn(),
  logout: fn(),
  updateUser: fn(),
  getRedirectUri: fn(),
  loadingUser: false,
  loadedUserFromCache: true,
  refetchBoot: fn(),
  squads: [],
  isAndroidApp: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Only what the profile surfaces actually read; the real provider is a boot
// round-trip we don't want in a story.
const settingsValue = {
  themeMode: 'dark',
  loadedSettings: true,
  insaneMode: false,
  spaciness: 'eco',
  openNewTab: true,
  showTopSites: true,
  sidebarExpanded: true,
  sortingEnabled: false,
  optOutReadingStreak: false,
  flags: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const logValue = {
  logEvent: fn(),
  logEventStart: fn(),
  logEventEnd: fn(),
  sendBeacon: () => false,
};

export function ShareStoryProviders({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [queryClient] = React.useState(createQueryClient);
  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <SettingsContext.Provider value={settingsValue}>
          <GrowthBookProvider
            app={BootApp.Webapp}
            user={mockUser}
            deviceId="storybook"
          >
            <LogContext.Provider value={logValue}>
              {children}
              {/* Real toast surface, so copy actions in the stories confirm
                  exactly the way they do in the product. */}
              <Toast autoDismissNotifications />
            </LogContext.Provider>
          </GrowthBookProvider>
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

/** Decorator for single-component stories: all providers plus a width cap. */
export const withShareProviders =
  (className = 'mx-auto w-full max-w-[40rem]') =>
  (Story: React.ComponentType): ReactElement =>
    (
      <ShareStoryProviders>
        <div className={className}>
          <Story />
        </div>
      </ShareStoryProviders>
    );
