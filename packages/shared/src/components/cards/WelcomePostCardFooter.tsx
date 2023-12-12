import React, { ReactElement, useMemo } from 'react';
import { sanitize } from 'dompurify';
import { CardImage, CardSpace } from './Card';
import { Post } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';

type WelcomePostCardFooterProps = {
  post: Post;
};

export const WelcomePostCardFooter = ({
  post,
}: WelcomePostCardFooterProps): ReactElement => {
  const content = useMemo(
    () =>
      post?.contentHtml ? sanitize(post.contentHtml, { ALLOWED_TAGS: [] }) : '',
    [post?.contentHtml],
  );

  const image = useMemo(() => {
    if (post?.image) {
      return post?.image;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(post?.contentHtml, 'text/html');
    const imgTag = doc.querySelector('img');
    if (imgTag) {
      return imgTag.getAttribute('src');
    }

    return undefined;
  }, [post?.contentHtml, post?.image]);

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
          className="object-cover my-2"
          loading="lazy"
        />
      </>
    );
  }
  if (content) {
    return (
      <p className="px-2 break-words line-clamp-6 typo-callout">
        {decodedText}
      </p>
    );
  }

  return null;
};
