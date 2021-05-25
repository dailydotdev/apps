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
import MostVisitedSites from './MostVisitedSites';
import getPageForAnalytics from '../lib/getPageForAnalytics';
import { trackPageView } from '@dailydotdev/shared/src/lib/analytics';
import TimerIcon from '@dailydotdev/shared/icons/timer.svg';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import DndMenu from './DndMenu';
import { useContextMenu } from 'react-contexify';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "search" */ '@dailydotdev/shared/src/components/PostsSearch'
    ),
);

export default function MainFeedPage(): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user } = useContext(AuthContext);
  const { onboardingStep } = useContext(OnboardingContext) || {};
  const [feedName, setFeedName] = useState<string>('default');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showDnd, setShowDnd] = useState(false);
  const { show: showDndMenu, hideAll } = useContextMenu({ id: 'dnd-context' });

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

  const onDndClick = (e: React.MouseEvent): void => {
    if (showDnd) {
      hideAll();
      setShowDnd(false);
    } else {
      const { right, bottom } = e.currentTarget.getBoundingClientRect();
      showDndMenu(e, {
        position: { x: right - 115, y: bottom + 4 },
      });
      setShowDnd(true);
    }
  };

  //TODO: main layout logo should redirect to extension's home page
  return (
    <MainLayout
      responsive={false}
      showRank={true}
      greeting={true}
      mainPage={true}
      additionalButtons={
        (onboardingStep > 2 || user) && (
          <HeaderButton
            icon={<TimerIcon />}
            {...getTooltipProps('Do Not Disturb', { position: 'down' })}
            className="btn-tertiary"
            onClick={onDndClick}
            pressed={showDnd}
          />
        )
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
          navChildren={<MostVisitedSites />}
        />
      </FeedLayout>
      <DndMenu onHidden={() => setShowDnd(false)} />
    </MainLayout>
  );
}
