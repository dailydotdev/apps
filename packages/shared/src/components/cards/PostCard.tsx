import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  Ref,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import {
  Card,
  CardButton,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import FeatherIcon from '../icons/Feather';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import PostAuthor from './PostAuthor';
import { ProfilePicture } from '../ProfilePicture';
import { PostCardHeader } from './PostCardHeader';
import classed from '../../lib/classed';
import { PostFooterOverlay } from './PostFooterOverlay';
import { PostCardTests } from '../post/common';

type Callback = (post: Post) => unknown;

export type PostCardProps = {
  post: Post;
  onPostClick?: Callback;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: Callback;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onMenuClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  onShare?: Callback;
  openNewTab?: boolean;
  enableMenu?: boolean;
  menuOpened?: boolean;
  showImage?: boolean;
  additionalInteractionButtonFeature?: string;
  insaneMode?: boolean;
} & HTMLAttributes<HTMLDivElement> &
  PostCardTests;

export const PostCard = forwardRef(function PostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onBookmarkClick,
    onMenuClick,
    onShare,
    openNewTab,
    enableMenu,
    menuOpened,
    className,
    children,
    showImage = true,
    style,
    additionalInteractionButtonFeature,
    insaneMode,
    onReadArticleClick,
    postCardVersion = 'v1',
    postModalByDefault,
    postEngagementNonClickable,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const onPostCardClick = () => onPostClick(post);
  const isV1 = postCardVersion === 'v1';
  const Containter = useMemo(
    () =>
      classed(
        'div',
        'relative flex flex-1',
        postCardVersion === 'v1' ? 'flex-col' : 'flex-col-reverse',
      ),
    [postCardVersion],
  );

  const { trending } = post;
  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};
  const card = (
    <Card
      {...props}
      className={getPostClassNames(post, className)}
      style={{ ...style, ...customStyle }}
      ref={ref}
    >
      {postModalByDefault ? (
        <CardButton title={post.title} onClick={onPostCardClick} />
      ) : (
        <PostLink
          title={post.title}
          href={post.permalink}
          openNewTab={openNewTab}
          onLinkClick={onPostCardClick}
        />
      )}
      <CardTextContainer>
        {isV1 && (
          <PostCardHeader
            source={post.source}
            postLink={post.permalink}
            onMenuClick={(event) => onMenuClick?.(event, post)}
            onReadArticleClick={onReadArticleClick}
            postModalByDefault={postModalByDefault}
            postEngagementNonClickable={postEngagementNonClickable}
          />
        )}
        <CardTitle>{post.title}</CardTitle>
      </CardTextContainer>
      <Containter className="mb-8 tablet:mb-0">
        <CardSpace />
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="mx-4"
        />
      </Containter>
      <Containter>
        {postCardVersion === 'v2' && (
          <PostFooterOverlay
            className={classNames(
              'rounded-b-12',
              insaneMode
                ? 'relative tablet:absolute tablet:right-0 tablet:bottom-0 tablet:left-0 mt-2 tablet:mt-0 tablet:border-0 border-t border-theme-divider-tertiary'
                : 'absolute right-0 bottom-0 left-0',
            )}
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
            <FeatherIcon className="text-2xl text-theme-status-help" />
          </div>
        )}
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onBookmarkClick={onBookmarkClick}
          onShare={onShare}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
          postCardVersion={postCardVersion}
          postModalByDefault={postModalByDefault}
          postEngagementNonClickable={postEngagementNonClickable}
          additionalInteractionButtonFeature={
            additionalInteractionButtonFeature
          }
          className={classNames(
            'mx-4',
            !postEngagementNonClickable && 'justify-between',
            !showImage && 'my-4 laptop:mb-0',
          )}
        />
      </Containter>
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
