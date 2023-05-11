import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import Markdown from '../Markdown';
import { LazyImage } from '../LazyImage';
import { cloudinary } from '../../lib/image';

interface WelcomePostContentProps {
  post: Post;
}

function WelcomePostContent({ post }: WelcomePostContentProps): ReactElement {
  return (
    <>
      <Markdown content={post.contentHtml} />
      <div className="block overflow-hidden mt-8 w-96 rounded-2xl cursor-pointer h-fit">
        <LazyImage
          imgSrc={post.image}
          imgAlt="Post cover image"
          ratio="52%"
          eager
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
        />
      </div>
    </>
  );
}

export default WelcomePostContent;
