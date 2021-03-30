import React, { HTMLAttributes, ReactElement, useMemo, useState } from 'react';
import Link from 'next/link';
import { Post } from '../../graphql/posts';
import {
  Card,
  CardHeader,
  CardImage,
  CardLink,
  CardSpace,
  CardTextContainer,
  CardTitle,
  featuredCommentsToButtons,
} from './Card';
import { SmallRoundedImage } from '../utilities';
import { postDateFormat } from '../../lib/dateFormat';
import QuaternaryButton from '../buttons/QuaternaryButton';
import UpvoteIcon from '../../icons/upvote.svg';
import CommentIcon from '../../icons/comment.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import FeatherIcon from '../../icons/feather.svg';
import MenuIcon from '../../icons/menu.svg';
import classNames from 'classnames';
import rem from '../../macros/rem.macro';
import dynamic from 'next/dynamic';
import InteractionCounter from '../InteractionCounter';
import { Comment } from '../../graphql/comments';
import Button from '../buttons/Button';
import styles from '../../styles/cards.module.css';
import { getTooltipProps } from '../../lib/tooltip';
import TrendingFlag from './TrendingFlag';

const ShareIcon = dynamic(() => import('../../icons/share.svg'));
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
} & HTMLAttributes<HTMLDivElement>;

export function PostCard({
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
  ...props
}: PostCardProps): ReactElement {
  const [selectedComment, setSelectedComment] = useState<Comment>();
  const date = useMemo(() => postDateFormat(post.createdAt), [post.createdAt]);

  const { trending } = post;

  const card = (
    <Card
      {...props}
      className={classNames(
        {
          [styles.read]: post.read,
          [styles.hideContent]: selectedComment,
          [styles.trending]: trending > 0,
        },
        styles.post,
        'group',
        className,
      )}
    >
      <CardLink
        href={post.permalink}
        {...(openNewTab
          ? { target: '_blank', rel: 'noopener' }
          : { target: '_self' })}
        title={post.title}
        onClick={() => onLinkClick?.(post)}
        onMouseUp={(event) => event.button === 1 && onLinkClick?.(post)}
      />
      <CardTextContainer>
        <CardHeader>
          {notification ? (
            <div className="flex-1 px-4 py-1.5 -mx-1.5 rounded-10 bg-theme-label-primary text-theme-label-invert typo-callout">
              {notification}
            </div>
          ) : (
            <>
              <Link href={`/sources/${post.source.id}`} prefetch={false}>
                <a
                  {...getTooltipProps(post.source.name)}
                  className="flex pr-2 cursor-pointer"
                >
                  <img
                    src={post.source.image}
                    alt={post.source.name}
                    className="w-6 h-6 rounded-full bg-theme-bg-tertiary"
                  />
                </a>
              </Link>
              {featuredCommentsToButtons(
                post.featuredComments,
                setSelectedComment,
              )}
              {enableMenu && (
                <Button
                  className={classNames(
                    'btn-tertiary ml-auto -mr-0.5',
                    !menuOpened && 'mouse:invisible mouse:group-hover:visible',
                  )}
                  buttonSize="small"
                  icon={<MenuIcon />}
                  onClick={(event) => onMenuClick?.(event, post)}
                  pressed={menuOpened}
                  {...getTooltipProps('More')}
                />
              )}
            </>
          )}
        </CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardTextContainer>
      <CardSpace />
      <div className="flex items-center mx-4 text-theme-label-tertiary typo-footnote">
        <time dateTime={post.createdAt}>{date}</time>
        {!!post.readTime && (
          <>
            <div className="w-0.5 h-0.5 mx-1 rounded-full bg-theme-label-tertiary" />
            <span data-testid="readTime">{post.readTime}m read time</span>
          </>
        )}
      </div>
      <CardImage
        imgAlt="Post Cover image"
        imgSrc={post.image}
        fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
        className="my-2"
      >
        {post.author && (
          <div
            className={`relative flex items-center py-2 px-3 text-theme-label-secondary bg-theme-bg-primary z-1 font-bold typo-callout ${styles.authorBox}`}
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
      <div
        className={`flex flex-row items-center justify-between mx-4 ${styles.actionButtons}`}
      >
        <QuaternaryButton
          id={`post-${post.id}-upvote-btn`}
          icon={<UpvoteIcon />}
          buttonSize="small"
          pressed={post.upvoted}
          {...getTooltipProps(post.upvoted ? 'Remove upvote' : 'Upvote')}
          onClick={() => onUpvoteClick?.(post, !post.upvoted)}
          style={{ width: rem(78) }}
          className="btn-tertiary-avocado"
        >
          <InteractionCounter value={post.numUpvotes > 0 && post.numUpvotes} />
        </QuaternaryButton>
        <Link href={post.commentsPermalink} passHref prefetch={false}>
          <QuaternaryButton
            id={`post-${post.id}-comment-btn`}
            tag="a"
            icon={<CommentIcon />}
            buttonSize="small"
            pressed={post.commented}
            {...getTooltipProps('Comments')}
            onClick={() => onCommentClick?.(post)}
            style={{ width: rem(78) }}
            className="btn-tertiary-avocado"
          >
            <InteractionCounter
              value={post.numComments > 0 && post.numComments}
            />
          </QuaternaryButton>
        </Link>
        <Button
          icon={<BookmarkIcon />}
          buttonSize="small"
          pressed={post.bookmarked}
          {...getTooltipProps(post.bookmarked ? 'Remove bookmark' : 'Bookmark')}
          onClick={() => onBookmarkClick?.(post, !post.bookmarked)}
          className="btn-tertiary-bun"
        />
        {showShare && (
          <Button
            icon={<ShareIcon />}
            buttonSize="small"
            {...getTooltipProps('Share post')}
            onClick={() => onShare?.(post)}
            className="btn-tertiary"
          />
        )}
      </div>
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
}
