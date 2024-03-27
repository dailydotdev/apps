import classNames from 'classnames';
import React, { ReactElement, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Tab, TabContainer } from '../tabs/TabContainer';
import NotificationsBell from '../notifications/NotificationsBell';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  Bookmarks = 'Bookmarks',
  History = 'History',
}

function FeedNav(): ReactElement {
  const router = useRouter();

  const shouldRenderNav = useMemo(() => {
    return /(?<!\/.+)\/(?:my-feed|popular|upvoted|discussed|bookmarks|history|notifications|)$/.test(
      router?.pathname,
    );
  }, [router?.pathname]);

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
          header: 'no-scrollbar overflow-x-auto px-1',
        }}
        tabListProps={{ className: { indicator: '!w-6' } }}
      >
        <Tab label={FeedNavTab.ForYou} url="/" />
        <Tab label={FeedNavTab.Popular} url="/popular" />
        <Tab label={FeedNavTab.Bookmarks} url="/bookmarks" />
        <Tab label={FeedNavTab.History} url="/history" />
      </TabContainer>

      <div className="fixed right-0 top-0 my-1 mr-1 flex h-12 w-36 items-center justify-end bg-gradient-to-r from-transparent via-background-default via-60% to-background-default">
        <NotificationsBell />
      </div>
    </div>
  );
}

export default FeedNav;
