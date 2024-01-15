import React, { ReactElement, useMemo } from 'react';
import { sanitize } from 'dompurify';
import { CardImage, CardSpace } from './Card';
import { cloudinary } from '../../lib/image';

interface WelcomePostCardFooterProps {
  image?: string;
  contentHtml?: string;
}

export const WelcomePostCardFooter = ({
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
        <CardImage
          alt="Post Cover image"
          src={image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className="my-2 object-cover"
          loading="lazy"
        />
      </>
    );
  }

  if (content) {
    return (
      <p className="my-4 line-clamp-6 break-words typo-callout">
        {decodedText}
      </p>
    );
  }

  return null;
};
