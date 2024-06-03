import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import PromotionalBanner from './PromotionalBanner';
import Sidebar from './sidebar/Sidebar';
import useSidebarRendered from '../hooks/useSidebarRendered';
import AnalyticsContext from '../contexts/AnalyticsContext';
import SettingsContext from '../contexts/SettingsContext';
import Toast from './notifications/Toast';
import { useAuthErrors } from '../hooks/useAuthErrors';
import { useAuthVerificationRecovery } from '../hooks/useAuthVerificationRecovery';
import MainLayoutHeader, {
  MainLayoutHeaderProps,
} from './layout/MainLayoutHeader';
import { InAppNotificationElement } from './notifications/InAppNotification';
import { useNotificationContext } from '../contexts/NotificationsContext';
import { AnalyticsEvent, NotificationTarget } from '../lib/analytics';
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
import { GoBackHeaderMobile } from './post/GoBackHeaderMobile';
import { BootPopups } from './modals/BootPopups';
import { useFeedName } from '../hooks/feed/useFeedName';

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
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { sidebarRendered } = useSidebarRendered();
  const { isAvailable: isBannerAvailable } = useBanner();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const { sidebarExpanded, autoDismissNotifications } =
    useContext(SettingsContext);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const { feedName } = useActiveFeedNameContext();
  const { isCustomFeed } = useFeedName({ feedName });

  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const { screenCenteredOnMobileLayout } = useFeedLayout();
  const { isNotificationsReady, unreadCount } = useNotificationContext();
  useAuthErrors();
  useAuthVerificationRecovery();
  useNotificationParams();

  const onMobileSidebarToggle = (state: boolean) => {
    trackEvent({
      event_name: `${state ? 'open' : 'close'} sidebar`,
    });
    setOpenMobileSidebar(state);
  };

  useEffect(() => {
    if (!isNotificationsReady || unreadCount === 0 || hasTrackedImpression) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: NotificationTarget.Icon,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
    setHasTrackedImpression(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationsReady, unreadCount, hasTrackedImpression]);

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
