import React, { ReactElement, useContext, useMemo, useState } from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import FeedLayout from '@dailydotdev/shared/src/components/FeedLayout';
import dynamic from 'next/dynamic';
import TimerIcon from '@dailydotdev/shared/icons/timer.svg';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { HeaderButton } from '@dailydotdev/shared/src/components/buttons/common';
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
  const { user } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>('default');
  const [isSearchOn, setIsSearchOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showDnd, setShowDnd] = useState(false);

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
    onPageChanged(`/${tab}`);
  };

  const activePage = useMemo(() => {
    if (isSearchOn) {
      return '/search';
    }
    return `/${feedName === 'default' ? 'popular' : feedName}`;
  }, [isSearchOn, feedName]);

  const onLogoClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setFeedName('default');
    setIsSearchOn(false);
    setSearchQuery(undefined);
  };

  return (
    <MainLayout
      greeting
      mainPage
      useNavButtonsNotLinks
      activePage={activePage}
      onLogoClick={onLogoClick}
      onShowDndClick={() => setShowDnd(true)}
      enableSearch={enableSearch}
      onNavTabClick={onNavTabClick}
      additionalButtons={
        <>
          {user && (
            <SimpleTooltip content="Do Not Disturb" placement="bottom">
              <HeaderButton
                icon={<TimerIcon />}
                className="btn-tertiary"
                onClick={() => setShowDnd(true)}
                pressed={showDnd}
              />
            </SimpleTooltip>
          )}
        </>
      }
    >
      <FeedLayout>
        <MainFeedLayout
          feedName={feedName}
          isSearchOn={isSearchOn}
          searchQuery={searchQuery}
          searchChildren={
            <PostsSearch
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
