import type { ReactElement } from 'react';
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
  className,
}: PreviewPost & { className?: string }): ReactElement => (
  <article className={classNames('flex items-start gap-4 py-3', className)}>
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

const SourceStack = ({
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
export const PreviewEnd = (): ReactElement => (
  <div className="relative -mt-16 flex justify-center bg-gradient-to-t from-background-default via-background-default to-transparent pb-2 pt-16 text-text-tertiary typo-footnote">
    Your full feed opens after this step.
  </div>
);

export const PreviewTrigger = ({
  posts,
  isOpen,
  isDisabled,
  disabledLabel,
  onClick,
}: {
  posts: PreviewPost[];
  isOpen?: boolean;
  isDisabled?: boolean;
  disabledLabel: string;
  onClick: () => void;
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
      {isDisabled
        ? disabledLabel
        : isOpen
        ? 'Hide preview'
        : 'Preview your feed'}
    </Button>
    <div className="h-px flex-1 bg-border-subtlest-tertiary" />
  </div>
);

export const SHORT_LIST_SIZE = 5;

export const PreviewList = ({
  posts,
  isRefreshing,
  size = SHORT_LIST_SIZE,
  className,
}: {
  posts: PreviewPost[];
  isRefreshing: boolean;
  size?: number;
  className?: string;
}): ReactElement => (
  <div
    aria-busy={isRefreshing}
    className={classNames(
      'flex w-full flex-col divide-y divide-border-subtlest-tertiary',
      className,
    )}
  >
    {isRefreshing
      ? Array.from({ length: size }, (_, index) => (
          <PreviewPostRowPlaceholder key={index} />
        ))
      : posts
          .slice(0, size)
          .map((item) => <PreviewPostRow key={item.post.id} {...item} />)}
  </div>
);
