import React, { ReactElement, useContext, useState } from 'react';
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
} from './common';
import InvitePeople from './InvitePeople';
import SidebarRankProgress from '../SidebarRankProgress';
import AlertContext from '../../contexts/AlertContext';
import FeedFilters from '../filters/FeedFilters';
import { AlertColor, AlertDot } from '../AlertDot';
import { useDynamicLoadedAnimation } from '../../hooks/useDynamicLoadAnimated';
import classNames from 'classnames';
import ProfileButton from '../profile/ProfileButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import AuthContext from '../../contexts/AuthContext';
import useProfileMenu from '../../hooks/useProfileMenu';
const { onMenuClick } = useProfileMenu();

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
    path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/changelog`,
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
  showSidebar = false,
  openMobileSidebar = false,
  onNavTabClick,
  enableSearch,
  setOpenMobileSidebar,
}: SidebarProps): ReactElement {
  const { alerts } = useContext(AlertContext);
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const { isLoaded, isAnimated, setLoaded, setHidden } =
    useDynamicLoadedAnimation();
  const { openSidebar, toggleOpenSidebar } = useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);

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
        },
        {
          icon: <ListIcon Icon={EyeIcon} />,
          title: 'Reading history',
          path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}history`,
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
    (!showSidebar && !item.hideOnMobile) || showSidebar;

  return (
    <>
      {openMobileSidebar && <SidebarBackdrop onClick={setOpenMobileSidebar} />}
      <SidebarAside
        className={classNames(
          'w-70 laptop:-translate-x-0',
          openSidebar ? 'laptop:w-60' : 'laptop:w-11',
          openMobileSidebar ? '-translate-x-0' : '-translate-x-70',
        )}
      >
        {showSidebar && (
          <MenuIcon
            openSidebar={openSidebar}
            toggleOpenSidebar={toggleOpenSidebar}
          />
        )}
        <Nav>
          {!loadingUser && !showSidebar && (
            <li className="flex flex-col p-6">
              {user ? (
                <>
                  <div className="flex mb-4 justify-between">
                    <ProfileButton onClick={() => {}} />
                    <Button className="btn btn-tertiary" onClick={onMenuClick}>
                      <SettingsIcon />
                    </Button>
                  </div>
                  <strong className="typo-callout mb-0.5">{user.name}</strong>
                  <p className="typo-footnote text-theme-label-secondary">
                    @{user.username}
                  </p>
                </>
              ) : (
                <Button
                  onClick={() => showLogin('main button')}
                  className="btn-primary"
                >
                  Login
                </Button>
              )}
            </li>
          )}
          {topMenuItems.map(({ key, items }) => (
            <NavSection key={key}>
              <NavHeader
                className={classNames(
                  'hidden laptop:block',
                  openSidebar ? 'opacity-100 px-3' : 'opacity-0 px-0',
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
                    useNavButtonsNotLinks={useNavButtonsNotLinks}
                  >
                    <ItemInner item={item} openSidebar={openSidebar} />
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
                useNavButtonsNotLinks={useNavButtonsNotLinks}
              >
                <ItemInner item={item} openSidebar={openSidebar} />
              </ButtonOrLink>
            </NavItem>
          ))}
          <InvitePeople openSidebar={openSidebar} />
          {showSidebar && <SidebarRankProgress openSidebar={openSidebar} />}
        </Nav>
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
