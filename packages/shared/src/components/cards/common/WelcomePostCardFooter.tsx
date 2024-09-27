import React, { ReactElement, useMemo } from 'react';
import { sanitize } from 'dompurify';
import { CardSpace } from './Card';
import { Post } from '../../../graphql/posts';
import { CardCover } from './CardCover';
import { useCardCover } from '../../../hooks/feed/useCardCover';

interface WelcomePostCardFooterProps {
  post: Post;
  image?: string;
  contentHtml?: string;
  onShare?: (post: Post) => void;
}

export const WelcomePostCardFooter = ({
  post,
  image,
  onShare,
  contentHtml,
}: WelcomePostCardFooterProps): ReactElement => {
  const { overlay } = useCardCover({
    post,
    className: {
      bookmark: {
        container: !image && '!justify-start !items-start ml-2 mt-4 gap-1',
      },
    },
  });
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
          onShare={onShare}
          post={post}
          imageProps={{
            src: image,
            className: 'my-2 w-full',
            alt: 'Post Cover image',
          }}
        />
      </>
    );
  }

  if (overlay) {
    return <>{overlay}</>;
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
