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
import AuthContext, { AuthContextData } from '../contexts/AuthContext';
import { logout as dispatchLogout } from '../lib/user';
import { Router } from 'next/router';
import { useCookieBanner } from '../hooks/useCookieBanner';
import useLoggedUser from '../hooks/useLoggedUser';
import { LoginModalMode } from '../components/modals/LoginModal';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import { trackPageView } from '../lib/analytics';
import useOnboarding from '../hooks/useOnboarding';
import OnboardingContext from '../contexts/OnboardingContext';
import SubscriptionContext from '../contexts/SubscriptionContext';
import useSubscriptionClient from '../hooks/useSubscriptionClient';
import useProgressiveEnhancement from '../hooks/useProgressiveEnhancement';
import { canonicalFromRouter } from '../lib/canonical';
import useSettings from '../hooks/useSettings';
import SettingsContext from '../contexts/SettingsContext';
import '../styles/globals.css';
import useAnalytics from '../hooks/useAnalytics';

const queryClient = new QueryClient();

const LoginModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "loginModal"*/ '../components/modals/LoginModal'
    ),
);
const CookieBanner = dynamic(() => import('../components/CookieBanner'));
const HelpUsGrowModal = dynamic(
  () => import('../components/modals/HelpUsGrowModal'),
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

Router.events.on('routeChangeComplete', trackPageView);

function InternalApp({ Component, pageProps, router }: AppProps): ReactElement {
  const [
    user,
    setUser,
    trackingId,
    loadingUser,
    tokenRefreshed,
    loadedUserFromCache,
  ] = useLoggedUser();
  const progressiveContext = useProgressiveEnhancement();
  const [loginMode, setLoginMode] = useState<LoginModalMode | null>(null);
  const [showCookie, acceptCookies, updateCookieBanner] = useCookieBanner();

  const closeLogin = () => setLoginMode(null);

  const logout = async (): Promise<void> => {
    await dispatchLogout();
    location.reload();
  };

  const authContext: AuthContextData = useMemo(
    () => ({
      user,
      shouldShowLogin: loginMode !== null,
      showLogin: (mode: LoginModalMode = LoginModalMode.Default) =>
        setLoginMode(mode),
      updateUser: setUser,
      logout,
      loadingUser,
      tokenRefreshed,
      loadedUserFromCache,
    }),
    [user, loginMode, loadingUser, tokenRefreshed],
  );
  const canFetchUserData = progressiveContext.windowLoaded && tokenRefreshed;
  const onboardingContext = useOnboarding(user, loadedUserFromCache);
  const subscriptionContext = useSubscriptionClient(canFetchUserData);
  const settingsContext = useSettings(user?.id, canFetchUserData);
  useAnalytics(trackingId, user, showCookie, progressiveContext.windowLoaded);

  useEffect(() => {
    if (
      user &&
      !user.infoConfirmed &&
      window.location.pathname.indexOf('/register') !== 0
    ) {
      window.location.replace(
        `/register?redirect_uri=${encodeURI(window.location.pathname)}`,
      );
    }
    updateCookieBanner(user);
  }, [user, loadingUser]);

  const getLayout =
    (Component as CompnentGetLayout).getLayout || ((page) => page);
  const { layoutProps } = Component as CompnentGetLayout;

  return (
    <ProgressiveEnhancementContext.Provider value={progressiveContext}>
      <AuthContext.Provider value={authContext}>
        <SubscriptionContext.Provider value={subscriptionContext}>
          <SettingsContext.Provider value={settingsContext}>
            <OnboardingContext.Provider value={onboardingContext}>
              <Head>
                <meta
                  name="viewport"
                  content="initial-scale=1.0, width=device-width"
                />
                <meta name="theme-color" content="#151618" />
                <meta name="msapplication-navbutton-color" content="#151618" />
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
              {getLayout(<Component {...pageProps} />, pageProps, layoutProps)}
              {!user &&
                !loadingUser &&
                (progressiveContext.windowLoaded || loginMode !== null) && (
                  <LoginModal
                    isOpen={loginMode !== null}
                    onRequestClose={closeLogin}
                    contentLabel="Login Modal"
                    mode={loginMode}
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
