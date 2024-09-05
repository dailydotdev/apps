import 'focus-visible';

import ExtensionOnboarding from '@dailydotdev/shared/src/components/ExtensionOnboarding';
import ExtensionPermissionsPrompt from '@dailydotdev/shared/src/components/ExtensionPermissionsPrompt';
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components/withFeaturesBoundary';
import AuthContext, {
  useAuthContext,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { BootDataProviderProps } from '@dailydotdev/shared/src/contexts/BootProvider';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { OnboardingContextProvider } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import useLogPageView from '@dailydotdev/shared/src/hooks/log/useLogPageView';
import { useConsoleLogo } from '@dailydotdev/shared/src/hooks/useConsoleLogo';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { useHostStatus } from '@dailydotdev/shared/src/hooks/useHostPermissionStatus';
import { useInAppNotification } from '@dailydotdev/shared/src/hooks/useInAppNotification';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import dynamic from 'next/dynamic';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Modal from 'react-modal';
import browser from 'webextension-polyfill';

import { BootDataProvider } from '../../../shared/src/contexts/BootProvider';
import { useContentScriptStatus } from '../../../shared/src/hooks';
import { version } from '../../package.json';
import { ExtensionContextProvider } from '../contexts/ExtensionContext';
import CustomRouter from '../lib/CustomRouter';
import { getContentScriptPermissionAndRegister } from '../lib/extensionScripts';
import MainFeedPage from './MainFeedPage';

const isFirefoxExtension = process.env.TARGET_BROWSER === 'firefox';
const DEFAULT_TAB_TITLE = 'New Tab';
const router = new CustomRouter();
const queryClient = new QueryClient(defaultQueryClientConfig);
const AuthModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "authModal" */ '@dailydotdev/shared/src/components/auth/AuthModal'
    ),
);

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

const getRedirectUri = () => browser.runtime.getURL('index.html');
function InternalApp(): ReactElement {
  useError();
  useInAppNotification();
  useLazyModal();
  usePrompt();
  useWebVitals();
  const { openModal } = useLazyModal();
  const { setCurrentPage, currentPage, promptUninstallExtension } =
    useExtensionContext();
  const [analyticsConsent, setAnalyticsConsent] = usePersistentState(
    'consent',
    false,
    isFirefoxExtension ? null : true,
  );

  const analyticsConsentPrompt = useCallback(() => {
    openModal({
      type: LazyModal.FirefoxPrivacy,
      props: {
        onAccept: () => setAnalyticsConsent(true),
        onDecline: () => promptUninstallExtension(),
      },
    });
  }, [openModal, promptUninstallExtension, setAnalyticsConsent]);

  useEffect(() => {
    if (analyticsConsent === null) {
      analyticsConsentPrompt();
    }
  }, [analyticsConsent, analyticsConsentPrompt]);

  const { unreadCount } = useNotificationContext();
  const { closeLogin, shouldShowLogin, loginState } = useContext(AuthContext);
  const { contentScriptGranted } = useContentScriptStatus();
  const { hostGranted, isFetching: isCheckingHostPermissions } =
    useHostStatus();
  const routeChangedCallbackRef = useLogPageView();
  useConsoleLogo();

  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;
  const shouldRedirectOnboarding = !user && isPageReady && !isTesting;

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
    if (contentScriptGranted) {
      getContentScriptPermissionAndRegister();
    }
  }, [contentScriptGranted]);

  useEffect(() => {
    document.title = unreadCount
      ? `(${unreadCount}) ${DEFAULT_TAB_TITLE}`
      : DEFAULT_TAB_TITLE;
  }, [unreadCount]);

  if (!hostGranted) {
    return isCheckingHostPermissions ? null : <ExtensionPermissionsPrompt />;
  }

  if (shouldRedirectOnboarding) {
    return <ExtensionOnboarding />;
  }

  return (
    <DndContextProvider>
      <MainFeedPage onPageChanged={onPageChanged} />
      {shouldShowLogin && (
        <AuthModal
          isOpen={shouldShowLogin}
          onRequestClose={closeLogin}
          contentLabel="Login Modal"
          {...loginState}
        />
      )}
    </DndContextProvider>
  );
}
const InternalAppWithFeaturesBoundary = withFeaturesBoundary(InternalApp, {
  fallback: null,
});

export default function App({
  localBootData,
}: Pick<BootDataProviderProps, 'localBootData'>): ReactElement {
  const [currentPage, setCurrentPage] = useState<string>('/');
  const deviceId = useDeviceId();

  return (
    <RouterContext.Provider value={router}>
      <ProgressiveEnhancementContextProvider>
        <QueryClientProvider client={queryClient}>
          <ExtensionContextProvider
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
                <OnboardingContextProvider>
                  <LazyModalElement />
                  <InternalAppWithFeaturesBoundary />
                </OnboardingContextProvider>
              </SubscriptionContextProvider>
            </BootDataProvider>
          </ExtensionContextProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ProgressiveEnhancementContextProvider>
    </RouterContext.Provider>
  );
}
