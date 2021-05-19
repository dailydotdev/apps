import React, { ReactElement, useContext, useState } from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import Sidebar from '@dailydotdev/shared/src/components/Sidebar';
import MainFeedLayout from '../../../shared/src/components/MainFeedLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';

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
          onNavTabClick={(tab) => setFeedName(tab.name)}
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
