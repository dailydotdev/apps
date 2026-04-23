import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import ScrollToTopButton from '@dailydotdev/shared/src/components/ScrollToTopButton';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import dynamic from 'next/dynamic';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import { useDndContext } from '@dailydotdev/shared/src/contexts/DndContext';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import useCustomDefaultFeed from '@dailydotdev/shared/src/hooks/feed/useCustomDefaultFeed';
import {
  CustomizeNewTabSidebar,
  CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX,
} from '@dailydotdev/shared/src/features/customizeNewTab/CustomizeNewTabSidebar';
import { useCustomizeNewTab } from '@dailydotdev/shared/src/features/customizeNewTab/useCustomizeNewTab';
import ShortcutLinks from './ShortcutLinks/ShortcutLinks';
import DndBanner from './DndBanner';
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
  initialPage?: string;
  shouldInitializeCurrentPage?: boolean;
  shortcuts?: ReactNode;
};

const normalizePage = (page: string): string =>
  page.startsWith('/') ? page : `/${page}`;

const getInitialFeedName = (page?: string): string => {
  if (!page) {
    return 'default';
  }

  const normalizedPage = normalizePage(page);

  if (normalizedPage === '/') {
    return 'default';
  }

  return normalizedPage;
};

export default function MainFeedPage({
  onPageChanged,
  initialPage,
  shouldInitializeCurrentPage = true,
  shortcuts,
}: MainFeedPageProps): ReactElement {
  const { logEvent } = useLogContext();
  const [isSearchOn, setIsSearchOn] = useState(false);
  const { user, loadingUser } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>(() =>
    getInitialFeedName(initialPage),
  );
  const [searchQuery, setSearchQuery] = useState<string>();
  const { shouldUseListFeedLayout } = useFeedLayout({ feedRelated: false });
  useCompanionSettings();
  const { isActive: isDndActive, showDnd, setShowDnd } = useDndContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const customizer = useCustomizeNewTab();
  const customizerOffset = customizer.isOpen
    ? `${CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX}px`
    : '0px';

  useLayoutEffect(() => {
    if (!initialPage || !shouldInitializeCurrentPage) {
      return;
    }

    onPageChanged(normalizePage(initialPage));
  }, [initialPage, onPageChanged, shouldInitializeCurrentPage]);

  const onNavTabClick = useCallback(
    (tab: string): void => {
      const normalizedTab = normalizePage(tab);

      if (normalizedTab !== '/search') {
        setIsSearchOn(false);
      }

      setFeedName(getInitialFeedName(normalizedTab));
      const isMyFeed = normalizedTab === '/my-feed';

      if (getShouldRedirect(isMyFeed, !!user)) {
        onPageChanged('/');
        return;
      }

      onPageChanged(normalizedTab);
    },
    [onPageChanged, user],
  );

  const activePage = useMemo(() => {
    if (isSearchOn) {
      return '/search';
    }

    if (feedName === 'default') {
      return '/';
    }

    // default page when user selected custom default feed
    if (isCustomDefaultFeed && feedName === 'default') {
      return '/';
    }

    return normalizePage(feedName);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOn, isCustomDefaultFeed, feedName]);

  const onLogoClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setFeedName('my-feed');
    setIsSearchOn(false);
    setSearchQuery(undefined);
  };

  return (
    <>
      <div
        className="transition-[padding] duration-200 ease-in-out"
        style={{ paddingRight: customizerOffset }}
      >
        <div className="fixed bottom-0 left-0 z-2 w-full">
          <ScrollToTopButton />
        </div>
        <MainLayout
          mainPage
          isNavItemsButton
          activePage={activePage}
          onLogoClick={onLogoClick}
          onNavTabClick={onNavTabClick}
          screenCentered={false}
          customBanner={isDndActive && <DndBanner />}
          additionalButtons={!loadingUser && <CompanionPopupButton />}
        >
          <FeedLayoutProvider>
            <MainFeedLayout
              feedName={feedName}
              isSearchOn={isSearchOn}
              searchQuery={searchQuery}
              onNavTabClick={onNavTabClick}
              searchChildren={
                <PostsSearch
                  onSubmitQuery={async (query, extraFlags) => {
                    logEvent({
                      event_name: LogEvent.SubmitSearch,
                      extra: JSON.stringify({
                        query,
                        provider: SearchProviderEnum.Posts,
                        ...extraFlags,
                      }),
                    });

                    setSearchQuery(query);
                  }}
                  onFocus={() => {
                    logEvent({ event_name: LogEvent.FocusSearch });
                  }}
                />
              }
              shortcuts={
                shortcuts ?? (
                  <ShortcutLinks
                    shouldUseListFeedLayout={shouldUseListFeedLayout}
                  />
                )
              }
            />
          </FeedLayoutProvider>
          <DndModal isOpen={showDnd} onRequestClose={() => setShowDnd(false)} />
        </MainLayout>
      </div>
      <CustomizeNewTabSidebar customizer={customizer} />
    </>
  );
}
