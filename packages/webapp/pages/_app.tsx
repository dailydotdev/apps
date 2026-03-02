import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'focus-visible';
import { useConsoleLogo } from '@dailydotdev/shared/src/hooks/useConsoleLogo';
import { DefaultSeo, NextSeo } from 'next-seo';
import type { DehydratedState } from '@tanstack/react-query';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  useCookieBanner,
  cookieAcknowledgedKey,
} from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { canonicalFromRouter } from '@dailydotdev/shared/src/lib/canonical';
import '@dailydotdev/shared/src/styles/globals.css';
import useLogPageView from '@dailydotdev/shared/src/hooks/log/useLogPageView';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { PostReferrerContextProvider } from '@dailydotdev/shared/src/contexts/PostReferrerContext';
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { useIOSError } from '@dailydotdev/shared/src/hooks/useIOSError';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { useManualScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { PushNotificationContextProvider } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { structuredCloneJsonPolyfill } from '@dailydotdev/shared/src/lib/structuredClone';
import { fromCDN } from '@dailydotdev/shared/src/lib';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth';
import { useCheckCoresRole } from '@dailydotdev/shared/src/hooks/useCheckCoresRole';
import {
  messageHandlerExists,
  postWebKitMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import { useCheckLocation } from '@dailydotdev/shared/src/hooks/useCheckLocation';
import Seo, { defaultSeo, defaultSeoTitle } from '../next-seo';
import useWebappVersion from '../hooks/useWebappVersion';
import { getAppOrigin, getSiteOrigin } from '../lib/seo';
import { PixelsProvider } from '../context/PixelsContext';

structuredCloneJsonPolyfill();

const CookieBanner = dynamic(
  () =>
    import(
      /* webpackChunkName: "cookieBanner" */ '../components/banner/CookieBanner'
    ),
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

const onboardingExcludedPaths = [
  '/onboarding',
  '/recruiter',
  '/jobs',
  '/settings',
];
const hotAndColdModalQueryKey = 'openModal';
const hotAndColdModalQueryValue = 'hottakes';
const hotAndColdModalLegacyQueryValue = 'hotAndCold';
const isOnboardingExcludedPath = (pathname: string): boolean =>
  onboardingExcludedPaths.some((path) => pathname.startsWith(path));

const APP_ORIGIN = getAppOrigin();
const SITE_ORIGIN = getSiteOrigin();

const GLOBAL_SEO_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: 'daily.dev',
      url: SITE_ORIGIN,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/apple-touch-icon.png`,
        width: 180,
        height: 180,
      },
      sameAs: [
        'https://twitter.com/dailydotdev',
        'https://github.com/dailydotdev',
        'https://www.linkedin.com/company/daily-dev-ltd',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_ORIGIN}/#website`,
      url: APP_ORIGIN,
      name: 'daily.dev',
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${APP_ORIGIN}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

function InternalApp({ Component, pageProps, router }: AppProps): ReactElement {
  const { isOnboardingActionsReady, isOnboardingComplete } =
    useOnboardingActions();
  const didRegisterSwRef = useRef(false);
  const openedHotAndColdFromQueryRef = useRef(false);

  const { unreadCount } = useNotificationContext();
  const unreadText = getUnreadText(unreadCount);
  const { user, trackingId, isFunnel } = useAuthContext();
  const { showBanner, onAcceptCookies, onOpenBanner, onHideBanner } =
    useCookieBanner();
  useWebVitals();
  useLogPageView();
  const { modal, closeModal, openModal } = useLazyModal();
  useConsoleLogo();
  useIOSError();

  useCheckCoresRole();
  useCheckLocation();

  const activeModalType = modal?.type;
  const hotAndColdModalQuery = router.query[hotAndColdModalQueryKey];
  const shouldOpenHotAndColdFromQuery =
    hotAndColdModalQuery === hotAndColdModalQueryValue ||
    hotAndColdModalQuery === hotAndColdModalLegacyQueryValue ||
    (Array.isArray(hotAndColdModalQuery) &&
      (hotAndColdModalQuery.includes(hotAndColdModalQueryValue) ||
        hotAndColdModalQuery.includes(hotAndColdModalLegacyQueryValue)));

  useEffect(() => {
    if (!shouldOpenHotAndColdFromQuery) {
      openedHotAndColdFromQueryRef.current = false;
      return;
    }

    if (activeModalType === LazyModal.HotAndCold) {
      openedHotAndColdFromQueryRef.current = true;
      return;
    }

    if (activeModalType) {
      return;
    }

    if (!openedHotAndColdFromQueryRef.current) {
      openModal({ type: LazyModal.HotAndCold });
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has(hotAndColdModalQueryKey)) {
      return;
    }

    url.searchParams.delete(hotAndColdModalQueryKey);
    const nextPath = `${url.pathname}${url.search}${url.hash}`;

    router.replace(nextPath, undefined, { shallow: true });
  }, [activeModalType, openModal, router, shouldOpenHotAndColdFromQuery]);

  useEffect(() => {
    if (
      !isFunnel &&
      isOnboardingActionsReady &&
      !isOnboardingComplete &&
      !isOnboardingExcludedPath(router.pathname)
    ) {
      router.replace('/onboarding');
    }
  }, [isFunnel, isOnboardingActionsReady, router, isOnboardingComplete]);

  useEffect(() => {
    if (
      user &&
      !didRegisterSwRef.current &&
      'serviceWorker' in globalThis?.navigator &&
      window.serwist !== undefined
    ) {
      didRegisterSwRef.current = true;
      window.serwist.register();
    }
  }, [user]);

  useEffect(() => {
    const id = user?.id || trackingId;
    if (id && messageHandlerExists(WebKitMessageHandlers.UpdateUserId)) {
      postWebKitMessage(WebKitMessageHandlers.UpdateUserId, id);
    }
  }, [user?.id, trackingId]);

  useEffect(() => {
    if (
      user?.subscriptionFlags?.appAccountToken &&
      messageHandlerExists(WebKitMessageHandlers.IAPSetAppAccountToken)
    ) {
      postWebKitMessage(
        WebKitMessageHandlers.IAPSetAppAccountToken,
        user.subscriptionFlags.appAccountToken,
      );
    }
  }, [user?.subscriptionFlags?.appAccountToken]);

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

  const showAppStoreBanner = !router.pathname.startsWith('/helloworld');
  const isImageGenerator = router.pathname.startsWith('/image-generator');
  const canonical = canonicalFromRouter(router);

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
        {showAppStoreBanner && (
          <meta name="apple-itunes-app" content="app-id=6740634400" />
        )}
        <meta
          name="facebook-domain-verification"
          content="78sk2yqe8k6z8uznxwj6q82gklhy42"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={fromCDN('/apple-touch-icon.png')}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={fromCDN('/favicon-32x32.png')}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={fromCDN('/favicon-16x16.png')}
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="sitemap"
          type="application/xml"
          title="Sitemap"
          href="/sitemap.xml"
        />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLM-friendly site directory"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: GLOBAL_SEO_JSON_LD }}
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
        <link rel="preconnect" href="https://media.daily.dev" />
      </Head>
      <DefaultSeo
        {...Seo}
        {...defaultSeo}
        title={defaultSeoTitle}
        canonical={canonical}
        openGraph={{
          ...Seo.openGraph,
          url: canonical,
        }}
        titleTemplate={unreadCount ? `(${unreadText}) %s` : '%s'}
      />
      {!!seo && <NextSeo {...seo} />}
      <LazyModalElement />
      <DndContextProvider>
        {getLayout(<Component {...pageProps} />, pageProps, layoutProps)}
      </DndContextProvider>
      {showBanner && !isFunnel && !isImageGenerator && (
        <CookieBanner
          onAccepted={onAcceptCookies}
          onHideBanner={onHideBanner}
          onModalClose={() => {
            const interacted = !!localStorage.getItem(cookieAcknowledgedKey);

            if (!interacted) {
              onOpenBanner();
            }
          }}
        />
      )}
      <div className="award-easter-egg-container" />
    </>
  );
}

export default function App(
  props: AppProps<{ dehydratedState: DehydratedState }>,
): ReactElement {
  const [queryClient] = useState(
    () => new QueryClient(defaultQueryClientConfig),
  );
  const version = useWebappVersion();
  const deviceId = useDeviceId();
  useError();
  useManualScrollRestoration();

  const {
    pageProps: { dehydratedState },
  } = props;

  return (
    <ProgressiveEnhancementContextProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <BootDataProvider
            app={BootApp.Webapp}
            getRedirectUri={getRedirectUri}
            getPage={getPage}
            version={version}
            deviceId={deviceId}
          >
            <PixelsProvider>
              <PushNotificationContextProvider>
                <SubscriptionContextProvider>
                  <PostReferrerContextProvider>
                    <InternalApp {...props} />
                  </PostReferrerContextProvider>
                </SubscriptionContextProvider>
              </PushNotificationContextProvider>
            </PixelsProvider>
          </BootDataProvider>
          <ReactQueryDevtools />
        </HydrationBoundary>
      </QueryClientProvider>
    </ProgressiveEnhancementContextProvider>
  );
}
