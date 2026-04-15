import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import InteractionCounter from '@dailydotdev/shared/src/components/InteractionCounter';
import { BookmarkButton } from '@dailydotdev/shared/src/components/buttons/BookmarkButton';
import { PostOptionButton } from '@dailydotdev/shared/src/features/posts/PostOptionButton';
import { UpvoteButtonIcon } from '@dailydotdev/shared/src/components/cards/common/UpvoteButtonIcon';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import {
  DownvoteIcon,
  DiscussIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { RelativeTime } from '@dailydotdev/shared/src/components/utilities/RelativeTime';
import { PostContentReminder } from '@dailydotdev/shared/src/components/post/common/PostContentReminder';
import {
  EXPLORE_TOPIC_CLUSTER_CATEGORIES,
  type ExploreCategoryId,
} from './exploreCategories';
import type { ExploreStory } from './exploreTypes';
import {
  getExploreCommunityPickPublisher,
  getExploreStoryImage,
  getExploreStoryTitle,
} from './exploreStoryHelpers';
import { useExplorePostActionCallbacks } from './useExplorePostActionCallbacks';

interface ClusterStory {
  id: string;
  post?: ExploreStory;
  publisher: string;
  publisherImage?: string;
  title: string;
  href: string;
  publishedAt?: string;
  readTimeMinutes?: number | null;
  upvotes: number;
  comments: number;
  image?: string;
}

type TopicCluster = {
  id: string;
  topic: string;
  topicHref: string;
  featured: ClusterStory;
  related: ClusterStory[];
};

const mapToClusterStory = (story: ExploreStory): ClusterStory => {
  const isCommunityPick = story.source?.name === 'Community Picks';
  const communityPublisher = isCommunityPick
    ? getExploreCommunityPickPublisher(story)
    : null;

  return {
    id: story.id,
    post: story,
    publisher:
      communityPublisher?.name ||
      story.source?.name ||
      story.author?.name ||
      'Community',
    publisherImage:
      communityPublisher?.image ||
      story.source?.image ||
      story.author?.image ||
      undefined,
    title: getExploreStoryTitle(story),
    href: story.commentsPermalink,
    publishedAt: story.createdAt || undefined,
    readTimeMinutes: story.readTime ?? null,
    upvotes: story.numUpvotes ?? 0,
    comments: story.numComments ?? 0,
    image: getExploreStoryImage(story),
  };
};

const StoryMeta = ({
  publisher,
  publisherImage,
  publishedAt,
}: Pick<
  ClusterStory,
  'publisher' | 'publisherImage' | 'publishedAt'
>): ReactElement => (
  <p
    className="mt-2 flex min-w-0 flex-wrap items-center gap-1 text-text-tertiary typo-caption2"
    style={{ fontSize: '13px' }}
  >
    {publisherImage ? (
      <img
        src={publisherImage}
        alt={publisher}
        className="h-4 w-4 rounded-full object-cover"
      />
    ) : (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold uppercase text-text-tertiary">
        {publisher.charAt(0)}
      </span>
    )}
    <span className="max-w-[10rem] truncate laptop:max-w-[12rem]">
      {publisher}
    </span>
    {publishedAt && (
      <>
        <span aria-hidden>•</span>
        <RelativeTime dateTime={publishedAt} />
      </>
    )}
  </p>
);

const StoryActions = ({
  post,
  onOpenPostModal,
}: {
  post: ExploreStory;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
}): ReactElement => {
  const storyPost = post as Post;
  const { onUpvoteClick, onDownvoteClick, onBookmarkClick } =
    useExplorePostActionCallbacks();
  const isUpvoteActive = post.userState?.vote === UserVote.Up;
  const isDownvoteActive = post.userState?.vote === UserVote.Down;

  return (
    <>
      <div className="mt-1 flex items-center gap-1">
        <QuaternaryButton
          labelClassName="!pl-0"
          className="btn-tertiary-avocado pointer-events-auto"
          id={`post-${post.id}-upvote-btn`}
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
          {(post.numUpvotes ?? 0) > 0 && (
            <InteractionCounter
              className="tabular-nums"
              value={post.numUpvotes ?? 0}
            />
          )}
        </QuaternaryButton>
        <QuaternaryButton
          className="pointer-events-auto"
          id={`post-${post.id}-downvote-btn`}
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
          id={`post-${post.id}-comment-btn`}
          className="btn-tertiary-blueCheese pointer-events-auto"
          color={ButtonColor.BlueCheese}
          tag="a"
          href={post.commentsPermalink}
          onClick={(event) => onOpenPostModal?.(storyPost, event)}
          pressed={post.commented}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={
            <DiscussIcon secondary={post.commented} size={IconSize.XSmall} />
          }
        >
          {(post.numComments ?? 0) > 0 && (
            <InteractionCounter
              className="tabular-nums"
              value={post.numComments ?? 0}
            />
          )}
        </QuaternaryButton>
        <BookmarkButton
          post={storyPost}
          buttonProps={{
            id: `post-${post.id}-bookmark-btn`,
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

const TopicClusterCard = ({
  cluster,
  onOpenPostModal,
}: {
  cluster: TopicCluster;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
}): ReactElement => {
  return (
    <section
      id={`${cluster.id}-topic-cluster`}
      aria-labelledby={`${cluster.id}-topic-cluster-heading`}
      className="w-full border-b border-border-subtlest-tertiary p-3"
    >
      <header className="mb-4">
        <a
          href={cluster.topicHref}
          className="focus-visible-outline inline-flex items-center gap-2 rounded-8 text-text-primary transition-colors"
        >
          <h2
            id={`${cluster.id}-topic-cluster-heading`}
            className="font-bold typo-title3"
          >
            {cluster.topic}
          </h2>
        </a>
      </header>
      <div className="grid gap-4 laptop:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] laptop:gap-x-8">
        <article className="rounded-12 p-0">
          {!!cluster.featured.image && (
            <a
              href={cluster.featured.href}
              className="focus-visible-outline group block rounded-12"
              onClick={(event) => {
                if (!cluster.featured.post) {
                  return;
                }

                onOpenPostModal?.(cluster.featured.post as Post, event);
              }}
            >
              <img
                src={cluster.featured.image}
                alt={cluster.featured.title}
                className="h-52 w-full rounded-12 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </a>
          )}
          <a
            href={cluster.featured.href}
            className="focus-visible-outline group block rounded-12"
            onClick={(event) => {
              if (!cluster.featured.post) {
                return;
              }

              onOpenPostModal?.(cluster.featured.post as Post, event);
            }}
          >
            <h3
              className="mt-2 text-text-primary typo-callout"
              style={{ fontSize: '17px' }}
            >
              {cluster.featured.title}
            </h3>
          </a>
          <StoryMeta
            publisher={cluster.featured.publisher}
            publisherImage={cluster.featured.publisherImage}
            publishedAt={cluster.featured.publishedAt}
          />
          {cluster.featured.post && (
            <StoryActions
              post={cluster.featured.post}
              onOpenPostModal={onOpenPostModal}
            />
          )}
        </article>

        <div className="space-y-4 p-0">
          {cluster.related.map((story) => (
            <article key={story.id} className="p-0">
              <div className="group flex items-start gap-3 rounded-8">
                {!!story.image && (
                  <a
                    href={story.href}
                    className="focus-visible-outline order-2 shrink-0 rounded-8"
                    onClick={(event) => {
                      if (!story.post) {
                        return;
                      }

                      onOpenPostModal?.(story.post as Post, event);
                    }}
                  >
                    <img
                      src={story.image}
                      alt={story.title}
                      className="h-16 w-16 shrink-0 rounded-12 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </a>
                )}
                <div className="min-w-0 flex-1">
                  <a
                    href={story.href}
                    className="focus-visible-outline group block rounded-8"
                    onClick={(event) => {
                      if (!story.post) {
                        return;
                      }

                      onOpenPostModal?.(story.post as Post, event);
                    }}
                  >
                    <h3
                      className="mt-1 line-clamp-2 text-text-primary transition-colors typo-callout"
                      style={{ fontSize: '17px' }}
                    >
                      {story.title}
                    </h3>
                  </a>
                  <StoryMeta
                    publisher={story.publisher}
                    publisherImage={story.publisherImage}
                    publishedAt={story.publishedAt}
                  />
                  {story.post && (
                    <StoryActions
                      post={story.post}
                      onOpenPostModal={onOpenPostModal}
                    />
                  )}
                </div>
              </div>
            </article>
          ))}
          <Button
            tag="a"
            variant={ButtonVariant.Float}
            href={cluster.topicHref}
            className="w-full"
          >
            <span className="inline-flex items-center gap-2">
              {`More ${cluster.topic} posts`}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

const AgenticTopicClusterSection = ({
  storiesByCategory,
  onOpenPostModal,
}: {
  storiesByCategory?: Partial<Record<ExploreCategoryId, ExploreStory[]>>;
  onOpenPostModal?: (post: Post, event: MouseEvent<HTMLElement>) => void;
}): ReactElement => {
  const topicClusters = EXPLORE_TOPIC_CLUSTER_CATEGORIES.map((category) => {
    const categoryStories = storiesByCategory?.[category.id] ?? [];
    const mappedStories = categoryStories.map(mapToClusterStory);
    const featuredIndex = mappedStories.findIndex((story) => !!story.image);
    const featuredStory =
      featuredIndex >= 0 ? mappedStories[featuredIndex] : mappedStories[0];
    const featured = featuredStory ?? {
      id: `${category.id}-featured-fallback`,
      publisher: `${category.label} Digest`,
      title: `Latest ${category.label} stories`,
      href: category.path,
      publishedAt: undefined,
      readTimeMinutes: 5,
      upvotes: 0,
      comments: 0,
    };
    const skipIndex = featuredStory ? mappedStories.indexOf(featuredStory) : -1;
    const related = mappedStories
      .filter((_, index) => index !== skipIndex)
      .slice(0, 4);

    return {
      id: category.id,
      topic: category.label,
      topicHref: category.path,
      featured,
      related,
    };
  });

  return (
    <div className="flex w-full flex-col gap-6">
      {topicClusters.map((cluster) => (
        <TopicClusterCard
          key={cluster.id}
          cluster={cluster}
          onOpenPostModal={onOpenPostModal}
        />
      ))}
    </div>
  );
};

export default AgenticTopicClusterSection;
