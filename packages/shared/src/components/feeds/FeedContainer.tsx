import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Spaciness } from '../../graphql/settings';
import SettingsContext from '../../contexts/SettingsContext';
import FeedContext from '../../contexts/FeedContext';
import styles from '../Feed.module.css';
import {
  useFeedLayout,
  ToastSubject,
  useToastNotification,
  FeedPagesWithMobileLayoutType,
  useViewSize,
  ViewSize,
  useFeeds,
} from '../../hooks';
import ConditionalWrapper from '../ConditionalWrapper';
import { useActiveFeedNameContext } from '../../contexts';
import { SharedFeedPage } from '../utilities';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { OtherFeedPage } from '../../lib/query';
import { useShortcuts } from '../../hooks/utils';

export interface FeedContainerProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  inlineHeader?: boolean;
  showSearch?: boolean;
  shortcuts?: ReactNode;
  actionButtons?: ReactNode;
  isHorizontal?: boolean;
  feedContainerRef?: React.Ref<HTMLDivElement>;
}

const listGaps = {
  cozy: 'gap-5',
  roomy: 'gap-3',
};

const gridGaps = {
  cozy: 'gap-14',
  roomy: 'gap-12',
};

const cardListClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
};

export const getFeedGapPx = {
  'gap-2': 8,
  'gap-3': 12,
  'gap-5': 20,
  'gap-8': 32,
  'gap-12': 48,
  'gap-14': 56,
};

export const gapClass = ({
  isList,
  isFeedLayoutList,
  space,
}: {
  isList: boolean;
  isFeedLayoutList: boolean;
  space: Spaciness;
}): string => {
  if (isFeedLayoutList) {
    return '';
  }
  return isList ? listGaps[space] ?? 'gap-2' : gridGaps[space] ?? 'gap-8';
};

const cardClass = ({
  isList,
  numberOfCards,
  isHorizontal,
}: {
  isList: boolean;
  numberOfCards: number;
  isHorizontal: boolean;
}): string => {
  if (isHorizontal) {
    return 'auto-cols-[calc((100%/var(--num-cards))-var(--feed-gap)-calc(var(--feed-gap)*+1)/var(--num-cards))] tablet:auto-cols-[calc((100%/var(--num-cards))-var(--feed-gap)-calc(var(--feed-gap)*-1)/var(--num-cards))]';
  }
  return isList ? 'grid-cols-1' : cardListClass[numberOfCards];
};

const getStyle = (isList: boolean, space: Spaciness): CSSProperties => {
  if (isList && space !== 'eco') {
    return space === 'cozy'
      ? { maxWidth: '48.75rem' }
      : { maxWidth: '63.75rem' };
  }
  return {};
};

const feedNameToHeading: Record<
  Exclude<
    FeedPagesWithMobileLayoutType,
    | 'user-upvoted'
    | 'user-posts'
    | 'squads[handle]'
    | 'tags[tag]'
    | 'sources[source]'
    | 'search-bookmarks'
    | 'sources[source]/most-upvoted'
    | 'sources[source]/best-discussed'
    | 'tags[tag]/most-upvoted'
    | 'tags[tag]/best-discussed'
    | SharedFeedPage.Custom
    | SharedFeedPage.CustomForm
    | OtherFeedPage.Explore
    | OtherFeedPage.ExploreLatest
    | OtherFeedPage.ExploreUpvoted
    | OtherFeedPage.ExploreDiscussed
    | OtherFeedPage.Tags
    | OtherFeedPage.Sources
    | OtherFeedPage.Leaderboard
    | OtherFeedPage.FeedByIds
    | OtherFeedPage.Welcome
  >,
  string
> = {
  search: 'Search',
  'my-feed': 'For you',
  popular: 'Popular',
  upvoted: 'Most upvoted',
  discussed: 'Best discussions',
  bookmarks: 'Bookmarks',
};

