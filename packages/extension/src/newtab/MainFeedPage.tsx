import React, { ReactElement, useContext, useState } from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import Sidebar from '@dailydotdev/shared/src/components/Sidebar';
import MainFeedLayout, {
  Tab,
} from '@dailydotdev/shared/src/components/MainFeedLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';
import MostVisitedSites from './MostVisitedSites';
import getPageForAnalytics from '../lib/getPageForAnalytics';
import { trackPageView } from '@dailydotdev/shared/src/lib/analytics';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "search" */ '@dailydotdev/shared/src/components/PostsSearch'
    ),
);

export default function MainFeedPage(): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [feedName, setFeedName] = useState<string>('default');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();

  const enableSearch = () => {
    setIsSearchOn(true);
    setSearchQuery(null);
    trackPageView(getPageForAnalytics('/search'));
  };

  const closeSearch = () => {
    setIsSearchOn(false);
    trackPageView(getPageForAnalytics(`/${feedName}`));
  };

  const onNavTabClick = (tab: Tab): void => {
    setFeedName(tab.name);
    trackPageView(getPageForAnalytics(`/${tab.name}`));
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
          feedName={feedName}
          isSearchOn={isSearchOn}
          searchQuery={searchQuery}
          onSearchButtonClick={enableSearch}
          onNavTabClick={onNavTabClick}
          searchChildren={
            <PostsSearch
              closeSearch={closeSearch}
              onSubmitQuery={async (query) => setSearchQuery(query)}
            />
          }
          navChildren={<MostVisitedSites />}
        />
      </FeedLayout>
    </MainLayout>
  );
}
