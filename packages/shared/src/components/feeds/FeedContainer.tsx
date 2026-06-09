import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
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
import { ProfileUploadBanner } from '../../features/profile/components/ProfileUploadBanner';
import { MarketingCtaVariant } from '../marketing/cta/common';
import {
  uploadCvBgLaptop,
  uploadCvBgTablet,
  uploadCvBgMobile,
} from '../../lib/image';
import { useUploadCv } from '../../features/profile/hooks/useUploadCv';
import { TargetId } from '../../lib/log';
import { useHasIntroQuests } from '../../hooks/useHasIntroQuests';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

export interface FeedContainerProps {
  children: ReactNode;
  topContent?: ReactNode;
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
  disableListFrame?: boolean;
}

const listGapClass = 'gap-2';
const gridGapClass = 'gap-8';
const feedGapPx = {
  [listGapClass]: 8,
  [gridGapClass]: 32,
};

const cardListClass: Partial<Record<number, string>> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
};

type FeedGapClass = keyof typeof feedGapPx;

/**
 * Returns the appropriate gap class based on layout mode.
 */
export const gapClass = ({
  isList,
  isFeedLayoutList,
}: {
  isList: boolean;
  isFeedLayoutList: boolean;
}): string => {
  if (isFeedLayoutList) {
    return '';
  }
  return isList ? listGapClass : gridGapClass;
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
  return isList ? 'grid-cols-1' : cardListClass[numberOfCards] ?? 'grid-cols-1';
};

export const feedNameToHeading: Record<
  Extract<
    FeedPagesWithMobileLayoutType,
    | SharedFeedPage.Search
    | SharedFeedPage.MyFeed
    | SharedFeedPage.Popular
    | SharedFeedPage.Upvoted
    | OtherFeedPage.Discussed
    | OtherFeedPage.Following
  >,
  string
> = {
  search: 'Search',
  'my-feed': 'For you',
  popular: 'Popular',
  upvoted: 'Most upvoted',
  discussed: 'Best discussions',
  following: 'Following',
};

