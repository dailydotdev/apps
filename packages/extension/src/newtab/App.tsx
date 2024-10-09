import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import 'focus-visible';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import AuthContext, {
  useAuthContext,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import browser from 'webextension-polyfill';
import { useInAppNotification } from '@dailydotdev/shared/src/hooks/useInAppNotification';
import { BootDataProviderProps } from '@dailydotdev/shared/src/contexts/BootProvider';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import useLogPageView from '@dailydotdev/shared/src/hooks/log/useLogPageView';
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import {
  useFeature,
  useGrowthBookContext,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import ExtensionOnboarding from '@dailydotdev/shared/src/components/ExtensionOnboarding';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components/withFeaturesBoundary';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { useHostStatus } from '@dailydotdev/shared/src/hooks/useHostPermissionStatus';
import ExtensionPermissionsPrompt from '@dailydotdev/shared/src/components/ExtensionPermissionsPrompt';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { useConsoleLogo } from '@dailydotdev/shared/src/hooks/useConsoleLogo';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { structuredCloneJsonPolyfill } from '@dailydotdev/shared/src/lib/structuredClone';
import { get as getCache } from 'idb-keyval';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { ExtensionContextProvider } from '../contexts/ExtensionContext';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import { BootDataProvider } from '../../../shared/src/contexts/BootProvider';
import { getContentScriptPermissionAndRegister } from '../lib/extensionScripts';
import { useContentScriptStatus } from '../../../shared/src/hooks';
import { KeepItOverlay } from './KeepItOverlay';
import { INSTALLATION_STORAGE_KEY } from '../lib/common';

structuredCloneJsonPolyfill();

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

  const [shouldShowOverlay, setShouldShowOverlay] = useState(false);
  const { unreadCount } = useNotificationContext();
  const { closeLogin, shouldShowLogin, loginState } = useContext(AuthContext);
  const { contentScriptGranted } = useContentScriptStatus();
  const { hostGranted, isFetching: isCheckingHostPermissions } =
    useHostStatus();
  const routeChangedCallbackRef = useLogPageView();
  useConsoleLogo();

  const extensionOverlay = useFeature(feature.extensionOverlay);
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
    if (shouldShowLogin) {
      return;
    }

    getCache(INSTALLATION_STORAGE_KEY).then((value) => {
      if (value) {
        setShouldShowOverlay(true);
      }
    });
  }, [shouldShowLogin]);

  useEffect(() => {
    document.title = unreadCount
      ? `(${unreadCount}) ${DEFAULT_TAB_TITLE}`
      : DEFAULT_TAB_TITLE;
  }, [unreadCount]);

  const onClose = useCallback(() => setShouldShowOverlay(false), []);
  const overlay =
    shouldShowOverlay && extensionOverlay ? (
      <KeepItOverlay onClose={onClose} />
    ) : null;

  if (!hostGranted) {
    return isCheckingHostPermissions ? null : (
      <ExtensionPermissionsPrompt>{overlay}</ExtensionPermissionsPrompt>
    );
  }

  if (shouldRedirectOnboarding) {
    return <ExtensionOnboarding>{overlay}</ExtensionOnboarding>;
  }

  return (
    <DndContextProvider>
      {overlay}
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
                <LazyModalElement />
                <InternalAppWithFeaturesBoundary />
              </SubscriptionContextProvider>
            </BootDataProvider>
          </ExtensionContextProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ProgressiveEnhancementContextProvider>
    </RouterContext.Provider>
  );
}
