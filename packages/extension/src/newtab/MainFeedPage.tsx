import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import browser from 'webextension-polyfill';
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
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import { useDndContext } from '@dailydotdev/shared/src/contexts/DndContext';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import useCustomDefaultFeed from '@dailydotdev/shared/src/hooks/feed/useCustomDefaultFeed';
import { CustomizeNewTabProvider } from '@dailydotdev/shared/src/features/customizeNewTab/CustomizeNewTabContext';
import { CustomizeNewTabSidebar } from '@dailydotdev/shared/src/features/customizeNewTab/CustomizeNewTabSidebar';
import { isFocusActiveAt } from '@dailydotdev/shared/src/features/customizeNewTab/lib/focusSchedule';
import { normaliseNewTabMode } from '@dailydotdev/shared/src/features/customizeNewTab/lib/newTabMode';
import { DndBanner } from '@dailydotdev/shared/src/components/DndBanner';
import ShortcutLinks from './ShortcutLinks/ShortcutLinks';
import { CompanionPopupButton } from '../companion/CompanionPopupButton';
import { useCompanionSettings } from '../companion/useCompanionSettings';
import { getDefaultLink } from './dnd';

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

const FocusRedirectEffect = (): null => {
  const { flags } = useSettingsContext();
  useEffect(() => {
    const mode = normaliseNewTabMode(flags?.newTabMode);
    if (mode !== 'focus') {
      return;
    }
    if (!isFocusActiveAt(flags?.focusSchedule, new Date())) {
      return;
    }
    // Replace the daily.dev tab with the browser's native new tab. We accept
    // a brief flash before the redirect because Focus is opt-in; reading the
    // schedule pre-React would require mirroring it into chrome.storage.local.
    const redirect = async () => {
      const tab = await browser.tabs.getCurrent();
      if (tab?.id == null) {
        return;
      }
      window.stop();
      await browser.tabs.update(tab.id, { url: getDefaultLink() });
    };
    redirect().catch(() => undefined);
  }, [flags?.newTabMode, flags?.focusSchedule]);
  return null;
};

const MainFeedPageInner = ({
  onPageChanged,
  initialPage,
  shouldInitializeCurrentPage = true,
  shortcuts,
}: MainFeedPageProps): ReactElement => {
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

  const { optOutCompanion } = useSettingsContext();

  return (
    <>
      <FocusRedirectEffect />
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
      <CustomizeNewTabSidebar />
    </>
  );
};

export default function MainFeedPage(props: MainFeedPageProps): ReactElement {
  return (
    <CustomizeNewTabProvider>
      <MainFeedPageInner {...props} />
    </CustomizeNewTabProvider>
  );
}
