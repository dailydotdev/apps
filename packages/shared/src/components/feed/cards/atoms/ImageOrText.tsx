import React, { ReactElement, useMemo } from 'react';
import { sanitize } from 'dompurify';
import { cloudinary } from '../../../../lib/image';
import { Post } from '../../../../graphql/posts';
import { Image } from './Image';
import { Typography, TypographyType } from '../../../typography/Typography';

export default function ImageOrText({ post }: { post: Post }): ReactElement {
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

  return (
    <section className="flex flex-1 flex-col">
      {image && (
        <Image
          alt="Post Cover image"
          src={image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          loading="lazy"
          className="my-2 w-full object-cover"
        />
      )}
      {content && (
        <Typography
          type={TypographyType.Callout}
          className="line-clamp-6 break-words px-2"
        >
          {decodedText}
        </Typography>
      )}
    </section>
  );
}
