import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
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
  useConditionalFeature,
  FeedPagesWithMobileLayoutType,
  useViewSize,
  ViewSize,
} from '../../hooks';
import ConditionalWrapper from '../ConditionalWrapper';
import { useActiveFeedNameContext } from '../../contexts';
import { feature } from '../../lib/featureManagement';

export interface FeedContainerProps {
  children: ReactNode;
  forceCardMode?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  inlineHeader?: boolean;
  showSearch?: boolean;
  shortcuts?: ReactNode;
  actionButtons?: ReactNode;
  isHorizontal?: boolean;
  feedContainerRef?: React.RefObject<HTMLDivElement>;
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
  isFeedLayoutV1,
  space,
}: {
  isList: boolean;
  isFeedLayoutV1: boolean;
  space: Spaciness;
}): string => {
  if (isFeedLayoutV1) {
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
    | 'posts/[id]/similar'
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
  forceCardMode,
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
  const { value: isShortcutsV1 } = useConditionalFeature({
    feature: feature.onboardingMostVisited,
    shouldEvaluate: !!shortcuts,
  });
  const currentSettings = useContext(FeedContext);
  const { subject } = useToastNotification();
  const {
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { feedName } = useActiveFeedNameContext();
  const router = useRouter();
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const insaneMode = !forceCardMode && listMode;
  const isList = (insaneMode && numCards > 1) || shouldUseMobileFeedLayout;
  const feedGapPx =
    getFeedGapPx[
      gapClass({
        isList,
        isFeedLayoutV1: shouldUseMobileFeedLayout,
        space: spaciness,
      })
    ];
  const style = {
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;
  const cardContainerStyle = { ...getStyle(isList, spaciness) };
  const isFinder = router.pathname === '/search/posts';
  const isSearch = showSearch && !isFinder;

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
          {isSearch && !shouldUseMobileFeedLayout && (
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
          {shouldUseMobileFeedLayout && !isShortcutsV1 && shortcuts}
          <ConditionalWrapper
            condition={shouldUseMobileFeedLayout}
            wrapper={(child) => (
              <div
                className={classNames(
                  'flex flex-col rounded-16 border border-border-subtlest-tertiary tablet:mt-6',
                  isSearch && 'mt-6',
                  !isLaptop && '!mt-2 border-0',
                )}
              >
                <ConditionalWrapper
                  condition={
                    isLaptop && (feedNameToHeading[feedName] || actionButtons)
                  }
                  wrapper={(component) => (
                    <span className="flex w-full flex-row items-center justify-between px-6 py-4">
                      <strong className="typo-title3">
                        {feedNameToHeading[feedName] ?? ''}
                      </strong>
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
                isSearch && !shouldUseMobileFeedLayout && 'mt-8',
                isHorizontal &&
                  'no-scrollbar snap-x snap-mandatory grid-flow-col overflow-x-scroll scroll-smooth',
                gapClass({
                  isList,
                  isFeedLayoutV1: shouldUseMobileFeedLayout,
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
