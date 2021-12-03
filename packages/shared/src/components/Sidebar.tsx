import React, { ReactElement, useContext, useState } from 'react';
import Link from 'next/link';
import SettingsContext from '../contexts/SettingsContext';
import { Button } from './buttons/Button';
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

interface SidebarMenuItems {
  key: string;
  items: SidebarMenuItem[];
}

interface SidebarMenuItem {
  icon: ReactElement;
  title: string;
  path?: string;
  action?: () => unknown;
}

const ListIcon = ({ Icon }): ReactElement => <Icon className="mr-3 w-5 h-5" />;

export default function Sidebar(): ReactElement {
  const { openSidebar, toggleOpenSidebar } = useContext(SettingsContext);
  const [showSettings, setShowSettings] = useState(false);

  const topMenuItems: SidebarMenuItems[] = [
    {
      key: 'Discover',
      items: [
        {
          icon: <ListIcon Icon={FilterIcon} />,
          title: 'Feed filters',
          path: '/sidebar',
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

  const ItemInner = ({ item }: { item: SidebarMenuItem }) => (
    <>
      {item.icon}
      <span
        className={`flex-1 text-left transition-opacity ${
          openSidebar ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {item.title}
      </span>
    </>
  );

  return (
    <>
      <aside
        className={`border-r border-theme-divider-tertiary transition-all transform duration-500 ease-in-out min-h-screen group ${
          openSidebar ? 'w-60' : 'w-11'
        }`}
      >
        <Button
          onClick={() => toggleOpenSidebar()}
          absolute
          className={`btn btn-primary h-6 w-6 top-3 -right-3 z-3 ${
            openSidebar
              ? 'transition-opacity  invisible group-hover:visible opacity-0 group-hover:opacity-100'
              : ''
          }`}
          buttonSize="xsmall"
        >
          <ArrowIcon
            className={`typo-title3 ${
              openSidebar ? '-rotate-90' : 'rotate-90'
            }`}
          />
        </Button>
        <nav className="mt-4">
          {topMenuItems.map(({ key, items }) => (
            <ul key={key} className="mt-2">
              <li
                className={`typo-footnote text-theme-label-quaternary h-7 flex items-center font-bold  transition-opacity ${
                  openSidebar ? 'opacity-100 px-3' : 'opacity-0 px-0'
                }`}
              >
                {key}
              </li>
              {items.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center typo-callout text-theme-label-tertiary"
                >
                  {item.path ? (
                    <Link href={item.path} passHref prefetch={false}>
                      <a className="flex flex-1 items-center px-3 h-7">
                        <ItemInner item={item} />
                      </a>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="flex flex-1 items-center px-3 h-7"
                      onClick={item.action}
                    >
                      <ItemInner item={item} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </aside>
      {showSettings && (
        <FeedSettingsModal
          isOpen={showSettings}
          onRequestClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
