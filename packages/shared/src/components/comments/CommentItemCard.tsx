import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { HidePostItemCardProps } from '../../graphql/users';
import { PostItem } from '../../graphql/posts';
import { ProfilePicture } from '../ProfilePicture';
import { Comment } from '../../graphql/comments';
import Markdown from '../Markdown';

interface PostItemCardProps {
  className?: string;
  comment: Comment;
  showButtons?: boolean;
  clickable?: boolean;
  onHide?: (params: HidePostItemCardProps) => Promise<unknown>;
  onContextMenu?: (event: React.MouseEvent, post: PostItem) => void;
}

export default function CommentItemCard({
  comment,
  className,
}: PostItemCardProps): ReactElement {
  return (
    <article
      className={classNames(
        'flex relative flex-row items-center my-4 py-3 px-6',
        className,
      )}
    >
      <ProfilePicture size="xxlarge" user={comment.author} nativeLazyLoading />
      <div className="flex flex-col flex-1 ml-4">
        <p className="typo-footnote text-theme-label-tertiary">
          {comment.author.name}
        </p>
        <p className="flex flex-wrap flex-1 line-clamp-2 typo-callout">
          <Markdown content={comment.contentHtml} />
        </p>
      </div>
    </article>
  );
}
