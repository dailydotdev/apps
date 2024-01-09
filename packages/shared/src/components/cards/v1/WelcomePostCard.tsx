import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { CardButton, FreeformCardTitle } from './Card';
import ActionButtons from './ActionButtons';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import OptionsButton from '../../buttons/OptionsButton';
import { WelcomePostCardFooter } from '../WelcomePostCardFooter';
import { useSquadChecklist } from '../../../hooks/useSquadChecklist';
import { Squad } from '../../../graphql/sources';
import { ActionType } from '../../../graphql/actions';
import FeedItemContainer from './FeedItemContainer';
import { PostType } from '../../../graphql/posts';
import { useFeedPreviewMode } from '../../../hooks';
import { SquadPostCardHeader } from '../common/SquadPostCardHeader';
import { usePostImage } from '../../../hooks/post/usePostImage';

export const WelcomePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
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
        className: classNames(
          domProps.className,
          shouldShowHighlightPulse && 'highlight-pulse',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt, type: postType }}
      link={
        !isFeedPreview && (
          <CardButton title={post.title} onClick={onPostCardClick} />
        )
      }
    >
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
      <FreeformCardTitle
        className={classNames(
          generateTitleClamp({
            hasImage: !!image,
            hasHtmlContent: !!post.contentHtml,
          }),
          'px-2 font-bold !text-theme-label-primary typo-title3',
        )}
      >
        {post.title}
      </FreeformCardTitle>
      <Container ref={containerRef}>
        <WelcomePostCardFooter image={image} contentHtml={post.contentHtml} />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
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
