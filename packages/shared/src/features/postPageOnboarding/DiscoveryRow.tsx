import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { LazyImage } from '../../components/LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { CardLink } from '../../components/cards/common/Card';
import { PostEngagementCounts } from '../../components/cards/SimilarPosts/PostEngagementCounts';
import { LockIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';

interface DiscoveryRowProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  posts: Post[];
  locked?: boolean;
  onUnlock?: () => void;
}

const RowCard = ({ post }: { post: Post }): ReactElement => (
  <article className="group relative flex w-60 shrink-0 snap-start flex-col overflow-hidden rounded-16 bg-surface-float transition-transform hover:-translate-y-1">
    <CardLink href={post.commentsPermalink} title={post.title} />
    <LazyImage
      imgSrc={post.image}
      imgAlt={post.title ?? 'Post cover image'}
      className="h-32 w-full"
      fallbackSrc={cloudinaryPostImageCoverPlaceholder}
    />
    <div className="flex flex-1 flex-col gap-1 p-3">
      <div className="flex items-center gap-2">
        <LazyImage
          imgSrc={post.source?.image ?? ''}
          imgAlt={post.source?.name ?? ''}
          className="size-5 shrink-0 rounded-full"
        />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          truncate
        >
          {post.source?.name}
        </Typography>
      </div>
      <h3 className="line-clamp-2 break-words font-bold text-text-primary typo-callout">
        {post.title}
      </h3>
      <PostEngagementCounts
        upvotes={post.numUpvotes ?? 0}
        comments={post.numComments ?? 0}
        className="mt-auto pt-1 text-text-tertiary"
      />
    </div>
  </article>
);

/**
 * A Netflix-style titled carousel of posts. The `locked` variant blurs the
 * content behind a gradient veil and an "unlock your feed" CTA — turning the
 * sheer volume of available content into a reason to sign up.
 */
export const DiscoveryRow = ({
  title,
  icon,
  subtitle,
  posts,
  locked = false,
  onUnlock,
}: DiscoveryRowProps): ReactElement => (
  <section className="flex flex-col gap-3">
    <header className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col">
        <Typography bold type={TypographyType.Title3}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {subtitle}
          </Typography>
        )}
      </div>
    </header>
    <div className="relative">
      <div
        className={classNames(
          'flex snap-x gap-3 overflow-x-auto pb-2',
          locked && 'pointer-events-none select-none blur-[3px]',
        )}
        aria-hidden={locked}
      >
        {posts.map((post) => (
          <RowCard key={post.id} post={post} />
        ))}
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6 text-center shadow-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface-float">
              <LockIcon size={IconSize.Large} className="text-text-primary" />
            </span>
            <Typography bold type={TypographyType.Title3}>
              Your full feed is locked
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              Sign up free to unlock endless personalized dev content — tools,
              news, and discussions, every day.
            </Typography>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={onUnlock}
            >
              Unlock my feed
            </Button>
          </div>
        </div>
      )}
    </div>
  </section>
);
