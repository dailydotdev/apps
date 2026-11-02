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
import { useFeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { useShortcutLinks } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks';
import { useFeedWidgetShortcuts } from '@dailydotdev/shared/src/features/feedWidgets/feedState';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
import { useDndContext } from '@dailydotdev/shared/src/contexts/DndContext';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import useCustomDefaultFeed from '@dailydotdev/shared/src/hooks/feed/useCustomDefaultFeed';
import { DndBanner } from '@dailydotdev/shared/src/components/DndBanner';
import ShortcutLinks from './ShortcutLinks/ShortcutLinks';
import { ExtensionTopBanners } from './ExtensionTopBanners';
import { ExtensionSignInContent } from './ExtensionSignInContent';
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
  // Cover strip for visitors who still need to log in or finish onboarding
  // (the hijacking new tab). Laptop renders it above the feed card and puts
  // the sign-in title and CTAs in the feed's page header; smaller screens
  // render it in the feed's shortcuts slot.
  loginStrip?: ReactNode;
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
  loginStrip,
}: MainFeedPageProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { getFeatureValue } = useFeaturesReadyContext();
  const [isSearchOn, setIsSearchOn] = useState(false);
  const { user, loadingUser } = useContext(AuthContext);
  const [feedName, setFeedName] = useState<string>(() =>
    getInitialFeedName(initialPage),
  );
  const [searchQuery, setSearchQuery] = useState<string>();
  const { shouldUseListFeedLayout } = useFeedLayout({ feedRelated: false });
  const isLaptopLayout = useLaptopLayout();
  useCompanionSettings();
  const { isActive: isDndActive, showDnd, setShowDnd } = useDndContext();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();

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
  // Where the rail shows the Shortcuts widget, the row and the "Add
  // shortcuts" card step aside. A search from the header keeps the feed
  // underneath, so the row holds still around it.
  const { hasShortcuts: hasRailShortcuts, isPending: isRailPending } =
    useFeedWidgetShortcuts(
      getFeedName(isSearchOn ? normalizePage(feedName) : activePage, {
        hasUser: !!user,
      }),
    );
  const isShortcutsHidden = hasRailShortcuts || isRailPending;
  const hasShortcutsToShow =
    !isShortcutsHidden && showTopSites && (shortcutLinks?.length ?? 0) > 0;

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
          customBanner={isDndActive && <DndBanner />}
          additionalButtons={
            !loadingUser && !optOutCompanion && <CompanionPopupButton />
          }
          topBanner={
            <>
              {isLaptopLayout && loginStrip && (
                <div className="mx-4 laptop:mx-0">{loginStrip}</div>
              )}
              {isLaptopLayout && hasShortcutsToShow && (
                <div className="mx-4 flex justify-center pt-2 laptop:mx-0 [&:empty]:hidden">
                  <ShortcutLinks shouldUseListFeedLayout={false} />
                </div>
              )}
              {!isShortcutsHidden && <ExtensionTopBanners />}
            </>
          }
        >
          <FeedLayoutProvider>
            <MainFeedLayout
              feedName={feedName}
              isSearchOn={isSearchOn}
              searchQuery={searchQuery}
              onNavTabClick={onNavTabClick}
              pageHeaderContent={
                !!loginStrip && !user && <ExtensionSignInContent />
              }
              searchChildren={
                <PostsSearch
                  onSubmitQuery={async (query, extraFlags) => {
                    logEvent({
                      event_name: LogEvent.SubmitSearch,
                      extra: JSON.stringify({
                        query,
                        provider: SearchProviderEnum.Posts,
                        search_version: getFeatureValue(feature.searchVersion),
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
                isLaptopLayout
                  ? undefined
                  : (loginStrip && <div className="mx-4">{loginStrip}</div>) ??
                    (isShortcutsHidden ? undefined : (
                      <ShortcutLinks
                        shouldUseListFeedLayout={shouldUseListFeedLayout}
                      />
                    ))
              }
            />
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
