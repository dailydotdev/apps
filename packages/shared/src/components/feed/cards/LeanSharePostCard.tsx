import React, { forwardRef, ReactElement, Ref, useRef, useState } from 'react';
import { CardButton, getPostClassNames } from '../../cards/Card';
import { SharedPostCardHeader } from '../../cards/SharedPostCardHeader';
import { SharedPostText } from '../../cards/SharedPostText';
import { SharedPostCardFooter } from '../../cards/SharedPostCardFooter';
import { Container, PostCardProps } from '../../cards/common';
import FeedItemContainer from '../../cards/FeedItemContainer';
import { useActiveFeedContext } from '../../../contexts';
import LeanOptionsButton from './LeanOptionsMenu';
import LeanActionButtons from './LeanActionButtons';
import useLeanPostActions from '../../../hooks/post/useLeanPostActions';

export const LeanSharePostCard = forwardRef(function LeanSharePostCard(
  { post, children }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending } = post;
  const { queryKey } = useActiveFeedContext();
  const { onClick } = useLeanPostActions({ queryKey });

  const onPostCardClick = () => onClick(post);
  const [isSharedPostShort, setSharedPostShort] = useState(true);
  const containerRef = useRef<HTMLDivElement>();
  const onSharedPostTextHeightChange = (height: number) => {
    if (!containerRef.current) {
      return;
    }
    setSharedPostShort(containerRef.current.offsetHeight - height < 40);
  };

  return (
    <FeedItemContainer
      domProps={{
        className: getPostClassNames(post, 'min-h-card'),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />
      <LeanOptionsButton
        post={post}
        className="group-hover:flex laptop:hidden top-2 right-2"
        tooltipPlacement="top"
        position="absolute"
      />
      <SharedPostCardHeader
        author={post.author}
        source={post.source}
        createdAt={post.createdAt}
      />
      <SharedPostText
        title={post.title}
        onHeightChange={onSharedPostTextHeightChange}
      />
      <Container ref={containerRef}>
        <SharedPostCardFooter
          sharedPost={post.sharedPost}
          isShort={isSharedPostShort}
        />
        <LeanActionButtons post={post} className="justify-between mx-4" />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
