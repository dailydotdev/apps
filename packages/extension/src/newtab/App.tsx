import React, {
  MutableRefObject,
  ReactElement,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import 'focus-visible';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { browser } from 'webextension-polyfill-ts';
import { useInAppNotification } from '@dailydotdev/shared/src/hooks/useInAppNotification';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import { BootDataProviderProps } from '@dailydotdev/shared/src/contexts/BootProvider';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import useDeviceId from '@dailydotdev/shared/src/hooks/analytics/useDeviceId';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import { DndContextProvider } from './DndContext';
import { BootDataProvider } from '../../../shared/src/contexts/BootProvider';
import {
  getContentScriptPermissionAndRegister,
  useExtensionPermission,
} from '../companion/useExtensionPermission';

const AnalyticsConsentModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "analyticsConsentModal" */ './AnalyticsConsentModal'
    ),
);

const DEFAULT_TAB_TITLE = 'New Tab';
const router = new CustomRouter();
const queryClient = new QueryClient();
const AuthModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "authModal" */ '@dailydotdev/shared/src/components/auth/AuthModal'
    ),
);

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

const shouldShowConsent = process.env.TARGET_BROWSER === 'firefox';

const getRedirectUri = () => browser.runtime.getURL('index.html');

function InternalApp({
  pageRef,
}: {
  pageRef: MutableRefObject<string>;
}): ReactElement {
  useError();
  useInAppNotification();
  const { unreadCount } = useNotificationContext();
  const { closeLogin, shouldShowLogin, loginState } = useContext(AuthContext);
  const { contentScriptGranted } = useExtensionPermission({
    origin: 'on extension load',
  });
  const [analyticsConsent, setAnalyticsConsent] = usePersistentState(
    'consent',
    false,
    shouldShowConsent ? null : true,
  );
  const routeChangedCallbackRef = useTrackPageView();

  useEffect(() => {
    if (routeChangedCallbackRef.current) {
      routeChangedCallbackRef.current();
    }
  }, [routeChangedCallbackRef]);

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
      {analyticsConsent === null && (
        <AnalyticsConsentModal
          onDecline={() => setAnalyticsConsent(false)}
          onAccept={() => setAnalyticsConsent(true)}
          isOpen
        />
      )}
    </DndContextProvider>
  );
}

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
            app="extension"
            getRedirectUri={getRedirectUri}
            localBootData={localBootData}
          >
            <SubscriptionContextProvider>
              <AnalyticsContextProvider
                app="extension"
                version={version}
                getPage={() => pageRef.current}
                deviceId={deviceId}
              >
                <InternalApp pageRef={pageRef} />
              </AnalyticsContextProvider>
            </SubscriptionContextProvider>
          </BootDataProvider>
        </QueryClientProvider>
      </ProgressiveEnhancementContextProvider>
    </RouterContext.Provider>
  );
}
