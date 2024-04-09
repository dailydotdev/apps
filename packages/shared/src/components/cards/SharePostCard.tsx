import React, { forwardRef, ReactElement, Ref, useRef, useState } from 'react';
import { getPostClassNames } from './Card';
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
import { TrendingFlag } from '../../lib/featureValues';
import { TrendingFlag as TrendingFlagComponent } from './common/TrendingFlag';

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
  const trendingFlag = useFeature(feature.trendingFlag);
  const isTrendingFlagV1 = trendingFlag === TrendingFlag.V1;
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
      flagProps={{ pinnedAt, ...(!isTrendingFlagV1 && { trending }) }}
    >
      <CardOverlay post={post} onPostCardClick={onPostCardClick} />

      {trending && isTrendingFlagV1 && (
        <TrendingFlagComponent
          iconOnly
          className={{ container: 'right-2 top-2' }}
        />
      )}

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
      <Container ref={containerRef} className="min-h-0 justify-end">
        <SharedPostCardFooter
          sharedPost={post.sharedPost}
          isShort={isSharedPostShort}
          isVideoType={isVideoType}
          post={post}
        />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
