import React, { ReactElement, useContext, useState } from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import Sidebar from '@dailydotdev/shared/src/components/Sidebar';
import MainFeedLayout from '../../../shared/src/components/MainFeedLayout';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "search" */ '@dailydotdev/shared/src/components/PostsSearch'
    ),
);

type FeedQueryProps = {
  query: string;
  queryIfLogged?: string;
  variables?: unknown;
};

const propsByFeed: Record<string, FeedQueryProps> = {
  popular: {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_QUERY,
  },
  upvoted: {
    query: MOST_UPVOTED_FEED_QUERY,
  },
  discussed: {
    query: MOST_DISCUSSED_FEED_QUERY,
  },
  recent: {
    query: ANONYMOUS_FEED_QUERY,
    queryIfLogged: FEED_QUERY,
    variables: { ranking: 'TIME' },
  },
};

export default function MainFeedPage(): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [feedName, setFeedName] = useState<string>('popular');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();

  let feedProps: FeedQueryProps;
  if (isSearchOn && searchQuery) {
    feedProps = {
      query: SEARCH_POSTS_QUERY,
      variables: { query: searchQuery },
    };
  } else {
    feedProps = propsByFeed[feedName];
  }

  const enableSearch = () => {
    setIsSearchOn(true);
    setSearchQuery(null);
  };

  //TODO: main layout logo should redirect to extension's home page
  return (
    <MainLayout
      responsive={false}
      showRank={true}
      greeting={true}
      mainPage={true}
    >
      <FeedLayout>
        {windowLoaded && <Sidebar />}
        <MainFeedLayout
          useNavButtonsNotLinks
          feedName={isSearchOn ? 'search' : feedName}
          onSearchButtonClicked={enableSearch}
          onNavTabClicked={(tab) => setFeedName(tab.name)}
          {...feedProps}
          searchChildren={
            <PostsSearch
              closeSearch={() => setIsSearchOn(false)}
              onSubmitQuery={async (query) => setSearchQuery(query)}
            />
          }
        />
      </FeedLayout>
    </MainLayout>
  );
}
