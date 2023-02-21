import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { CardImage } from './Card';
import FeatherIcon from '../icons/Feather';
import PostAuthor from './PostAuthor';
import { ProfilePicture } from '../ProfilePicture';
import { Post } from '../../graphql/posts';
import styles from './Card.module.css';
import { cloudinary } from '../../lib/image';

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
      {!showImage && (
        <PostAuthor post={post} className="mx-4 mt-2 hidden tablet:flex" />
      )}
      {showImage && (
        <CardImage
          alt="Post Cover image"
          src={post.image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className="my-2 object-cover"
          loading="lazy"
        />
      )}
      {showImage && post.author && (
        <div
          className={classNames(
            'absolute rounded-t-xl mt-2 flex items-center py-2 px-3 text-theme-label-secondary bg-theme-bg-primary z-1 font-bold typo-callout w-full',
            styles.authorBox,
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
