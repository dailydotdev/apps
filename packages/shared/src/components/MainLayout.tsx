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
import { useSwipeableSidebar } from '../hooks/useSwipeableSidebar';
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
import { LazyModalElement } from './modals/LazyModalElement';
import { PromptElement } from './modals/Prompt';
import { useNotificationParams } from '../hooks/useNotificationParams';
import { daysLeft, OnboardingV2 } from '../lib/featureValues';
import { useAuthContext } from '../contexts/AuthContext';
import { MainFeedPage } from './utilities';
import { isTesting, onboardingUrl } from '../lib/constants';
import { useBanner } from '../hooks/useBanner';
import { useFeature, useGrowthBookContext } from './GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FixedBottomBanner } from './banners/FixedBottomBanner';
import usePersistentContext from '../hooks/usePersistentContext';
import { generateStorageKey, StorageTopic } from '../lib/storage';

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
}

const mainLayoutClass = (sidebarExpanded: boolean) =>
  sidebarExpanded ? 'laptop:pl-60' : 'laptop:pl-11';

const feeds = Object.values(MainFeedPage);

export default function MainLayout({
  children,
  showOnlyLogo,
  greeting,
  activePage,
  isNavItemsButton,
  mobileTitle,
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
  showPostButton,
}: MainLayoutProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const onboardingV2 = useFeature(feature.onboardingV2);
  const { sidebarRendered } = useSidebarRendered();
  const { isAvailable: isBannerAvailable } = useBanner();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const { sidebarExpanded, optOutWeeklyGoal, autoDismissNotifications } =
    useContext(SettingsContext);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const { isNotificationsReady, unreadCount } = useNotificationContext();
  useAuthErrors();
  useAuthVerificationRecovery();
  useNotificationParams();
  const handlers = useSwipeableSidebar({
    sidebarRendered,
    openMobileSidebar,
    setOpenMobileSidebar,
  });
  const [isDismissed, setIsDismissed, isFetched] = usePersistentContext(
    generateStorageKey(StorageTopic.Onboarding, 'wall_dismissed'),
    false,
  );

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

  const renderSidebar = () => {
    if (
      showOnlyLogo ||
      sidebarRendered === null ||
      (sidebarRendered && !showSidebar)
    ) {
      return null;
    }

    return (
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
        setOpenMobileSidebar={() => onMobileSidebarToggle(false)}
      />
    );
  };

  const router = useRouter();
  const page = router?.route?.substring(1).trim() as MainFeedPage;
  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;
  const isPageApplicableForOnboarding = !page || feeds.includes(page);
  const shouldRedirectOnboarding =
    !user &&
    isPageReady &&
    (onboardingV2 !== OnboardingV2.Control || daysLeft < 1) &&
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

  if (
    (!isPageReady && isPageApplicableForOnboarding) ||
    shouldRedirectOnboarding
  ) {
    return null;
  }

  const shouldShowBanner =
    !user && onboardingV2 === OnboardingV2.Control && isFetched && !isDismissed;

  console.log(
    !user,
    onboardingV2 === OnboardingV2.Control,
    isFetched,
    !isDismissed,
  );

  return (
    <div {...handlers} className="antialiased">
      {customBanner}
      {isBannerAvailable && <PromotionalBanner />}
      <InAppNotificationElement />
      <LazyModalElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <MainLayoutHeader
        greeting={greeting}
        hasBanner={isBannerAvailable}
        mobileTitle={mobileTitle}
        showOnlyLogo={showOnlyLogo}
        sidebarRendered={sidebarRendered}
        optOutWeeklyGoal={optOutWeeklyGoal}
        additionalButtons={additionalButtons}
        onLogoClick={onLogoClick}
        onMobileSidebarToggle={onMobileSidebarToggle}
        showPostButton={showPostButton}
      />
      <main
        className={classNames(
          'flex flex-row',
          className,
          !showOnlyLogo && !screenCentered && mainLayoutClass(sidebarExpanded),
          isBannerAvailable ? 'laptop:pt-22' : 'laptop:pt-14',
        )}
      >
        {renderSidebar()}
        {children}
      </main>
      <PromptElement />
      {shouldShowBanner && (
        <FixedBottomBanner
          daysLeft={daysLeft}
          onDismiss={() => setIsDismissed(true)}
        />
      )}
    </div>
  );
}
