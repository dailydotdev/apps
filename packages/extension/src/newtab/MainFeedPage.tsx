import React, { ReactElement, useContext, useMemo, useState } from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  FeedLayout as FeedLayoutEnum,
  SearchExperiment,
} from '@dailydotdev/shared/src/lib/featureValues';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
import ShortcutLinks from './ShortcutLinks';
import DndBanner from './DndBanner';
import DndContext from './DndContext';
import { CompanionPopupButton } from '../companion/CompanionPopupButton';
import { useCompanionSettings } from '../companion/useCompanionSettings';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "postsSearch" */ '@dailydotdev/shared/src/components/PostsSearch'
    ),
);

const DndModal = dynamic(
  () => import(/* webpackChunkName: "dndModal" */ './DndModal'),
);

export type MainFeedPageProps = {
  onPageChanged: (page: string) => unknown;
};

export default function MainFeedPage({
  onPageChanged,
}: MainFeedPageProps): ReactElement {
  const searchVersion = useFeature(feature.search);
  const { alerts } = useContext(AlertContext);
  const [isSearchOn, setIsSearchOn] = useState(false);
  const { user, loadingUser } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showDnd, setShowDnd] = useState(false);
  const layout = useFeature(feature.feedLayout);
  useCompanionSettings();
  const { isActive: isDndActive } = useContext(DndContext);
  const enableSearch = () => {
    if (searchVersion !== SearchExperiment.Control) {
      window.location.assign(`${webappUrl}posts/finder`);
      return;
    }

    setIsSearchOn(true);
    setSearchQuery(null);
    onPageChanged('/search');
  };

  const onNavTabClick = (tab: string): void => {
    if (tab !== 'search') {
      setIsSearchOn(false);
    }
    setFeedName(tab);
    const isMyFeed = tab === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      onPageChanged(`/`);
    } else {
      onPageChanged(`/${tab}`);
    }
  };

  const activePage = useMemo(() => {
    if (isSearchOn) {
      return '/search';
    }

    const feed = getFeedName(feedName, {
      hasUser: !!user,
      hasFiltered: !alerts?.filter,
    });

    return `/${feed}`;
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOn, feedName]);

  const onLogoClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setFeedName('popular');
    setIsSearchOn(false);
    setSearchQuery(undefined);
  };

  return (
    <MainLayout
      greeting
      mainPage
      isNavItemsButton
      activePage={activePage}
      onLogoClick={onLogoClick}
      showDnd={showDnd}
      dndActive={isDndActive}
      onShowDndClick={() => setShowDnd(true)}
      enableSearch={enableSearch}
      onNavTabClick={onNavTabClick}
      screenCentered={false}
      customBanner={isDndActive && <DndBanner />}
      additionalButtons={!loadingUser && <CompanionPopupButton />}
    >
      <FeedLayout>
        <MainFeedLayout
          feedName={feedName}
          isSearchOn={isSearchOn}
          searchQuery={searchQuery}
          onFeedPageChanged={onNavTabClick}
          searchChildren={
            <PostsSearch
              onSubmitQuery={async (query) => setSearchQuery(query)}
            />
          }
          navChildren={!isSearchOn && <ShortcutLinks />}
          shortcuts={
            <ShortcutLinks
              className={
                layout === FeedLayoutEnum.Control ? 'ml-auto' : 'mt-4 w-fit'
              }
            />
          }
        />
      </FeedLayout>
      <DndModal isOpen={showDnd} onRequestClose={() => setShowDnd(false)} />
    </MainLayout>
  );
}
