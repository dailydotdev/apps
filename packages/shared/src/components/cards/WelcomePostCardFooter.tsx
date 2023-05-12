import React, { ReactElement } from 'react';
import { CardImage } from './Card';
import { Post } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';

type WelcomePostCardFooterProps = {
  post: Post;
};

export const WelcomePostCardFooter = ({
  post,
}: WelcomePostCardFooterProps): ReactElement => {
  return (
    <CardImage
      alt="Post Cover image"
      src={post.image}
      fallbackSrc={cloudinary.post.imageCoverPlaceholder}
      className="object-cover my-2"
      loading="lazy"
    />
  );
};
