import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import HeaderLogo from './HeaderLogo';
import { useViewSize, ViewSize } from '../../hooks';
import { useReadingStreak } from '../../hooks/streaks';
import { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useActiveFeedNameContext } from '../../contexts';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { SharedFeedPage } from '../utilities';
import FeedNav from '../feeds/FeedNav';
import useActiveNav from '../../hooks/useActiveNav';
import { MobileAppHeader } from '../../features/getApp/components/MobileAppHeader';
import { ShellBlock } from '../shell/ShellBlock';
import { ShellRoot } from '../shell/shellNav';
import { useShellBlockPlan } from '../shell/useShellBlockPlan';
import { Chips, ShellRow } from '../shell/ShellRow';
import { webappUrl } from '../../lib/constants';

export interface MainLayoutHeaderProps {
  hasBanner?: boolean;
  sidebarRendered?: boolean;
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

const SpotlightTrigger = dynamic(
  () =>
    import(
      /* webpackChunkName: "spotlightTrigger" */ '../spotlight/SpotlightTrigger'
    ),
);

const HeaderButtons = dynamic(
  () => import(/* webpackChunkName: "headerButtons" */ './HeaderButtons'),
  { ssr: false },
);

function MainLayoutHeader({
  hasBanner,
  sidebarRendered,
  additionalButtons,
  onLogoClick,
}: MainLayoutHeaderProps): ReactElement {
  const { loadedSettings } = useSettingsContext();
  const [hasHydrated, setHasHydrated] = useState(false);
  const { streak, isStreaksEnabled } = useReadingStreak();
  const isStreakLarge = (streak?.current ?? 0) > 99; // if we exceed 100, we need to display it differently in the UI
  const { feedName } = useActiveFeedNameContext();
  const activeFeedName = feedName ?? SharedFeedPage.Popular;
  const { isAnyExplore, isSearch } = useFeedName({
    feedName: activeFeedName,
  });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isPhone = useViewSize(ViewSize.MobileL) && !isLaptop;
  const { root } = useShellBlockPlan();
  const isSearchPage = isSearch || isAnyExplore;
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });
  const { profile } = useActiveNav(activeFeedName);
  const shouldUseLoadedSettings = loadedSettings && hasHydrated;
  const isMobile = !isLaptop;
  const isMobileSearchPage =
    shouldUseLoadedSettings && isMobile && isSearchPage;
  const shouldRenderFeedNav =
    shouldUseLoadedSettings && isMobile && !isSearchPage;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const renderSearchPanel = useCallback(
    () =>
      shouldUseLoadedSettings && (
        <div
          className={classNames(
            'left-0 top-0 z-header mx-2 items-center py-3 tablet:left-16 laptop:left-0',
            // Every header child is flex-shrink:0 via the global reset, so a
            // crowded action rail overflows the header instead of compressing
            // it. The search is the one element that can afford to give up
            // width, so it absorbs the squeeze at desktop widths. Laptop-scoped
            // so the mobile search page keeps its original layout.
            'laptop:min-w-0 laptop:flex-1',
            isSearchPage
              ? 'relative right-0 tablet:!left-0 laptop:top-0'
              : 'hidden laptop:flex',
            hasBanner && 'tablet:top-18',
          )}
        >
          <SpotlightTrigger />
        </div>
      ),
    [shouldUseLoadedSettings, isSearchPage, hasBanner],
  );

  const row = (() => {
    if (root === ShellRoot.Explore) {
      return (
        <>
          <div className="flex h-[3.25rem] flex-col px-2 pb-1">
            <SpotlightTrigger />
          </div>
          <ShellRow>
            <Chips
              items={[
                { key: 'tags', label: 'Tags', href: `${webappUrl}tags` },
                {
                  key: 'sources',
                  label: 'Sources',
                  href: `${webappUrl}sources`,
                },
                {
                  key: 'leaderboard',
                  label: 'Leaderboard',
                  href: `${webappUrl}users`,
                },
                {
                  key: 'discussions',
                  label: 'Discussions',
                  href: `${webappUrl}discussed`,
                },
              ]}
            />
          </ShellRow>
        </>
      );
    }
    if (root === ShellRoot.Home) {
      // The segments need the member's settings; until they load the row
      // keeps its height, so the block measures the same before and after.
      return shouldUseLoadedSettings ? (
        <FeedNav inShellBlock />
      ) : (
        <div className="h-11" />
      );
    }
    return undefined;
  })();

  // The server cannot know the screen, so it and the first client render
  // emit both the phone block and the wider header and CSS shows one of
  // them; from the second render on only this screen's stays mounted.
  const block = (!hasHydrated || isPhone) && (
    <ShellBlock root={root} row={row} />
  );

  if (hasHydrated && isPhone) {
    return <>{block}</>;
  }

  if (shouldRenderFeedNav) {
    return (
      <>
        <FeedNav />
      </>
    );
  }

  return (
    <>
      {block}
      {isMobileSearchPage && <MobileAppHeader />}
      <header
        className={classNames(
          isMobileSearchPage
            ? 'sticky top-[var(--mobile-app-header-offset,0px)] w-full bg-background-default transition-[top] duration-200 ease-out tablet:pl-16'
            : 'fixed top-0 h-14 flex-row content-center items-center justify-center gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:px-4',
          'z-header',
          !isMobileSearchPage &&
            (profile ? 'hidden laptop:flex' : 'hidden tablet:flex'),
          hasBanner && 'laptop:[--safe-area-top-offset:2rem]',
          !isMobileSearchPage && isSearchPage && 'mb-16 laptop:mb-0',
          !isMobileSearchPage && scrollClassName,
        )}
        style={featureTheme ? featureTheme.navbar : undefined}
      >
        {isMobileSearchPage
          ? renderSearchPanel()
          : sidebarRendered !== undefined && (
              <>
                <div>
                  <HeaderLogo
                    position={
                      isStreaksEnabled && isStreakLarge
                        ? LogoPosition.Relative
                        : LogoPosition.Absolute
                    }
                    onLogoClick={onLogoClick}
                  />
                </div>
                {renderSearchPanel()}
                <HeaderButtons additionalButtons={additionalButtons} />
              </>
            )}
      </header>
    </>
  );
}

export default MainLayoutHeader;
