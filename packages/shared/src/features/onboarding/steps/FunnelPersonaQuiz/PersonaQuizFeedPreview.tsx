import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../../../graphql/common';
import {
  PREVIEW_FEED_QUERY,
  supportedTypesForPrivateSources,
} from '../../../../graphql/feed';
import type { Post } from '../../../../graphql/posts';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { Image } from '../../../../components/image/Image';
import { useViewSize, ViewSize } from '../../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

interface PersonaQuizFeedPreviewProps {
  includeTags: string[];
}

interface FeedPreviewResponse {
  page: {
    edges: Array<{ node: Post }>;
  };
}

const PREVIEW_LIMIT = 4;
const PREVIEW_TAG_LIMIT = 12;

interface PreviewCardProps {
  post: Post;
  variant: 'grid' | 'list';
}

const PreviewCard = ({ post, variant }: PreviewCardProps): ReactElement => {
  const sourceName = post.source?.name;
  const sourceImage = post.source?.image;
  const tags = (post.tags ?? []).slice(0, 3);

  if (variant === 'grid') {
    return (
      <article className="relative flex max-h-cardLarge min-h-card flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-2">
        <div className="mx-2 mt-2 flex items-center gap-2">
          {sourceImage && (
            <Image
              alt=""
              aria-hidden
              src={sourceImage}
              className="size-8 rounded-full object-cover"
              loading="lazy"
            />
          )}
          {sourceName && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="truncate"
            >
              {sourceName}
            </Typography>
          )}
        </div>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
          className="mx-2 mt-2 line-clamp-3"
        >
          {post.title}
        </Typography>
        {tags.length > 0 && (
          <ul className="mx-2 mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-6 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption2"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}
        <div className="flex-1" />
        {post.image && (
          <Image
            alt=""
            aria-hidden
            src={post.image}
            className="mt-3 h-40 w-full rounded-12 object-cover"
            loading="lazy"
          />
        )}
      </article>
    );
  }

  return (
    <article className="relative flex items-stretch gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle py-4 pl-4 pr-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          {sourceImage && (
            <Image
              alt=""
              aria-hidden
              src={sourceImage}
              className="size-8 rounded-full object-cover"
              loading="lazy"
            />
          )}
          {sourceName && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="truncate"
            >
              {sourceName}
            </Typography>
          )}
        </div>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          className="line-clamp-3"
        >
          {post.title}
        </Typography>
        {tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-6 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption2"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      {post.image && (
        <Image
          alt=""
          aria-hidden
          src={post.image}
          className="aspect-square h-auto w-24 shrink-0 self-start rounded-12 object-cover mobileXL:w-40"
          loading="lazy"
        />
      )}
    </article>
  );
};

// Only drop posts whose source is completely missing. Earlier we rejected
// anything whose source name happened to read "Unknown", but the prod feed
// preview doesn't actually return that placeholder — being strict was just
// stripping legitimate posts and leaving the preview empty.
const hasUsableSource = (post: Post): boolean => !!post.source?.name?.trim();

export const PersonaQuizFeedPreview = ({
  includeTags,
}: PersonaQuizFeedPreviewProps): ReactElement | null => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const auth = useAuthContext();
  const isLoggedIn = !!auth?.user;

  const topTags = useMemo(
    () => includeTags.slice(0, PREVIEW_TAG_LIMIT),
    [includeTags],
  );
  const queryKeyTags = topTags.join('|');

  const { data } = useQuery({
    queryKey: ['persona-quiz-feed-preview', queryKeyTags, isLoggedIn],
    queryFn: () =>
      gqlClient.request<FeedPreviewResponse>(PREVIEW_FEED_QUERY, {
        loggedIn: isLoggedIn,
        supportedTypes: supportedTypesForPrivateSources,
        filters: { includeTags: topTags },
      }),
    enabled: topTags.length > 0,
    staleTime: 30_000,
    retry: false,
  });

  const posts = useMemo(() => {
    const edges = data?.page.edges ?? [];
    return edges
      .map((edge) => edge.node)
      .filter(hasUsableSource)
      .slice(0, PREVIEW_LIMIT);
  }, [data]);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-3 px-4 pb-8 tablet:mx-auto tablet:max-w-3xl">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="uppercase tracking-wider"
      >
        Sneak peek of your feed
      </Typography>
      <div
        className={classNames(
          'grid gap-3',
          isTablet ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        {posts.map((post) => (
          <PreviewCard
            key={post.id}
            post={post}
            variant={isTablet ? 'grid' : 'list'}
          />
        ))}
      </div>
    </section>
  );
};
