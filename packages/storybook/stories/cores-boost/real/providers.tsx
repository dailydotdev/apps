import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext, {
  ThemeMode,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { FeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';

export const noop = (): void => undefined;

// Production GrowthBook values for a non-team user (read from a production
// boot, 2026-11-05). The team rule lowers the boost minimum to 1,000, so
// anyone checking production from a team account sees a different slider.
export const productionFlags: Record<string, unknown> = {
  cores: true,
  post_boost_ads: true,
  cores_pricing_ids: 'cores_default',
  boost_settings: {
    min: 5000,
    max: 100000,
    step: 1000,
    default_cores: 10000,
    default_days: 5,
  },
};

export const viewer: LoggedUser = {
  id: 'sb-viewer',
  username: 'devdana',
  name: 'Dev Dana',
  image: fallbackImages.avatar,
  providers: ['github'],
  email: 'dana@example.com',
  infoConfirmed: true,
  premium: false,
  createdAt: '2025-03-02T10:00:00.000Z',
  permalink: 'https://app.daily.dev/devdana',
  coresRole: CoresRole.Creator,
  balance: { amount: 0 },
};

const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
  sidebarExpanded: true,
};

export interface CoresProvidersProps {
  children: ReactNode;
  /** The viewer's Core balance */
  balance?: number;
  coresRole?: CoresRole;
  isPlus?: boolean;
}

export const CoresProviders = ({
  children,
  balance = 0,
  coresRole = CoresRole.Creator,
  isPlus = false,
}: CoresProvidersProps): ReactElement => {
  const LogContext = getLogContextStatic();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
  );
  const [user, setUser] = useState<LoggedUser>(() => ({
    ...viewer,
    coresRole,
    isPlus,
    balance: { amount: balance },
  }));
  // Awarding and buying write the new balance back, as in the app
  const updateUser = useCallback(async (next: LoggedUser) => {
    setUser(next);
    return next;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FeatureOverrides values={productionFlags}>
        <FeaturesReadyContext.Provider
          value={{
            ready: true,
            settled: true,
            getFeatureValue: ((feature: {
              id: string;
              defaultValue: unknown;
            }) =>
              feature.id in productionFlags
                ? productionFlags[feature.id]
                : feature.defaultValue) as never,
          }}
        >
          <AuthContextProvider
            user={user}
            firstLoad={false}
            isFetched
            loadingUser={false}
            tokenRefreshed
            loadedUserFromCache
            getRedirectUri={() => ''}
            updateUser={updateUser as never}
            refetchBoot={noop as never}
            visit={{ visitId: 'sb', sessionId: 'sb' } as never}
            accessToken={null as never}
            squads={[]}
            feeds={undefined}
            geo={{ region: 'US' } as never}
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
              {/* Themed assets follow the Storybook theme toggle */}
              <SettingsContext.Provider
                value={
                  {
                    ...settings,
                    themeMode: document.documentElement.classList.contains(
                      'dark',
                    )
                      ? ThemeMode.Dark
                      : ThemeMode.Light,
                  } as never
                }
              >
                {children}
              </SettingsContext.Provider>
            </LogContext.Provider>
          </AuthContextProvider>
        </FeaturesReadyContext.Provider>
      </FeatureOverrides>
    </QueryClientProvider>
  );
};
