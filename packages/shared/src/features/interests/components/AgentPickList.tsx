import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ArrowIcon, DiscussIcon, UpvoteIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Post } from '../../../graphql/posts';

const InlineStat = ({
  icon,
  value,
  ariaLabel,
}: {
  icon: ReactElement;
  value: number;
  ariaLabel: string;
}): ReactElement => (
  <span
    aria-label={ariaLabel}
    className="inline-flex items-center gap-1.5 px-1"
  >
    {icon}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);

const PickRow = ({
  post,
  onOpen,
}: {
  post: Post;
  onOpen: (post: Post) => void;
}): ReactElement => (
  <li>
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-float tablet:px-5"
    >
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Body}
        bold
        color={TypographyColor.Primary}
        className="min-w-0 flex-1 !leading-snug"
      >
        {post.title}
      </Typography>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <InlineStat
          ariaLabel={`${post.numUpvotes ?? 0} upvotes`}
          icon={
            <UpvoteIcon
              size={IconSize.XSmall}
              className="text-text-tertiary"
              secondary
            />
          }
          value={post.numUpvotes ?? 0}
        />
        <InlineStat
          ariaLabel={`${post.numComments ?? 0} comments`}
          icon={
            <DiscussIcon
              size={IconSize.XSmall}
              className="text-text-tertiary"
              secondary
            />
          }
          value={post.numComments ?? 0}
        />
        {post.source?.image && (
          <span className="hidden items-center pl-1 tablet:inline-flex">
            <span className="overflow-hidden rounded-full border-2 border-background-default bg-surface-float">
              <img
                src={post.source.image}
                alt={post.source.name ?? ''}
                loading="lazy"
                className="size-4 object-cover"
              />
            </span>
          </span>
        )}
        <ArrowIcon
          size={IconSize.XSmall}
          className="shrink-0 rotate-90 text-text-quaternary transition-colors group-hover:text-text-tertiary"
          aria-hidden
        />
      </div>
    </button>
  </li>
);

export const AgentPickList = ({
  posts,
  onOpen,
}: {
  posts: Post[];
  onOpen: (post: Post) => void;
}): ReactElement => (
  <ol className="divide-y divide-border-subtlest-quaternary overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default">
    {posts.map((post) => (
      <PickRow key={post.id} post={post} onOpen={onOpen} />
    ))}
  </ol>
);
