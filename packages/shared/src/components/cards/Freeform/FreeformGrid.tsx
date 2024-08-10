import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useSquadChecklist } from '../../../hooks/useSquadChecklist';
import { Squad } from '../../../graphql/sources';
import { useConditionalFeature } from '../../../hooks';
import { feature } from '../../../lib/featureManagement';
import { PostType } from '../../../graphql/posts';
import { ActionType } from '../../../graphql/actions';
import FeedItemContainer from '../FeedItemContainer';
import { FreeformCardTitle, getPostClassNames } from '../Card';
import CardOverlay from '../common/CardOverlay';
import OptionsButton from '../../buttons/OptionsButton';
import { SquadPostCardHeader } from '../common/SquadPostCardHeader';
import PostMetadata from '../PostMetadata';
import { WelcomePostCardFooter } from '../WelcomePostCardFooter';
import ActionButtons from '../ActionsButtons/ActionButtons';

export const FreeformGrid = forwardRef(function SharePostCard(
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
    onDownvoteClick,
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
  const { value: shouldShowNewImage } = useConditionalFeature({
    shouldEvaluate: !!post.author,
    feature: feature.authorImage,
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
        )}
      >
        {post.title}
      </FreeformCardTitle>
      {shouldShowNewImage && (
        <>
          {image && <div className="flex-1" />}
          <PostMetadata
            className={classNames(
              'mx-2 mb-1 line-clamp-1 break-words',
              image ? 'mt-0' : 'mt-1',
            )}
            createdAt={post.createdAt}
            readTime={post.readTime}
          />
        </>
      )}
      <Container ref={containerRef}>
        <WelcomePostCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
        />
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          className="mt-auto"
          onDownvoteClick={onDownvoteClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
