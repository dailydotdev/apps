import React, { ReactElement, ReactNode, useContext, useState } from 'react';
import Link from 'next/link';
import SettingsContext from '../contexts/SettingsContext';
import { Button } from './buttons/Button';
import { BlueDot } from './notifs';
import { FeedSettingsModal } from './modals/FeedSettingsModal';
import ArrowIcon from '../../icons/arrow.svg';
import HotIcon from '../../icons/hot.svg';
import FilterIcon from '../../icons/filter.svg';
import UpvoteIcon from '../../icons/upvote.svg';
import SearchIcon from '../../icons/magnifying.svg';
import DisqusIcon from '../../icons/comment.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import EyeIcon from '../../icons/eye.svg';
import SettingsIcon from '../../icons/settings.svg';
import { SimpleTooltip } from './tooltips/SimpleTooltip';
import classed from '../lib/classed';
import FeedFilters from './filters/FeedFilters';
import AlertContext from '../contexts/AlertContext';
import useFeedSettings from '../hooks/useFeedSettings';

interface SidebarMenuItems {
  key: string;
  items: SidebarMenuItem[];
}

interface SidebarMenuItem {
  icon: ReactElement;
  title: string;
  path?: string;
  action?: () => unknown;
  notif?: ReactElement;
}

const ListIcon = ({ Icon }): ReactElement => <Icon className="w-5 h-5" />;
const ItemInner = ({
  item,
  openSidebar,
}: {
  item: SidebarMenuItem;
  openSidebar: boolean;
}) => (
  <>
    <span className="relative mr-3">
      {item.notif}
      {item.icon}
    </span>
    <span
      className={`flex-1 text-left transition-opacity ${
        openSidebar ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {item.title}
    </span>
  </>
);
const btnClass = 'flex flex-1 items-center px-3 h-7';
const ButtonOrLink = ({
  item,
  children,
}: {
  item: SidebarMenuItem;
  children?: ReactNode;
}) =>
  item.path ? (
    <Link href={item.path} passHref prefetch={false}>
      <a className={btnClass}>{children}</a>
    </Link>
  ) : (
    <button type="button" className={btnClass} onClick={item.action}>
      {children}
    </button>
  );
const MenuIcon = ({
  openSidebar,
  toggleOpenSidebar,
}: {
  openSidebar: boolean;
  toggleOpenSidebar: () => Promise<void>;
}) => (
  <SimpleTooltip
    placement="right"
    content={`${openSidebar ? 'Close' : 'Open'} sidebar`}
  >
    <Button
      onClick={() => toggleOpenSidebar()}
      absolute
      className={`btn btn-primary h-6 w-6 top-3 -right-3 z-3 ${
        openSidebar &&
        'transition-opacity  invisible group-hover:visible opacity-0 group-hover:opacity-100'
      }`}
      buttonSize="xsmall"
    >
      <ArrowIcon
        className={`typo-title3 ${openSidebar ? '-rotate-90' : 'rotate-90'}`}
      />
    </Button>
  </SimpleTooltip>
);
const SidebarAside = classed(
  'aside',
  'border-r border-theme-divider-tertiary transition-all transform duration-500 ease-in-out min-h-screen group',
);
const Nav = classed('nav', 'mt-4');
const NavSection = classed('ul', 'mt-2');
const NavHeader = classed(
  'li',
  'typo-footnote text-theme-label-quaternary h-7 flex items-center font-bold  transition-opacity',
);
const NavItem = classed(
  'li',
  'flex items-center typo-callout text-theme-label-tertiary',
);

export default function Sidebar(): ReactElement {
  const { openSidebar, toggleOpenSidebar } = useContext(SettingsContext);
  const { feedSettings } = useFeedSettings();
  const { alerts, updateAlerts } = useContext(AlertContext);
  const [showSettings, setShowSettings] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const showFilters = () => {
    if (
      alerts?.filter &&
      (feedSettings?.includeTags?.length ||
        feedSettings?.blockedTags?.length ||
        feedSettings?.excludeSources?.length ||
        feedSettings?.advancedSettings?.length)
    ) {
      updateAlerts({ filter: false });
    }

    setIsFilterOpen(true);
  };

  const topMenuItems: SidebarMenuItems[] = [
    {
      key: 'Discover',
      items: [
        {
          icon: <ListIcon Icon={FilterIcon} />,
          notif: alerts.filter && (
            <BlueDot style={{ top: `-${0.125}rem`, right: `-${0.125}rem` }} />
          ),
          title: 'Feed filters',
          action: showFilters,
        },
        {
          icon: <ListIcon Icon={HotIcon} />,
          title: 'Popular',
          path: '/popular',
        },
        {
          icon: <ListIcon Icon={UpvoteIcon} />,
          title: 'Most upvoted',
          path: '/upvoted',
        },
        {
          icon: <ListIcon Icon={DisqusIcon} />,
          title: 'Best discussions',
          path: '/discussed',
        },
        {
          icon: <ListIcon Icon={SearchIcon} />,
          title: 'Search',
          path: '/search',
        },
      ],
    },
    {
      key: 'Manage',
      items: [
        {
          icon: <ListIcon Icon={BookmarkIcon} />,
          title: 'Bookmarks',
          path: '/bookmarks',
        },
        {
          icon: <ListIcon Icon={EyeIcon} />,
          title: 'Reading history',
          path: '/history',
        },
        {
          icon: <ListIcon Icon={SettingsIcon} />,
          title: 'Customize',
          action: () => setShowSettings(!showSettings),
        },
      ],
    },
  ];

  return (
    <>
      <SidebarAside className={openSidebar ? 'w-60' : 'w-11'}>
        <MenuIcon
          openSidebar={openSidebar}
          toggleOpenSidebar={toggleOpenSidebar}
        />
        <Nav>
          {topMenuItems.map(({ key, items }) => (
            <NavSection key={key}>
              <NavHeader
                className={openSidebar ? 'opacity-100 px-3' : 'opacity-0 px-0'}
              >
                {key}
              </NavHeader>
              {items.map((item) => (
                <NavItem key={item.title}>
                  <ButtonOrLink item={item}>
                    <ItemInner item={item} openSidebar={openSidebar} />
                  </ButtonOrLink>
                </NavItem>
              ))}
            </NavSection>
          ))}
        </Nav>
      </SidebarAside>
      {showSettings && (
        <FeedSettingsModal
          isOpen={showSettings}
          onRequestClose={() => setShowSettings(false)}
        />
      )}
      <FeedFilters
        isOpen={isFilterOpen}
        onBack={() => setIsFilterOpen(false)}
      />
    </>
  );
}
