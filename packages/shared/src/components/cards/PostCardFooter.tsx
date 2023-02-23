import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { CardImage } from './Card';
import FeatherIcon from '../icons/Feather';
import PostAuthor from './PostAuthor';
import { ProfilePicture } from '../ProfilePicture';
import { Post } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';
import { visibleOnGroupHover } from './common';

type PostCardFooterProps = {
  insaneMode: boolean;
  openNewTab: boolean;
  showImage: boolean;
  post: Post;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
};

export const PostCardFooter = ({
  post,
  showImage,
}: PostCardFooterProps): ReactElement => {
  return (
    <>
      {!showImage && post.author && (
        <PostAuthor
          author={post.author}
          className={classNames(
            'hidden tablet:flex laptop:hidden mx-4 mt-2',
            visibleOnGroupHover,
          )}
        />
      )}
      {showImage && (
        <CardImage
          alt="Post Cover image"
          src={post.image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className="object-cover my-2"
          loading="lazy"
        />
      )}
      {showImage && post.author && (
        <div
          className={classNames(
            'absolute rounded-t-xl mt-2 flex items-center py-2 px-3 text-theme-label-secondary bg-theme-bg-primary z-1 font-bold typo-callout w-full',
            visibleOnGroupHover,
          )}
        >
          <ProfilePicture size="small" user={post.author} />
          <span className="flex-1 mx-3 truncate">{post.author.name}</span>
          <FeatherIcon secondary className="text-2xl text-theme-status-help" />
        </div>
      )}
    </>
  );
};
