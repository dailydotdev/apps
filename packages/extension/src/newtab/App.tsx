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
import { BootDataProviderProps } from '@dailydotdev/shared/src/contexts/BootProvider';
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
import ExtensionOnboarding from '@dailydotdev/shared/src/components/ExtensionOnboarding';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components/withFeaturesBoundary';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { useHostStatus } from '@dailydotdev/shared/src/hooks/useHostPermissionStatus';
import ExtensionPermissionsPrompt from '@dailydotdev/shared/src/components/ExtensionPermissionsPrompt';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { useConsoleLogo } from '@dailydotdev/shared/src/hooks/useConsoleLogo';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { structuredCloneJsonPolyfill } from '@dailydotdev/shared/src/lib/structuredClone';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import {
  FIREFOX_ACCEPTED_PERMISSION,
  FirefoxPermissionType,
} from '@dailydotdev/shared/src/lib/cookie';
import { ExtensionContextProvider } from '../contexts/ExtensionContext';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import { BootDataProvider } from '../../../shared/src/contexts/BootProvider';
import { getContentScriptPermissionAndRegister } from '../lib/extensionScripts';
import { useContentScriptStatus } from '../../../shared/src/hooks';
import { FirefoxPermission } from '../permission/FirefoxPermission';
import { FirefoxPermissionDeclined } from '../permission/FirefoxPermissionDeclined';

structuredCloneJsonPolyfill();

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
  useWebVitals();
  const { setCurrentPage, currentPage } = useExtensionContext();
  const [firefoxPermission, setFirefoxPermission, isFetched] =
    usePersistentContext<FirefoxPermissionType | null>(
      FIREFOX_ACCEPTED_PERMISSION,
      null,
    );
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
  const isFirefoxExtension = process.env.TARGET_BROWSER === 'firefox';

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

  if (isFirefoxExtension) {
    if (!isFetched) {
      return null;
    }

    if (firefoxPermission === FirefoxPermissionType.Declined) {
      return (
        <FirefoxPermissionDeclined
          onGoBack={() => setFirefoxPermission(null)}
        />
      );
    }

    if (firefoxPermission !== FirefoxPermissionType.Accepted) {
      return <FirefoxPermission onUpdate={setFirefoxPermission} />;
    }
  }

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
