import React, { ReactElement, useContext, useState, useMemo } from 'react';
import classNames from 'classnames';
import SettingsContext from '../../contexts/SettingsContext';
import { FeedSettingsModal } from '../modals/FeedSettingsModal';
import HotIcon from '../../../icons/hot.svg';
import FilterIcon from '../../../icons/filter.svg';
import UpvoteIcon from '../../../icons/upvote.svg';
import SearchIcon from '../../../icons/magnifying.svg';
import DiscussIcon from '../../../icons/comment.svg';
import BookmarkIcon from '../../../icons/bookmark.svg';
import EyeIcon from '../../../icons/eye.svg';
import SettingsIcon from '../../../icons/settings.svg';
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
import InvitePeople from './InvitePeople';
import SidebarRankProgress from '../SidebarRankProgress';
import AlertContext from '../../contexts/AlertContext';
import FeedFilters from '../filters/FeedFilters';
import { AlertColor, AlertDot } from '../AlertDot';
import { useDynamicLoadedAnimation } from '../../hooks/useDynamicLoadAnimated';
import SidebarUserButton from './SidebarUserButton';
import AuthContext from '../../contexts/AuthContext';
import useHideMobileSidebar from '../../hooks/useHideMobileSidebar';
import AnalyticsContext from '../../contexts/AnalyticsContext';

const bottomMenuItems: SidebarMenuItem[] = [
  {
    icon: <ListIcon Icon={DocsIcon} />,
    title: 'Docs',
    path: 'https://docs.daily.dev/',
    target: '_blank',
  },
  {
    icon: <ListIcon Icon={TerminalIcon} />,
    title: 'Changelog',
    path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/daily_updates `,
  },
  {
    icon: <ListIcon Icon={FeedbackIcon} />,
    title: 'Feedback',
    path: 'https://it057218.typeform.com/to/S9p9SVNI',
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
        <NavItem
          key={item.title}
          active={item.active || item.path === activePage}
        >
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
  onNavTabClick,
  enableSearch,
  setOpenMobileSidebar,
  onShowDndClick,
}: SidebarProps): ReactElement {
  const activePage = activePageProp === '/' ? '/popular' : activePageProp;
  const { alerts } = useContext(AlertContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { isLoaded, isAnimated, setLoaded, setHidden } =
    useDynamicLoadedAnimation();
  const { sidebarExpanded, toggleSidebarExpanded } =
    useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);

  useHideMobileSidebar({
    state: openMobileSidebar,
    action: setOpenMobileSidebar,
  });

  const trackAndToggleSidebarExpanded = () => {
    trackEvent({
      event_name: `${sidebarExpanded ? 'open' : 'close'} sidebar`,
    });
    toggleSidebarExpanded();
  };

  const discoverMenuItems: SidebarMenuItem[] = [
    {
      icon: <ListIcon Icon={FilterIcon} />,
      alert: alerts.filter && (
        <AlertDot className="-top-0.5 -right-0.5" color={AlertColor.Fill} />
      ),
      title: 'Feed filters',
      action: setLoaded,
      hideOnMobile: true,
    },
    {
      icon: <ListIcon Icon={HotIcon} />,
      title: 'Popular',
      path: '/popular',
      action: () => onNavTabClick?.('popular'),
    },
    {
      icon: <ListIcon Icon={UpvoteIcon} />,
      title: 'Most upvoted',
      path: '/upvoted',
      action: () => onNavTabClick?.('upvoted'),
    },
    {
      icon: <ListIcon Icon={DiscussIcon} />,
      title: 'Best discussions',
      path: '/discussed',
      action: () => onNavTabClick?.('discussed'),
    },
    {
      icon: <ListIcon Icon={SearchIcon} />,
      title: 'Search',
      path: '/search',
      action: enableSearch ? () => enableSearch() : null,
      hideOnMobile: true,
    },
  ];

  const manageMenuItems: SidebarMenuItem[] = [
    {
      icon: <ListIcon Icon={BookmarkIcon} />,
      title: 'Bookmarks',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}bookmarks`,
      hideOnMobile: true,
      requiresLogin: true,
    },
    {
      icon: <ListIcon Icon={EyeIcon} />,
      title: 'Reading history',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}history`,
      requiresLogin: true,
    },
    {
      icon: <ListIcon Icon={SettingsIcon} />,
      title: 'Customize',
      action: () => setShowSettings(!showSettings),
      active: showSettings,
    },
  ];

  const defaultRenderSectionProps = useMemo(() => {
    return {
      useNavButtonsNotLinks,
      sidebarExpanded,
      sidebarRendered,
      activePage,
    };
  }, [sidebarExpanded, sidebarRendered, activePage]);

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
            <SidebarUserButton
              sidebarRendered={sidebarRendered}
              onShowDndClick={onShowDndClick}
            />
            <RenderSection
              {...defaultRenderSectionProps}
              title="Discover"
              items={discoverMenuItems}
            />
            <RenderSection
              {...defaultRenderSectionProps}
              title="Manage"
              items={manageMenuItems}
            />
          </Nav>
          <div className="flex-1" />
          <Nav>
            <RenderSection
              {...defaultRenderSectionProps}
              items={bottomMenuItems}
            />
            <InvitePeople
              sidebarExpanded={sidebarExpanded || sidebarRendered === false}
            />
            {sidebarRendered && (
              <SidebarRankProgress sidebarExpanded={sidebarExpanded} />
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
      {isLoaded && <FeedFilters isOpen={isAnimated} onBack={setHidden} />}
    </>
  );
}
