import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaPopoverSmall } from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaPopoverSmall';
import { generateQueryKey, RequestKey } from '@dailydotdev/shared/src/lib/query';
import ProfileIndex from '../../../webapp/components/layouts/SettingsLayout/Profile';

// What members see today, from the production components. The popover gets
// the live `verify-work-email` marketing_cta row, word for word.

const noop = (): void => undefined;

const member = {
  id: 'sb-maya',
  name: 'Maya',
  username: 'maya',
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1',
  bio: 'Senior Engineer at Acme',
  providers: ['github'],
  socialLinks: [],
};

const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
  sidebarExpanded: true,
};

const Providers = ({ children }: { children: ReactNode }): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
      },
    });
    // The settings form loads the full profile; seed it so it needs no API.
    client.setQueryData(
      generateQueryKey(RequestKey.Profile, member as never, { id: member.id }),
      member,
    );
    return client;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={member as never}
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{} as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          <SettingsContext.Provider value={settings as never}>
            {children}
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

/** The live row behind Customer.io campaign 46. */
export const verifyWorkEmailCta: MarketingCta = {
  campaignId: 'verify-work-email',
  variant: MarketingCtaVariant.PopoverSmall,
  createdAt: new Date('2025-05-28T13:43:53Z'),
  flags: {
    image:
      'https://media.daily.dev/image/upload/s--t5oyEhRs--/f_auto/v1728979615/public/Verified%20work%20email',
    title: 'Get verified for free',
    ctaUrl: 'https://app.daily.dev/settings/profile',
    ctaText: 'Get my badge',
    tagText: 'Verification',
    tagColor: 'avocado',
    description:
      'Claim your free verified badge to show where you work. It’s fast, easy, and makes your profile pop.',
  },
} as MarketingCta;

export const ProductionPopover = (): ReactElement => (
  <Providers>
    <MarketingCtaPopoverSmall marketingCta={verifyWorkEmailCta} />
  </Providers>
);

/** `/settings/profile`, where "Get my badge" goes. */
export const ProductionLanding = (): ReactElement => (
  <Providers>
    <ProfileIndex />
  </Providers>
);
