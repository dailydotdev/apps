import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import PromotionalBanner from './PromotionalBanner';
import useSidebarRendered from '../hooks/useSidebarRendered';
import { useLogContext } from '../contexts/LogContext';
import SettingsContext from '../contexts/SettingsContext';
import Toast from './notifications/Toast';
import type { MainLayoutHeaderProps } from './layout/MainLayoutHeader';
import MainLayoutHeader from './layout/MainLayoutHeader';
import { InAppNotificationElement } from './notifications/InAppNotification';
import { useNotificationContext } from '../contexts/NotificationsContext';
import { LogEvent, NotificationTarget, TargetType } from '../lib/log';
import { PromptElement } from './modals/Prompt';
import { useNotificationParams } from '../hooks/useNotificationParams';
import { useAuthContext } from '../contexts/AuthContext';
import { SharedFeedPage } from './utilities';
import { isTesting, onboardingUrl } from '../lib/constants';
import { useBanner } from '../hooks/useBanner';
import { useGrowthBookContext } from './GrowthBookProvider';
import {
  ActiveFeedNameContextProvider,
  useActiveFeedNameContext,
} from '../contexts';
import { useFeedLayout, useViewSize, ViewSize } from '../hooks';
import { BootPopups } from './modals/BootPopups';
import { StreakMilestonePopup } from './modals/streaks/StreakMilestonePopup';
import { useFeedName } from '../hooks/feed/useFeedName';
import { AuthTriggers } from '../lib/auth';
import PlusMobileEntryBanner from './marketing/banners/PlusMobileEntryBanner';
import usePlusEntry from '../hooks/usePlusEntry';
import { SearchProvider } from '../contexts/search/SearchContext';
import { SpotlightProvider } from './spotlight/SpotlightContext';
import { SpotlightHost } from './spotlight/SpotlightHost';
import { FeedbackWidget } from './feedback';
import { isExtension } from '../lib/func';
import { useLayoutVariant } from '../hooks/layout/useLayoutVariant';
import { RouteProgressBar } from './RouteProgressBar';

const GoBackHeaderMobile = dynamic(
  () =>
    import(
      /* webpackChunkName: "goBackHeaderMobile" */ './post/GoBackHeaderMobile'
    ),
  { ssr: false },
);

const Sidebar = dynamic(() =>
  import(/* webpackChunkName: "sidebar" */ './sidebar/Sidebar').then(
    (mod) => mod.Sidebar,
  ),
);

export interface MainLayoutProps
  extends Omit<MainLayoutHeaderProps, 'onMobileSidebarToggle'>,
    HTMLAttributes<HTMLDivElement> {
  mainPage?: boolean;
  activePage?: string;
  isNavItemsButton?: boolean;
  screenCentered?: boolean;
  customBanner?: ReactNode;
  showSidebar?: boolean;
  onNavTabClick?: (tab: string) => void;
  canGoBack?: string;
  hideBackButton?: boolean;
  hideFeedbackWidget?: boolean;
}

export const feeds = Object.values(SharedFeedPage);

function MainLayoutComponent({
  children,
  activePage,
  isNavItemsButton,
  customBanner,
  additionalButtons,
  screenCentered = true,
  showSidebar = true,
  className,
  onLogoClick,
  onNavTabClick,
  canGoBack,
  hideFeedbackWidget = false,
}: MainLayoutProps): ReactElement | null {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { user, isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { sidebarRendered } = useSidebarRendered();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { sidebarExpanded, autoDismissNotifications } =
    useContext(SettingsContext);
  const [hasLoggedImpression, setHasLoggedImpression] = useState(false);
  const { feedName } = useActiveFeedNameContext();
  const page = router?.route?.substring(1).trim() as SharedFeedPage;
  const currentFeedName = feedName ?? page ?? SharedFeedPage.Popular;
  const { isCustomFeed } = useFeedName({ feedName: currentFeedName });
  const { plusEntryAnnouncementBar } = usePlusEntry();
  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const { screenCenteredOnMobileLayout } = useFeedLayout();
  const { isNotificationsReady, unreadCount } = useNotificationContext();
  const { isV2 } = useLayoutVariant();
  useNotificationParams();

  // The dual-sidebar layout takes ownership of the global header chrome
  // (logo + search + user actions) on laptop+ for authenticated users
  // (and for extension new tab regardless of auth state). When that's
  // the case the global header is hidden, the main content gets the
  // floating-card treatment, and the global feedback widget is suppressed
  // because the rail provides its own.
  const sidebarOwnsHeader =
    isV2 && (isLoggedIn || isExtension) && showSidebar && sidebarRendered;

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

  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;
  const isPageApplicableForOnboarding =
    !page || feeds.includes(page) || isCustomFeed;
  const shouldRedirectOnboarding =
    !isExtension &&
    !user &&
    isPageReady &&
    isPageApplicableForOnboarding &&
    !isTesting;

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
    <div
      className={classNames(
        'antialiased',
        isV2 &&
          'laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]',
      )}
    >
      {canGoBack && <GoBackHeaderMobile />}
      {customBanner}
      {isBannerAvailable && <PromotionalBanner />}
      <InAppNotificationElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <BootPopups />
      <SpotlightHost />
      <StreakMilestonePopup />
      {plusEntryAnnouncementBar && (
        <PlusMobileEntryBanner
          className="relative"
          {...plusEntryAnnouncementBar}
          targetType={TargetType.PlusEntryAnnouncementBar}
        />
      )}

      {!sidebarOwnsHeader && (
        <MainLayoutHeader
          hasBanner={isBannerAvailable}
          sidebarRendered={sidebarRendered}
          additionalButtons={additionalButtons}
          onLogoClick={onLogoClick}
        />
      )}
      <main
        className={classNames(
          'flex flex-col transition-[padding] duration-300 ease-in-out',
          !sidebarOwnsHeader && 'laptop:pt-16',
          showSidebar &&
            (isV2 ? 'tablet:pl-16 laptop:pl-16' : 'tablet:pl-16 laptop:pl-11'),
          className,
          isAuthReady &&
            showSidebar &&
            sidebarExpanded &&
            (isV2
              ? 'laptop:!pl-[19rem]'
              : !isScreenCentered && 'laptop:!pl-60'),
          isBannerAvailable && !sidebarOwnsHeader && 'laptop:pt-24',
        )}
      >
        {isAuthReady && showSidebar && (
          <Sidebar
            additionalButtons={additionalButtons}
            isNavButtons={isNavItemsButton}
            showFeedbackWidget={!hideFeedbackWidget}
            onNavTabClick={onNavTabClick}
            onLogoClick={onLogoClick}
            activePage={activePage ?? router.asPath ?? router.pathname}
          />
        )}
        {sidebarOwnsHeader ? (
          <div className="flex min-h-0 flex-1 flex-col laptop:my-3 laptop:ml-1 laptop:mr-3">
            <div
              className={classNames(
                'relative flex min-h-0 flex-1 flex-col',
                'laptop:overflow-hidden laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:p-0.5 laptop:shadow-2',
                'laptop:min-h-[calc(100vh-1.5rem)]',
              )}
            >
              <RouteProgressBar />
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      {!hideFeedbackWidget && !sidebarOwnsHeader && <FeedbackWidget />}
    </div>
  );
}

const MainLayout = (props: MainLayoutProps): ReactElement => (
  <ActiveFeedNameContextProvider>
    <SearchProvider>
      <SpotlightProvider>
        <MainLayoutComponent {...props} />
      </SpotlightProvider>
    </SearchProvider>
  </ActiveFeedNameContextProvider>
);

export default MainLayout;
