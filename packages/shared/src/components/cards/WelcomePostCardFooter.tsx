import React, { ReactElement, useRef } from 'react';
import { sanitize } from 'dompurify';
import { CardImage } from './Card';
import { Post } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';

type WelcomePostCardFooterProps = {
  post: Post;
};

export const WelcomePostCardFooter = ({
  post,
}: WelcomePostCardFooterProps): ReactElement => {
  const contentRef = useRef<HTMLDivElement>();

  if (post.image) {
    return (
      <CardImage
        alt="Post Cover image"
        src={post.image}
        fallbackSrc={cloudinary.post.imageCoverPlaceholder}
        className="object-cover my-2"
        loading="lazy"
      />
    );
  }

  if (post.content) {
    return (
      <>
        <p className="px-2 break-words line-clamp-6 typo-callout">
          {contentRef?.current?.textContent}
        </p>
        <div
          ref={contentRef}
          className="hidden"
          dangerouslySetInnerHTML={{
            __html: sanitize(post.contentHtml, { ADD_ATTR: ['target'] }),
          }}
        />
      </>
    );
  }

  return null;
};
