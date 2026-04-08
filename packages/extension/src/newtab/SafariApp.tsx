import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Modal from 'react-modal';
import 'focus-visible';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import browser from 'webextension-polyfill';
import type { BootDataProviderProps } from '@dailydotdev/shared/src/contexts/BootProvider';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import useLogPageView from '@dailydotdev/shared/src/hooks/log/useLogPageView';
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components/withFeaturesBoundary';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { useConsoleLogo } from '@dailydotdev/shared/src/hooks/useConsoleLogo';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { structuredCloneJsonPolyfill } from '@dailydotdev/shared/src/lib/structuredClone';
import { useCheckCoresRole } from '@dailydotdev/shared/src/hooks/useCheckCoresRole';
import { ShortcutsProvider } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { useCheckLocation } from '@dailydotdev/shared/src/hooks/useCheckLocation';
import { useScrollbarWidth } from '@dailydotdev/shared/src/hooks/useScrollbarWidth';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import SafariPermissionsGate from './SafariPermissionsGate';
import { SafariExtensionContextProvider } from '../contexts/SafariExtensionContext';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import { BootDataProvider } from '../../../shared/src/contexts/BootProvider';

structuredCloneJsonPolyfill();

const DEFAULT_TAB_TITLE = 'New Tab';
const router = new CustomRouter();
// Safari: report pathname as /onboarding to prevent AuthContext from
// force-logging out users who haven't completed webapp onboarding.
// The shared AuthContext calls logout() when infoConfirmed is false,
// unless the current page is /onboarding or /callback.
router.pathname = '/onboarding';
const queryClient = new QueryClient(defaultQueryClientConfig);
Modal.setAppElement('#__next');
Modal.defaultStyles = {};

const getRedirectUri = () => browser.runtime.getURL('index.html');

const feedErrorFallback: ReactElement = (
  <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 px-6 text-center">
    <h1 className="typo-title2">Something went wrong</h1>
    <p className="text-text-tertiary">Please reload this page to continue.</p>
    <button
      type="button"
      className="btn-primary px-5 py-2"
      onClick={() => window.location.reload()}
    >
      Reload
    </button>
  </div>
);

function InternalApp(): ReactElement {
  useError();
  useWebVitals();
  useScrollbarWidth();
  const { setCurrentPage, currentPage } = useExtensionContext();
  const { unreadCount } = useNotificationContext();
  const routeChangedCallbackRef = useLogPageView();
  useConsoleLogo();
  const { isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;

  useCheckLocation();
  useCheckCoresRole();

  useEffect(() => {
    if (routeChangedCallbackRef.current && isPageReady) {
      routeChangedCallbackRef.current();
    }
  }, [isPageReady, routeChangedCallbackRef, currentPage]);

  const { dismissToast } = useToastNotification();

  const onPageChanged = useCallback(
    (page: string): void => {
      setCurrentPage(page);
      dismissToast();
    },
    [dismissToast, setCurrentPage],
  );

  useEffect(() => {
    document.title = unreadCount
      ? `(${unreadCount}) ${DEFAULT_TAB_TITLE}`
      : DEFAULT_TAB_TITLE;
  }, [unreadCount]);

  return (
    <ErrorBoundary feature="extension-feed" fallback={feedErrorFallback}>
      <DndContextProvider>
        <MainFeedPage onPageChanged={onPageChanged} />
      </DndContextProvider>
    </ErrorBoundary>
  );
}

const InternalAppWithFeaturesBoundary = withFeaturesBoundary(InternalApp, {
  fallback: null,
});

export default function SafariApp({
  localBootData,
}: Pick<BootDataProviderProps, 'localBootData'>): ReactElement {
  const [currentPage, setCurrentPage] = useState<string>('/');
  const deviceId = useDeviceId();

  return (
    <SafariPermissionsGate>
      <RouterContext.Provider value={router}>
        <ProgressiveEnhancementContextProvider>
          <QueryClientProvider client={queryClient}>
            <SafariExtensionContextProvider
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            >
              <BootDataProvider
                app={BootApp.Extension}
                getRedirectUri={getRedirectUri}
                localBootData={localBootData}
                version={version}
                getPage={() => currentPage}
                deviceId={deviceId}
              >
                <SubscriptionContextProvider>
                  <ShortcutsProvider>
                    <LazyModalElement />
                    <InternalAppWithFeaturesBoundary />
                  </ShortcutsProvider>
                </SubscriptionContextProvider>
              </BootDataProvider>
            </SafariExtensionContextProvider>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </ProgressiveEnhancementContextProvider>
      </RouterContext.Provider>
    </SafariPermissionsGate>
  );
}
