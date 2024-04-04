import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Tab, TabContainer } from '../tabs/TabContainer';
import NotificationsBell from '../notifications/NotificationsBell';
import { useActiveFeedNameContext } from '../../contexts';
import useActiveNav from '../../hooks/useActiveNav';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  Bookmarks = 'Bookmarks',
  History = 'History',
}

function FeedNav(): ReactElement {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const { home: shouldRenderNav, notifications } = useActiveNav(feedName);

  if (!shouldRenderNav || router?.pathname?.startsWith('/posts/[id]')) {
    return null;
  }

  return (
    <div
      className={classNames(
        'Zbg-background-default sticky top-0 z-header flex h-14 w-full tablet:pl-16',
      )}
    >
      <TabContainer
        controlledActive={notifications ? 'notifications' : undefined}
        className={{
          header: 'no-scrollbar overflow-x-auto px-1 pr-28',
        }}
        tabListProps={{ className: { indicator: '!w-6' } }}
      >
        <Tab label={FeedNavTab.ForYou} url="/" />
        <Tab label={FeedNavTab.Popular} url="/popular" />
        <Tab label={FeedNavTab.Bookmarks} url="/bookmarks" />
        <Tab label={FeedNavTab.History} url="/history" />
      </TabContainer>

      <div className="fixed left-[100vw] top-0 my-1 flex h-12 w-20 -translate-x-full items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4">
        <NotificationsBell compact />
      </div>
    </div>
  );
}

export default FeedNav;
