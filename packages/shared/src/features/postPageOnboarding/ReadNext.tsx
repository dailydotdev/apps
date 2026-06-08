import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '../../graphql/posts';
import { gqlClient } from '../../graphql/common';
import {
  FURTHER_READING_QUERY,
  type FurtherReadingData,
} from '../../graphql/furtherReading';
import { capitalize } from '../../lib/strings';
import { CardLink } from '../../components/cards/common/Card';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { useAnonPostOnboarding } from './useAnonPostOnboarding';
import { useAnonFeedTags } from './useAnonFeedTags';
import { BuildFeedAuthOptions } from './BuildFeedAuthOptions';

interface ReadNextProps {
  post: Post;
}

const MAX_ITEMS = 7;

const dedupeById = (posts: Post[], excludeId?: string): Post[] => {
  const seen = new Set<string>();
  return posts.filter((item) => {
    if (!item?.id || item.id === excludeId || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

const ReadNextItem = ({
  post,
  index,
}: {
  post: Post;
  index: number;
}): ReactElement => {
  const meta = [
    post.source?.name,
    post.readTime ? `${post.readTime} min read` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <article className="group relative flex gap-4 border-t border-border-subtlest-tertiary py-4">
      <CardLink href={post.commentsPermalink} title={post.title} />
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Quaternary}
        className="w-6 shrink-0 font-mono tabular-nums"
      >
        {(index + 1).toString().padStart(2, '0')}
      </Typography>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="break-words font-bold text-text-primary typo-body group-hover:underline">
          {post.title}
        </h3>
        {meta && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {meta}
          </Typography>
        )}
      </div>
    </article>
  );
};

/**
 * "Read next" — real related posts (similar / trending / discussed) for the
 * current article, presented as a calm editorial column. No images-as-bait, no
 * locked rows, no fabricated content: if there's nothing real to show, it
 * renders nothing. The invitation at the end is honest and low-key.
 */
export const ReadNext = ({ post }: ReadNextProps): ReactElement | null => {
  const { isEnabled } = useAnonPostOnboarding();
  const { selectedTags } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: isEnabled,
  });
  const tags = post?.tags ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['readNext', post?.id],
    queryFn: () =>
      gqlClient.request<FurtherReadingData>(FURTHER_READING_QUERY, {
        loggedIn: false,
        post: post.id,
        trendingFirst: 3,
        similarFirst: MAX_ITEMS,
        discussedFirst: 4,
        withDiscussedPosts: true,
        tags,
      }),
    enabled: isEnabled && !!post?.id && tags.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const posts = useMemo(() => {
    const merged = [
      ...(data?.similarPosts ?? []),
      ...(data?.trendingPosts ?? []),
      ...(data?.discussedPosts ?? []),
    ];
    return dedupeById(merged, post?.id).slice(0, MAX_ITEMS);
  }, [data, post?.id]);

  if (!isEnabled || tags.length === 0) {
    return null;
  }

  if (!isLoading && posts.length === 0) {
    return null;
  }

  const topic = tags[0] ? capitalize(tags[0]) : null;

  return (
    <section className="mt-12 flex flex-col">
      <Typography bold tag={TypographyTag.H2} type={TypographyType.Title2}>
        Read next
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1"
      >
        {topic
          ? `More on ${topic}, from what the developer community is reading.`
          : 'More from what the developer community is reading.'}
      </Typography>

      <div className="mt-4 flex flex-col">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="flex flex-col gap-2 border-t border-border-subtlest-tertiary py-4"
            >
              <ElementPlaceholder className="h-4 w-3/4 rounded-12" />
              <ElementPlaceholder className="h-3 w-1/3 rounded-12" />
            </div>
          ))
        ) : (
          <>
            {posts.map((item, index) => (
              <ReadNextItem key={item.id} post={item} index={index} />
            ))}
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-16 bg-surface-float p-5">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
        >
          This is a glimpse of what a daily.dev feed gives you every day — the
          best of {topic ?? 'your stack'}, curated and tuned to you. Make one
          that&apos;s yours.
        </Typography>
        <div className="max-w-md">
          <BuildFeedAuthOptions tags={selectedTags} origin="feed" />
        </div>
      </div>
    </section>
  );
};
