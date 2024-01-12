import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { CardTitle } from './Card';
import ActionButtons from './ActionButtons';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import { WelcomePostCardFooter } from '../WelcomePostCardFooter';
import { useSquadChecklist } from '../../../hooks/useSquadChecklist';
import { Squad } from '../../../graphql/sources';
import { ActionType } from '../../../graphql/actions';
import FeedItemContainer from './FeedItemContainer';
import { PostType } from '../../../graphql/posts';
import { useFeedPreviewMode } from '../../../hooks';
import { PostCardHeader } from './PostCardHeader';
import { usePostImage } from '../../../hooks/post/usePostImage';
import SquadHeaderPicture from '../common/SquadHeaderPicture';

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
      linkProps={
        !isFeedPreview && {
          title: post.title,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
    >
      <PostCardHeader
        post={post}
        onMenuClick={(event) => onMenuClick?.(event, post)}
        metadata={{
          topLabel: enableSourceHeader ? post.source.name : post.author.name,
          bottomLabel: enableSourceHeader
            ? post.author.name
            : `@${post.source.handle ?? post.sharedPost.source.handle}`,
        }}
      >
        <SquadHeaderPicture
          author={post.author}
          source={post.source}
          reverse={!enableSourceHeader}
        />
      </PostCardHeader>
      <CardTitle
        className={classNames(
          generateTitleClamp({
            hasImage: !!image,
            hasHtmlContent: !!post.contentHtml,
          }),
          'multi-truncate',
        )}
      >
        {post.title}
      </CardTitle>
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
