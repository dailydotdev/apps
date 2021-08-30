import React, { ReactElement, useContext, useState } from 'react';
import MainLayout, {
  HeaderButton,
} from '@dailydotdev/shared/src/components/MainLayout';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import Sidebar from '@dailydotdev/shared/src/components/Sidebar';
import MainFeedLayout, {
  Tab,
} from '@dailydotdev/shared/src/components/MainFeedLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';
import TimerIcon from '@dailydotdev/shared/icons/timer.svg';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import MostVisitedSites from './MostVisitedSites';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "search" */ '@dailydotdev/shared/src/components/PostsSearch'
    ),
);

const DndModal = dynamic(
  () => import(/* webpackChunkName: "dnd" */ './DndModal'),
);

export type MainFeedPageProps = {
  onPageChanged: (page: string) => unknown;
};

export default function MainFeedPage({
  onPageChanged,
}: MainFeedPageProps): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user } = useContext(AuthContext);
  const { onboardingStep } = useContext(OnboardingContext) || {};
  const [feedName, setFeedName] = useState<string>('default');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showDnd, setShowDnd] = useState(false);

  const enableSearch = () => {
    setIsSearchOn(true);
    setSearchQuery(null);
    onPageChanged('/search');
  };

  const closeSearch = () => {
    setIsSearchOn(false);
    onPageChanged(`/${feedName}`);
  };

  const onNavTabClick = (tab: Tab): void => {
    setFeedName(tab.name);
    onPageChanged(`/${tab.name}`);
  };

  const onLogoClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setFeedName('default');
    setIsSearchOn(false);
    setSearchQuery(undefined);
  };

  return (
    <MainLayout
      responsive={false}
      showRank
      greeting
      mainPage
      onLogoClick={onLogoClick}
      additionalButtons={
        <>
          {(onboardingStep > 2 || user) && (
            <HeaderButton
              icon={<TimerIcon />}
              {...getTooltipProps('Do Not Disturb', { position: 'down' })}
              className="btn-tertiary"
              onClick={() => setShowDnd(true)}
              pressed={showDnd}
            />
          )}
        </>
      }
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
          navChildren={!isSearchOn && <MostVisitedSites />}
        />
      </FeedLayout>
      <DndModal isOpen={showDnd} onRequestClose={() => setShowDnd(false)} />
    </MainLayout>
  );
}
