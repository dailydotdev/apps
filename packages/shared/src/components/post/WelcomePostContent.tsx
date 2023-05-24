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
      <h1 className="my-6 font-bold whitespace-pre-line typo-title2">
        {post.title}
      </h1>
      <Markdown content={post.contentHtml} />
      <div className="block overflow-hidden mt-8 max-w-sm rounded-2xl h-fit">
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