export const FeedContainer = ({
  children,
  header,
  footer,
  className,
  inlineHeader = false,
  showSearch,
  shortcuts,
  actionButtons,
  isHorizontal,
  feedContainerRef,
}: FeedContainerProps): ReactElement => {
  const { isShortcutsV1 } = useShortcuts();
  const currentSettings = useContext(FeedContext);
  const { subject } = useToastNotification();
  const { spaciness, loadedSettings } = useContext(SettingsContext);
  const { shouldUseListFeedLayout, isListMode } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { feedName } = useActiveFeedNameContext();
  const { isAnyExplore, isExplorePopular, isExploreLatest } = useFeedName({
    feedName,
  });
  const router = useRouter();
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isList =
    (isHorizontal || isListMode) && !shouldUseListFeedLayout
      ? false
      : (isListMode && numCards > 1) || shouldUseListFeedLayout;
  const feedGapPx =
    getFeedGapPx[
      gapClass({
        isList,
        isFeedLayoutList: shouldUseListFeedLayout,
        space: spaciness,
      })
    ];
  const style = {
    '--num-cards': isHorizontal && isListMode && numCards >= 2 ? 2 : numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;
  const cardContainerStyle = { ...getStyle(isList, spaciness) };
  const isFinder = router.pathname === '/search/posts';
  const isSearch = showSearch && !isFinder;

  const { feeds } = useFeeds();

  const feedHeading = useMemo(() => {
    if (feedName === SharedFeedPage.Custom) {
      const customFeed = feeds?.edges.find(
        ({ node: feed }) =>
          feed.id === router.query.slugOrId ||
          feed.slug === router.query.slugOrId,
      )?.node;

      if (customFeed?.flags?.name) {
        return customFeed.flags.name;
      }
    }

    return feedNameToHeading[feedName] ?? '';
  }, [feeds, feedName, router.query.slugOrId]);

  if (!loadedSettings) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        'relative flex w-full flex-col laptopL:mx-auto',
        styles.container,
        className,
      )}
    >
      <div className="flex w-full flex-col laptopL:mx-auto" style={style}>
        {!inlineHeader && header}
        <div
          className={classNames(
            'relative mx-auto w-full',
            styles.feed,
            !isList && styles.cards,
          )}
          style={cardContainerStyle}
          aria-live={subject === ToastSubject.Feed ? 'assertive' : 'off'}
          data-testid="posts-feed"
        >
          {inlineHeader && header}
          {isSearch && !shouldUseListFeedLayout && (
            <span
              className={classNames(
                'flex flex-1 items-center',
                isShortcutsV1 ? 'flex-col-reverse' : 'flex-row',
              )}
            >
              {!!actionButtons && (
                <span className="mr-auto flex w-full flex-row gap-3 border-border-subtlest-tertiary pr-3 laptop:w-auto">
                  {actionButtons}
                </span>
              )}
              {shortcuts}
            </span>
          )}
          {shouldUseListFeedLayout && !isShortcutsV1 && shortcuts}
          <ConditionalWrapper
            condition={shouldUseListFeedLayout}
            wrapper={(child) => (
              <div
                className={classNames(
                  'flex flex-col rounded-16 border border-border-subtlest-tertiary tablet:mt-6',
                  isSearch && 'mt-6',
                  !isLaptop && '!mt-2 border-0',
                )}
              >
                <ConditionalWrapper
                  condition={isLaptop && (feedHeading || actionButtons)}
                  wrapper={(component) => (
                    <span className="flex w-full flex-row items-center justify-between px-6 py-4">
                      <strong className="typo-title3">{feedHeading}</strong>
                      <span className="flex flex-row gap-3">{component}</span>
                    </span>
                  )}
                >
                  {actionButtons || null}
                </ConditionalWrapper>
                {isShortcutsV1 && shortcuts}
                {child}
              </div>
            )}
          >
            <div
              className={classNames(
                'grid',
                !isLaptop && (isExplorePopular || isExploreLatest) && 'mt-4',
                isSearch && !shouldUseListFeedLayout && !isAnyExplore && 'mt-8',
                isHorizontal &&
                  'no-scrollbar snap-x snap-mandatory grid-flow-col overflow-x-scroll scroll-smooth',
                gapClass({
                  isList,
                  isFeedLayoutList: shouldUseListFeedLayout,
                  space: spaciness,
                }),
                cardClass({ isList, numberOfCards: numCards, isHorizontal }),
              )}
              ref={feedContainerRef}
            >
              {children}
            </div>
          </ConditionalWrapper>
          {footer}
        </div>
      </div>
    </div>
  );
};
