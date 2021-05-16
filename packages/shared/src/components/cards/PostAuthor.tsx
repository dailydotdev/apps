import { Post } from '../../graphql/posts';
import React, { ReactElement } from 'react';
import classNames from 'classnames';
import styles from './Card.module.css';
import FeatherIcon from '../../../icons/feather.svg';
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
      <FeatherIcon className="text-xl mr-1" />
      <span className="truncate">{post.author.name}</span>
    </div>
  );
}
