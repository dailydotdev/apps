import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { CardButton, FreeformCardTitle, getPostClassNames } from './Card';
import ActionButtons from './ActionButtons';
import { Container, PostCardProps } from './common';
import OptionsButton from '../buttons/OptionsButton';
import { WelcomePostCardHeader } from './WelcomePostCardHeader';
import { WelcomePostCardFooter } from './WelcomePostCardFooter';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { Squad } from '../../graphql/sources';
import { ActionType } from '../../graphql/actions';
import FeedItemContainer from './FeedItemContainer';
import { PostType } from '../../graphql/posts';

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
    children,
    onReadArticleClick,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, type: postType } = post;
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();

  const { openStep, isChecklistVisible } = useSquadChecklist({
    squad: post.source as Squad,
  });

  const shouldShowHighlightPulse =
    postType === PostType.Welcome &&
    isChecklistVisible &&
    [ActionType.SquadFirstComment, ActionType.EditWelcomePost].includes(
      openStep,
    );

  const clamp = (() => {
    if (post.image) {
      return 'line-clamp-3';
    }

    return post.contentHtml ? 'line-clamp-4' : 'line-clamp-9';
  })();

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className,
          'min-h-card',
          shouldShowHighlightPulse && 'highlight-pulse',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt }}
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
        enableSourceHeader={enableSourceHeader}
      />
      <FreeformCardTitle
        className={classNames(
          clamp,
          'px-2 font-bold !text-theme-label-primary typo-title3',
        )}
      >
        {post.title}
      </FreeformCardTitle>
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
          className={classNames('mx-4 mt-auto justify-between')}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
