import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'focus-visible';
import { useConsoleLogo } from '@dailydotdev/shared/src/hooks/useConsoleLogo';
import { DefaultSeo, NextSeo } from 'next-seo';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
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
import useDeviceId from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { useIOSError } from '@dailydotdev/shared/src/hooks/useIOSError';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  defaultQueryClientConfig,
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useWebVitals } from '@dailydotdev/shared/src/hooks/useWebVitals';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import {
  useActions,
  useManualScrollRestoration,
} from '@dailydotdev/shared/src/hooks';
import { PushNotificationContextProvider } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { structuredCloneJsonPolyfill } from '@dailydotdev/shared/src/lib/structuredClone';
import { useOnboarding } from '@dailydotdev/shared/src/hooks/auth';
import {
  messageHandlerExists,
  postWebKitMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { CHECK_CORES_ROLE_QUERY } from '@dailydotdev/shared/src/graphql/njord';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import Seo, { defaultSeo, defaultSeoTitle } from '../next-seo';
import useWebappVersion from '../hooks/useWebappVersion';
import { PixelsProvider } from '../context/PixelsContext';
import { AppHeadMetas } from '../../shared/src/features/common/components/AppHeadMetas';

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

function InternalApp({ Component, pageProps, router }: AppProps): ReactElement {
  const {
    isOnboardingActionsReady,
    hasCompletedContentTypes,
    hasCompletedEditTags,
  } = useOnboarding();
  const didRegisterSwRef = useRef(false);

  const { unreadCount } = useNotificationContext();
  const unreadText = getUnreadText(unreadCount);
  const { user, trackingId, updateUser } = useAuthContext();
  const { showBanner, onAcceptCookies, onOpenBanner, onHideBanner } =
    useCookieBanner();
  useWebVitals();
  useLogPageView();
  const { modal, closeModal } = useLazyModal();
  useConsoleLogo();
  useIOSError();
  const { isActionsFetched, checkHasCompleted } = useActions();

  useEffect(() => {
    if (
      isOnboardingActionsReady &&
      (!hasCompletedEditTags || !hasCompletedContentTypes) &&
      !router.pathname.includes('/onboarding')
    ) {
      router.replace('/onboarding');
    }
  }, [
    isOnboardingActionsReady,
    router,
    hasCompletedEditTags,
    hasCompletedContentTypes,
  ]);

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

  useQuery({
    queryKey: generateQueryKey(RequestKey.CheckCoresRole, user),
    queryFn: async () => {
      const result = await gqlClient.request<{
        checkCoresRole: Pick<LoggedUser, 'coresRole'>;
      }>(CHECK_CORES_ROLE_QUERY);

      if (result.checkCoresRole.coresRole !== user.coresRole) {
        await updateUser({
          ...user,
          coresRole: result.checkCoresRole.coresRole,
        });
      }

      return result.checkCoresRole;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled:
      !!user &&
      isActionsFetched &&
      !checkHasCompleted(ActionType.CheckedCoresRole),
  });

  const getLayout =
    (Component as ComponentGetLayout).getLayout || ((page) => page);
  const { layoutProps } = Component as ComponentGetLayout;

  const { themeColor } = useThemedAsset();
  const seo = (pageProps?.seo || layoutProps?.seo) as Record<string, unknown>;

  return (
    <>
      <Head>
        <meta name="theme-color" content={themeColor} />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={themeColor}
        />
        <AppHeadMetas />
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
      {showBanner && (
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
          <PixelsProvider>
            <PushNotificationContextProvider>
              <SubscriptionContextProvider>
                <InternalApp {...props} />
              </SubscriptionContextProvider>
            </PushNotificationContextProvider>
          </PixelsProvider>
        </BootDataProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ProgressiveEnhancementContextProvider>
  );
}
