import classNames from 'classnames';
import React, { ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { BookmarkIcon } from '../icons';
import styles from '../cards/Card.module.css';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Post } from '../../graphql/posts';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { TextPlaceholder } from '../widgets/common';
import SquadPostAuthor from '../post/SquadPostAuthor';
import { CardLink } from '../cards/Card';
import { postDateFormat } from '../../lib/dateFormat';
import { combinedClicks } from '../../lib/click';

type PostProps = {
  post: Post;
  onLinkClick: (post: Post) => unknown;
  onBookmark: (post: Post) => unknown;
};

export const SquadPostListItem = ({
  post,
  onLinkClick,
  onBookmark,
}: PostProps): ReactElement => {
  return (
    <article
      className={classNames(
        'group relative flex items-start px-4 py-2 hover:bg-theme-hover',
        styles.card,
      )}
    >
      <CardLink
        href={post.commentsPermalink}
        title={post.title}
        {...combinedClicks(() => onLinkClick(post))}
      />
      <div className="flex w-full flex-col">
        {post?.author && (
          <SquadPostAuthor
            className={{
              name: 'text-theme-label-primary typo-callout',
              handle: 'text-theme-label-quaternary typo-callout',
              details: 'flex-1 pr-8',
            }}
            author={post.author}
            size="large"
            date={postDateFormat(post.createdAt)}
          />
        )}
        <p className="mt-2 line-clamp-3 text-theme-label-primary typo-callout">
          {post.title}
        </p>
      </div>
      <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <Button
          className="absolute right-3 group-hover:visible mouse:invisible"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Bun}
          pressed={post.bookmarked}
          size={ButtonSize.Small}
          icon={<BookmarkIcon secondary={post.bookmarked} />}
          onClick={() => onBookmark(post)}
        />
      </SimpleTooltip>
    </article>
  );
};

const SquadPostListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="relative flex flex-col px-4 py-2">
    <div className="mb-2 flex flex-1 flex-row items-center">
      <ElementPlaceholder className="mt-1 h-10 w-10 rounded-14" />
      <div className="ml-3 mr-2 flex flex-1 flex-col">
        <TextPlaceholder style={{ width: '40%' }} />
        <TextPlaceholder style={{ width: '40%' }} />
      </div>
    </div>
    <TextPlaceholder style={{ width: '80%' }} />
    <TextPlaceholder style={{ width: '80%' }} />
  </article>
);

SquadPostListItem.Placeholder = SquadPostListItemPlaceholder;
