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
import useThirdPartyAnalytics from '@dailydotdev/shared/src/hooks/useThirdPartyAnalytics';
import ProgressiveEnhancementContext, {
  ProgressiveEnhancementContextProvider,
} from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { browser } from 'webextension-polyfill-ts';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import { BootDataProviderProps } from '@dailydotdev/shared/src/contexts/BootProvider';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import { trackPageView } from '@dailydotdev/shared/src/lib/analytics';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import getPageForAnalytics from '../lib/getPageForAnalytics';
import { DndContextProvider } from './DndContext';
import { BootDataProvider } from '../../../shared/src/contexts/BootProvider';

const AnalyticsConsentModal = dynamic(() => import('./AnalyticsConsentModal'));

const router = new CustomRouter();
const queryClient = new QueryClient();
const LoginModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "loginModal" */ '@dailydotdev/shared/src/components/modals/LoginModal'
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
  const {
    user,
    tokenRefreshed,
    trackingId,
    closeLogin,
    loadingUser,
    shouldShowLogin,
    loginState,
  } = useContext(AuthContext);
  const { flags } = useContext(FeaturesContext);
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [analyticsConsent, setAnalyticsConsent] = usePersistentState(
    'consent',
    false,
    shouldShowConsent ? null : true,
  );
  const routeChangedCallbackRef = useTrackPageView();
  useThirdPartyAnalytics(
    trackingId,
    user,
    analyticsConsent !== true,
    windowLoaded,
    `extension v${version}`,
    () => getPageForAnalytics(''),
    flags,
  );

  useEffect(() => {
    if (tokenRefreshed && user && !user.infoConfirmed) {
      window.location.replace(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}register?redirect_uri=${encodeURI(
          browser.runtime.getURL('index.html'),
        )}`,
      );
    }
  }, [user, loadingUser, tokenRefreshed]);

  useEffect(() => {
    if (routeChangedCallbackRef.current) {
      routeChangedCallbackRef.current();
    }
  }, [routeChangedCallbackRef]);

  const onPageChanged = (page: string): void => {
    // eslint-disable-next-line no-param-reassign
    pageRef.current = page;
    routeChangedCallbackRef.current();
    trackPageView(getPageForAnalytics(page));
  };

  return (
    <DndContextProvider>
      <MainFeedPage onPageChanged={onPageChanged} />
      {!user && !loadingUser && shouldShowLogin && (
        <LoginModal
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
