import React, { ReactElement } from 'react';
import { Post } from '../../../graphql/posts';
import Markdown from '../../Markdown';

interface SharePostTitleProps {
  post: Post;
}

export function SharePostTitle({ post }: SharePostTitleProps): ReactElement {
  if (!post?.title) {
    return null;
  }

  if (!post?.titleHtml) {
    return <p className="mt-6 whitespace-pre-line typo-title3">{post.title}</p>;
  }

  return <Markdown className="mt-6" content={post.titleHtml} />;
}
