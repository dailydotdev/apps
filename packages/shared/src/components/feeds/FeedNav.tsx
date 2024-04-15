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

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  Bookmarks = 'Bookmarks',
  History = 'History',
  MostUpvoted = 'Most Upvoted',
  Discussions = 'Discussions',
}

const urlToTab: Record<string, FeedNavTab> = {
  '/': FeedNavTab.ForYou,
  '/popular': FeedNavTab.Popular,
  '/upvoted': FeedNavTab.MostUpvoted,
  '/discussed': FeedNavTab.Discussions,
  '/bookmarks': FeedNavTab.Bookmarks,
  '/history': FeedNavTab.History,
};

function FeedNav(): ReactElement {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isSortableFeed } = useFeedName({ feedName });
  const { home: shouldRenderNav } = useActiveNav(feedName);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );

  if (!shouldRenderNav || router?.pathname?.startsWith('/posts/[id]')) {
    return null;
  }

  return (
    <div
      className={classNames(
        'sticky top-0 z-header w-full bg-background-default tablet:pl-16',
      )}
    >
      {isMobile && <MobileFeedActions />}
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
        <div className="fixed flex h-11 w-20 -translate-y-12 translate-x-[calc(100vw-100%)] items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4">
          <Dropdown
            className={{ label: 'hidden', chevron: 'hidden', button: '!px-1' }}
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
        </div>
      )}
    </div>
  );
}

export default FeedNav;
