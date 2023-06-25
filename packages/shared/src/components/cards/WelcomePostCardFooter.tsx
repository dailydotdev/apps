import React, { ReactElement, useMemo, useState } from 'react';
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
  const [image, setImage] = useState(post?.image);
  const content = useMemo(
    () =>
      post?.contentHtml ? sanitize(post.contentHtml, { ALLOWED_TAGS: [] }) : '',
    [post?.contentHtml],
  );

  const imageCheck = useMemo(() => {
    if (image) return true;

    const parser = new DOMParser();
    const doc = parser.parseFromString(post?.contentHtml, 'text/html');
    const imgTag = doc.querySelector('img');
    if (imgTag) {
      setImage(imgTag.getAttribute('src') || null);
      return true;
    }

    return false;
  }, [post?.contentHtml, image]);

  if (imageCheck) {
    return (
      <CardImage
        alt="Post Cover image"
        src={image}
        fallbackSrc={cloudinary.post.imageCoverPlaceholder}
        className="object-cover my-2"
        loading="lazy"
      />
    );
  }
  if (content) {
    return (
      <p className="px-2 break-words line-clamp-6 typo-callout">{content}</p>
    );
  }

  return null;
};
