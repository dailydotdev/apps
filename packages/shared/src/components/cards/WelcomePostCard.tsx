import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { Card, CardButton, CardSpace, getPostClassNames } from './Card';
import ActionButtons from './ActionButtons';
import { Container, PostCardProps } from './common';
import OptionsButton from '../buttons/OptionsButton';
import { WelcomePostCardHeader } from './WelcomePostCardHeader';
import { WelcomePostCardFooter } from './WelcomePostCardFooter';

export const WelcomePostCard = forwardRef(function SharePostCard(
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
    className,
    children,
    style,
    onReadArticleClick,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();

  return (
    <Card
      {...props}
      className={getPostClassNames(post, className, 'min-h-[22.5rem]')}
      style={style}
      ref={ref}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />
      <OptionsButton
        className="group-hover:flex laptop:hidden top-2 right-2"
        onClick={(event) => onMenuClick?.(event, post)}
        tooltipPlacement="top"
        position="absolute"
      />
      <WelcomePostCardHeader
        author={post.author}
        source={post.source}
        createdAt={post.createdAt}
      />
      <p className="px-2 font-bold line-clamp-3 typo-title3">{post.title}</p>
      <CardSpace />
      <Container ref={containerRef}>
        <WelcomePostCardFooter post={post} />
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
          className={classNames('mx-4 justify-between')}
        />
      </Container>
      {children}
    </Card>
  );
});
