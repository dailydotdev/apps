import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  Ref,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import {
  Card,
  CardButton,
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import classed from '../../lib/classed';
import { PostCardTests } from '../post/common';
import { SharedPostCardHeader } from './SharedPostCardHeader';
import { SharedPostText } from './SharedPostText';
import { PostCardFooter } from './PostCardFooter';
import { SharedPostCardFooter } from './SharedPostCardFooter';

type Callback = (post: Post) => unknown;
const Containter = classed('div', 'relative flex flex-1 flex-col');

export type PostCardProps = {
  post: Post;
  onPostClick?: Callback;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: Callback;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onMenuClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  onShare?: Callback;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  openNewTab?: boolean;
  enableMenu?: boolean;
  menuOpened?: boolean;
  showImage?: boolean;
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
    onShareClick,
    openNewTab,
    enableMenu,
    menuOpened,
    className,
    children,
    showImage = true,
    style,
    insaneMode,
    onReadArticleClick,
    postModalByDefault,
    postEngagementNonClickable,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const onPostCardClick = () => onPostClick(post);
  const [isSharedPostShort, setSharedPostShort] = useState(true);
  const containerRef = useRef<HTMLDivElement>();
  const onSharedPostTextHeightChange = (height: number) => {
    if (!containerRef.current) {
      return;
    }
    setSharedPostShort(containerRef.current.offsetHeight - height < 40);
  };
  const isSharedPost = !!post.sharedPost;
  const { trending } = post;
  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};
  const card = (
    <Card
      {...props}
      className={getPostClassNames(post, className, 'min-h-[22.5rem]')}
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
        {isSharedPost ? (
          <SharedPostCardHeader
            author={post.author}
            source={post.source}
            permalink={post.permalink}
            onMenuClick={(event) => onMenuClick?.(event, post)}
            onReadArticleClick={onReadArticleClick}
            createdAt={post.createdAt}
          />
        ) : (
          <>
            <PostCardHeader
              openNewTab={openNewTab}
              source={post.source}
              postLink={post.permalink}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
              postModalByDefault={postModalByDefault}
              postEngagementNonClickable={postEngagementNonClickable}
            />
            <CardTitle>{post.title}</CardTitle>
          </>
        )}
      </CardTextContainer>
      {isSharedPost ? (
        <SharedPostText
          title={post.title}
          onHeightChange={onSharedPostTextHeightChange}
        />
      ) : (
        <Containter className="mb-8 tablet:mb-0">
          <CardSpace />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            className="mx-4"
          />
        </Containter>
      )}
      <Containter ref={containerRef}>
        {isSharedPost ? (
          <SharedPostCardFooter
            sharedPost={post.sharedPost}
            isShort={isSharedPostShort}
          />
        ) : (
          <PostCardFooter
            insaneMode={insaneMode}
            openNewTab={openNewTab}
            post={post}
            showImage={showImage}
            onReadArticleClick={onReadArticleClick}
            postEngagementNonClickable={postEngagementNonClickable}
            postModalByDefault={postModalByDefault}
          />
        )}
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onBookmarkClick={onBookmarkClick}
          onShare={onShare}
          onShareClick={onShareClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
          postModalByDefault={postModalByDefault}
          postEngagementNonClickable={postEngagementNonClickable}
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
