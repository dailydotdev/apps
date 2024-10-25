import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'focus-visible';
import { useConsoleLogo } from '@dailydotdev/shared/src/hooks/useConsoleLogo';
import { DefaultSeo, NextSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useCookieBanner } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { canonicalFromRouter } from '@dailydotdev/shared/src/lib/canonical';
import '@dailydotdev/shared/src/styles/globals.css';
import useLogPageView from '@dailydotdev/shared/src/hooks/log/useLogPageView';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { useManualScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { PushNotificationContextProvider } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { structuredCloneJsonPolyfill } from '@dailydotdev/shared/src/lib/structuredClone';
import Seo, { defaultSeo, defaultSeoTitle } from '../next-seo';
import useWebappVersion from '../hooks/useWebappVersion';

structuredCloneJsonPolyfill();

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
  const didRegisterSwRef = useRef(false);
  const { unreadCount } = useNotificationContext();
  const unreadText = getUnreadText(unreadCount);
  const { user, closeLogin, shouldShowLogin, loginState } =
    useContext(AuthContext);
  const [showCookie, acceptCookies, updateCookieBanner] = useCookieBanner();
  useWebVitals();
  useLogPageView();
  const { modal, closeModal } = useLazyModal();
  useConsoleLogo();

  useEffect(() => {
    updateCookieBanner(user);

    if (
      user &&
      !didRegisterSwRef.current &&
      'serviceWorker' in globalThis?.navigator &&
      window.serwist !== undefined
    ) {
      didRegisterSwRef.current = true;
      window.serwist.register();
    }
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

  const { themeColor } = useThemedAsset();
  const seo = (pageProps?.seo || layoutProps?.seo) as Record<string, unknown>;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, viewport-fit=cover"
        />
        <meta name="theme-color" content={themeColor} />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={themeColor}
        />

        <meta name="application-name" content="daily.dev" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="daily.dev" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="slack-app-id" content="A07AM7XC529" />

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
        <link
          rel="sitemap"
          type="text/plain"
          title="Sitemap"
          href="/sitemap.txt"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('load', () => { window.windowLoaded = true; }, {
      once: true,
    });`,
          }}
        />

        <link rel="preconnect" href="https://api.daily.dev" />
        <link rel="preconnect" href="https://sso.daily.dev" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://daily-now-res.cloudinary.com" />
      </Head>
      <DefaultSeo
        {...Seo}
        {...defaultSeo}
        title={defaultSeoTitle}
        canonical={canonicalFromRouter(router)}
        titleTemplate={unreadCount ? `(${unreadText}) %s` : '%s'}
      />
      {!!seo && <NextSeo {...seo} />}
      <LazyModalElement />
      <DndContextProvider>
        {getLayout(<Component {...pageProps} />, pageProps, layoutProps)}
      </DndContextProvider>
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
  useManualScrollRestoration();

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
          <PushNotificationContextProvider>
            <SubscriptionContextProvider>
              <InternalApp {...props} />
            </SubscriptionContextProvider>
          </PushNotificationContextProvider>
        </BootDataProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ProgressiveEnhancementContextProvider>
  );
}
