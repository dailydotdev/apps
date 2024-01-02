import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { CardImage, CardVideoImage } from './Card';
import FeatherIcon from '../icons/Feather';
import PostAuthor from './PostAuthor';
import { ProfilePicture } from '../ProfilePicture';
import { Post, isVideoPost } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';
import { visibleOnGroupHover } from './common';

interface PostCardFooterClassName {
  image?: string;
}

type PostCardFooterProps = {
  insaneMode: boolean;
  openNewTab: boolean;
  showImage: boolean;
  post: Post;
  className: PostCardFooterClassName;
};

export const PostCardFooter = ({
  post,
  showImage,
  className,
}: PostCardFooterProps): ReactElement => {
  const isVideoType = isVideoPost(post);
  const ImageComponent = isVideoType ? CardVideoImage : CardImage;
  return (
    <>
      {!showImage && post.author && (
        <PostAuthor
          author={post.author}
          className={classNames(
            'mx-4 mt-2 hidden tablet:flex laptop:hidden',
            visibleOnGroupHover,
          )}
        />
      )}
      {showImage && (
        <ImageComponent
          alt="Post Cover image"
          src={post.image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className={classNames(
            'w-full object-cover',
            className.image,
            !isVideoType && 'my-2',
          )}
          loading="lazy"
          data-testid="postImage"
          {...(isVideoType && { wrapperClassName: 'my-2' })}
        />
      )}
      {showImage && post.author && (
        <div
          className={classNames(
            'absolute z-1 mt-2 flex w-full items-center rounded-t-xl bg-theme-bg-primary px-3 py-2 font-bold text-theme-label-secondary typo-callout',
            visibleOnGroupHover,
          )}
        >
          <ProfilePicture size="small" user={post.author} />
          <span className="mx-3 flex-1 truncate">{post.author.name}</span>
          <FeatherIcon secondary className="text-2xl text-theme-status-help" />
        </div>
      )}
    </>
  );
};
