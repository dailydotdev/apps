import type { MouseEvent, ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  ArenaTab,
  RankedTool,
  SentimentHighlightItem,
} from '@dailydotdev/shared/src/features/agents/arena/types';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { RelativeTime } from '@dailydotdev/shared/src/components/utilities/RelativeTime';
import { BriefCardFeed } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardFeed';
import { TopHero } from '@dailydotdev/shared/src/components/banners/HeroBottomBanner';
import {
  ArrowIcon,
  DiscussIcon,
  DownvoteIcon,
  MenuIcon,
  RefreshIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { useScrollManagement } from '@dailydotdev/shared/src/components/HorizontalScroll/useScrollManagement';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  BriefContextProvider,
  useBriefContext,
} from '@dailydotdev/shared/src/components/cards/brief/BriefContext';
import { useReadingReminderHero } from '@dailydotdev/shared/src/hooks/notifications/useReadingReminderHero';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import InteractionCounter from '@dailydotdev/shared/src/components/InteractionCounter';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { UpvoteButtonIcon } from '@dailydotdev/shared/src/components/cards/common/UpvoteButtonIcon';
import { BookmarkButton } from '@dailydotdev/shared/src/components/buttons/BookmarkButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import { PostOptionButton } from '@dailydotdev/shared/src/features/posts/PostOptionButton';
import { ClickbaitShield } from '@dailydotdev/shared/src/components/cards/common/ClickbaitShield';
import { useSmartTitle } from '@dailydotdev/shared/src/hooks/post/useSmartTitle';
import { PostModalMap } from '@dailydotdev/shared/src/components/Feed';
import { PostPosition } from '@dailydotdev/shared/src/hooks/usePostModalNavigation';
import { PostContentReminder } from '@dailydotdev/shared/src/components/post/common/PostContentReminder';
import { briefingUrl, plusUrl } from '@dailydotdev/shared/src/lib/constants';
import { AgentsHighlightsSection } from '../agents/AgentsHighlightsSection';
import { AgentsLeaderboardSection } from '../agents/AgentsLeaderboardSection';
import { ExploreSocialStrips } from './ExploreSocialStrips';
import AgenticTopicClusterSection from './AgenticTopicClusterSection';
import { ExploreQuickActionsSection } from './ExploreQuickActionsSection';
import type { ExploreCategoryId } from './exploreCategories';
import { EXPLORE_CATEGORIES } from './exploreCategories';
import { useExplorePostActionCallbacks } from './useExplorePostActionCallbacks';
import {
  getExploreCommunityAuthorMeta,
  getExploreStoryTitle,
} from './exploreStoryHelpers';
import type { ExploreStory } from './exploreTypes';
import { ExploreTopCommentChip } from './ExploreTopCommentChip';
import { ExploreTopNewsHeader } from './ExploreTopNewsHeader';
import { NewExploreLayoutBanner } from './NewExploreLayoutBanner';

export type { ExploreStory } from './exploreTypes';

interface StorySection {
  id: string;
  title: string;
  href: string;
  stories: ExploreStory[];
  totalStoriesCount: number;
}

/** Matches {@link StorySectionBlock} sponsored-row merge (latest vs popular tail length). */
function mergeSponsoredIntoSectionStories(
  sectionStories: ExploreStory[],
  sponsoredStory: ExploreStory | null | undefined,
  isLatestSection: boolean,
): ExploreStory[] {
  if (!sponsoredStory) {
    return sectionStories;
  }

  const nonSponsoredStories = sectionStories.filter(
    (story) => story.id !== sponsoredStory.id,
  );

  return [
    nonSponsoredStories[0],
    sponsoredStory,
    ...nonSponsoredStories.slice(1, isLatestSection ? 4 : 6),
  ].filter(Boolean) as ExploreStory[];
}

function getStoryIdsFromMergedSection(
  sectionStories: ExploreStory[],
  sponsoredStory: ExploreStory | null | undefined,
  isLatestSection: boolean,
): Set<string> {
  const merged = mergeSponsoredIntoSectionStories(
    sectionStories,
    sponsoredStory,
    isLatestSection,
  );
  const capped = isLatestSection ? merged.slice(0, 5) : merged;

  return new Set(capped.map((story) => story.id));
}

function addIdsToSet(target: Set<string>, ids: Iterable<string>): void {
  Array.from(ids).forEach((id) => {
    target.add(id);
  });
}

/** Must stay aligned with `getFeedQueryKey` in `ExplorePageContent.tsx`. */
const getExploreFeedQueryKey = (
  categoryId: ExploreCategoryId,
  section: 'latest' | 'popular' | 'upvoted' | 'discussed',
) => ['explore', categoryId, section] as const;

interface ExploreNewsLayoutProps {
  activeTabId: ExploreCategoryId;
  highlightsLoading: boolean;
  highlights: PostHighlight[];
  digestSource?: Source | null;
  latestStories: ExploreStory[];
  popularStories: ExploreStory[];
  upvotedStories: ExploreStory[];
  discussedStories: ExploreStory[];
  videoLatestStories: ExploreStory[];
  videoPopularStories: ExploreStory[];
  videoUpvotedStories: ExploreStory[];
  videoDiscussedStories: ExploreStory[];
  arenaTools: RankedTool[];
  arenaLoading: boolean;
  arenaTab: ArenaTab;
  onArenaTabChange?: (tab: ArenaTab) => void;
  arenaHighlightsItems: SentimentHighlightItem[];
  categoryClusterStories?: Partial<Record<ExploreCategoryId, ExploreStory[]>>;
}

const PersonMeta = ({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}): ReactElement => (
  <span className="flex min-w-0 items-center gap-1.5">
    {image ? (
      <img
        src={image}
        alt={name}
        className="h-4 w-4 rounded-full object-cover"
      />
    ) : (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold uppercase text-text-tertiary">
        {name.charAt(0)}
      </span>
    )}
    <span className="min-w-0 flex-1 truncate">{name}</span>
  </span>
);

const metaFromSource = (
  story: ExploreStory,
  source: Pick<Source, 'name' | 'image'> | undefined | null,
): { name: string; image?: string | null } | null => {
  if (!source?.name) {
    return null;
  }

  if (source.name === 'Community Picks') {
    return getExploreCommunityAuthorMeta(story);
  }

  return { name: source.name, image: source.image };
};

const metaFromCollectionSources = (
  story: ExploreStory,
): { name: string; image?: string | null } | null => {
  const first = story.collectionSources?.[0];
  if (!first) {
    return null;
  }

  const name = first.name?.trim() || first.handle || null;
  if (!name) {
    return null;
  }

  return { name, image: first.image };
};

