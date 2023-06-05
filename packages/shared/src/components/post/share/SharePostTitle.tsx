import React, { ReactElement } from 'react';
import { sanitize } from 'dompurify';
import { Post } from '../../../graphql/posts';
import styles from '../../markdown.module.css';

interface SharePostTitleProps {
  post: Post;
}

export function SharePostTitle({ post }: SharePostTitleProps): ReactElement {
  if (!post?.title) return null;

  if (!post?.titleHtml) {
    return <p className="mt-6 whitespace-pre-line typo-title3">{post.title}</p>;
  }

  return (
    <div
      className={styles.markdown}
      dangerouslySetInnerHTML={{
        __html: sanitize(post?.titleHtml, { ALLOWED_TAGS: ['a'] }),
      }}
    />
  );
}
