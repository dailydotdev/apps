import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import styles from './Card.module.css';
import FeatherIcon from '../icons/Feather';

export default function PostAuthor({
  post,
  className,
}: {
  post: Post;
  className?: string;
}): ReactElement {
  if (!post.author) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        'flex items-center font-bold typo-footnote text-theme-status-help',
        styles.authorBox,
        className,
      )}
    >
      <FeatherIcon className="mr-1 text-xl" />
      <span className="truncate">{post.author.name}</span>
    </div>
  );
}
