import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn, mocked } from 'storybook/test';
import mockedRouter, { useRouter } from 'next/router';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { BOOT_QUERY_KEY } from '@dailydotdev/shared/src/contexts/common';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import {
  FeaturesReadyContext,
  GrowthBookContext,
  useFeaturesReadyContext,
  useGrowthBookContext,
} from '../../../mock/GrowthBookProvider';
import { ProductionFlags } from '../../features/gist-feed/ProductionFlags';

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

/** MainLayout holds its chrome, and the home feed its cards, until
 * GrowthBook reports ready and settled */
const GrowthBookReady = ({ children }: { children: ReactNode }) => {
  const { growthbook } = useGrowthBookContext();
  const featuresReady = useFeaturesReadyContext();

  return (
    <GrowthBookContext.Provider
      value={{ growthbook: { ...growthbook, ready: true } as never }}
    >
      <FeaturesReadyContext.Provider
        value={{ ...featuresReady, ready: true, settled: true }}
      >
        {children}
      </FeaturesReadyContext.Provider>
    </GrowthBookContext.Provider>
  );
};

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/wallet': 'Core wallet',
  '/boosts': 'Boosts',
  '/cores': 'Get More Cores',
  '/daily-quests': 'Daily quests',
  '/notifications': 'Notifications',
};

const RouteContext = createContext<(path: string) => void>(() => undefined);

/** Moves the production shell to the page a screen is on */
export const useRoute = (path: string): void => {
  const setPath = useContext(RouteContext);
  useEffect(() => setPath(path), [path, setPath]);
};

export interface CoresProvidersProps {
  children: ReactNode;
  /** The viewer's Core balance */
  balance?: number;
  coresRole?: CoresRole;
  isPlus?: boolean;
  /** The route the app is on, which the sidebar marks as active */
  activePage?: string;
}

/**
 * The production app around a screen, as the webapp mounts a page: a real
 * boot (BootDataProvider, so auth, settings and the dark theme come from it),
 * production flags, and MainLayout with its sidebar and header.
 */
export const CoresProviders = ({
  children,
  balance = 0,
  coresRole = CoresRole.Creator,
  isPlus = false,
  activePage = '/wallet',
}: CoresProvidersProps): ReactElement => {
  // MainLayout paints once the router is ready, and reads the page from it.
  // The sidebar's Recent list records the page under document.title, and
  // skips post pages as production does.
  // A walkthrough moves between pages: each screen names its route
  // (useRoute), and the shell re-renders on it.
  const [path, setPath] = useState(activePage);
  const routed = useRef<string>();
  if (routed.current !== path) {
    routed.current = path;
    const isPost = path.startsWith('/posts/');
    const route = isPost ? '/posts/[id]' : path;
    document.title = `${pageTitles[path] ?? 'daily.dev'} | daily.dev`;
    mocked(useRouter).mockReturnValue({
      ...mockedRouter,
      isReady: true,
      route,
      pathname: route,
      asPath: path,
      query: {},
    } as never);
  }
  const [bootData] = useState(() => ({
    ...getBootMock(),
    user: {
      ...defaultBootData.user,
      ...viewer,
      coresRole,
      isPlus,
      balance: { amount: balance },
    },
    settings: { ...defaultBootData.settings, theme: 'darcula' },
  }));
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
          refetchOnWindowFocus: false,
        },
      },
    });
    client.setQueryData(BOOT_QUERY_KEY, bootData);
    // Boot refetches through the global mock, which answers as the fixture
    // user; pinning the query keeps this viewer and balance
    client.getQueryCache().subscribe(({ query }) => {
      const booted = query.state.data as { user?: { id: string } } | undefined;
      if (
        query.queryHash === JSON.stringify(BOOT_QUERY_KEY) &&
        booted?.user?.id !== bootData.user.id
      ) {
        client.setQueryData(BOOT_QUERY_KEY, bootData);
      }
    });
    return client;
  });
  // react-modal binds to #__next, so screens mount after it is in the DOM
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Webapp}
        deviceId="sb"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={bootData as never}
      >
        <ProductionFlags overrides={productionFlags}>
          <GrowthBookReady>
            <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
              <div id="__next">
                <RouteContext.Provider value={setPath}>
                  <MainLayout activePage={path}>
                    {isMounted && children}
                  </MainLayout>
                </RouteContext.Provider>
              </div>
            </ActiveFeedContext.Provider>
          </GrowthBookReady>
        </ProductionFlags>
      </BootDataProvider>
    </QueryClientProvider>
  );
};