const getStoryOriginInfo = (
  story: ExploreStory,
): { name: string; image?: string | null } | null =>
  metaFromSource(story, story.source) ??
  metaFromSource(story, story.sharedPost?.source) ??
  getExploreCommunityAuthorMeta(story) ??
  metaFromCollectionSources(story);

const hasStoryOrigin = (
  story: ExploreStory,
  sourceLabelOverride?: string,
  sourceFallbackLabel?: string,
): boolean =>
  Boolean(
    sourceLabelOverride || getStoryOriginInfo(story) || sourceFallbackLabel,
  );

const StoryOriginMeta = ({
  story,
  sourceLabelOverride,
  sourceFallbackLabel,
}: {
  story: ExploreStory;
  sourceLabelOverride?: string;
  sourceFallbackLabel?: string;
}): ReactElement | null => {
  if (sourceLabelOverride) {
    return (
      <span className="block min-w-0 truncate">{sourceLabelOverride}</span>
    );
  }

  const originInfo = getStoryOriginInfo(story);

  if (originInfo) {
    return <PersonMeta name={originInfo.name} image={originInfo.image} />;
  }

  if (sourceFallbackLabel) {
    return (
      <span className="block min-w-0 truncate">{sourceFallbackLabel}</span>
    );
  }

  return null;
};

