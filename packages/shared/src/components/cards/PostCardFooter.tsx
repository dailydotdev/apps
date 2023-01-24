import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { CardImage } from './Card';
import FeatherIcon from '../icons/Feather';
import PostAuthor from './PostAuthor';
import { ProfilePicture } from '../ProfilePicture';
import { PostFooterOverlay } from './PostFooterOverlay';
import { PostCardTests } from '../post/common';
import { Post } from '../../graphql/posts';
import styles from './Card.module.css';

type PostCardFooterProps = {
  insaneMode: boolean;
  openNewTab: boolean;
  showImage: boolean;
  post: Post;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
} & PostCardTests;

export const PostCardFooter = ({
  postCardVersion,
  insaneMode,
  openNewTab,
  post,
  onReadArticleClick,
  postModalByDefault,
  postEngagementNonClickable,
  showImage,
}: PostCardFooterProps): ReactElement => {
  const isV1 = postCardVersion === 'v1';
  return (
    <>
      {postCardVersion === 'v2' && (
        <PostFooterOverlay
          className={classNames(
            'rounded-b-12',
            insaneMode
              ? 'relative tablet:absolute tablet:right-0 tablet:bottom-0 tablet:left-0 mt-2 tablet:mt-0 tablet:border-0 border-t border-theme-divider-tertiary'
              : 'absolute right-0 bottom-0 left-0',
          )}
          openNewTab={openNewTab}
          postLink={post.permalink}
          source={post.source}
          author={post.author}
          insaneMode={insaneMode}
          onReadArticleClick={onReadArticleClick}
          postModalByDefault={postModalByDefault}
          postEngagementNonClickable={postEngagementNonClickable}
        />
      )}
      {!showImage && (
        <PostAuthor post={post} className="hidden tablet:flex mx-4 mt-2" />
      )}
      {showImage && (
        <CardImage
          alt="Post Cover image"
          src={post.image}
          fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
          className={classNames('object-cover', isV1 ? 'my-2' : 'mt-2')}
          loading="lazy"
        />
      )}
      {showImage && post.author && isV1 && (
        <div
          className={classNames(
            'absolute rounded-t-xl mt-2 flex items-center py-2 px-3 text-theme-label-secondary bg-theme-bg-primary z-1 font-bold typo-callout w-full',
            styles.authorBox,
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
