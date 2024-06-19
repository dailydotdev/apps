import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { FreeformCardTitle, getPostClassNames } from './Card';
import ActionButtons from './ActionButtons';
import { Container, generateTitleClamp, PostCardProps } from './common';
import OptionsButton from '../buttons/OptionsButton';
import { WelcomePostCardFooter } from './WelcomePostCardFooter';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { Squad } from '../../graphql/sources';
import { ActionType } from '../../graphql/actions';
import FeedItemContainer from './FeedItemContainer';
import { PostType } from '../../graphql/posts';
import { SquadPostCardHeader } from './common/SquadPostCardHeader';
import { usePostImage } from '../../hooks/post/usePostImage';
import CardOverlay from './common/CardOverlay';

export const WelcomePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onBookmarkClick,
    children,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, type: postType, trending } = post;
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const image = usePostImage(post);
  const { openStep, isChecklistVisible } = useSquadChecklist({
    squad: post.source as Squad,
  });

  const shouldShowHighlightPulse =
    postType === PostType.Welcome &&
    isChecklistVisible &&
    [ActionType.SquadFirstComment, ActionType.EditWelcomePost].includes(
      openStep,
    );

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
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked}
    >
      <CardOverlay post={post} onPostCardClick={onPostCardClick} />
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
        bookmarked={post.bookmarked}
      />
      <FreeformCardTitle
        className={classNames(
          generateTitleClamp({
            hasImage: !!image,
            hasHtmlContent: !!post.contentHtml,
          }),
          'px-2 font-bold !text-text-primary typo-title3',
        )}
      >
        {post.title}
      </FreeformCardTitle>
      <Container ref={containerRef}>
        <WelcomePostCardFooter image={image} contentHtml={post.contentHtml} />
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          className="mt-auto"
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
