import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { useRouter } from 'next/router';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { useActiveFeedNameContext } from '../../contexts';
import useActiveNav from '../../hooks/useActiveNav';
import { useViewSize, ViewSize } from '../../hooks';
import usePersistentContext from '../../hooks/usePersistentContext';
import {
  algorithmsList,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
} from '../layout/common';
import { MobileFeedActions } from './MobileFeedActions';
import { useFeedName } from '../../hooks/feed/useFeedName';
import SettingsContext from '../../contexts/SettingsContext';
import { Dropdown } from '../fields/Dropdown';
import { SortIcon } from '../icons';
import { IconSize } from '../Icon';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { webappUrl } from '../../lib/constants';
import NotificationsBell from '../notifications/NotificationsBell';
import classed from '../../lib/classed';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  Bookmarks = 'Bookmarks',
  History = 'History',
  MostUpvoted = 'Most Upvoted',
  Discussions = 'Discussions',
}

const urlToTab: Record<string, FeedNavTab> = {
  [`${webappUrl}`]: FeedNavTab.ForYou,
  [`${webappUrl}popular`]: FeedNavTab.Popular,
  [`${webappUrl}upvoted`]: FeedNavTab.MostUpvoted,
  [`${webappUrl}discussed`]: FeedNavTab.Discussions,
  [`${webappUrl}bookmarks`]: FeedNavTab.Bookmarks,
  [`${webappUrl}history`]: FeedNavTab.History,
};

const StickyNavIconWrapper = classed(
  'div',
  'sticky flex h-11 w-20 -translate-y-12 items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4',
);

function FeedNav(): ReactElement {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isSortableFeed } = useFeedName({ feedName });
  const { home: shouldRenderNav } = useActiveNav(feedName);
  const isLaptop = useViewSize(ViewSize.LaptopL);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });

  if (!shouldRenderNav || router?.pathname?.startsWith('/posts/[id]')) {
    return null;
  }

  return (
    <div
      className={classNames(
        'sticky top-0 z-header w-full tablet:pl-16',
        scrollClassName,
      )}
    >
      {isMobile && <MobileFeedActions />}
      <div className="mb-4 h-[3.25rem] tablet:mb-0">
        <TabContainer
          controlledActive={urlToTab[router.asPath] ?? ''}
          shouldMountInactive
          className={{
            header: classNames(
              'no-scrollbar overflow-x-auto px-2',
              isSortableFeed && sortingEnabled && 'pr-28',
            ),
          }}
          tabListProps={{
            className: { indicator: '!w-6', item: 'px-1' },
            autoScrollActive: true,
          }}
        >
          {Object.entries(urlToTab).map(([url, label]) => (
            // key is assigned automatically in the Tab component
            // eslint-disable-next-line react/jsx-key
            <Tab label={label} url={url} />
          ))}
        </TabContainer>

        {isMobile && sortingEnabled && isSortableFeed && (
          <StickyNavIconWrapper className="translate-x-[calc(100vw-100%)]">
            <Dropdown
              className={{
                label: 'hidden',
                chevron: 'hidden',
                button: '!px-1',
              }}
              dynamicMenuWidth
              shouldIndicateSelected
              buttonSize={ButtonSize.Small}
              buttonVariant={ButtonVariant.Tertiary}
              icon={<SortIcon size={IconSize.Medium} />}
              selectedIndex={selectedAlgo}
              options={algorithmsList}
              onChange={(_, index) => setSelectedAlgo(index)}
              drawerProps={{ displayCloseButton: true }}
            />
          </StickyNavIconWrapper>
        )}
        <StickyNavIconWrapper className="hidden translate-x-[calc(100vw-180%)] tablet:flex laptop:hidden">
          <NotificationsBell compact />
        </StickyNavIconWrapper>
      </div>
    </div>
  );
}

export default FeedNav;
