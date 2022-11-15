import React, { ReactElement, useContext, useMemo, useState } from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout, {
  getFeedName,
} from '@dailydotdev/shared/src/components/MainFeedLayout';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
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
  const { user, loadingUser } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>('default');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showDnd, setShowDnd] = useState(false);
  const { placement } = useCompanionSettings('main feed page');
  const { isActive: isDndActive } = useContext(DndContext);
  const enableSearch = () => {
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
      additionalButtons={
        !loadingUser &&
        placement === 'header' && <CompanionPopupButton placement={placement} />
      }
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
        />
      </FeedLayout>
      <DndModal isOpen={showDnd} onRequestClose={() => setShowDnd(false)} />
    </MainLayout>
  );
}
