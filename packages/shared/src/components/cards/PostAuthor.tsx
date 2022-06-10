import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import styles from './Card.module.css';
import FeatherIcon from '../icons/Feather';
import { Comment } from '../../graphql/comments';

export default function PostAuthor({
  post,
  selectedComment,
  className,
}: {
  post: Post;
  selectedComment: Comment;
  className?: string;
}): ReactElement {
  if (!post.author) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        'flex items-center font-bold typo-footnote text-theme-status-help',
        selectedComment ? 'invisible' : styles.authorBox,
        className,
      )}
    >
      <FeatherIcon className="mr-1 text-xl" />
      <span className="truncate">{post.author.name}</span>
    </div>
  );
}
