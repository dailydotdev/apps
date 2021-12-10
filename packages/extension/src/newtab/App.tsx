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
import { OnboardingContextProvider } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { runtime } from 'webextension-polyfill';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import { trackPageView } from '@dailydotdev/shared/src/lib/analytics';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import getPageForAnalytics from '../lib/getPageForAnalytics';
import DndContext from './DndContext';
import useDndContext from './useDndContext';
import DndBanner from './DndBanner';
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

const getRedirectUri = () => runtime.getURL('index.html');

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
  const dndContext = useDndContext();

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
          runtime.getURL('index.html'),
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
    <DndContext.Provider value={dndContext}>
      {dndContext.isActive && <DndBanner />}
      <MainFeedPage onPageChanged={onPageChanged} />
      {!user && !loadingUser && (windowLoaded || shouldShowLogin) && (
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
    </DndContext.Provider>
  );
}

export default function App(): ReactElement {
  const pageRef = useRef('/');

  return (
    <RouterContext.Provider value={router}>
      <ProgressiveEnhancementContextProvider>
        <QueryClientProvider client={queryClient}>
          <BootDataProvider app="extension" getRedirectUri={getRedirectUri}>
            <SubscriptionContextProvider>
              <SettingsContextProvider>
                <OnboardingContextProvider>
                  <AnalyticsContextProvider
                    app="extension"
                    version={version}
                    getPage={() => pageRef.current}
                  >
                    <InternalApp pageRef={pageRef} />
                  </AnalyticsContextProvider>
                </OnboardingContextProvider>
              </SettingsContextProvider>
            </SubscriptionContextProvider>
          </BootDataProvider>
        </QueryClientProvider>
      </ProgressiveEnhancementContextProvider>
    </RouterContext.Provider>
  );
}
