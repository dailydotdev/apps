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
      <h1 className="my-6 whitespace-pre-line font-bold typo-title2">
        {post.title}
      </h1>
      {post.type === PostType.Freeform && post.image && (
        <Link href={post.image}>
          <a target="_blank" rel="noopener noreferrer">
            <Image
              src={post.image}
              alt="Post cover image"
              className="mb-10 h-auto max-h-[62.5rem] w-full rounded-12 object-cover"
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
        <div className="mb-5 mt-8 block h-fit max-w-sm cursor-pointer overflow-hidden rounded-16">
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
