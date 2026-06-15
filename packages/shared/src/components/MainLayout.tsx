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
import { useRecordRecentPages } from '../hooks/useRecentPages';
import { isSidebarSettingsPath } from './sidebar/sidebarCategory';
import {
  HomepageTopBanners,
  useHomepageTopBannersVisibility,
} from './marketing/banners/HomepageTopBanners';
import { RouteProgressBar } from './RouteProgressBar';
import { StreakContentEdge } from './streak/StreakContentEdge';

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
  /**
   * Layout v2 only. Rendered above the floating feed card, alongside the
   * built-in reading-reminder TopHero. Pages can pass dynamic banners
   * (e.g. the extension's onboarding hero row) and the whole strip
   * collapses to nothing if neither the reminder nor the banner has
   * anything to show.
   */
  topBanner?: ReactNode;
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
  topBanner,
}: MainLayoutProps): ReactElement | null {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { user, isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { sidebarRendered } = useSidebarRendered();
  const { isAvailable: isBannerAvailable } = useBanner();
  const { sidebarExpanded, autoDismissNotifications, loadedSettings, flags } =
    useContext(SettingsContext);
  const isSidebarCompact = !!flags?.sidebarCompact;
  const v2CollapsedPadding = isSidebarCompact
    ? 'tablet:pl-16 laptop:pl-16'
    : 'tablet:pl-16 laptop:pl-20';
  const v2ExpandedPadding = isSidebarCompact
    ? 'laptop:!pl-[19rem]'
    : 'laptop:!pl-[20rem]';
  const [hasLoggedImpression, setHasLoggedImpression] = useState(false);
  const { feedName } = useActiveFeedNameContext();
  const page = router?.route?.substring(1).trim() as SharedFeedPage;
  const currentFeedName = feedName ?? page ?? SharedFeedPage.Popular;
  const { isCustomFeed, isExploreTag } = useFeedName({
    feedName: currentFeedName,
  });
  const { plusEntryAnnouncementBar } = usePlusEntry();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const { screenCenteredOnMobileLayout } = useFeedLayout();
  const { isNotificationsReady, unreadCount } = useNotificationContext();
  const { isV2, isLoading: isLayoutVariantLoading } = useLayoutVariant();
  useRecordRecentPages(isV2);
  useNotificationParams();

  // Settings pages render their navigation only inside the v2 context panel,
  // so the sidebar force-expands there regardless of the stored preference.
  // Mirror that here so the floating content keeps its expanded-width padding
  // and never slides under the panel. Matches the `activePage` resolution the
  // Sidebar receives below.
  const forceSidebarExpanded =
    isV2 &&
    isSidebarSettingsPath(activePage ?? router.asPath ?? router.pathname ?? '');

  // The main content's left padding settles from the rail width to the
  // expanded-sidebar width once auth, settings, and the layout-variant flag
  // resolve on the client. Without gating, the `transition-[padding]` below
  // animates that initial settle on every hard refresh, sliding all content
  // sideways. The layout is "settled" only once all three are resolved
  // (`isLayoutVariantLoading` stays true until both auth and GrowthBook are
  // ready, so it also covers the window where `isV2` hasn't reached its
  // final value yet).
  const layoutSettled =
    isAuthReady && loadedSettings && !isLayoutVariantLoading;
  const [contentTransitionsEnabled, setContentTransitionsEnabled] =
    useState(false);
  useEffect(() => {
    if (layoutSettled) {
      setContentTransitionsEnabled(true);
    }
  }, [layoutSettled]);
  // The v2 page uses a tinted background; the document root stays
  // `background-default`, so overscroll past the feed reveals a darker strip.
  // Flag the root while v2 is active so it can paint the same tint (laptop+,
  // matching where the tinted page background applies — see base.css).
  useEffect(() => {
    if (!isV2) {
      return undefined;
    }
    const root = globalThis.document?.documentElement;
    root?.classList.add('layout-v2');
    return () => root?.classList.remove('layout-v2');
  }, [isV2]);
  // v2 (experiment) snaps the initial settle into place (transitions enable
  // one commit later, so only genuine toggles animate). The control variant
  // keeps animating on `layoutSettled` exactly as before.
  const animateContentPadding = isV2
    ? contentTransitionsEnabled
    : layoutSettled;

  // On laptop the v1 and v2 chrome (sidebar + global header) look different,
  // so rendering before the experiment resolves makes v2 users flash the v1
  // layout and then swap. Hold the variant-specific chrome until the flag has
  // resolved so the correct layout paints once. Below laptop there is no v2
  // chrome and `isLayoutVariantLoading` never resolves (the flag isn't
  // evaluated there), so treat non-laptop as always resolved.
  const isLayoutChromeResolved = !isLaptop || !isLayoutVariantLoading;

  // Extension new tab mounts its own `ExtensionTopBanners` strip, so
  // the webapp strip is suppressed there to avoid duplicate cards.
  const { hasAny: hasTopBannersRaw } = useHomepageTopBannersVisibility();
  const showHomepageTopBanners = !isExtension;
  const hasTopBanners = showHomepageTopBanners && hasTopBannersRaw;

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
    !page || feeds.includes(page) || isCustomFeed || isExploreTag;
  const shouldRedirectOnboarding =
    !isExtension &&
    !user &&
    isPageReady &&
    isPageApplicableForOnboarding &&
    // Install referrals (`?ref=install`) are routed by the permission-primer
    // flow in `_app` (to `/activate` or `/onboarding`). Redirecting here too
    // would race that and bounce the user off `/activate`.
    router?.query?.ref !== 'install' &&
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

  // Pages that render the app chrome (sidebar layout) wait for boot before
  // painting — the same `isPageReady` gate the feeds already use. The v1/v2
  // chrome differs structurally and the variant only resolves after boot, so
  // rendering early makes v2 users paint the v1 layout and then snap. Holding
  // until boot lets the resolved layout paint once. The gate is
  // breakpoint-independent (false on both server and first client render until
  // ready), so it stays free of hydration mismatches.
  if (
    (!isPageReady && (isPageApplicableForOnboarding || showSidebar)) ||
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

      {!sidebarOwnsHeader && isLayoutChromeResolved && (
        <MainLayoutHeader
          hasBanner={isBannerAvailable}
          sidebarRendered={sidebarRendered}
          additionalButtons={additionalButtons}
          onLogoClick={onLogoClick}
        />
      )}
      <main
        className={classNames(
          'flex flex-col',
          animateContentPadding &&
            'transition-[padding] duration-300 ease-in-out',
          !sidebarOwnsHeader && 'laptop:pt-16',
          showSidebar &&
            (isV2 ? v2CollapsedPadding : 'tablet:pl-16 laptop:pl-11'),
          className,
          isAuthReady &&
            showSidebar &&
            (sidebarExpanded || forceSidebarExpanded) &&
            (isV2 ? v2ExpandedPadding : !isScreenCentered && 'laptop:!pl-60'),
          isBannerAvailable && !sidebarOwnsHeader && 'laptop:pt-24',
        )}
      >
        {isAuthReady && isLayoutChromeResolved && showSidebar && (
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
            {showHomepageTopBanners && (
              <HomepageTopBanners className="mx-4 mb-3 laptop:mx-0" />
            )}
            {topBanner}
            <div
              className={classNames(
                'relative flex min-h-0 flex-1 flex-col',
                // `overflow-clip` (not `hidden`) clips content to the rounded
                // card without establishing a scroll container, so descendant
                // `position: sticky` elements (e.g. the post action bar) stick
                // to the viewport instead of being inert.
                // No drop shadow — the subtle border defines the floating card
                // in both themes; shadow-2 cast a heavy bottom shadow.
                'laptop:overflow-clip laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:p-0.5',
                !hasTopBanners &&
                  !topBanner &&
                  'laptop:min-h-[calc(100vh-1.5rem)]',
              )}
            >
              <RouteProgressBar />
              {sidebarOwnsHeader && <StreakContentEdge />}
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
