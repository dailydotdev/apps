import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  Ref,
  useState,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { Post } from '../../graphql/posts';
import {
  Card,
  CardHeader,
  CardImage,
  CardNotification,
  CardSpace,
  CardTextContainer,
  CardTitle,
  featuredCommentsToButtons,
  getPostClassNames,
} from './Card';
import FeatherIcon from '../../../icons/feather.svg';
import { Comment } from '../../graphql/comments';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import PostAuthor from './PostAuthor';
import OptionsButton from '../buttons/OptionsButton';
import { ProfilePicture } from '../ProfilePicture';

const FeaturedComment = dynamic(() => import('./FeaturedComment'));

type Callback = (post: Post) => unknown;

export type PostCardProps = {
  post: Post;
  onLinkClick?: Callback;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: Callback;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onMenuClick?: (event: React.MouseEvent, post: Post) => unknown;
  showShare?: boolean;
  onShare?: Callback;
  openNewTab?: boolean;
  enableMenu?: boolean;
  menuOpened?: boolean;
  notification?: string;
  showImage?: boolean;
  postHeadingFont: string;
} & HTMLAttributes<HTMLDivElement>;

export const PostCard = forwardRef(function PostCard(
  {
    post,
    onLinkClick,
    onUpvoteClick,
    onCommentClick,
    onBookmarkClick,
    onMenuClick,
    showShare,
    onShare,
    openNewTab,
    enableMenu,
    menuOpened,
    notification,
    className,
    children,
    showImage = true,
    style,
    postHeadingFont,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const [selectedComment, setSelectedComment] = useState<Comment>();
  const { trending } = post;

  const customStyle =
    selectedComment && !showImage ? { minHeight: '15.125rem' } : {};
  const card = (
    <Card
      {...props}
      className={getPostClassNames(post, selectedComment, className)}
      style={{ ...style, ...customStyle }}
      ref={ref}
    >
      <PostLink post={post} openNewTab={openNewTab} onLinkClick={onLinkClick} />
      <CardTextContainer>
        <CardHeader>
          {notification ? (
            <CardNotification className="flex-1 text-center">
              {notification}
            </CardNotification>
          ) : (
            <>
              <SourceButton post={post} style={{ marginRight: '0.875rem' }} />
              {featuredCommentsToButtons(
                post.featuredComments,
                setSelectedComment,
              )}
              <OptionsButton
                onClick={(event) => onMenuClick?.(event, post)}
                post={post}
              />
            </>
          )}
        </CardHeader>
        <CardTitle className={classNames(className, postHeadingFont)}>
          {post.title}
        </CardTitle>
      </CardTextContainer>
      <CardSpace />
      <PostMetadata
        createdAt={post.createdAt}
        readTime={post.readTime}
        className="mx-4"
      />
      {!showImage && (
        <PostAuthor
          post={post}
          selectedComment={selectedComment}
          className="mx-4 mt-2"
        />
      )}
      {showImage && (
        <CardImage
          imgAlt="Post Cover image"
          imgSrc={post.image}
          fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
          className="my-2"
        >
          {post.author && (
            <div
              className={classNames(
                'absolute flex items-center py-2 px-3 text-theme-label-secondary bg-theme-bg-primary z-1 font-bold typo-callout w-full',
                selectedComment ? 'invisible' : styles.authorBox,
              )}
            >
              <ProfilePicture
                className="rounded-full"
                size="small"
                user={post.author}
              />
              <span className="flex-1 mx-3 truncate">{post.author.name}</span>
              <FeatherIcon className="text-2xl text-theme-status-help" />
            </div>
          )}
        </CardImage>
      )}
      <ActionButtons
        post={post}
        onUpvoteClick={onUpvoteClick}
        onCommentClick={onCommentClick}
        onBookmarkClick={onBookmarkClick}
        showShare={showShare}
        onShare={onShare}
        className={classNames('justify-between mx-4', !showImage && 'mt-4')}
      />
      {selectedComment && (
        <FeaturedComment
          comment={selectedComment}
          featuredComments={post.featuredComments}
          onCommentClick={setSelectedComment}
          onBack={() => setSelectedComment(null)}
          className={styles.show}
        />
      )}
      {children}
    </Card>
  );

  if (trending) {
    return (
      <div className={`relative ${styles.cardContainer}`}>
        {card}
        <TrendingFlag trending={trending} />
      </div>
    );
  }
  return card;
});
