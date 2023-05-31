import React, { ReactElement } from 'react';
import { Post, PostType } from '../../graphql/posts';
import Markdown from '../Markdown';
import { LazyImage } from '../LazyImage';
import { cloudinary } from '../../lib/image';
import { Image } from '../image/Image';

interface WelcomePostContentProps {
  post: Post;
}

function WelcomePostContent({ post }: WelcomePostContentProps): ReactElement {
  return (
    <>
      <h1 className="my-6 font-bold whitespace-pre-line typo-title2">
        {post.title}
      </h1>
      {post.type === PostType.Freeform && post.image && (
        <Image
          src={post.image}
          alt="Post cover image"
          className="object-cover mb-10 w-full h-auto rounded-xl max-h-[18rem]"
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
        />
      )}
      <Markdown content={post.contentHtml} />
      {post.type === PostType.Welcome && post.image && (
        <div className="block overflow-hidden mt-8 max-w-sm rounded-2xl cursor-pointer h-fit">
          <LazyImage
            imgSrc={post.image}
            imgAlt="Post cover image"
            ratio="52%"
            eager
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          />
        </div>
      )}
    </>
  );
}

export default WelcomePostContent;
