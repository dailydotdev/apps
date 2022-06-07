import React, { ReactElement, useContext, useState, useMemo } from 'react';
import classNames from 'classnames';
import SettingsContext from '../../contexts/SettingsContext';
import { FeedSettingsModal } from '../modals/FeedSettingsModal';
import FeedbackIcon from '../../../icons/feedback.svg';
import DocsIcon from '../../../icons/docs.svg';
import TerminalIcon from '../../../icons/terminal.svg';
import {
  ButtonOrLink,
  ItemInner,
  ListIcon,
  MenuIcon,
  Nav,
  NavHeader,
  NavItem,
  NavSection,
  SidebarAside,
  SidebarMenuItem,
  SidebarProps,
  SidebarBackdrop,
  SidebarScrollWrapper,
} from './common';
import HotIcon from '../icons/Hot';
import UpvoteIcon from '../icons/Upvote';
import DiscussIcon from '../icons/Discuss';
import SearchIcon from '../icons/Search';
import FilterIcon from '../icons/Filter';
import MoonIcon from '../icons/Moon';
import HomeIcon from '../icons/Home';
import SettingsIcon from '../icons/Settings';
import BookmarkIconComponent from '../icons/Bookmark';
import EyeIconComponent from '../icons/Eye';
import InvitePeople from './InvitePeople';
import SidebarRankProgress from '../SidebarRankProgress';
import AlertContext from '../../contexts/AlertContext';
import FeedFilters from '../filters/FeedFilters';
import { useDynamicLoadedAnimation } from '../../hooks/useDynamicLoadAnimated';
import SidebarUserButton from './SidebarUserButton';
import AuthContext from '../../contexts/AuthContext';
import useHideMobileSidebar from '../../hooks/useHideMobileSidebar';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import MyFeedButton from './MyFeedButton';
import MyFeedAlert from './MyFeedAlert';
import FeaturesContext from '../../contexts/FeaturesContext';
import { AlertColor, AlertDot } from '../AlertDot';
import { useMyFeed } from '../../hooks/useMyFeed';
import useDefaultFeed from '../../hooks/useDefaultFeed';
import { Features, getFeatureValue } from '../../lib/featureManagement';
import CreateMyFeedButton from '../CreateMyFeedButton';
import CreateMyFeedModal from '../modals/CreateMyFeedModal';

