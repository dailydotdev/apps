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
import usePromotionalBanner from '../hooks/usePromotionalBanner';
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
import { OnboardingV2 } from '../lib/featureValues';
import { useFeaturesContext } from '../contexts/FeaturesContext';
import { useAuthContext } from '../contexts/AuthContext';
import { MainFeedPage } from './utilities';
import { isTesting, webappUrl } from '../lib/constants';

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
  const { onboardingV2, isFeaturesLoaded } = useFeaturesContext();
  const { sidebarRendered } = useSidebarRendered();
  const { bannerData, setLastSeen } = usePromotionalBanner();
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

  const onMobileSidebarToggle = (state: boolean) => {
    trackEvent({
      event_name: `${state ? 'open' : 'close'} sidebar`,
    });
    setOpenMobileSidebar(state);
  };

  const hasBanner = !!bannerData?.banner || !!customBanner;

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
    )
      return null;

    return (
      <Sidebar
        promotionalBannerActive={hasBanner}
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
    (isFeaturesLoaded && router?.isReady && isAuthReady) || isTesting;

  const isPageApplicableForOnboarding = !page || feeds.includes(page);
  const shouldRedirectOnboarding =
    !user &&
    isPageReady &&
    onboardingV2 !== OnboardingV2.Control &&
    isPageApplicableForOnboarding &&
    !isTesting;

  useEffect(() => {
    if (!shouldRedirectOnboarding) return;

    router.push({ pathname: `${webappUrl}/onboarding`, query: router.query });
  }, [shouldRedirectOnboarding, router]);

  if (
    (!isPageReady && isPageApplicableForOnboarding) ||
    shouldRedirectOnboarding
  )
    return null;

  return (
    <div {...handlers}>
      {customBanner || (
        <PromotionalBanner bannerData={bannerData} setLastSeen={setLastSeen} />
      )}
      <InAppNotificationElement />
      <LazyModalElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <MainLayoutHeader
        greeting={greeting}
        hasBanner={hasBanner}
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
          hasBanner ? 'laptop:pt-22' : 'laptop:pt-14',
        )}
      >
        {renderSidebar()}
        {children}
      </main>
      <PromptElement />
    </div>
  );
}
