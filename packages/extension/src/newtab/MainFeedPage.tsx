import React, { ReactElement, useContext, useMemo, useState } from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
import {
  SearchProviderEnum,
  getSearchUrl,
} from '@dailydotdev/shared/src/graphql/search';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
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
  const { alerts } = useContext(AlertContext);
  const { trackEvent } = useAnalyticsContext();
  const [isSearchOn, setIsSearchOn] = useState(false);
  const { user, loadingUser } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showDnd, setShowDnd] = useState(false);
  const { shouldUseMobileFeedLayout } = useFeedLayout({ feedRelated: false });
  useCompanionSettings();
  const { isActive: isDndActive } = useContext(DndContext);
  const enableSearch = () => {
    window.location.assign(
      getSearchUrl({ provider: SearchProviderEnum.Posts }),
    );
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
    <>
      <div className="fixed bottom-0 left-0 z-2 w-full">
        <ScrollToTopButton />
      </div>
      <MainLayout
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
            searchChildren={
              <PostsSearch
                onSubmitQuery={async (query) => {
                  trackEvent({
                    event_name: AnalyticsEvent.SubmitSearch,
                    extra: JSON.stringify({
                      query,
                      provider: SearchProviderEnum.Posts,
                    }),
                  });

                  setSearchQuery(query);
                }}
                onFocus={() => {
                  trackEvent({ event_name: AnalyticsEvent.FocusSearch });
                }}
              />
            }
            shortcuts={
              <ShortcutLinks
                shouldUseMobileFeedLayout={shouldUseMobileFeedLayout}
              />
            }
          />
        </FeedLayout>
        <DndModal isOpen={showDnd} onRequestClose={() => setShowDnd(false)} />
      </MainLayout>
    </>
  );
}
