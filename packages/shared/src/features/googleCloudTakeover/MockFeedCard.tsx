import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  BookmarkIcon,
  DiscussIcon,
  MenuIcon,
  UpvoteIcon,
} from '../../components/icons';

export type MockPost = {
  source: string;
  title: string;
  tag: string;
  meta: string;
  avatar: string;
  cover: string;
  upvotes: string;
  comments: string;
};

type MockFeedCardProps = {
  post: MockPost;
  className?: string;
};

// A static, dependency-free post card that fills the feed around the four
// Google Cloud placements so the takeover reads in real feed context.
// Mirrors the production `ArticleGrid` chrome (source row → title → tag →
// meta → cover → engagement bar) without the feed-internal hooks.
export const MockFeedCard = ({
  post,
  className,
}: MockFeedCardProps): ReactElement => (
  <article
    className={classNames(
      'flex h-full min-h-card flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-0',
      className,
    )}
  >
    <div className="mx-4 mt-4 flex h-8 items-center gap-2">
      <div
        className={classNames('size-8 shrink-0 rounded-full', post.avatar)}
      />
      <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
        {post.source}
      </span>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<MenuIcon />}
        aria-label="Card menu"
      />
    </div>
    <h3 className="mx-4 mt-2 line-clamp-3 break-words font-bold text-text-primary typo-title3">
      {post.title}
    </h3>
    <p className="mx-4 mt-2 truncate text-text-tertiary typo-footnote">
      {post.tag}
    </p>
    <p className="mx-4 mt-1 truncate text-text-tertiary typo-footnote">
      {post.meta}
    </p>
    <div className="mx-4 mt-3">
      <div
        className={classNames('aspect-video w-full rounded-12', post.cover)}
      />
    </div>
    <div className="flex-1" />
    <div className="mx-4 px-1 pb-2 pt-3">
      <div className="flex flex-1 items-center justify-between text-text-tertiary typo-footnote">
        <span className="inline-flex items-center">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            color={ButtonColor.Avocado}
            icon={<UpvoteIcon />}
            aria-label="Upvote"
          />
          <span className="pl-1 tabular-nums">{post.upvotes}</span>
        </span>
        <span className="inline-flex items-center">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            color={ButtonColor.BlueCheese}
            icon={<DiscussIcon />}
            aria-label="Comment"
          />
          <span className="pl-1 tabular-nums">{post.comments}</span>
        </span>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          color={ButtonColor.Bun}
          icon={<BookmarkIcon />}
          aria-label="Bookmark"
        />
      </div>
    </div>
  </article>
);
