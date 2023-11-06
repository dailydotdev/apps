import '@dailydotdev/shared/src/lib/lazysizesImport';
import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'focus-visible';
import Modal from 'react-modal';
import { DefaultSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { OnboardingContextProvider } from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { useCookieBanner } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { canonicalFromRouter } from '@dailydotdev/shared/src/lib/canonical';
import '@dailydotdev/shared/src/styles/globals.css';
import { useInAppNotification } from '@dailydotdev/shared/src/hooks/useInAppNotification';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import useDeviceId from '@dailydotdev/shared/src/hooks/analytics/useDeviceId';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { ReactQueryDevtools } from 'react-query/devtools';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import Seo from '../next-seo';
import useWebappVersion from '../hooks/useWebappVersion';

const AuthModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "authModal" */ '@dailydotdev/shared/src/components/auth/AuthModal'
    ),
);
const CookieBanner = dynamic(
  () =>
    import(/* webpackChunkName: "cookieBanner" */ '../components/CookieBanner'),
);

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

interface ComponentGetLayout {
  getLayout?: (
    page: ReactNode,
    pageProps: Record<string, unknown>,
    layoutProps: Record<string, unknown>,
  ) => ReactNode;
  layoutProps?: Record<string, unknown>;
}

const getRedirectUri = () =>
  `${window.location.origin}${window.location.pathname}`;

const getPage = () => window.location.pathname;

function InternalApp({ Component, pageProps, router }: AppProps): ReactElement {
  const { unreadCount } = useNotificationContext();
  const unreadText = getUnreadText(unreadCount);
  const { user, closeLogin, shouldShowLogin, loginState } =
    useContext(AuthContext);
  const [showCookie, acceptCookies, updateCookieBanner] = useCookieBanner();
  useWebVitals();
  useTrackPageView();
  useInAppNotification();
  const { modal, closeModal } = useLazyModal();
  usePrompt();

  useEffect(() => {
    updateCookieBanner(user);
  }, [updateCookieBanner, user]);

  useEffect(() => {
    if (!modal) {
      return undefined;
    }

    const onRouteChange = () => {
      if (!modal.persistOnRouteChange) {
        closeModal();
      }
    };

    router.events.on('routeChangeStart', onRouteChange);

    return () => {
      router.events.off('routeChangeStart', onRouteChange);
    };
  }, [modal, closeModal, router.events]);

  const getLayout =
    (Component as ComponentGetLayout).getLayout || ((page) => page);
  const { layoutProps } = Component as ComponentGetLayout;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, viewport-fit=cover"
        />
        <meta name="theme-color" content="#151618" />
        <meta name="msapplication-nav" content="#151618" />
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
      <DefaultSeo
        {...Seo}
        canonical={canonicalFromRouter(router)}
        titleTemplate={unreadCount ? `(${unreadText}) %s` : '%s'}
      />
      {getLayout(<Component {...pageProps} />, pageProps, layoutProps)}
      {shouldShowLogin && (
        <AuthModal
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
  const [queryClient] = useState(
    () => new QueryClient(defaultQueryClientConfig),
  );
  const version = useWebappVersion();
  const deviceId = useDeviceId();
  useError();

  return (
    <ProgressiveEnhancementContextProvider>
      <QueryClientProvider client={queryClient}>
        <BootDataProvider
          app={BootApp.Webapp}
          getRedirectUri={getRedirectUri}
          getPage={getPage}
          version={version}
          deviceId={deviceId}
        >
          <SubscriptionContextProvider>
            <OnboardingContextProvider>
              <InternalApp {...props} />
            </OnboardingContextProvider>
          </SubscriptionContextProvider>
        </BootDataProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ProgressiveEnhancementContextProvider>
  );
}
