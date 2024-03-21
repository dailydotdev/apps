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
import {
  AnalyticsEvent,
  NotificationTarget,
  TargetType,
} from '../lib/analytics';
import { PromptElement } from './modals/Prompt';
import { useNotificationParams } from '../hooks/useNotificationParams';
import { useAuthContext } from '../contexts/AuthContext';
import { SharedFeedPage } from './utilities';
import { isTesting, onboardingUrl } from '../lib/constants';
import { useBanner } from '../hooks/useBanner';
import { useGrowthBookContext } from './GrowthBookProvider';
import { useReferralReminder } from '../hooks/referral/useReferralReminder';
import { ActiveFeedNameContextProvider } from '../contexts';
import { useBoot, useFeedLayout, useViewSize, ViewSize } from '../hooks';
import { useStreakMilestone } from '../hooks/streaks';
import { ReputationPrivilegesModalTrigger } from './modals';
import { MarketingCtaVariant } from './cards/MarketingCta/common';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';

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
}: MainLayoutProps): ReactElement {
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { sidebarRendered } = useSidebarRendered();
  const { isAvailable: isBannerAvailable } = useBanner();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const { sidebarExpanded, optOutWeeklyGoal, autoDismissNotifications } =
    useContext(SettingsContext);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const { getMarketingCta } = useBoot();
  const { openModal } = useLazyModal<LazyModal.MarketingCta>();

  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const { shouldUseMobileFeedLayout } = useFeedLayout();

  const { isNotificationsReady, unreadCount } = useNotificationContext();
  useAuthErrors();
  useAuthVerificationRecovery();
  useNotificationParams();
  useReferralReminder();
  useStreakMilestone();

  const marketingCta = getMarketingCta(MarketingCtaVariant.Popover);

  useEffect(() => {
    if (marketingCta) {
      openModal({
        type: LazyModal.MarketingCta,
        props: {
          marketingCta,
          onAfterOpen: () => {
            trackEvent({
              event_name: AnalyticsEvent.Impression,
              target_type: TargetType.MarketingCtaPopover,
              target_id: marketingCta.campaignId,
            });
          },
        },
      });
    }
  }, [marketingCta, openModal, trackEvent]);

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
    if (sidebarRendered === null || (sidebarRendered && !showSidebar)) {
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

  const page = router?.route?.substring(1).trim() as SharedFeedPage;
  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;
  const isPageApplicableForOnboarding = !page || feeds.includes(page);
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
    isLaptopXL && shouldUseMobileFeedLayout ? true : screenCentered;

  return (
    <div className="antialiased">
      {customBanner}
      {isBannerAvailable && <PromotionalBanner />}
      <InAppNotificationElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <ReputationPrivilegesModalTrigger />
      <MainLayoutHeader
        hasBanner={isBannerAvailable}
        sidebarRendered={sidebarRendered}
        optOutWeeklyGoal={optOutWeeklyGoal}
        additionalButtons={additionalButtons}
        onLogoClick={onLogoClick}
        onMobileSidebarToggle={onMobileSidebarToggle}
      />
      <main
        className={classNames(
          'flex flex-row',
          className,
          !isScreenCentered && sidebarExpanded
            ? 'laptop:pl-60'
            : 'laptop:pl-11',
          isBannerAvailable && 'laptop:pt-8',
        )}
      >
        {renderSidebar()}
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
