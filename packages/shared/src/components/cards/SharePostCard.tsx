import React, { forwardRef, ReactElement, Ref, useRef, useState } from 'react';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import ActionButtons from './ActionButtons';
import { SharedPostText } from './SharedPostText';
import { SharedPostCardFooter } from './SharedPostCardFooter';
import { Container, PostCardProps } from './common';
import OptionsButton from '../buttons/OptionsButton';
import FeedItemContainer from './FeedItemContainer';
import { isVideoPost } from '../../graphql/posts';
import { SquadPostCardHeader } from './common/SquadPostCardHeader';
import CardOverlay from './common/CardOverlay';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PostCardHeader } from './PostCardHeader';
import { PostCardFooter } from './PostCardFooter';
import PostMetadata from './PostMetadata';
import PostTags from './PostTags';

export const SharePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onBookmarkClick,
    openNewTab,
    children,
    onReadArticleClick,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending } = post;
  const onPostCardClick = () => onPostClick(post);
  const [isSharedPostShort, setSharedPostShort] = useState(true);
  const containerRef = useRef<HTMLDivElement>();
  const onSharedPostTextHeightChange = (height: number) => {
    if (!containerRef.current) {
      return;
    }
    setSharedPostShort(containerRef.current.offsetHeight - height < 40);
  };
  const isVideoType = isVideoPost(post);
  const improvedSharedPostCard = useFeature(feature.improvedSharedPostCard);

  const postImage = improvedSharedPostCard ? post.sharedPost.image : post.image;
  const postCreatedAt = improvedSharedPostCard
    ? post.createdAt
    : post.sharedPost.createdAt;

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className,
          'min-h-card max-h-card',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
    >
      <CardOverlay post={post} onPostCardClick={onPostCardClick} />
      {improvedSharedPostCard ? (
        <>
          <CardTextContainer>
            <PostCardHeader
              post={post}
              className="flex"
              openNewTab={openNewTab}
              source={post.source}
              postLink={post.sharedPost.permalink}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
            />
            <CardTitle>{post?.title || post.sharedPost.title}</CardTitle>
          </CardTextContainer>
          <Container>
            <CardSpace />
            <PostTags tags={post.sharedPost.tags} />
            <PostMetadata
              createdAt={postCreatedAt}
              readTime={post.sharedPost.readTime}
              isVideoType={isVideoType}
              className="mx-4"
            />
          </Container>
        </>
      ) : (
        <>
          <OptionsButton
            className="absolute right-2 top-2 group-hover:flex laptop:hidden"
            onClick={(event) => onMenuClick?.(event, post)}
            tooltipPlacement="top"
          />
          <SquadPostCardHeader
            author={post.author}
            source={post.source}
            createdAt={post.createdAt}
            enableSourceHeader={enableSourceHeader}
          />
          <SharedPostText
            title={post.title}
            onHeightChange={onSharedPostTextHeightChange}
          />
        </>
      )}
      <Container
        ref={containerRef}
        className={!improvedSharedPostCard && 'min-h-0 justify-end'}
      >
        {improvedSharedPostCard ? (
          <PostCardFooter
            image={postImage}
            openNewTab={openNewTab}
            post={post}
            className={{}}
          />
        ) : (
          <SharedPostCardFooter
            image={postImage}
            sharedPost={post.sharedPost}
            isShort={isSharedPostShort}
            isVideoType={isVideoType}
            post={post}
          />
        )}
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
