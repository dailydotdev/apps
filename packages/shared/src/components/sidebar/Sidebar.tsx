import React, { ReactElement, useContext, useState } from 'react';
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
  SidebarMenuItems,
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

export default function Sidebar({
  useNavButtonsNotLinks = false,
  activePage,
  sidebarRendered = false,
  openMobileSidebar = false,
  onNavTabClick,
  enableSearch,
  setOpenMobileSidebar,
  onShowDndClick,
}: SidebarProps): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { isLoaded, isAnimated, setLoaded, setHidden } =
    useDynamicLoadedAnimation();
  const { sidebarExpanded, toggleSidebarExpanded } =
    useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);
  useHideMobileSidebar({ action: setOpenMobileSidebar });

  const topMenuItems: SidebarMenuItems[] = [
    {
      key: 'Discover',
      items: [
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
      ],
    },
    {
      key: 'Manage',
      items: [
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
      ],
    },
  ];

  const mobileItemsFilter = (item) =>
    (!sidebarRendered && !item.hideOnMobile) || sidebarRendered;

  return (
    <>
      {openMobileSidebar && <SidebarBackdrop onClick={setOpenMobileSidebar} />}
      <SidebarAside
        className={classNames(
          sidebarExpanded ? 'laptop:w-60' : 'laptop:w-11',
          openMobileSidebar ? '-translate-x-0' : '-translate-x-70',
        )}
      >
        {sidebarRendered && (
          <MenuIcon
            sidebarExpanded={sidebarExpanded}
            toggleSidebarExpanded={toggleSidebarExpanded}
          />
        )}
        <SidebarScrollWrapper>
          <Nav>
            <SidebarUserButton
              sidebarRendered={sidebarRendered}
              onShowDndClick={onShowDndClick}
            />
            {topMenuItems.map(({ key, items }) => (
              <NavSection key={key}>
                <NavHeader
                  className={classNames(
                    'hidden laptop:block',
                    sidebarExpanded ? 'opacity-100 px-3' : 'opacity-0 px-0',
                  )}
                >
                  {key}
                </NavHeader>
                {items.filter(mobileItemsFilter).map((item) => (
                  <NavItem
                    key={item.title}
                    active={item.active || item.path === activePage}
                  >
                    <ButtonOrLink
                      item={item}
                      showLogin={
                        item.requiresLogin && !user
                          ? () => showLogin(item.title)
                          : null
                      }
                      useNavButtonsNotLinks={useNavButtonsNotLinks}
                    >
                      <ItemInner
                        item={item}
                        sidebarExpanded={sidebarExpanded || !sidebarRendered}
                      />
                    </ButtonOrLink>
                  </NavItem>
                ))}
              </NavSection>
            ))}
          </Nav>
          <div className="flex-1" />
          <Nav>
            {bottomMenuItems.filter(mobileItemsFilter).map((item) => (
              <NavItem
                key={item.title}
                active={item.active || item.path === activePage}
              >
                <ButtonOrLink
                  item={item}
                  showLogin={
                    item.requiresLogin && !user ? () => showLogin : null
                  }
                  useNavButtonsNotLinks={useNavButtonsNotLinks}
                >
                  <ItemInner
                    item={item}
                    sidebarExpanded={sidebarExpanded || !sidebarRendered}
                  />
                </ButtonOrLink>
              </NavItem>
            ))}
            <InvitePeople sidebarExpanded={sidebarExpanded} />
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
