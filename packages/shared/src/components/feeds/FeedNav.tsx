import classNames from 'classnames';
import React, { ReactElement, useMemo } from 'react';
import { Tab, TabContainer } from '../tabs/TabContainer';
import NotificationsBell from '../notifications/NotificationsBell';
import { useActiveFeedNameContext } from '../../contexts';
import { SharedFeedPage } from '../utilities';
import { OtherFeedPage } from '../../lib/query';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  Bookmarks = 'Bookmarks',
  History = 'History',
}

function FeedNav(): ReactElement {
  const { feedName } = useActiveFeedNameContext();

  const shouldRenderNav = useMemo(() => {
    return [
      SharedFeedPage.MyFeed,
      SharedFeedPage.Popular,
      SharedFeedPage.Upvoted,
      SharedFeedPage.Discussed,
      OtherFeedPage.Bookmarks,
      OtherFeedPage.History,
      OtherFeedPage.Notifications,
    ].includes(feedName);
  }, [feedName]);

  if (!shouldRenderNav) {
    return null;
  }

  return (
    <div
      className={classNames(
        'sticky top-0 z-header h-14 w-full bg-background-default tablet:pl-16',
      )}
    >
      <TabContainer
        shouldMountInactive
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

      <div className="fixed right-0 top-0 my-1 flex h-12 w-36 items-center justify-end bg-gradient-to-r from-transparent via-background-default via-60% to-background-default pr-1">
        <NotificationsBell compact />
      </div>
    </div>
  );
}

export default FeedNav;
