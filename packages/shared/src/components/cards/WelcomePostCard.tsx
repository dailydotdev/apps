import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { CardButton, FreeformCardTitle, getPostClassNames } from './Card';
import ActionButtons from './ActionButtons';
import { Container, PostCardProps } from './common';
import OptionsButton from '../buttons/OptionsButton';
import { WelcomePostCardFooter } from './WelcomePostCardFooter';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { Squad } from '../../graphql/sources';
import { ActionType } from '../../graphql/actions';
import FeedItemContainer from './FeedItemContainer';
import { PostType } from '../../graphql/posts';
import { useFeedPreviewMode } from '../../hooks';
import { SquadPostCardHeader } from './common/SquadPostCardHeader';

export const WelcomePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onShare,
    onShareClick,
    onBookmarkClick,
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
  const isFeedPreview = useFeedPreviewMode();

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

    return post.contentHtml ? 'line-clamp-3' : 'line-clamp-9';
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
      {!isFeedPreview && (
        <CardButton title={post.title} onClick={onPostCardClick} />
      )}

      <OptionsButton
        className="group-hover:flex laptop:hidden absolute top-2 right-2"
        onClick={(event) => onMenuClick?.(event, post)}
        tooltipPlacement="top"
      />
      <SquadPostCardHeader
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
          onShare={onShare}
          onShareClick={onShareClick}
          onBookmarkClick={onBookmarkClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
          className="mt-auto"
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
