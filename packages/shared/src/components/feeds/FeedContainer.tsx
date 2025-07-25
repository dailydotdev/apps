import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { Spaciness } from '../../graphql/settings';
import SettingsContext from '../../contexts/SettingsContext';
import FeedContext from '../../contexts/FeedContext';
import styles from '../Feed.module.css';
import type { FeedPagesWithMobileLayoutType } from '../../hooks';
import {
  useFeedLayout,
  ToastSubject,
  useToastNotification,
  useViewSize,
  ViewSize,
  useFeeds,
  useBoot,
} from '../../hooks';
import ConditionalWrapper from '../ConditionalWrapper';
import { useActiveFeedNameContext } from '../../contexts';
import { SharedFeedPage } from '../utilities';
import { useFeedName } from '../../hooks/feed/useFeedName';
import type { OtherFeedPage } from '../../lib/query';
import { isExtension } from '../../lib/func';
import { useInteractiveFeedContext } from '../../contexts/InteractiveFeedContext';
import { ProfileUploadBanner } from '../../features/profile/components/ProfileUploadBanner';
import { MarketingCtaVariant } from '../marketingCta/common';
import {
  uploadCvBgLaptop,
  uploadCvBgTablet,
  uploadCvBgMobile,
} from '../../lib/image';
import { useUploadCv } from '../../features/profile/hooks/useUploadCv';
import { TargetId } from '../../lib/log';

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
  showBriefCard?: boolean;
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
  Extract<
    FeedPagesWithMobileLayoutType,
    | SharedFeedPage.Search
    | SharedFeedPage.MyFeed
    | SharedFeedPage.Popular
    | SharedFeedPage.Upvoted
    | OtherFeedPage.Discussed
    | OtherFeedPage.Bookmarks
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
  showBriefCard,
}: FeedContainerProps): ReactElement => {
  const currentSettings = useContext(FeedContext);
  const { interactiveFeedExp } = useInteractiveFeedContext();
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

  const { getMarketingCta, clearMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.FeedBanner);
  const { onUpload, status, shouldShow } = useUploadCv({
    onUploadSuccess: () => clearMarketingCta(marketingCta.campaignId),
  });
  const shouldShowBanner = !!marketingCta && shouldShow;

  const clearMarketingCtaRef = useRef(clearMarketingCta);
  clearMarketingCtaRef.current = clearMarketingCta;

  useEffect(() => {
    // when the user has uploaded their cv already, but marketing tool does not know it
    if (!!marketingCta && !shouldShow) {
      clearMarketingCtaRef.current(marketingCta.campaignId);
    }
  }, [marketingCta, shouldShow]);

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
      {shouldShowBanner && (
        <div
          className={classNames(
            'laptop:px-0 laptop:pt-0',
            showBriefCard ? 'px-4' : 'tablet:px-4 tablet:pt-1',
          )}
        >
          <ProfileUploadBanner
            className={{
              container: classNames({
                'mb-0': isList,
                'mt-0 tablet:mt-4': !showBriefCard,
              }),
              image:
                isList && 'laptop:bottom-0 laptop:right-0 laptop:top-[unset]',
            }}
            status={status}
            onUpload={onUpload}
            onClose={() => clearMarketingCta(marketingCta.campaignId)}
            banner={{
              title: marketingCta?.flags?.title,
              description: marketingCta?.flags?.description,
              cover: {
                laptop: isList ? uploadCvBgTablet : uploadCvBgLaptop,
                tablet: uploadCvBgTablet,
                base: uploadCvBgMobile,
              },
            }}
            targetId={TargetId.Feed}
          />
        </div>
      )}
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
                isExtension ? 'flex-col-reverse' : 'flex-row',
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
                {isExtension && shortcuts}
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
                  'no-scrollbar snap-x snap-mandatory grid-flow-col overflow-x-scroll scroll-smooth py-2',
                gapClass({
                  isList,
                  isFeedLayoutList: shouldUseListFeedLayout,
                  space: spaciness,
                }),
                cardClass({ isList, numberOfCards: numCards, isHorizontal }),
                interactiveFeedExp && '!gap-3',
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
