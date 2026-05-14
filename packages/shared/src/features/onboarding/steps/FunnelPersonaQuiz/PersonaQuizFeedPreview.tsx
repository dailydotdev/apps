import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../../graphql/posts';
import { Image } from '../../../../components/image/Image';
import { useViewSize, ViewSize } from '../../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

interface PersonaQuizFeedPreviewProps {
  posts: Post[];
}

const PREVIEW_LIMIT = 4;

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

export const PersonaQuizFeedPreview = ({
  posts,
}: PersonaQuizFeedPreviewProps): ReactElement | null => {
  const isTablet = useViewSize(ViewSize.Tablet);

  if (posts.length === 0) {
    return null;
  }

  const visible = posts.slice(0, PREVIEW_LIMIT);

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
        {visible.map((post) => (
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
