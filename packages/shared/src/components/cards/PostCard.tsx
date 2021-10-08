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
import { SmallRoundedImage } from '../utilities';
import FeatherIcon from '../../../icons/feather.svg';
import FlagIcon from '../../../icons/flag.svg';
import { Comment } from '../../graphql/comments';
import { ForwardedButton as Button } from '../buttons/Button';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import PostAuthor from './PostAuthor';

const LazyTooltip = dynamic(() => import('../tooltips/LazyTooltip'));

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
            <CardNotification className="flex-1">
              {notification}
            </CardNotification>
          ) : (
            <>
              <SourceButton post={post} style={{ marginRight: '0.875rem' }} />
              {featuredCommentsToButtons(
                post.featuredComments,
                setSelectedComment,
              )}
              {enableMenu && !selectedComment && (
                <LazyTooltip content="Report post">
                  <Button
                    className={classNames(
                      'btn-tertiary',
                      !menuOpened &&
                        'mouse:invisible mouse:group-hover:visible',
                    )}
                    style={{ marginLeft: 'auto', marginRight: '-0.125rem' }}
                    buttonSize="small"
                    icon={<FlagIcon />}
                    onClick={(event) => onMenuClick?.(event, post)}
                    pressed={menuOpened}
                  />
                </LazyTooltip>
              )}
            </>
          )}
        </CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardTextContainer>
      <CardSpace />
      <PostMetadata post={post} className="mx-4" />
      {!showImage && (
        <PostAuthor
          post={post}
          selectedComment={selectedComment}
          className="mt-2 mx-4"
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
              <SmallRoundedImage
                imgSrc={post.author.image}
                imgAlt="Author's profile picture"
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
