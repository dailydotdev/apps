import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Post, PostType } from '../../graphql/posts';
import Markdown from '../Markdown';
import { LazyImage } from '../LazyImage';
import { cloudinary } from '../../lib/image';
import { Image } from '../image/Image';

interface MarkdownPostContentProps {
  post: Post;
}

function MarkdownPostContent({ post }: MarkdownPostContentProps): ReactElement {
  return (
    <>
      <h1 className="my-6 font-bold whitespace-pre-line typo-title2">
        {post.title}
      </h1>
      {post.type === PostType.Freeform && post.image && (
        <Link href={post.image}>
          <a target="_blank" rel="noopener noreferrer">
            <Image
              src={post.image}
              alt="Post cover image"
              className="object-cover mb-10 w-full h-auto rounded-xl max-h-[62.5rem]"
              fallbackSrc={cloudinary.post.imageCoverPlaceholder}
            />
          </a>
        </Link>
      )}
      <Markdown
        content={post.contentHtml}
        className={post.type !== PostType.Welcome && 'mb-5'}
      />
      {post.type === PostType.Welcome && post.image && (
        <div className="block overflow-hidden mt-8 mb-5 max-w-sm rounded-2xl cursor-pointer h-fit">
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

export default MarkdownPostContent;
