import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { PreviewPost } from './previewData';

const pluralize = (count: number, noun: string): string =>
  `${largeNumberFormat(count)} ${noun}${count === 1 ? '' : 's'}`;

const getEngagement = (post: Post): string =>
  [
    post.numUpvotes && pluralize(post.numUpvotes, 'upvote'),
    post.numComments && pluralize(post.numComments, 'comment'),
  ]
    .filter(Boolean)
    .join(' · ');

export const MatchedTag = ({ tag }: { tag: string }): ReactElement => (
  <span className="shrink-0 font-bold text-brand-default">#{tag}</span>
);

export const PreviewPostRow = ({
  post,
  matchedTags,
  isFresh,
  badge,
  className,
}: PreviewPost & {
  isFresh?: boolean;
  badge?: ReactNode;
  className?: string;
}): ReactElement => (
  <article
    className={classNames(
      'flex items-start gap-4 py-3 transition-colors duration-700',
      isFresh && 'bg-brand-float',
      className,
    )}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex min-w-0 items-center gap-1.5 text-text-tertiary typo-footnote">
        <SourceAvatar
          className="!mr-0"
          size={ProfileImageSize.Size16}
          source={post.source as Source}
        />
        <span className="truncate">{post.source?.name}</span>
      </span>
      <h3 className="line-clamp-2 font-bold text-text-primary typo-callout">
        {post.title}
      </h3>
      <span className="flex min-w-0 items-center gap-2 text-text-tertiary typo-footnote">
        {!!matchedTags[0] && <MatchedTag tag={matchedTags[0]} />}
        <span className="truncate">{getEngagement(post)}</span>
        {badge}
      </span>
    </div>
    <Image
      alt=""
      className="h-16 w-24 shrink-0 rounded-12 object-cover"
      loading="lazy"
      src={post.image}
      type={ImageType.Post}
    />
  </article>
);

export const PreviewPostRowPlaceholder = (): ReactElement => (
  <div className="flex items-start gap-4 py-3">
    <div className="flex flex-1 flex-col gap-2 pt-1">
      <ElementPlaceholder className="h-3 w-1/3 rounded-6" />
      <ElementPlaceholder className="h-4 w-full rounded-6" />
      <ElementPlaceholder className="h-3 w-1/2 rounded-6" />
    </div>
    <ElementPlaceholder className="h-16 w-24 rounded-12" />
  </div>
);

export const PreviewPostTile = ({
  post,
  matchedTags,
}: PreviewPost): ReactElement => (
  <article className="flex w-56 shrink-0 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-2 pb-3">
    <Image
      alt=""
      className="h-28 w-full rounded-12 object-cover"
      loading="lazy"
      src={post.image}
      type={ImageType.Post}
    />
    <span className="flex min-w-0 items-center gap-1.5 px-1 text-text-tertiary typo-footnote">
      <SourceAvatar
        className="!mr-0"
        size={ProfileImageSize.Size16}
        source={post.source as Source}
      />
      <span className="truncate">{post.source?.name}</span>
    </span>
    <h3 className="line-clamp-2 px-1 font-bold text-text-primary typo-callout">
      {post.title}
    </h3>
    {!!matchedTags[0] && (
      <span className="px-1 typo-footnote">
        <MatchedTag tag={matchedTags[0]} />
      </span>
    )}
  </article>
);

export const SourceStack = ({
  posts,
  size = ProfileImageSize.Small,
}: {
  posts: PreviewPost[];
  size?: ProfileImageSize;
}): ReactElement => (
  <span className="flex items-center">
    {posts.slice(0, 3).map(({ post }, index) => (
      <SourceAvatar
        key={post.id}
        className={classNames(
          '!mr-0 border-2 border-background-default',
          index > 0 && '-ml-2',
        )}
        size={size}
        source={post.source as Source}
      />
    ))}
  </span>
);

// The fade that ends a capped preview, so it reads as a sample with the full
// feed one step away, not as a feed to keep scrolling.
export const PreviewEnd = ({
  children = 'Your full feed opens after this step.',
  isOnSurface,
}: {
  children?: ReactNode;
  // Inside a `bg-background-subtle` panel the fade has to match the panel.
  isOnSurface?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'relative -mt-16 flex justify-center bg-gradient-to-t to-transparent pb-2 pt-16 text-text-tertiary typo-footnote',
      isOnSurface
        ? 'from-background-subtle via-background-subtle'
        : 'from-background-default via-background-default',
    )}
  >
    {children}
  </div>
);

export const PreviewTrigger = ({
  posts,
  isOpen,
  isDisabled,
  disabledLabel,
  onClick,
  label = 'Preview your feed',
}: {
  posts: PreviewPost[];
  isOpen?: boolean;
  isDisabled?: boolean;
  disabledLabel: string;
  onClick: () => void;
  label?: string;
}): ReactElement => (
  <div className="flex w-full items-center justify-center gap-4">
    <div className="h-px flex-1 bg-border-subtlest-tertiary" />
    <Button
      className="!pl-2"
      disabled={isDisabled}
      icon={
        isDisabled ? (
          <EyeIcon />
        ) : (
          <SourceStack posts={posts} size={ProfileImageSize.XSmall} />
        )
      }
      onClick={onClick}
      size={ButtonSize.Medium}
      variant={ButtonVariant.Float}
    >
      {isDisabled ? disabledLabel : isOpen ? 'Hide preview' : label}
    </Button>
    <div className="h-px flex-1 bg-border-subtlest-tertiary" />
  </div>
);
