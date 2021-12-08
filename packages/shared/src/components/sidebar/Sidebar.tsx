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
} from './common';
import InvitePeople from './InvitePeople';
import SidebarRankProgress from '../SidebarRankProgress';

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
    path: 'https://changelog.daily.dev/',
    target: '_blank',
  },
  {
    icon: <ListIcon Icon={FeedbackIcon} />,
    title: 'Feedback',
    path: 'https://it057218.typeform.com/to/S9p9SVNI',
    target: '_blank',
  },
];

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
          icon: <ListIcon Icon={DiscussIcon} />,
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
        <div className="flex-1" />
        <Nav>
          {bottomMenuItems.map((item) => (
            <NavItem key={item.title}>
              <ButtonOrLink item={item}>
                <ItemInner item={item} openSidebar={openSidebar} />
              </ButtonOrLink>
            </NavItem>
          ))}
          <InvitePeople openSidebar={openSidebar} />
          <SidebarRankProgress openSidebar={openSidebar} />
        </Nav>
      </SidebarAside>
      {showSettings && (
        <FeedSettingsModal
          isOpen={showSettings}
          onRequestClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
