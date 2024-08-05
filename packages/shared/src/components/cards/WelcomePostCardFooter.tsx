import React, { ReactElement, useMemo } from 'react';
import { sanitize } from 'dompurify';
import { CardSpace } from './Card';
import { Post } from '../../graphql/posts';
import { CardCover } from './common/CardCover';

interface WelcomePostCardFooterProps {
  post: Post;
  image?: string;
  contentHtml?: string;
}

export const WelcomePostCardFooter = ({
  post,
  image,
  contentHtml,
}: WelcomePostCardFooterProps): ReactElement => {
  const content = useMemo(
    () => (contentHtml ? sanitize(contentHtml, { ALLOWED_TAGS: [] }) : ''),
    [contentHtml],
  );
  const decodedText = useMemo(() => {
    const span = document.createElement('div');
    span.innerHTML = content || '';
    return span.innerText || content;
  }, [content]);

  if (image) {
    return (
      <>
        <CardSpace />
        <CardCover
          post={post}
          imageProps={{
            src: image,
            className: 'my-2 w-full',
            loading: 'lazy',
            alt: 'Post Cover image',
          }}
        />
      </>
    );
  }

  if (content) {
    return (
      <p className="mt-1 line-clamp-6 break-words px-2 typo-callout">
        {decodedText}
      </p>
    );
  }

  return null;
};