export const FeedContainer = ({
  children,
  topContent,
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
  disableListFrame = false,
}: FeedContainerProps): ReactElement => {
  const currentSettings = useContext(FeedContext);
  const { subject } = useToastNotification();
  const { loadedSettings } = useContext(SettingsContext);
  const { shouldUseListFeedLayout, isListMode } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;
  const { feedName } = useActiveFeedNameContext();
  const activeFeedName = feedName ?? SharedFeedPage.MyFeed;
  const { isAnyExplore, isExplorePopular, isExploreLatest } = useFeedName({
    feedName: activeFeedName,
  });
  const router = useRouter();
  const numCards = currentSettings.numCards.eco;
  const isList =
    (isHorizontal || isListMode) && !shouldUseListFeedLayout
      ? false
      : (isListMode && numCards > 1) || shouldUseListFeedLayout;
  const feedGapClass = gapClass({
    isList,
    isFeedLayoutList: shouldUseListFeedLayout,
  }) as FeedGapClass;
  const gapSizePx = feedGapPx[feedGapClass];
  const style = {
    '--num-cards': isHorizontal && isListMode && numCards >= 2 ? 2 : numCards,
    '--feed-gap': `${gapSizePx / 16}rem`,
  } as CSSProperties;
  const isFinder = router.pathname === '/search/posts';
  const isSearch = showSearch && !isFinder;

  const { feeds } = useFeeds();

  const feedHeading = useMemo(() => {
    if (activeFeedName === SharedFeedPage.Custom) {
      const customFeed = feeds?.edges.find(
        ({ node: feed }) =>
          feed.id === router.query.slugOrId ||
          feed.slug === router.query.slugOrId,
      )?.node;

      if (customFeed?.flags?.name) {
        return customFeed.flags.name;
      }
    }

    if (activeFeedName in feedNameToHeading) {
      return feedNameToHeading[
        activeFeedName as keyof typeof feedNameToHeading
      ];
    }

    return '';
  }, [activeFeedName, feeds, router.query.slugOrId]);

  const { getMarketingCta, clearMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.FeedBanner);
  const { onUpload, status, shouldShow } = useUploadCv({
    onUploadSuccess: () => {
      if (marketingCta) {
        clearMarketingCta(marketingCta.campaignId);
      }
    },
  });
  const shouldEvaluateBanner =
    !!marketingCta && shouldShow && activeFeedName === SharedFeedPage.MyFeed;
  const hasIntroQuests = useHasIntroQuests({
    shouldEvaluate: shouldEvaluateBanner,
  });
  const shouldShowBanner = shouldEvaluateBanner && !hasIntroQuests;

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
              image: isList
                ? 'laptop:bottom-0 laptop:right-0 laptop:top-[unset]'
                : undefined,
            }}
            status={status}
            onUpload={onUpload}
            onClose={() =>
              marketingCta && clearMarketingCta(marketingCta.campaignId)
            }
            banner={
              marketingCta?.flags?.title && marketingCta?.flags?.description
                ? {
                    title: marketingCta.flags.title,
                    description: marketingCta.flags.description,
                    cover: {
                      laptop: isList ? uploadCvBgTablet : uploadCvBgLaptop,
                      tablet: uploadCvBgTablet,
                      base: uploadCvBgMobile,
                    },
                  }
                : undefined
            }
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
          aria-live={subject === ToastSubject.Feed ? 'assertive' : 'off'}
          data-testid="posts-feed"
        >
          {inlineHeader && header}
          {topContent}
          {/* v2 hoists the shared page-header strip up to MainFeedLayout
              so it can sit outside `FeedPageLayoutList`'s 680px width
              clamp and span the full floating-card width. Non-v2 keeps
              its in-container search header strip here. */}
          {!isV2Laptop && isSearch && !shouldUseListFeedLayout && (
            <header
              className={classNames(
                'flex items-center',
                isExtension && 'flex-1 flex-col-reverse',
                !isExtension && 'flex-1 flex-row',
              )}
            >
              {!!actionButtons && (
                <span className="mr-auto flex w-full flex-row gap-3 border-border-subtlest-tertiary">
                  {actionButtons}
                </span>
              )}
              {shortcuts}
            </header>
          )}
          <ConditionalWrapper
            condition={shouldUseListFeedLayout}
            wrapper={(child) => (
              <div
                className={classNames(
                  'flex flex-col',
                  // v2 drops the outside border around the list-frame so
                  // the cards sit directly inside the floating card with
                  // a single frame; legacy layout keeps the rounded
                  // bordered box around the list.
                  !disableListFrame &&
                    !isV2Laptop &&
                    'rounded-16 border border-border-subtlest-tertiary tablet:mt-6',
                  // v2-only: swap the list-card top separator token to
                  // match the floating-card / card hierarchy.
                  !disableListFrame &&
                    isV2Laptop &&
                    '[&_article]:!border-border-subtlest-quaternary',
                  !disableListFrame && isSearch && !isV2Laptop && 'mt-6',
                  !disableListFrame && !isLaptop && '!mt-2 border-0',
                )}
              >
                {!isV2Laptop && (
                  <ConditionalWrapper
                    condition={isLaptop && !!(feedHeading || actionButtons)}
                    wrapper={(component) => (
                      <span className="flex w-full flex-row items-center justify-between px-6 py-4">
                        <strong className="typo-title3">{feedHeading}</strong>
                        <span className="flex flex-row gap-3">{component}</span>
                      </span>
                    )}
                  >
                    {actionButtons || null}
                  </ConditionalWrapper>
                )}
                {isExtension && shortcuts}
                {child}
              </div>
            )}
          >
            <div
              className={classNames(
                'grid',
                // v2: inset the grid so cards sit off the floating-card
                // rounded edges + swap card borders to the lighter
                // quaternary token (matches the floating-card frame so
                // we get a clean frame → list-frame → cards hierarchy
                // instead of two clashing layers). Scoped here so the
                // legacy grid layout keeps its current tokens.
                isV2Laptop &&
                  !shouldUseListFeedLayout &&
                  // Symmetric inset on every side — matches the designer
                  // mock. The page-header strip above sets its own
                  // bottom border, so cards sit p-6 inside the floating
                  // card on all four sides.
                  'tablet:p-2 laptop:p-6 [&_article:hover]:!border-border-subtlest-tertiary [&_article]:!border-border-subtlest-quaternary',
                shouldUseListFeedLayout && isLaptop && 'px-6 pt-4',
                !isLaptop && (isExplorePopular || isExploreLatest) && 'mt-4',
                // mt-8 is a legacy spacer below the search/action header;
                // v2 already enforces the gap via the grid's own `p-6`
                // inset (matches the left/right inset), so doubling up
                // here would push the first row 32px further down than
                // the cards sit from the floating frame's left edge.
                isSearch &&
                  !shouldUseListFeedLayout &&
                  !isAnyExplore &&
                  !isV2Laptop &&
                  'mt-8',
                isHorizontal &&
                  'no-scrollbar snap-x snap-mandatory grid-flow-col overflow-x-scroll scroll-smooth py-2 pt-5',
                gapClass({
                  isList,
                  isFeedLayoutList: shouldUseListFeedLayout,
                }),
                cardClass({
                  isList,
                  numberOfCards: numCards,
                  isHorizontal: isHorizontal ?? false,
                }),
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
