import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  discoverOnboardingPosts,
  type OnboardingSwipePost,
} from '../../../../graphql/personaQuiz';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';

interface PersonaQuizFeedPreviewProps {
  seedTags: string[];
  answerCount: number;
}

const PREVIEW_COUNT = 4;

const PreviewSkeleton = (): ReactElement => (
  <ul className="flex flex-col gap-3">
    {Array.from({ length: PREVIEW_COUNT }, (_, index) => (
      <li
        key={`skeleton-${index}`}
        aria-busy
        className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default p-4"
      >
        <div className="h-3 w-3/4 animate-pulse rounded-8 bg-surface-float" />
        <div className="h-3 w-1/2 animate-pulse rounded-8 bg-surface-float" />
        <div className="mt-1 flex gap-2">
          <div className="h-4 w-12 animate-pulse rounded-6 bg-surface-float" />
          <div className="h-4 w-16 animate-pulse rounded-6 bg-surface-float" />
          <div className="h-4 w-10 animate-pulse rounded-6 bg-surface-float" />
        </div>
      </li>
    ))}
  </ul>
);

interface PreviewCardProps {
  post: OnboardingSwipePost;
}

const PreviewCard = ({ post }: PreviewCardProps): ReactElement => (
  <li className="flex flex-col gap-1.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-4">
    <Typography
      tag={TypographyTag.H3}
      type={TypographyType.Callout}
      color={TypographyColor.Primary}
      bold
      className="line-clamp-2"
    >
      {post.title}
    </Typography>
    {post.summary && (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="line-clamp-2"
      >
        {post.summary}
      </Typography>
    )}
    {post.tags.length > 0 && (
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {post.tags.slice(0, 4).map((tag) => (
          <li
            key={tag}
            className="rounded-6 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption2"
          >
            #{tag}
          </li>
        ))}
      </ul>
    )}
  </li>
);

export const PersonaQuizFeedPreview = ({
  seedTags,
  answerCount,
}: PersonaQuizFeedPreviewProps): ReactElement | null => {
  const enabled = seedTags.length > 0;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['persona-quiz-feed-preview', seedTags.join('|'), answerCount],
    queryFn: () =>
      discoverOnboardingPosts({
        selectedTags: seedTags,
        n: PREVIEW_COUNT,
      }),
    enabled,
    staleTime: Infinity,
  });

  if (!enabled || isError) {
    return null;
  }

  const posts = data?.posts ?? [];
  if (!isLoading && posts.length === 0) {
    return null;
  }

  return (
    <section
      className={classNames(
        'flex w-full flex-col gap-3 px-4 pb-8 tablet:mx-auto tablet:max-w-md',
      )}
    >
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="uppercase tracking-wider"
      >
        Sneak peek of your feed
      </Typography>
      {isLoading ? (
        <PreviewSkeleton />
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.slice(0, PREVIEW_COUNT).map((post) => (
            <PreviewCard key={post.postId} post={post} />
          ))}
        </ul>
      )}
    </section>
  );
};
