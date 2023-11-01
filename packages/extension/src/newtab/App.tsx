import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import 'focus-visible';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { OnboardingContextProvider } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import AuthContext, {
  useAuthContext,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { browser } from 'webextension-polyfill-ts';
import { useInAppNotification } from '@dailydotdev/shared/src/hooks/useInAppNotification';
import { BootDataProviderProps } from '@dailydotdev/shared/src/contexts/BootProvider';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import useDeviceId from '@dailydotdev/shared/src/hooks/analytics/useDeviceId';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import ExtensionOnboarding from '@dailydotdev/shared/src/components/ExtensionOnboarding';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components/withFeaturesBoundary';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import { DndContextProvider } from './DndContext';
import { BootDataProvider } from '../../../shared/src/contexts/BootProvider';
import {
  getContentScriptPermissionAndRegister,
  requestContentScripts,
  registerBrowserContentScripts,
  getContentScriptPermission,
} from '../lib/extensionScripts';
import {
  EXTENSION_PERMISSION_KEY,
  useContentScriptStatus,
} from '../../../shared/src/hooks';

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
function InternalApp({
  pageRef,
}: {
  pageRef: MutableRefObject<string>;
}): ReactElement {
  useError();
  useInAppNotification();
  useLazyModal();
  usePrompt();
  useWebVitals();
  const { unreadCount } = useNotificationContext();
  const { closeLogin, shouldShowLogin, loginState } = useContext(AuthContext);
  const { contentScriptGranted } = useContentScriptStatus();
  const routeChangedCallbackRef = useTrackPageView();

  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;
  const shouldRedirectOnboarding = !user && isPageReady && !isTesting;

  useQuery(EXTENSION_PERMISSION_KEY, () => ({
    requestContentScripts,
    registerBrowserContentScripts,
    getContentScriptPermission,
  }));

  useEffect(() => {
    if (routeChangedCallbackRef.current && isPageReady) {
      routeChangedCallbackRef.current();
    }
  }, [isPageReady, routeChangedCallbackRef]);

  const { dismissToast } = useToastNotification();

  const onPageChanged = (page: string): void => {
    // eslint-disable-next-line no-param-reassign
    pageRef.current = page;
    routeChangedCallbackRef.current();
    dismissToast();
  };

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

  useEffect(() => {
    if (shouldRedirectOnboarding) {
      routeChangedCallbackRef.current();
    }
  }, [routeChangedCallbackRef, shouldRedirectOnboarding]);

  if (shouldRedirectOnboarding) {
    // eslint-disable-next-line no-param-reassign
    pageRef.current = '/hijacking';
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
const InternalAppWithFeaturesBoundary = withFeaturesBoundary(InternalApp);

export default function App({
  localBootData,
}: Pick<BootDataProviderProps, 'localBootData'>): ReactElement {
  const pageRef = useRef('/');
  const deviceId = useDeviceId();

  return (
    <RouterContext.Provider value={router}>
      <ProgressiveEnhancementContextProvider>
        <QueryClientProvider client={queryClient}>
          <BootDataProvider
            app={BootApp.Extension}
            getRedirectUri={getRedirectUri}
            localBootData={localBootData}
            version={version}
            getPage={() => pageRef.current}
            deviceId={deviceId}
          >
            <SubscriptionContextProvider>
              <OnboardingContextProvider>
                <InternalAppWithFeaturesBoundary pageRef={pageRef} />
              </OnboardingContextProvider>
            </SubscriptionContextProvider>
          </BootDataProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ProgressiveEnhancementContextProvider>
    </RouterContext.Provider>
  );
}
