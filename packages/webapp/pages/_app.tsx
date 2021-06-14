// Must be the first import
if (process.env.NODE_ENV === 'development') {
  // Must use require here as import statements are only allowed
  // to exist at top-level.
  require('preact/debug');
}

import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'focus-visible';
import Modal from 'react-modal';
import { DefaultSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from 'react-query';
import Seo from '../next-seo';
import AuthContext, {
  AuthContextData,
  LoginState,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { logout as dispatchLogout } from '@dailydotdev/shared/src/lib/user';
import { Router } from 'next/router';
import { useCookieBanner } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import useLoggedUser from '@dailydotdev/shared/src/hooks/useLoggedUser';
import { LoginModalMode } from '@dailydotdev/shared/src/types/LoginModalMode';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { trackPageView } from '@dailydotdev/shared/src/lib/analytics';
import useOnboarding from '@dailydotdev/shared/src/hooks/useOnboarding';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import SubscriptionContext from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import useSubscriptionClient from '@dailydotdev/shared/src/hooks/useSubscriptionClient';
import useProgressiveEnhancement from '@dailydotdev/shared/src/hooks/useProgressiveEnhancement';
import { canonicalFromRouter } from '@dailydotdev/shared/src/lib/canonical';
import useSettings from '@dailydotdev/shared/src/hooks/useSettings';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import '@dailydotdev/shared/src/styles/globals.css';
import useAnalytics from '@dailydotdev/shared/src/hooks/useAnalytics';
import useFeatures from '@dailydotdev/shared/src/lib/useFeatures';

const queryClient = new QueryClient();

const LoginModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "loginModal"*/ '@dailydotdev/shared/src/components/modals/LoginModal'
    ),
);
const CookieBanner = dynamic(() => import('../components/CookieBanner'));
const HelpUsGrowModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/HelpUsGrowModal'),
);

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

interface CompnentGetLayout {
  getLayout?: (
    page: ReactNode,
    pageProps: Record<string, unknown>,
    layoutProps: Record<string, unknown>,
  ) => ReactNode;
  layoutProps?: Record<string, unknown>;
}

Router.events.on('routeChangeComplete', (page) => trackPageView(`/web${page}`));

function InternalApp({ Component, pageProps, router }: AppProps): ReactElement {
  const [
    user,
    setUser,
    trackingId,
    loadingUser,
    tokenRefreshed,
    loadedUserFromCache,
  ] = useLoggedUser('web');
  const progressiveContext = useProgressiveEnhancement();
  const [loginState, setLoginState] = useState<LoginState | null>(null);
  const [showCookie, acceptCookies, updateCookieBanner] = useCookieBanner();
  const featuresContext = useFeatures();

  const closeLogin = () => setLoginState(null);

  const logout = async (): Promise<void> => {
    await dispatchLogout();
    location.reload();
  };

  const authContext: AuthContextData = useMemo(
    () => ({
      user,
      shouldShowLogin: loginState !== null,
      showLogin: (trigger, mode = LoginModalMode.Default) =>
        setLoginState({ trigger, mode }),
      updateUser: setUser,
      logout,
      loadingUser,
      tokenRefreshed,
      loadedUserFromCache,
      getRedirectUri: () =>
        `${window.location.origin}${window.location.pathname}`,
    }),
    [user, loginState, loadingUser, tokenRefreshed],
  );
  const canFetchUserData = progressiveContext.windowLoaded && tokenRefreshed;
  const onboardingContext = useOnboarding(user, loadedUserFromCache);
  const subscriptionContext = useSubscriptionClient(canFetchUserData);
  const settingsContext = useSettings(user?.id, canFetchUserData);
  useAnalytics(
    trackingId,
    user,
    showCookie,
    progressiveContext.windowLoaded,
    'webapp',
    () => `/web${window.location.pathname}${window.location.search}`,
  );

  useEffect(() => {
    if (
      tokenRefreshed &&
      user &&
      !user.infoConfirmed &&
      window.location.pathname.indexOf('/register') !== 0
    ) {
      window.location.replace(
        `/register?redirect_uri=${encodeURI(window.location.pathname)}`,
      );
    }
    updateCookieBanner(user);
  }, [user, loadingUser, tokenRefreshed]);

  const getLayout =
    (Component as CompnentGetLayout).getLayout || ((page) => page);
  const { layoutProps } = Component as CompnentGetLayout;

  return (
    <ProgressiveEnhancementContext.Provider value={progressiveContext}>
      <AuthContext.Provider value={authContext}>
        <FeaturesContext.Provider value={featuresContext}>
          <SubscriptionContext.Provider value={subscriptionContext}>
            <SettingsContext.Provider value={settingsContext}>
              <OnboardingContext.Provider value={onboardingContext}>
                <Head>
                  <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                  />
                  <meta name="theme-color" content="#151618" />
                  <meta
                    name="msapplication-navbutton-color"
                    content="#151618"
                  />
                  <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="#151618"
                  />

                  <meta name="application-name" content="daily.dev" />
                  <meta name="apple-mobile-web-app-capable" content="yes" />
                  <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                  />
                  <meta name="apple-mobile-web-app-title" content="daily.dev" />
                  <meta name="format-detection" content="telephone=no" />
                  <meta name="mobile-web-app-capable" content="yes" />
                  <meta name="msapplication-TileColor" content="#151618" />
                  <meta name="msapplication-tap-highlight" content="no" />

                  <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                  />
                  <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                  />
                  <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                  />
                  <link rel="manifest" href="/manifest.json" />

                  <script
                    dangerouslySetInnerHTML={{
                      __html: `window.addEventListener('load', () => { window.windowLoaded = true; }, {
      once: true,
    });`,
                    }}
                  />

                  <link rel="preconnect" href="https://res.cloudinary.com" />
                </Head>
                <DefaultSeo {...Seo} canonical={canonicalFromRouter(router)} />
                {getLayout(
                  <Component {...pageProps} />,
                  pageProps,
                  layoutProps,
                )}
                {!user &&
                  !loadingUser &&
                  (progressiveContext.windowLoaded || loginState !== null) && (
                    <LoginModal
                      isOpen={loginState !== null}
                      onRequestClose={closeLogin}
                      contentLabel="Login Modal"
                      {...loginState}
                    />
                  )}
                {showCookie && <CookieBanner onAccepted={acceptCookies} />}
                {onboardingContext.showReferral && (
                  <HelpUsGrowModal
                    isOpen={true}
                    onRequestClose={onboardingContext.closeReferral}
                  />
                )}
              </OnboardingContext.Provider>
            </SettingsContext.Provider>
          </SubscriptionContext.Provider>
        </FeaturesContext.Provider>
      </AuthContext.Provider>
    </ProgressiveEnhancementContext.Provider>
  );
}

export default function App(props: AppProps): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <InternalApp {...props} />
    </QueryClientProvider>
  );
}