const bottomMenuItems: SidebarMenuItem[] = [
  {
    icon: (active: boolean) => <ListIcon Icon={DocsIcon} />,
    title: 'Docs',
    path: 'https://docs.daily.dev/',
    target: '_blank',
  },
  {
    icon: (active: boolean) => <ListIcon Icon={TerminalIcon} />,
    title: 'Changelog',
    path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/daily_updates`,
  },
  {
    icon: (active: boolean) => <ListIcon Icon={FeedbackIcon} />,
    title: 'Feedback',
    path: 'https://daily.dev/feedback',
    target: '_blank',
  },
];

interface RenderSectionProps {
  title?: string;
  items: SidebarMenuItem[];
  sidebarExpanded: boolean;
  sidebarRendered: boolean;
  activePage: string;
  useNavButtonsNotLinks: boolean;
}
const RenderSection = ({
  title,
  items,
  sidebarExpanded,
  sidebarRendered,
  activePage,
  useNavButtonsNotLinks,
}: RenderSectionProps) => {
  const { user, showLogin } = useContext(AuthContext);

  const mobileItemsFilter = (item) =>
    (sidebarRendered === false && !item.hideOnMobile) || sidebarRendered;

  const isActive = (item) => {
    console.log(item, activePage);
    return item.active || item.path === activePage;
  };

  return (
    <NavSection>
      {title && (
        <NavHeader
          className={classNames(
            'hidden laptop:block',
            sidebarExpanded ? 'opacity-100 px-3' : 'opacity-0 px-0',
          )}
        >
          {title}
        </NavHeader>
      )}
      {items.filter(mobileItemsFilter).map((item) => (
        <NavItem key={item.title} active={isActive(item)}>
          <ButtonOrLink
            item={item}
            showLogin={
              item.requiresLogin && !user ? () => showLogin(item.title) : null
            }
            useNavButtonsNotLinks={useNavButtonsNotLinks}
          >
            <ItemInner
              item={item}
              sidebarExpanded={sidebarExpanded || sidebarRendered === false}
              active={isActive(item)}
            />
          </ButtonOrLink>
        </NavItem>
      ))}
    </NavSection>
  );
};

export default function Sidebar({
  promotionalBannerActive = false,
  useNavButtonsNotLinks = false,
  activePage: activePageProp,
  sidebarRendered = false,
  openMobileSidebar = false,
  showDnd = false,
  onNavTabClick,
  enableSearch,
  setOpenMobileSidebar,
  onShowDndClick,
}: SidebarProps): ReactElement {
  const { shouldShowMyFeed, myFeedPosition } = useMyFeed();
  const [defaultFeed] = useDefaultFeed(shouldShowMyFeed);
  const activePage =
    activePageProp === '/' ? `/${defaultFeed}` : activePageProp;
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const {
    isLoaded,
    isAnimated,
    setLoaded: openFeedFilters,
    setHidden,
  } = useDynamicLoadedAnimation();
  const {
    sidebarExpanded,
    toggleSidebarExpanded,
    loadedSettings,
    optOutWeeklyGoal,
  } = useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);
  const shouldShowDnD = !!process.env.TARGET_BROWSER;
  const { flags } = useContext(FeaturesContext);
  const popularFeedCopy = getFeatureValue(Features.PopularFeedCopy, flags);
  const feedFilterModal = getFeatureValue(Features.FeedFilterModal, flags);

  useHideMobileSidebar({
    state: openMobileSidebar,
    action: setOpenMobileSidebar,
  });

  const hideMyFeedAlert = () => {
    updateAlerts({ myFeed: null });
  };

  const trackAndToggleSidebarExpanded = () => {
    trackEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  };

  const discoverMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <HotIcon filled={active} />} />
      ),
      title: popularFeedCopy,
      path: '/popular',
      action: () => onNavTabClick?.('popular'),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <UpvoteIcon filled={active} />} />
      ),
      title: 'Most upvoted',
      path: '/upvoted',
      action: () => onNavTabClick?.('upvoted'),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <DiscussIcon filled={active} />} />
      ),
      title: 'Best discussions',
      path: '/discussed',
      action: () => onNavTabClick?.('discussed'),
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SearchIcon filled={active} />} />
      ),
      title: 'Search',
      path: '/search',
      action: enableSearch ? () => enableSearch() : null,
      hideOnMobile: true,
    },
  ];
  if (!shouldShowMyFeed) {
    discoverMenuItems.unshift({
      icon: (active: boolean) => (
        <ListIcon Icon={() => <FilterIcon filled={active} />} />
      ),
      alert: alerts.filter && (
        <AlertDot className="-top-0.5 right-2.5" color={AlertColor.Fill} />
      ),
      title: 'Feed filters',
      action: openFeedFilters,
      hideOnMobile: true,
    });
  }

  const myFeedMenuItem: SidebarMenuItem = {
    icon: (active: boolean) => (
      <ListIcon Icon={() => <HomeIcon filled={active} />} />
    ),
    title: 'My feed',
    path: '/my-feed',
    alert: (alerts.filter || alerts.myFeed) && !sidebarExpanded && (
      <AlertDot className="top-0 right-2.5" color={AlertColor.Success} />
    ),
    action: () => onNavTabClick?.('my-feed'),
  };

  const manageMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkIconComponent filled={active} />} />
      ),
      title: 'Bookmarks',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}bookmarks`,
      hideOnMobile: true,
      requiresLogin: true,
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <EyeIconComponent filled={active} />} />
      ),
      title: 'Reading history',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}history`,
      requiresLogin: true,
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SettingsIcon filled={active} />} />
      ),
      title: 'Customize',
      action: () => setShowSettings(!showSettings),
      active: showSettings,
    },
  ];
  if (shouldShowDnD) {
    const dndMenuItem = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <MoonIcon filled={active} />} />
      ),
      title: 'Focus mode',
      action: onShowDndClick,
      active: showDnd,
    };
    manageMenuItems.splice(2, 0, dndMenuItem);
  }

  const defaultRenderSectionProps = useMemo(() => {
    return {
      sidebarExpanded,
      sidebarRendered,
      activePage,
    };
  }, [sidebarExpanded, sidebarRendered, activePage]);

  if (!loadedSettings) {
    return <></>;
  }

  const shouldHideMyFeedAlert =
    !shouldShowMyFeed || alerts?.filter || (!alerts?.filter && !alerts?.myFeed);

  return (
    <>
      {openMobileSidebar && sidebarRendered === false && (
        <SidebarBackdrop onClick={setOpenMobileSidebar} />
      )}
      <SidebarAside
        data-testid="sidebar-aside"
        className={classNames(
          sidebarExpanded ? 'laptop:w-60' : 'laptop:w-11',
          openMobileSidebar ? '-translate-x-0' : '-translate-x-70',
          promotionalBannerActive
            ? 'laptop:top-22 laptop:h-[calc(100vh-theme(space.22))]'
            : 'laptop:top-14 laptop:h-[calc(100vh-theme(space.14))]',
        )}
      >
        {sidebarRendered && (
          <MenuIcon
            sidebarExpanded={sidebarExpanded}
            toggleSidebarExpanded={trackAndToggleSidebarExpanded}
          />
        )}
        <SidebarScrollWrapper>
          <Nav>
            <SidebarUserButton sidebarRendered={sidebarRendered} />
            {shouldShowMyFeed &&
              myFeedPosition === 'sidebar' &&
              alerts?.filter &&
              sidebarRendered && (
                <CreateMyFeedButton
                  type={myFeedPosition}
                  action={openFeedFilters}
                  sidebarExpanded={sidebarExpanded}
                  flags={flags}
                />
              )}
            {shouldShowMyFeed && !alerts?.filter && (
              <MyFeedButton
                sidebarRendered={sidebarRendered}
                sidebarExpanded={sidebarExpanded}
                item={myFeedMenuItem}
                action={openFeedFilters}
                isActive={activePage === myFeedMenuItem.path}
                useNavButtonsNotLinks={useNavButtonsNotLinks}
              />
            )}
            {sidebarExpanded && !shouldHideMyFeedAlert && (
              <MyFeedAlert alerts={alerts} hideAlert={hideMyFeedAlert} />
            )}
            <RenderSection
              {...defaultRenderSectionProps}
              title="Discover"
              items={discoverMenuItems}
              useNavButtonsNotLinks={useNavButtonsNotLinks}
            />
            <RenderSection
              {...defaultRenderSectionProps}
              title="Manage"
              items={manageMenuItems}
              useNavButtonsNotLinks={false}
            />
          </Nav>
          <div className="flex-1" />
          <Nav>
            <RenderSection
              {...defaultRenderSectionProps}
              items={bottomMenuItems}
              useNavButtonsNotLinks={false}
            />
            <InvitePeople
              sidebarExpanded={sidebarExpanded || sidebarRendered === false}
            />
            {sidebarRendered && !optOutWeeklyGoal && (
              <SidebarRankProgress
                disableNewRankPopup={showSettings}
                sidebarExpanded={sidebarExpanded}
              />
            )}
          </Nav>
        </SidebarScrollWrapper>
      </SidebarAside>
      {showSettings && (
        <FeedSettingsModal
          isOpen={showSettings}
          onRequestClose={() => setShowSettings(false)}
        />
      )}
      {isLoaded && feedFilterModal === 'v1' ? (
        <FeedFilters isOpen={isAnimated} onBack={setHidden} />
      ) : (
        <CreateMyFeedModal
          isOpen={isAnimated}
          onRequestClose={() => setHidden()}
          feedFilterModalType={feedFilterModal}
        />
      )}
    </>
  );
}
