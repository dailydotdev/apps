// Must be the first import
// if (process.env.NODE_ENV === 'development') {
//   // Must use require here as import statements are only allowed
//   // to exist at top-level.
//   require('preact/debug');
// }

import React, { ReactElement, ReactNode, useContext, useEffect } from 'react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'focus-visible';
import Modal from 'react-modal';
import { DefaultSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContext, {
  REGISTRATION_PATH,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { Router } from 'next/router';
import { useCookieBanner } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import ProgressiveEnhancementContext, {
  ProgressiveEnhancementContextProvider,
} from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { trackPageView } from '@dailydotdev/shared/src/lib/analytics';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { canonicalFromRouter } from '@dailydotdev/shared/src/lib/canonical';
import '@dailydotdev/shared/src/styles/globals.css';
import useThirdPartyAnalytics from '@dailydotdev/shared/src/hooks/useThirdPartyAnalytics';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import Seo from '../next-seo';
import useWebappVersion from '../hooks/useWebappVersion';

// const ReactQueryDevtools = dynamic(
//   () => import('react-query/devtools').then((mod) => mod.ReactQueryDevtools),
//   { ssr: false },
// );

const queryClient = new QueryClient();

const LoginModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "loginModal" */ '@dailydotdev/shared/src/components/modals/LoginModal'
    ),
);
const CookieBanner = dynamic(() => import('../components/CookieBanner'));

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

const getRedirectUri = () =>
  `${window.location.origin}${window.location.pathname}`;

const getPage = () => window.location.pathname;

function InternalApp({ Component, pageProps, router }: AppProps): ReactElement {
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
  const [showCookie, acceptCookies, updateCookieBanner] = useCookieBanner();

  useTrackPageView();
  useThirdPartyAnalytics(
    trackingId,
    user,
    showCookie,
    windowLoaded,
    'webapp',
    () => `/web${window.location.pathname}${window.location.search}`,
    flags,
  );

  useEffect(() => {
    if (
      tokenRefreshed &&
      user &&
      !user.infoConfirmed &&
      window.location.pathname.indexOf(REGISTRATION_PATH) !== 0
    ) {
      /*  this will check if the user came from our registration
          if the user has clicked the logout button in the registration - it should go through here because the user will be redirected
          and since the window.location.replace did not clear all the local state and data like window.location.replace - we will have to force a reload
      */
      const referrer = document.referrer && new URL(document.referrer);
      if (referrer.pathname?.indexOf(REGISTRATION_PATH) !== -1) {
        window.location.reload();
        return;
      }

      window.location.replace(
        `/register?redirect_uri=${encodeURI(window.location.pathname)}`,
      );
    }
    updateCookieBanner(user);
  }, [user, loadingUser, tokenRefreshed, router.pathname]);

  const getLayout =
    (Component as CompnentGetLayout).getLayout || ((page) => page);
  const { layoutProps } = Component as CompnentGetLayout;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, viewport-fit=cover"
        />
        <meta name="theme-color" content="#151618" />
        <meta name="msapplication-navbutton-color" content="#151618" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#151618" />

        <meta name="application-name" content="daily.dev" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
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
      {!user && !loadingUser && shouldShowLogin && (
        <LoginModal
          isOpen={shouldShowLogin}
          onRequestClose={closeLogin}
          contentLabel="Login Modal"
          {...loginState}
        />
      )}
      {showCookie && <CookieBanner onAccepted={acceptCookies} />}
    </>
  );
}

export default function App(props: AppProps): ReactElement {
  const version = useWebappVersion();

  return (
    <ProgressiveEnhancementContextProvider>
      <QueryClientProvider client={queryClient}>
        <BootDataProvider app="web" getRedirectUri={getRedirectUri}>
          <SubscriptionContextProvider>
            <AnalyticsContextProvider
              app="webapp"
              version={version}
              getPage={getPage}
            >
              <InternalApp {...props} />
            </AnalyticsContextProvider>
          </SubscriptionContextProvider>
        </BootDataProvider>
      </QueryClientProvider>
    </ProgressiveEnhancementContextProvider>
  );
}