/** Refresh + remove — headline/thumbnail remain the tap targets for the post. */
const ExploreAdPostActionRow = ({
  story,
  treatAsSponsored,
  onRefreshAd,
  isRefreshingAd,
}: {
  story: ExploreStory;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
  /** Sponsored explore slot may not include `flags.ad`; still use ad-style actions. */
  treatAsSponsored?: boolean;
  onRefreshAd?: () => void | Promise<void>;
  isRefreshingAd?: boolean;
}): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  const digestAd = story.flags?.ad;
  const showAdActions = !!digestAd || !!treatAsSponsored;

  const removeAdsMenuOptions = useMemo(
    () => [
      {
        label: 'Remove ads',
        anchorProps: {
          href: plusUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          onClick: () => {
            logSubscriptionEvent({
              event_name: LogEvent.UpgradeSubscription,
              target_id: TargetId.Ads,
            });
          },
        },
      },
    ],
    [logSubscriptionEvent],
  );

  if (!showAdActions) {
    throw new Error('ExploreAdPostActionRow: expected ad or sponsored story');
  }

  return (
    <div className="explore-post-actions mt-1 flex w-full min-w-0 flex-wrap items-center justify-start gap-1">
      {!!onRefreshAd && (
        <QuaternaryButton
          className="pointer-events-auto"
          id={`post-${story.id}-refresh-ad-btn`}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          type="button"
          icon={<RefreshIcon size={IconSize.XSmall} />}
          loading={isRefreshingAd}
          aria-label="Refresh ad"
          onClick={() => {
            Promise.resolve(onRefreshAd()).catch(() => null);
          }}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild tooltip={{ content: 'More options' }}>
          <Button
            id={`post-${story.id}-ad-more-btn`}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            type="button"
            className="pointer-events-auto"
            icon={<MenuIcon size={IconSize.XSmall} />}
            aria-label="More options"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuOptions options={removeAdsMenuOptions} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const StoryRow = ({
  story,
  sourceLabelOverride,
  showEngagement = true,
  isSponsored = false,
  imageOnRight = true,
  showEngagementIcons = false,
  sourceFallbackLabel,
  headlineMaxLines = 3,
  compactTopNews = false,
  showTopCommentChip = false,
  onOpenPostModal,
  onRefreshAd,
  isRefreshingAd,
}: {
  story: ExploreStory;
  sourceLabelOverride?: string;
  showEngagement?: boolean;
  isSponsored?: boolean;
  imageOnRight?: boolean;
  showEngagementIcons?: boolean;
  sourceFallbackLabel?: string;
  /** 2 = tighter rows under “More stories” sections */
  headlineMaxLines?: 2 | 3;
  /** Top-news column: no bottom border, no top padding per row */
  compactTopNews?: boolean;
  /** Top comment preview under actions (Popular section) */
  showTopCommentChip?: boolean;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
  onRefreshAd?: () => void | Promise<void>;
  isRefreshingAd?: boolean;
}): ReactElement => {
  const hasSourceMeta = hasStoryOrigin(
    story,
    sourceLabelOverride,
    sourceFallbackLabel,
  );
  const storyPost = story as Post;
  const digestAd = story.flags?.ad;
  const isAdPost = !!digestAd || isSponsored;
  const hasStoryImage = !!story.image?.trim();
  const { onUpvoteClick, onDownvoteClick, onBookmarkClick } =
    useExplorePostActionCallbacks();
  const isUpvoteActive = story.userState?.vote === UserVote.Up;
  const isDownvoteActive = story.userState?.vote === UserVote.Down;
  const upvoteCount = story.numUpvotes ?? 0;
  const commentCount = story.numComments ?? 0;
  const { title: smartTitle } = useSmartTitle(storyPost);
  const displayTitle = smartTitle?.trim() || getExploreStoryTitle(story);
  const showClickbaitShield = !isAdPost && !!story.clickbaitTitleDetected;

  return (
    <article
      className={
        compactTopNews
          ? 'group flex items-start gap-3 pb-2.5 pt-0 last:pb-0'
          : 'group flex items-start gap-3 border-b border-border-subtlest-tertiary py-2.5'
      }
    >
      {hasStoryImage && (
        <Link href={story.commentsPermalink}>
          <a
            href={story.commentsPermalink}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-surface-float ${
              imageOnRight ? 'order-2' : ''
            }`}
            onClick={(event) => onOpenPostModal?.(storyPost, event)}
          >
            <img
              src={story.image}
              alt={getExploreStoryTitle(story)}
              className="h-full w-full object-cover"
            />
          </a>
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <Link href={story.commentsPermalink}>
          <a
            href={story.commentsPermalink}
            onClick={(event) => onOpenPostModal?.(storyPost, event)}
          >
            <p
              className={
                headlineMaxLines === 2
                  ? 'line-clamp-2 text-text-primary transition-colors typo-callout'
                  : 'line-clamp-3 text-text-primary transition-colors typo-callout'
              }
              style={{ fontSize: '17px' }}
            >
              {displayTitle}
            </p>
          </a>
        </Link>
        <div
          className="mt-2 flex min-w-0 flex-wrap items-center gap-1 text-text-tertiary typo-caption2"
          style={{ fontSize: '13px' }}
        >
          {isSponsored ? (
            <span className="flex min-w-0 max-w-full flex-wrap items-center gap-1">
              <StoryOriginMeta
                story={story}
                sourceLabelOverride={sourceLabelOverride}
                sourceFallbackLabel={sourceFallbackLabel}
              />
              {hasSourceMeta && <span aria-hidden>•</span>}
              <span>Sponsored</span>
            </span>
          ) : (
            <>
              <span className="flex min-w-0 max-w-full items-center gap-1">
                <StoryOriginMeta
                  story={story}
                  sourceLabelOverride={sourceLabelOverride}
                  sourceFallbackLabel={sourceFallbackLabel}
                />
                {hasSourceMeta && !!story.createdAt && (
                  <span aria-hidden>•</span>
                )}
                {!!story.createdAt && (
                  <span className="shrink-0">
                    <RelativeTime dateTime={story.createdAt} />
                  </span>
                )}
                {showClickbaitShield && <ClickbaitShield post={storyPost} />}
              </span>
              {!showEngagementIcons && showEngagement && !!story.numUpvotes && (
                <>
                  <span aria-hidden>•</span>
                  <span>{story.numUpvotes} upvotes</span>
                </>
              )}
              {!showEngagementIcons &&
                showEngagement &&
                !!story.numComments && (
                  <>
                    <span aria-hidden>•</span>
                    <span>{story.numComments} comments</span>
                  </>
                )}
            </>
          )}
        </div>
        {isAdPost ? (
          <ExploreAdPostActionRow
            story={story}
            onOpenPostModal={onOpenPostModal}
            treatAsSponsored={isSponsored && !digestAd}
            onRefreshAd={onRefreshAd}
            isRefreshingAd={isRefreshingAd}
          />
        ) : (
          <div className="explore-post-actions mt-1 flex min-w-0 flex-wrap items-center gap-1">
            <QuaternaryButton
              labelClassName="!pl-0"
              className="btn-tertiary-avocado pointer-events-auto"
              id={`post-${story.id}-upvote-btn`}
              color={ButtonColor.Avocado}
              pressed={isUpvoteActive}
              onClick={() => onUpvoteClick(storyPost)}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={
                <UpvoteButtonIcon
                  secondary={isUpvoteActive}
                  size={IconSize.XSmall}
                />
              }
            >
              {upvoteCount > 0 && (
                <InteractionCounter
                  className="tabular-nums"
                  value={upvoteCount}
                />
              )}
            </QuaternaryButton>
            <QuaternaryButton
              className="pointer-events-auto"
              id={`post-${story.id}-downvote-btn`}
              color={ButtonColor.Ketchup}
              icon={
                <DownvoteIcon
                  secondary={isDownvoteActive}
                  size={IconSize.XSmall}
                />
              }
              pressed={isDownvoteActive}
              onClick={() => {
                onDownvoteClick(storyPost).catch(() => null);
              }}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
            />
            <QuaternaryButton
              labelClassName="!pl-0"
              id={`post-${story.id}-comment-btn`}
              className="btn-tertiary-blueCheese pointer-events-auto"
              color={ButtonColor.BlueCheese}
              tag="a"
              href={story.commentsPermalink}
              onClick={(event: MouseEvent<HTMLElement>) =>
                onOpenPostModal?.(storyPost, event)
              }
              pressed={story.commented}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={
                <DiscussIcon
                  secondary={story.commented}
                  size={IconSize.XSmall}
                />
              }
            >
              {commentCount > 0 && (
                <InteractionCounter
                  className="tabular-nums"
                  value={commentCount}
                />
              )}
            </QuaternaryButton>
            <BookmarkButton
              post={storyPost}
              buttonProps={{
                id: `post-${story.id}-bookmark-btn`,
                onClick: () => onBookmarkClick(storyPost),
                size: ButtonSize.Small,
                className: 'btn-tertiary-bun pointer-events-auto',
                variant: ButtonVariant.Tertiary,
              }}
              iconSize={IconSize.XSmall}
            />
            <PostOptionButton
              post={storyPost}
              size={ButtonSize.Small}
              triggerClassName="[&_svg]:h-5 [&_svg]:w-5"
            />
          </div>
        )}
        {showTopCommentChip && !isAdPost && (
          <ExploreTopCommentChip
            postId={story.id}
            commentsPermalink={story.commentsPermalink}
            numComments={commentCount}
          />
        )}
        {!isAdPost && <PostContentReminder post={storyPost} className="mt-2" />}
      </div>
    </article>
  );
};

const ExplorePostActionRow = ({
  story,
  onOpenPostModal,
  onRefreshAd,
  isRefreshingAd,
}: {
  story: ExploreStory;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
  onRefreshAd?: () => void | Promise<void>;
  isRefreshingAd?: boolean;
}): ReactElement => {
  const storyPost = story as Post;
  const digestAd = story.flags?.ad;
  const { onUpvoteClick, onDownvoteClick, onBookmarkClick } =
    useExplorePostActionCallbacks();
  const isUpvoteActive = story.userState?.vote === UserVote.Up;
  const isDownvoteActive = story.userState?.vote === UserVote.Down;
  const upvoteCount = story.numUpvotes ?? 0;
  const commentCount = story.numComments ?? 0;

  if (digestAd) {
    return (
      <ExploreAdPostActionRow
        story={story}
        onOpenPostModal={onOpenPostModal}
        onRefreshAd={onRefreshAd}
        isRefreshingAd={isRefreshingAd}
      />
    );
  }

  return (
    <>
      <div className="explore-post-actions mt-1 flex min-w-0 flex-wrap items-center gap-1">
        <QuaternaryButton
          labelClassName="!pl-0"
          className="btn-tertiary-avocado pointer-events-auto"
          id={`post-${story.id}-upvote-btn`}
          color={ButtonColor.Avocado}
          pressed={isUpvoteActive}
          onClick={() => onUpvoteClick(storyPost)}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={
            <UpvoteButtonIcon
              secondary={isUpvoteActive}
              size={IconSize.XSmall}
            />
          }
        >
          {upvoteCount > 0 && (
            <InteractionCounter className="tabular-nums" value={upvoteCount} />
          )}
        </QuaternaryButton>
        <QuaternaryButton
          className="pointer-events-auto"
          id={`post-${story.id}-downvote-btn`}
          color={ButtonColor.Ketchup}
          icon={
            <DownvoteIcon secondary={isDownvoteActive} size={IconSize.XSmall} />
          }
          pressed={isDownvoteActive}
          onClick={() => {
            onDownvoteClick(storyPost).catch(() => null);
          }}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
        />
        <QuaternaryButton
          labelClassName="!pl-0"
          id={`post-${story.id}-comment-btn`}
          className="btn-tertiary-blueCheese pointer-events-auto"
          color={ButtonColor.BlueCheese}
          tag="a"
          href={story.commentsPermalink}
          onClick={(event: MouseEvent<HTMLElement>) =>
            onOpenPostModal?.(storyPost, event)
          }
          pressed={story.commented}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={
            <DiscussIcon secondary={story.commented} size={IconSize.XSmall} />
          }
        >
          {commentCount > 0 && (
            <InteractionCounter className="tabular-nums" value={commentCount} />
          )}
        </QuaternaryButton>
        <BookmarkButton
          post={storyPost}
          buttonProps={{
            id: `post-${story.id}-bookmark-btn`,
            onClick: () => onBookmarkClick(storyPost),
            size: ButtonSize.Small,
            className: 'btn-tertiary-bun pointer-events-auto',
            variant: ButtonVariant.Tertiary,
          }}
          iconSize={IconSize.XSmall}
        />
        <PostOptionButton
          post={storyPost}
          size={ButtonSize.Small}
          triggerClassName="[&_svg]:h-5 [&_svg]:w-5"
        />
      </div>
      <PostContentReminder post={storyPost} className="mt-2" />
    </>
  );
};

const StorySectionBlock = ({
  section,
  sponsoredStory,
  onOpenPostModal,
  domSectionId,
  onRefreshAd,
  isRefreshingAd,
}: {
  section: StorySection;
  sponsoredStory?: ExploreStory | null;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
  /** Avoid duplicate `id` when the same section type is rendered twice (e.g. two “More stories” columns). */
  domSectionId?: string;
  onRefreshAd?: () => void | Promise<void>;
  isRefreshingAd?: boolean;
}): ReactElement => {
  const isLatestSection = section.id === 'latest';
  const isPopularSection = section.id === 'popular';
  const isSponsoredSlotSection = isLatestSection || isPopularSection;

  let sectionPaddingClass = 'p-3 laptop:p-4';
  if (isLatestSection) {
    sectionPaddingClass =
      'pb-3 pl-0 pr-0 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-0 laptop:pt-0';
  } else if (isPopularSection) {
    sectionPaddingClass =
      'pb-3 pl-0 pr-0 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-0 laptop:pt-0';
  }

  const sectionBorderClass =
    isLatestSection || isPopularSection
      ? ''
      : 'border border-border-subtlest-tertiary';
  const sourceLabelOverride = undefined;
  const showEngagement = true;
  const storiesMerged = isSponsoredSlotSection
    ? mergeSponsoredIntoSectionStories(
        section.stories,
        sponsoredStory,
        isLatestSection,
      )
    : section.stories;
  const storiesToRender = isLatestSection
    ? storiesMerged.slice(0, 5)
    : storiesMerged;

  return (
    <section
      id={domSectionId ?? section.id}
      className={`my-4 h-full rounded-16 ${sectionPaddingClass} ${sectionBorderClass}`}
    >
      {isLatestSection && (
        <header className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-bold text-text-primary typo-title3">
            More stories
          </h2>
        </header>
      )}
      {!isLatestSection && !isPopularSection && (
        <header className="mb-2 flex items-center justify-between gap-3">
          <Link href={section.href}>
            <a className="text-text-primary transition-colors">
              <h2 className="font-bold typo-title3">{section.title}</h2>
            </a>
          </Link>
        </header>
      )}
      {storiesToRender.length > 0 ? (
        storiesToRender.map((story) => (
          <StoryRow
            key={story.id}
            story={story}
            sourceLabelOverride={sourceLabelOverride}
            showEngagement={showEngagement}
            showEngagementIcons
            headlineMaxLines={isSponsoredSlotSection ? 2 : 3}
            isSponsored={
              isSponsoredSlotSection && sponsoredStory?.id === story.id
            }
            showTopCommentChip={isPopularSection}
            onOpenPostModal={onOpenPostModal}
            onRefreshAd={onRefreshAd}
            isRefreshingAd={isRefreshingAd}
          />
        ))
      ) : (
        <p className="py-3 text-text-tertiary typo-callout">No stories yet.</p>
      )}
    </section>
  );
};

const CompactSectionBlock = ({
  section,
  onOpenPostModal,
  onRefreshAd,
  isRefreshingAd,
}: {
  section: StorySection;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
  onRefreshAd?: () => void | Promise<void>;
  isRefreshingAd?: boolean;
}): ReactElement => {
  const isUpvotedSection = section.id === 'upvoted';
  const isDiscussedSection = section.id === 'discussed';
  const isHighlightedCompactSection =
    section.id === 'upvoted' || section.id === 'discussed';
  const hasMoreStories = section.totalStoriesCount > section.stories.length;

  return (
    <section
      id={section.id}
      className={`rounded-16 p-3 laptop:p-4 ${
        isHighlightedCompactSection
          ? ''
          : 'border border-border-subtlest-tertiary'
      } ${isHighlightedCompactSection ? 'bg-surface-float' : ''}`}
    >
      <header className="mb-2 flex items-center justify-between gap-3">
        <Link href={section.href}>
          <a className="text-text-primary transition-colors">
            <h2 className="font-bold typo-title3">{section.title}</h2>
          </a>
        </Link>
      </header>
      {section.stories.length > 0 ? (
        section.stories.map((story, index) => (
          <div
            key={story.id}
            className={
              index === section.stories.length - 1
                ? ''
                : 'mb-2 border-b border-border-subtlest-tertiary'
            }
          >
            {isUpvotedSection || isDiscussedSection ? (
              <Link href={story.commentsPermalink}>
                <a
                  href={story.commentsPermalink}
                  className="flex items-start gap-3 py-2"
                  onClick={(event) => onOpenPostModal?.(story as Post, event)}
                >
                  {isUpvotedSection && (
                    <span className="flex w-8 shrink-0 flex-col items-center self-start text-accent-avocado-default">
                      <UpvoteIcon size={IconSize.Small} />
                      <span className="text-[1rem] font-bold leading-none typo-caption2">
                        {story.numUpvotes ?? 0}
                      </span>
                    </span>
                  )}
                  {isDiscussedSection && (
                    <span className="flex w-8 shrink-0 flex-col items-center self-start text-accent-blueCheese-default">
                      <DiscussIcon size={IconSize.Small} />
                      <span className="text-[1rem] font-bold leading-none typo-caption2">
                        {story.numComments ?? 0}
                      </span>
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="line-clamp-3 text-text-primary transition-colors typo-callout"
                      style={{ fontSize: '15px' }}
                    >
                      {getExploreStoryTitle(story)}
                    </p>
                    <div
                      className="mt-2 flex min-w-0 items-center gap-1 text-text-tertiary typo-caption2"
                      style={{ fontSize: '13px' }}
                    >
                      <StoryOriginMeta story={story} />
                      {hasStoryOrigin(story) && !!story.createdAt && (
                        <span aria-hidden>•</span>
                      )}
                      {!!story.createdAt && (
                        <span className="shrink-0">
                          <RelativeTime dateTime={story.createdAt} />
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            ) : (
              <StoryRow
                story={story}
                showEngagement
                showEngagementIcons
                onRefreshAd={onRefreshAd}
                isRefreshingAd={isRefreshingAd}
              />
            )}
          </div>
        ))
      ) : (
        <p className="py-2 text-text-tertiary typo-callout">No stories yet.</p>
      )}
      {hasMoreStories && (
        <Link href={section.href}>
          <a className="active:opacity-80 -mx-3 -mb-3 block border-t border-border-subtlest-tertiary px-4 py-3 text-center font-bold text-text-secondary typo-callout laptop:-mx-4 laptop:-mb-4 laptopL:hidden">
            Show all
          </a>
        </Link>
      )}
    </section>
  );
};

const MoreStoriesStrip = ({
  stories,
  onOpenPostModal,
  onRefreshAd,
  isRefreshingAd,
}: {
  stories: ExploreStory[];
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
  onRefreshAd?: () => void | Promise<void>;
  isRefreshingAd?: boolean;
}): ReactElement | null => {
  if (!stories.length) {
    return null;
  }

  return (
    <section id="more-stories-strip" className="my-4">
      <div className="rounded-16 pb-3 pl-0 pr-0 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-0 laptop:pt-0">
        {stories.map((story) => (
          <StoryRow
            key={story.id}
            story={story}
            showEngagement
            showEngagementIcons
            headlineMaxLines={2}
            onOpenPostModal={onOpenPostModal}
            onRefreshAd={onRefreshAd}
            isRefreshingAd={isRefreshingAd}
          />
        ))}
      </div>
    </section>
  );
};

const ReadingBriefStripInner = (): ReactElement => {
  const { brief } = useBriefContext();

  if (!brief) {
    return (
      <section id="reading-brief-strip" className="flex flex-col self-start">
        <BriefCardFeed
          targetId={TargetId.List}
          className={{
            container: '!p-0',
            card: '',
          }}
          showCloseButton={false}
          showBorder={false}
        />
      </section>
    );
  }

  return (
    <section
      id="reading-brief-strip"
      className="flex h-full flex-col rounded-16 border border-border-subtlest-tertiary p-3 laptop:p-4"
    >
      <header className="mb-2">
        <h2 className="font-bold text-text-primary typo-title3">
          Reading brief
        </h2>
      </header>
      <p className="text-text-tertiary typo-callout">
        A quick, high-signal recap tailored for you.
      </p>
      <div className="mt-3 flex min-h-0 grow">
        <BriefCardFeed
          targetId={TargetId.List}
          className={{
            container: '!h-full !p-0',
            card: 'h-full',
          }}
          showCloseButton={false}
          showBorder={false}
        />
      </div>
      <Link href={briefingUrl}>
        <a className="active:opacity-80 block border-t border-border-subtlest-tertiary px-4 py-3 text-center font-bold text-text-secondary typo-callout laptopL:hidden">
          Open reading brief
        </a>
      </Link>
    </section>
  );
};

const ReadingBriefStrip = (): ReactElement => {
  return (
    <BriefContextProvider>
      <ReadingBriefStripInner />
    </BriefContextProvider>
  );
};

export const ExploreNewsLayout = ({
  activeTabId,
  highlightsLoading,
  highlights,
  digestSource,
  latestStories,
  popularStories,
  upvotedStories,
  discussedStories,
  videoLatestStories,
  videoPopularStories,
  videoUpvotedStories,
  videoDiscussedStories,
  arenaTools,
  arenaLoading,
  arenaTab,
  onArenaTabChange,
  arenaHighlightsItems,
  categoryClusterStories,
}: ExploreNewsLayoutProps): ReactElement => {
  const queryClient = useQueryClient();
  const [isRefreshingExploreAds, setIsRefreshingExploreAds] = useState(false);
  const [categoriesScroller, setCategoriesScroller] =
    useState<HTMLDivElement | null>(null);
  const { isAtStart: isCategoriesAtStart, isAtEnd: isCategoriesAtEnd } =
    useScrollManagement(categoriesScroller);
  const showCategoriesScrollHint = !!categoriesScroller && !isCategoriesAtEnd;
  const showCategoriesScrollHintLeft =
    !!categoriesScroller && !isCategoriesAtStart;
  const onScrollCategoriesRight = useCallback(() => {
    if (!categoriesScroller) {
      return;
    }
    categoriesScroller.scrollBy({
      left: categoriesScroller.clientWidth * 0.8,
      behavior: 'smooth',
    });
  }, [categoriesScroller]);
  const onScrollCategoriesLeft = useCallback(() => {
    if (!categoriesScroller) {
      return;
    }
    categoriesScroller.scrollBy({
      left: -categoriesScroller.clientWidth * 0.8,
      behavior: 'smooth',
    });
  }, [categoriesScroller]);

  const onRefreshExploreAds = useCallback(async () => {
    setIsRefreshingExploreAds(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: getExploreFeedQueryKey(activeTabId, 'latest'),
        }),
        queryClient.refetchQueries({
          queryKey: getExploreFeedQueryKey(activeTabId, 'popular'),
        }),
        queryClient.refetchQueries({
          queryKey: getExploreFeedQueryKey(activeTabId, 'upvoted'),
        }),
        queryClient.refetchQueries({
          queryKey: getExploreFeedQueryKey(activeTabId, 'discussed'),
        }),
      ]);
    } finally {
      setIsRefreshingExploreAds(false);
    }
  }, [activeTabId, queryClient]);

  const isVideosMode = activeTabId === 'videos';
  const isExplorePage = activeTabId === 'explore';
  const showExploreOnlySections = isExplorePage;
  const {
    shouldShow: shouldShowReadingReminderHero,
    title: readingReminderTitle,
    subtitle: readingReminderSubtitle,
    onEnable: onEnableReadingReminder,
    onDismiss: onDismissReadingReminder,
  } = useReadingReminderHero({ requireMobile: false });

  const latestStoriesForView = useMemo(
    () => (isVideosMode ? videoLatestStories : latestStories),
    [isVideosMode, latestStories, videoLatestStories],
  );
  const popularStoriesForView = useMemo(
    () => (isVideosMode ? videoPopularStories : popularStories),
    [isVideosMode, popularStories, videoPopularStories],
  );
  const upvotedStoriesForView = useMemo(
    () => (isVideosMode ? videoUpvotedStories : upvotedStories),
    [isVideosMode, upvotedStories, videoUpvotedStories],
  );
  const discussedStoriesForView = useMemo(
    () => (isVideosMode ? videoDiscussedStories : discussedStories),
    [isVideosMode, discussedStories, videoDiscussedStories],
  );

  const videoHighlights = useMemo<PostHighlight[]>(() => {
    if (!isVideosMode) {
      return [];
    }

    const merged = [
      ...latestStoriesForView,
      ...popularStoriesForView,
      ...upvotedStoriesForView,
      ...discussedStoriesForView,
    ];
    const uniqueStories = Array.from(
      new Map(merged.map((story) => [story.id, story])).values(),
    );

    return uniqueStories.slice(0, 10).map((story) => ({
      channel: 'videos',
      headline: getExploreStoryTitle(story),
      highlightedAt: story.createdAt ?? new Date(0).toISOString(),
      post: {
        id: story.id,
        commentsPermalink: story.commentsPermalink,
      },
    }));
  }, [
    isVideosMode,
    latestStoriesForView,
    popularStoriesForView,
    upvotedStoriesForView,
    discussedStoriesForView,
  ]);

  const leadStory = useMemo(() => {
    const hasImage = (s: ExploreStory) => !!s.image?.trim();
    return (
      latestStoriesForView.find(hasImage) ??
      popularStoriesForView.find(hasImage) ??
      latestStoriesForView[0] ??
      popularStoriesForView[0] ??
      null
    );
  }, [latestStoriesForView, popularStoriesForView]);
  const latestStoriesAfterLead = useMemo(
    () => latestStoriesForView.filter((story) => story.id !== leadStory?.id),
    [latestStoriesForView, leadStory?.id],
  );
  const sponsoredStory = useMemo<ExploreStory | null>(() => {
    const candidates = [
      ...latestStoriesForView,
      ...popularStoriesForView,
      ...upvotedStoriesForView,
      ...discussedStoriesForView,
    ];
    const sponsoredCandidate = candidates.find((story) => !!story.flags?.ad);

    if (sponsoredCandidate) {
      return sponsoredCandidate;
    }

    return candidates.find((story) => story.id !== leadStory?.id) ?? null;
  }, [
    leadStory?.id,
    latestStoriesForView,
    popularStoriesForView,
    upvotedStoriesForView,
    discussedStoriesForView,
  ]);
  const sponsoredPopularStory = useMemo<ExploreStory | null>(() => {
    return popularStoriesForView.find((story) => !!story.flags?.ad) ?? null;
  }, [popularStoriesForView]);
  const topNewsStories = useMemo(() => {
    if (!sponsoredStory) {
      return latestStoriesAfterLead.slice(0, 4).map((story) => ({
        story,
        isSponsored: false,
      }));
    }

    const nonSponsoredStories = latestStoriesAfterLead.filter(
      (story) => story.id !== sponsoredStory.id,
    );
    const merged = [
      nonSponsoredStories[0],
      sponsoredStory,
      ...nonSponsoredStories.slice(1, 3),
    ].filter(Boolean) as ExploreStory[];

    return merged.slice(0, 4).map((story) => ({
      story,
      isSponsored: story.id === sponsoredStory.id,
    }));
  }, [latestStoriesAfterLead, sponsoredStory]);
  const latestSectionStoriesForList = useMemo(() => {
    const topIds = new Set(topNewsStories.map(({ story }) => story.id));

    return latestStoriesAfterLead
      .filter((story) => !topIds.has(story.id))
      .slice(0, 5);
  }, [latestStoriesAfterLead, topNewsStories]);
  const latestSection = useMemo<StorySection>(
    () => ({
      id: 'latest',
      title: 'Latest',
      href: '/posts/latest',
      stories: latestSectionStoriesForList,
      totalStoriesCount: latestStoriesForView.length,
    }),
    [latestSectionStoriesForList, latestStoriesForView.length],
  );
  const latestSectionSponsoredStory = useMemo(() => {
    if (!sponsoredStory) {
      return null;
    }

    if (topNewsStories.some(({ story }) => story.id === sponsoredStory.id)) {
      return null;
    }

    return sponsoredStory;
  }, [sponsoredStory, topNewsStories]);
  const latestRenderedIds = useMemo(
    () =>
      getStoryIdsFromMergedSection(
        latestSectionStoriesForList,
        latestSectionSponsoredStory,
        true,
      ),
    [latestSectionStoriesForList, latestSectionSponsoredStory],
  );
  const excludeBeforePopularPrimary = useMemo(() => {
    const next = new Set<string>();
    if (leadStory?.id) {
      next.add(leadStory.id);
    }
    addIdsToSet(
      next,
      topNewsStories.map(({ story }) => story.id),
    );
    addIdsToSet(next, latestRenderedIds);

    return next;
  }, [leadStory?.id, topNewsStories, latestRenderedIds]);
  const popularPrimarySponsored = useMemo(() => {
    if (
      !sponsoredPopularStory ||
      excludeBeforePopularPrimary.has(sponsoredPopularStory.id)
    ) {
      return null;
    }

    return sponsoredPopularStory;
  }, [sponsoredPopularStory, excludeBeforePopularPrimary]);
  const popularSectionPrimaryRaw = useMemo(
    () =>
      popularStoriesForView
        .filter((story) => !excludeBeforePopularPrimary.has(story.id))
        .slice(0, 5),
    [popularStoriesForView, excludeBeforePopularPrimary],
  );
  const popularPrimaryRenderedIds = useMemo(
    () =>
      getStoryIdsFromMergedSection(
        popularSectionPrimaryRaw,
        popularPrimarySponsored,
        false,
      ),
    [popularSectionPrimaryRaw, popularPrimarySponsored],
  );
  const popularSection = useMemo<StorySection>(
    () => ({
      id: 'popular',
      title: 'More stories',
      href: '/popular',
      stories: popularSectionPrimaryRaw,
      totalStoriesCount: popularStoriesForView.length,
    }),
    [popularSectionPrimaryRaw, popularStoriesForView.length],
  );
  const excludeBeforeUpvoted = useMemo(() => {
    const next = new Set(excludeBeforePopularPrimary);
    addIdsToSet(next, popularPrimaryRenderedIds);

    return next;
  }, [excludeBeforePopularPrimary, popularPrimaryRenderedIds]);
  const upvotedSection = useMemo<StorySection>(
    () => ({
      id: 'upvoted',
      title: 'Most Upvoted',
      href: '/upvoted',
      stories: upvotedStoriesForView
        .filter((story) => !excludeBeforeUpvoted.has(story.id))
        .slice(0, 6),
      totalStoriesCount: upvotedStoriesForView.length,
    }),
    [upvotedStoriesForView, excludeBeforeUpvoted],
  );
  const excludeBeforePopularSecondary = useMemo(() => {
    const next = new Set(excludeBeforeUpvoted);
    addIdsToSet(
      next,
      upvotedSection.stories.map((story) => story.id),
    );

    return next;
  }, [excludeBeforeUpvoted, upvotedSection.stories]);
  const popularSecondarySponsored = useMemo(() => {
    if (
      !sponsoredPopularStory ||
      excludeBeforePopularSecondary.has(sponsoredPopularStory.id)
    ) {
      return null;
    }

    return sponsoredPopularStory;
  }, [sponsoredPopularStory, excludeBeforePopularSecondary]);
  const popularSectionSecondaryRaw = useMemo(
    () =>
      popularStoriesForView
        .filter((story) => !excludeBeforePopularSecondary.has(story.id))
        .slice(0, 5),
    [popularStoriesForView, excludeBeforePopularSecondary],
  );
  const popularSecondaryRenderedIds = useMemo(
    () =>
      getStoryIdsFromMergedSection(
        popularSectionSecondaryRaw,
        popularSecondarySponsored,
        false,
      ),
    [popularSectionSecondaryRaw, popularSecondarySponsored],
  );
  const popularSectionSecondary = useMemo<StorySection>(
    () => ({
      id: 'popular',
      title: 'More stories',
      href: '/popular',
      stories: popularSectionSecondaryRaw,
      totalStoriesCount: popularStoriesForView.length,
    }),
    [popularSectionSecondaryRaw, popularStoriesForView.length],
  );
  const excludeBeforeDiscussed = useMemo(() => {
    const next = new Set(excludeBeforePopularSecondary);
    addIdsToSet(next, popularSecondaryRenderedIds);

    return next;
  }, [excludeBeforePopularSecondary, popularSecondaryRenderedIds]);
  const discussedSection = useMemo<StorySection>(
    () => ({
      id: 'discussed',
      title: 'Best Discussions',
      href: '/discussed',
      stories: discussedStoriesForView
        .filter((story) => !excludeBeforeDiscussed.has(story.id))
        .slice(0, 6),
      totalStoriesCount: discussedStoriesForView.length,
    }),
    [discussedStoriesForView, excludeBeforeDiscussed],
  );
  const moreStories = useMemo<ExploreStory[]>(() => {
    const displayedIds = new Set<string>();
    if (leadStory?.id) {
      displayedIds.add(leadStory.id);
    }
    addIdsToSet(
      displayedIds,
      topNewsStories.map(({ story }) => story.id),
    );
    addIdsToSet(displayedIds, latestRenderedIds);
    addIdsToSet(displayedIds, popularPrimaryRenderedIds);
    addIdsToSet(
      displayedIds,
      upvotedSection.stories.map((story) => story.id),
    );
    addIdsToSet(displayedIds, popularSecondaryRenderedIds);
    addIdsToSet(
      displayedIds,
      discussedSection.stories.map((story) => story.id),
    );
    if (sponsoredStory?.id) {
      displayedIds.add(sponsoredStory.id);
    }
    if (sponsoredPopularStory?.id) {
      displayedIds.add(sponsoredPopularStory.id);
    }

    const merged = [
      ...latestStoriesForView,
      ...popularStoriesForView,
      ...upvotedStoriesForView,
      ...discussedStoriesForView,
    ];
    const uniqueStories = Array.from(
      new Map(merged.map((story) => [story.id, story])).values(),
    );

    return uniqueStories
      .filter((story) => !displayedIds.has(story.id))
      .slice(0, 5);
  }, [
    leadStory?.id,
    latestRenderedIds,
    popularPrimaryRenderedIds,
    popularSecondaryRenderedIds,
    upvotedSection.stories,
    discussedSection.stories,
    sponsoredStory?.id,
    sponsoredPopularStory?.id,
    topNewsStories,
    latestStoriesForView,
    popularStoriesForView,
    upvotedStoriesForView,
    discussedStoriesForView,
  ]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const onOpenPostModal = useCallback(
    (post: Post, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      document.body.classList.add('hidden-scrollbar');
      setSelectedPost(post);
    },
    [],
  );

  const onClosePostModal = useCallback(() => {
    document.body.classList.remove('hidden-scrollbar');
    setSelectedPost(null);
  }, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
  }, []);

  const SelectedPostModal = selectedPost
    ? PostModalMap[selectedPost.type]
    : null;

  return (
    <main className="mx-auto flex w-full max-w-[72rem] flex-col gap-8 pb-8 pt-4 laptop:border-x laptop:border-border-subtlest-tertiary">
      <section
        id="explore"
        className="sticky top-16 z-rank isolate overflow-hidden bg-background-default px-3 transition-colors duration-200 laptop:px-8"
      >
        <div className="relative">
          <div
            ref={setCategoriesScroller}
            className="no-scrollbar relative flex items-center gap-7 overflow-x-auto py-2"
          >
            {EXPLORE_CATEGORIES.map((tab) => (
              <Link key={tab.id} href={tab.path}>
                <a
                  aria-current={tab.id === activeTabId ? 'page' : undefined}
                  className={
                    tab.id === activeTabId
                      ? 'hover:border-border-strong shrink-0 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-2.5 py-1.5 font-bold text-text-primary transition-colors typo-callout hover:bg-surface-hover'
                      : 'shrink-0 py-1.5 font-bold text-text-tertiary transition-colors typo-callout hover:text-text-primary'
                  }
                >
                  {tab.label}
                </a>
              </Link>
            ))}
          </div>
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 transition-opacity duration-200 ${
              showCategoriesScrollHintLeft ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              icon={<ArrowIcon className="-rotate-90 text-white" />}
              aria-label="Scroll categories left"
              tabIndex={showCategoriesScrollHintLeft ? 0 : -1}
              className={`pointer-events-auto bg-background-default shadow-2 ${
                showCategoriesScrollHintLeft ? '' : 'invisible'
              }`}
              onClick={onScrollCategoriesLeft}
            />
            <div className="pointer-events-none h-full w-12 bg-gradient-to-l from-transparent to-background-default" />
          </div>
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 transition-opacity duration-200 ${
              showCategoriesScrollHint ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="pointer-events-none h-full w-12 bg-gradient-to-r from-transparent to-background-default" />
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              icon={<ArrowIcon className="rotate-90 text-white" />}
              aria-label="Scroll categories right"
              tabIndex={showCategoriesScrollHint ? 0 : -1}
              className={`pointer-events-auto bg-background-default shadow-2 ${
                showCategoriesScrollHint ? '' : 'invisible'
              }`}
              onClick={onScrollCategoriesRight}
            />
          </div>
        </div>
      </section>

      <NewExploreLayoutBanner />

      <section id="top-news" className="w-full px-8 pb-6 pt-0 laptop:px-8">
        <ExploreTopNewsHeader activeTabId={activeTabId} />
        <div className="grid gap-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] laptop:gap-x-8">
          {leadStory ? (
            <article className="rounded-12 p-0">
              {!!leadStory.image?.trim() && (
                <Link href={leadStory.commentsPermalink}>
                  <a
                    href={leadStory.commentsPermalink}
                    className="focus-visible-outline group block rounded-12"
                    onClick={(event) =>
                      onOpenPostModal?.(leadStory as Post, event)
                    }
                  >
                    <img
                      src={leadStory.image}
                      alt={getExploreStoryTitle(leadStory)}
                      className="h-52 w-full rounded-12 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </a>
                </Link>
              )}
              <Link href={leadStory.commentsPermalink}>
                <a
                  href={leadStory.commentsPermalink}
                  className="focus-visible-outline group block rounded-12"
                  onClick={(event) =>
                    onOpenPostModal?.(leadStory as Post, event)
                  }
                >
                  <h3
                    className="mt-2 text-text-primary typo-callout"
                    style={{ fontSize: '17px' }}
                  >
                    {getExploreStoryTitle(leadStory)}
                  </h3>
                </a>
              </Link>
              <div
                className="mt-2 flex min-w-0 flex-wrap items-center gap-1 text-text-tertiary typo-caption2"
                style={{ fontSize: '13px' }}
              >
                <StoryOriginMeta story={leadStory} />
                {hasStoryOrigin(leadStory) &&
                  !!leadStory.createdAt &&
                  !leadStory.flags?.ad && <span aria-hidden>•</span>}
                {!!leadStory.createdAt && !leadStory.flags?.ad && (
                  <span className="shrink-0">
                    <RelativeTime dateTime={leadStory.createdAt} />
                  </span>
                )}
              </div>
              <ExplorePostActionRow
                story={leadStory}
                onOpenPostModal={onOpenPostModal}
                onRefreshAd={onRefreshExploreAds}
                isRefreshingAd={isRefreshingExploreAds}
              />
            </article>
          ) : (
            <div className="rounded-16 border border-border-subtlest-tertiary p-4">
              <p className="text-text-tertiary typo-callout">
                No lead story yet.
              </p>
            </div>
          )}
          <div className="p-0">
            {topNewsStories.map(({ story, isSponsored }) => (
              <StoryRow
                key={story.id}
                story={story}
                showEngagement
                showEngagementIcons
                headlineMaxLines={2}
                compactTopNews
                isSponsored={isSponsored}
                onOpenPostModal={onOpenPostModal}
                onRefreshAd={onRefreshExploreAds}
                isRefreshingAd={isRefreshingExploreAds}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 pb-6 laptop:px-8">
        <div className="grid items-start gap-x-10 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <StorySectionBlock
            section={latestSection}
            sponsoredStory={latestSectionSponsoredStory}
            onOpenPostModal={onOpenPostModal}
            onRefreshAd={onRefreshExploreAds}
            isRefreshingAd={isRefreshingExploreAds}
          />
          <div className="h-full">
            <AgentsHighlightsSection
              highlights={isVideosMode ? videoHighlights : highlights}
              loading={isVideosMode ? false : highlightsLoading}
              digestSource={digestSource}
            />
          </div>
        </div>
      </section>
      {isExplorePage && <ExploreQuickActionsSection />}

      <section className="px-8 pb-6 laptop:px-8">
        <div className="grid items-start gap-x-10 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <StorySectionBlock
            section={popularSection}
            sponsoredStory={popularPrimarySponsored}
            onOpenPostModal={onOpenPostModal}
            onRefreshAd={onRefreshExploreAds}
            isRefreshingAd={isRefreshingExploreAds}
          />
          <CompactSectionBlock
            section={upvotedSection}
            onOpenPostModal={onOpenPostModal}
            onRefreshAd={onRefreshExploreAds}
            isRefreshingAd={isRefreshingExploreAds}
          />
        </div>
      </section>
      {showExploreOnlySections && (
        <section className="px-8 pb-6 laptop:px-8">
          <div className="grid gap-x-10 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="laptop:col-span-2">
              <ExploreSocialStrips
                activeCategoryId={activeTabId}
                showTopSquads={false}
                showProgress
              />
            </div>
          </div>
        </section>
      )}
      <section className="px-8 pb-6 laptop:px-8">
        <div className="grid items-start gap-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] laptop:gap-x-10">
          <StorySectionBlock
            section={popularSectionSecondary}
            sponsoredStory={popularSecondarySponsored}
            domSectionId="explore-popular-secondary"
            onOpenPostModal={onOpenPostModal}
            onRefreshAd={onRefreshExploreAds}
            isRefreshingAd={isRefreshingExploreAds}
          />
          <CompactSectionBlock
            section={discussedSection}
            onOpenPostModal={onOpenPostModal}
            onRefreshAd={onRefreshExploreAds}
            isRefreshingAd={isRefreshingExploreAds}
          />
        </div>
      </section>
      <section className="px-8 pb-6 laptop:px-8">
        <ExploreSocialStrips
          activeCategoryId={activeTabId}
          showTopSquads
          showProgress={false}
        />
      </section>
      {showExploreOnlySections && (
        <>
          <section id="arena" className="px-8 pb-6 laptop:px-8">
            <AgentsLeaderboardSection
              tools={arenaTools}
              loading={arenaLoading}
              tab={arenaTab}
              onTabChange={onArenaTabChange}
              compact={false}
              highlightsItems={arenaHighlightsItems}
            />
          </section>
          <section className="px-8 pb-8 laptop:px-8">
            <ExploreSocialStrips
              activeCategoryId={activeTabId}
              showTopSquads={false}
              showTopTags
              showProgress={false}
            />
          </section>
        </>
      )}
      {isExplorePage && (
        <section className="px-8 pb-6 laptop:px-8">
          <div className="grid items-stretch gap-4 gap-x-10 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <MoreStoriesStrip
              stories={moreStories}
              onOpenPostModal={onOpenPostModal}
              onRefreshAd={onRefreshExploreAds}
              isRefreshingAd={isRefreshingExploreAds}
            />
            <ReadingBriefStrip />
          </div>
        </section>
      )}
      {showExploreOnlySections && (
        <section className="flex justify-center px-8 pb-6 laptop:px-8">
          <AgenticTopicClusterSection
            storiesByCategory={categoryClusterStories}
            onOpenPostModal={onOpenPostModal}
          />
        </section>
      )}
      {isExplorePage && shouldShowReadingReminderHero && (
        <section className="px-8 pb-6 laptop:px-8">
          <TopHero
            className="mb-0 pt-0"
            title={readingReminderTitle}
            subtitle={readingReminderSubtitle}
            onCtaClick={() => {
              onEnableReadingReminder().catch(() => null);
            }}
            onClose={() => {
              onDismissReadingReminder().catch(() => null);
            }}
          />
        </section>
      )}
      {selectedPost && SelectedPostModal && (
        <SelectedPostModal
          isOpen
          id={selectedPost.id}
          post={selectedPost}
          postPosition={PostPosition.Only}
          onPreviousPost={() => null}
          onNextPost={async () => null}
          onRequestClose={onClosePostModal}
        />
      )}
    </main>
  );
};
