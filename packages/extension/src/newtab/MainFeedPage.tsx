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
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  useConditionalFeature,
  useFeedLayout,
} from '@dailydotdev/shared/src/hooks';
import {
  DailyPageVariant,
  featureDailyPage,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { DailyHome } from '@dailydotdev/shared/src/features/daily/DailyHome';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { useShortcutLinks } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks';
import { useDndContext } from '@dailydotdev/shared/src/contexts/DndContext';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import useCustomDefaultFeed from '@dailydotdev/shared/src/hooks/feed/useCustomDefaultFeed';
import { DndBanner } from '@dailydotdev/shared/src/components/DndBanner';
import ShortcutLinks from './ShortcutLinks/ShortcutLinks';
import { ExtensionTopBanners } from './ExtensionTopBanners';
import { ExtensionSignInStrip } from './ExtensionSignInStrip';
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

const MainFeedPageInner = ({
  onPageChanged,
  initialPage,
  shouldInitializeCurrentPage = true,
  shortcuts,
}: MainFeedPageProps): ReactElement => {
  const { logEvent } = useLogContext();
  const [isSearchOn, setIsSearchOn] = useState(false);
  const { user, loadingUser, isLoggedIn } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>(() =>
    getInitialFeedName(initialPage),
  );
  const [searchQuery, setSearchQuery] = useState<string>();
  const { shouldUseListFeedLayout } = useFeedLayout({ feedRelated: false });
  const { isV2 } = useLayoutVariant();
  useCompanionSettings();
  const { isActive: isDndActive, showDnd, setShowDnd } = useDndContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const { value: dailyVariant } = useConditionalFeature({
    feature: featureDailyPage,
    shouldEvaluate: isLoggedIn,
  });
  const showDailyHome =
    feedName === 'default' &&
    !isSearchOn &&
    dailyVariant === DailyPageVariant.DailyAsDefault;

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

  const { optOutCompanion, showTopSites } = useSettingsContext();
  // Mirror `ExtensionTopBanners`' "Add shortcuts" gate so the topBanner
  // shortcut row and the marketing CTA card are mutually exclusive.
  const { shortcutLinks } = useShortcutLinks();
  const hasShortcutsToShow = showTopSites && (shortcutLinks?.length ?? 0) > 0;

  return (
    <>
      <div className="min-h-screen">
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
          additionalButtons={
            !loadingUser && !optOutCompanion && <CompanionPopupButton />
          }
          topBanner={
            <>
              <ExtensionSignInStrip />
              {isV2 && hasShortcutsToShow && (
                <div className="mx-4 flex justify-center pt-2 laptop:mx-0 [&:empty]:hidden">
                  <ShortcutLinks shouldUseListFeedLayout={false} />
                </div>
              )}
              <ExtensionTopBanners />
            </>
          }
        >
          <FeedLayoutProvider>
            {showDailyHome ? (
              <DailyHome
                onBackToFeed={() => onNavTabClick('/my-feed')}
                onNavTabClick={onNavTabClick}
              />
            ) : (
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
                  isV2
                    ? undefined
                    : shortcuts ?? (
                        <ShortcutLinks
                          shouldUseListFeedLayout={shouldUseListFeedLayout}
                        />
                      )
                }
              />
            )}
          </FeedLayoutProvider>
          <DndModal isOpen={showDnd} onRequestClose={() => setShowDnd(false)} />
        </MainLayout>
      </div>
    </>
  );
};

export default function MainFeedPage(props: MainFeedPageProps): ReactElement {
  return <MainFeedPageInner {...props} />;
}
