import React, { ReactElement, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import 'focus-visible';
import useAnalytics from '@dailydotdev/shared/src/hooks/useAnalytics';
import ProgressiveEnhancementContext, {
  ProgressiveEnhancementContextProvider,
} from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import AuthContext, {
  AuthContextProvider,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { OnboardingContextProvider } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { FeaturesContextProvider } from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { browser } from 'webextension-polyfill-ts';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import HelpUsGrowModalWithContext from '@dailydotdev/shared/src/components/modals/HelpUsGrowModalWithContext';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import useTrackPageView from '@dailydotdev/shared/src/hooks/useTrackPageView';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import getPageForAnalytics from '../lib/getPageForAnalytics';
import DndContext from './DndContext';
import useDndContext from './useDndContext';
import DndBanner from './DndBanner';

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

const getPage = () => '/';

function InternalApp(): ReactElement {
  const {
    user,
    tokenRefreshed,
    trackingId,
    closeLogin,
    loadingUser,
    shouldShowLogin,
    loginState,
  } = useContext(AuthContext);
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [analyticsConsent, setAnalyticsConsent] = usePersistentState(
    'consent',
    false,
    shouldShowConsent ? null : true,
  );
  const dndContext = useDndContext();

  useTrackPageView();
  useAnalytics(
    trackingId,
    user,
    analyticsConsent !== true,
    windowLoaded,
    `extension v${version}`,
    () => getPageForAnalytics(''),
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

  return (
    <DndContext.Provider value={dndContext}>
      {dndContext.isActive && <DndBanner />}
      <MainFeedPage />
      {!user && !loadingUser && (windowLoaded || shouldShowLogin) && (
        <LoginModal
          isOpen={shouldShowLogin}
          onRequestClose={closeLogin}
          contentLabel="Login Modal"
          {...loginState}
        />
      )}
      <HelpUsGrowModalWithContext />
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
  return (
    <RouterContext.Provider value={router}>
      <ProgressiveEnhancementContextProvider>
        <FeaturesContextProvider>
          <QueryClientProvider client={queryClient}>
            <AuthContextProvider
              app="extension"
              getRedirectUri={getRedirectUri}
            >
              <SubscriptionContextProvider>
                <SettingsContextProvider>
                  <OnboardingContextProvider>
                    <AnalyticsContextProvider
                      app="extension"
                      version={version}
                      getPage={getPage}
                    >
                      <InternalApp />
                    </AnalyticsContextProvider>
                  </OnboardingContextProvider>
                </SettingsContextProvider>
              </SubscriptionContextProvider>
            </AuthContextProvider>
          </QueryClientProvider>
        </FeaturesContextProvider>
      </ProgressiveEnhancementContextProvider>
    </RouterContext.Provider>
  );
}
