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

function FeedNav(): ReactElement {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isSortableFeed } = useFeedName({ feedName });
  const { home: shouldRenderNav, notifications } = useActiveNav(feedName);
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
        controlledActive={notifications ? 'notifications' : undefined}
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
        <Tab label={FeedNavTab.ForYou} url="/" />
        <Tab label={FeedNavTab.Popular} url="/popular" />
        <Tab label={FeedNavTab.MostUpvoted} url="/upvoted" />
        <Tab label={FeedNavTab.Discussions} url="/discussed" />
        <Tab label={FeedNavTab.Bookmarks} url="/bookmarks" />
        <Tab label={FeedNavTab.History} url="/history" />
      </TabContainer>
      {isMobile && sortingEnabled && isSortableFeed && (
        <div className="fixed right-0 top-12 my-1 flex h-12 w-20 items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4">
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
