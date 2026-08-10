import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ArrowIcon, DiscussIcon, UpvoteIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Post } from '../../../graphql/posts';
import { useNarrowContainer } from '../hooks/useNarrowContainer';
import { AgentRowActions } from './AgentRowActions';

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
  isViewing,
  isStacked,
}: {
  post: Post;
  onOpen: (post: Post) => void;
  isViewing: boolean;
  isStacked: boolean;
}): ReactElement => (
  // The corners live on the row rather than on the list: the list cannot clip
  // its overflow without cutting the add-to-chat button off its top edge, so
  // the ends have to round themselves.
  <li className="[&:first-child>div]:rounded-t-12 [&:last-child>div]:rounded-b-12">
    {/* A row rather than a button, so "add to chat" can sit in it. The title
        stretches its click over the whole row. */}
    <div
      className={classNames(
        // Stacked on a phone: a title and its counts side by side in 375px
        // leaves the title four words wide and five lines tall.
        'agent-press-row group/item relative flex w-full flex-col items-start gap-1 px-3 py-2.5 text-left transition-colors',
        // The same cramping happens on a desktop whose chat column has been
        // dragged phone-narrow, which a viewport class cannot see, so the
        // side-by-side layout is granted by the list's own measurement.
        !isStacked && 'tablet:flex-row tablet:items-center tablet:gap-3',
        isViewing ? 'bg-surface-float' : 'hover:bg-surface-float',
      )}
    >
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Callout}
        bold
        color={TypographyColor.Primary}
        className="w-full min-w-0 flex-1 text-balance !leading-snug"
      >
        <button
          type="button"
          onClick={() => onOpen(post)}
          className="w-full text-left after:absolute after:inset-0"
        >
          {post.title}
        </button>
      </Typography>
      {/* Floated off the row's top edge rather than placed in it: the row
          keeps every pixel of its title and every one of its counts, and
          nothing has to be hidden to make space. */}
      <AgentRowActions post={post} reveal />
      <div
        className={classNames(
          'flex shrink-0 items-center gap-2',
          !isStacked && 'tablet:ml-auto',
        )}
      >
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
          <span
            className={classNames(
              'hidden items-center pl-1',
              !isStacked && 'tablet:inline-flex',
            )}
          >
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
          className="shrink-0 rotate-90 text-text-quaternary transition-colors group-hover/item:text-text-tertiary"
          aria-hidden
        />
      </div>
    </div>
  </li>
);

export const AgentPickList = ({
  posts,
  onOpen,
  activePostId,
}: {
  posts: Post[];
  onOpen: (post: Post) => void;
  activePostId?: string;
}): ReactElement => {
  // The chat column is dragged, not fixed: with the content panel wide open it
  // can be phone-narrow on a laptop screen, which no media query can see. The
  // list measures the column it actually lives in, the way the content panel's
  // cards already do.
  const { ref, isNarrow } = useNarrowContainer<HTMLOListElement>();

  return (
    <ol
      ref={ref}
      className="divide-y divide-border-subtlest-quaternary rounded-12 border border-border-subtlest-quaternary bg-background-default"
    >
      {posts.map((post) => (
        <PickRow
          key={post.id}
          post={post}
          onOpen={onOpen}
          isViewing={post.id === activePostId}
          isStacked={isNarrow}
        />
      ))}
    </ol>
  );
};
