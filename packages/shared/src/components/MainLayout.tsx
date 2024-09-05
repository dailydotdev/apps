import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  ActiveFeedNameContextProvider,
  useActiveFeedNameContext,
} from '../contexts';
import { useAuthContext } from '../contexts/AuthContext';
import LogContext from '../contexts/LogContext';
import { useNotificationContext } from '../contexts/NotificationsContext';
import SettingsContext from '../contexts/SettingsContext';
import { useFeedLayout, useViewSize, ViewSize } from '../hooks';
import { useFeedName } from '../hooks/feed/useFeedName';
import { useAuthErrors } from '../hooks/useAuthErrors';
import { useAuthVerificationRecovery } from '../hooks/useAuthVerificationRecovery';
import { useBanner } from '../hooks/useBanner';
import { useNotificationParams } from '../hooks/useNotificationParams';
import useSidebarRendered from '../hooks/useSidebarRendered';
import { AuthTriggers } from '../lib/auth';
import { isTesting, onboardingUrl } from '../lib/constants';
import { LogEvent, NotificationTarget } from '../lib/log';
import { useGrowthBookContext } from './GrowthBookProvider';
import MainLayoutHeader, {
  MainLayoutHeaderProps,
} from './layout/MainLayoutHeader';
import { BootPopups } from './modals/BootPopups';
import { PromptElement } from './modals/Prompt';
import { InAppNotificationElement } from './notifications/InAppNotification';
import Toast from './notifications/Toast';
import PromotionalBanner from './PromotionalBanner';
import Sidebar from './sidebar/Sidebar';
import { SharedFeedPage } from './utilities';

const GoBackHeaderMobile = dynamic(
  () =>
    import(
      /* webpackChunkName: "goBackHeaderMobile" */ './post/GoBackHeaderMobile'
    ),
  { ssr: false },
);

export interface MainLayoutProps
  extends Omit<MainLayoutHeaderProps, 'onMobileSidebarToggle'>,
    HTMLAttributes<HTMLDivElement> {
  mainPage?: boolean;
  activePage?: string;
  isNavItemsButton?: boolean;
  showDnd?: boolean;
  dndActive?: boolean;
  screenCentered?: boolean;
  customBanner?: ReactNode;
  showSidebar?: boolean;
  enableSearch?: () => void;
  onNavTabClick?: (tab: string) => void;
  onShowDndClick?: () => unknown;
  canGoBack?: string;
}

const feeds = Object.values(SharedFeedPage);

function MainLayoutComponent({
  children,
  activePage,
  isNavItemsButton,
  showDnd,
  dndActive,
  customBanner,
  additionalButtons,
  screenCentered = true,
  showSidebar = true,
  className,
  onLogoClick,
  onNavTabClick,
  enableSearch,
  onShowDndClick,
  canGoBack,
}: MainLayoutProps): ReactElement {
  const router = useRouter();
  const { logEvent } = useContext(LogContext);
  const { user, isAuthReady, showLogin } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { sidebarRendered } = useSidebarRendered();
  const { isAvailable: isBannerAvailable } = useBanner();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const { sidebarExpanded, autoDismissNotifications } =
    useContext(SettingsContext);
  const [hasLoggedImpression, setHasLoggedImpression] = useState(false);
  const { feedName } = useActiveFeedNameContext();
  const { isCustomFeed } = useFeedName({ feedName });

  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const { screenCenteredOnMobileLayout } = useFeedLayout();
  const { isNotificationsReady, unreadCount } = useNotificationContext();
  useAuthErrors();
  useAuthVerificationRecovery();
  useNotificationParams();

  const onMobileSidebarToggle = (state: boolean) => {
    logEvent({
      event_name: `${state ? 'open' : 'close'} sidebar`,
    });
    setOpenMobileSidebar(state);
  };

  useEffect(() => {
    if (!isNotificationsReady || unreadCount === 0 || hasLoggedImpression) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: NotificationTarget.Icon,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
    setHasLoggedImpression(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationsReady, unreadCount, hasLoggedImpression]);

  const page = router?.route?.substring(1).trim() as SharedFeedPage;
  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;
  const isPageApplicableForOnboarding =
    !page || feeds.includes(page) || isCustomFeed;
  const shouldRedirectOnboarding =
    !user && isPageReady && isPageApplicableForOnboarding && !isTesting;

  useEffect(() => {
    if (!shouldRedirectOnboarding) {
      return;
    }

    const entries = Object.entries(router.query);

    if (entries.length === 0) {
      router.push(onboardingUrl);
      return;
    }

    const params = new URLSearchParams();

    entries.forEach(([key, value]) => {
      params.append(key, value as string);
    });

    router.push(`${onboardingUrl}?${params.toString()}`);
  }, [shouldRedirectOnboarding, router]);

  const ignoredUtmMediumForLogin = ['slack'];
  const utmSource = router?.query?.utm_source;
  const utmMedium = router?.query?.utm_medium;
  const shouldShowLogin =
    !user &&
    isAuthReady &&
    utmSource === 'notification' &&
    !ignoredUtmMediumForLogin.includes(utmMedium as string);

  useEffect(() => {
    if (!shouldShowLogin) {
      return;
    }

    showLogin({
      trigger: AuthTriggers.FromNotification,
      options: { isLogin: true },
    });
  }, [shouldShowLogin, showLogin]);

  if (
    (!isPageReady && isPageApplicableForOnboarding) ||
    shouldRedirectOnboarding
  ) {
    return null;
  }
  const isScreenCentered =
    isLaptopXL && screenCenteredOnMobileLayout ? true : screenCentered;

  return (
    <div className="antialiased">
      {canGoBack && <GoBackHeaderMobile />}
      {customBanner}
      {isBannerAvailable && <PromotionalBanner />}
      <InAppNotificationElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <BootPopups />
      <MainLayoutHeader
        hasBanner={isBannerAvailable}
        sidebarRendered={sidebarRendered}
        additionalButtons={additionalButtons}
        onLogoClick={onLogoClick}
      />
      <main
        className={classNames(
          'flex flex-col tablet:pl-16 laptop:pl-11',
          className,
          !isScreenCentered && sidebarExpanded && 'laptop:!pl-60',
          isBannerAvailable && 'laptop:pt-8',
        )}
      >
        {showSidebar && (
          <Sidebar
            promotionalBannerActive={isBannerAvailable}
            sidebarRendered={sidebarRendered}
            openMobileSidebar={openMobileSidebar}
            onNavTabClick={onNavTabClick}
            enableSearch={enableSearch}
            activePage={activePage}
            showDnd={showDnd}
            dndActive={dndActive}
            isNavButtons={isNavItemsButton}
            onShowDndClick={onShowDndClick}
            onLogoClick={onLogoClick}
            setOpenMobileSidebar={() => onMobileSidebarToggle(false)}
          />
        )}
        {children}
      </main>
    </div>
  );
}

const MainLayout = (props: MainLayoutProps): ReactElement => (
  <ActiveFeedNameContextProvider>
    <MainLayoutComponent {...props} />
  </ActiveFeedNameContextProvider>
);

export default MainLayout;
