import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import BookmarkIcon from '../icons/Bookmark';
import styles from '../cards/Card.module.css';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Post } from '../../graphql/posts';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { TextPlaceholder } from '../widgets/common';
import SquadPostAuthor from '../post/SquadPostAuthor';
import { CardLink } from '../cards/Card';
import { postDateFormat } from '../../lib/dateFormat';
import { combinedClicks } from '../../lib/click';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';

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
  const { role } = useMemberRoleForSource({
    source: post?.source,
    user: post?.author,
  });
  return (
    <article
      className={classNames(
        'relative flex py-2 pl-4 pr-2 group items-start hover:bg-theme-hover',
        styles.card,
      )}
    >
      <CardLink
        href={post.commentsPermalink}
        title={post.title}
        {...combinedClicks(() => onLinkClick(post))}
      />
      <div className="flex flex-col flex-1">
        <SquadPostAuthor
          className={{
            container: 'mt-0',
            name: 'typo-callout text-theme-label-primary',
            handle: 'typo-callout text-theme-label-quaternary',
          }}
          author={post.author}
          role={role}
          size="large"
          date={postDateFormat(post.createdAt)}
        />
        <p className="mt-2 line-clamp-3 typo-callout text-theme-label-primary">
          {post.title}
        </p>
      </div>
      <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <Button
          className="group-hover:visible mouse:invisible mt-1 btn-tertiary-bun"
          pressed={post.bookmarked}
          buttonSize={ButtonSize.Small}
          icon={<BookmarkIcon secondary={post.bookmarked} />}
          onClick={() => onBookmark(post)}
        />
      </SimpleTooltip>
    </article>
  );
};

const SquadPostListItemPlaceholder = (): ReactElement => (
  <article aria-busy className="flex relative flex-col py-2 px-4">
    <div className="flex flex-row flex-1 items-center mb-2">
      <ElementPlaceholder className="mt-1 w-10 h-10 rounded-14" />
      <div className="flex flex-col flex-1 mr-2 ml-3">
        <TextPlaceholder style={{ width: '40%' }} />
        <TextPlaceholder style={{ width: '40%' }} />
      </div>
    </div>
    <TextPlaceholder style={{ width: '80%' }} />
    <TextPlaceholder style={{ width: '80%' }} />
  </article>
);

SquadPostListItem.Placeholder = SquadPostListItemPlaceholder;
