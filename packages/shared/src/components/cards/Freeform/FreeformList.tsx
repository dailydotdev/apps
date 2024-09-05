import classNames from 'classnames';
import { sanitize } from 'dompurify';
import React, { forwardRef, ReactElement, Ref, useMemo, useRef } from 'react';

import { ActionType } from '../../../graphql/actions';
import { PostType } from '../../../graphql/posts';
import { Squad } from '../../../graphql/sources';
import { useFeedPreviewMode, useTruncatedSummary } from '../../../hooks';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useSquadChecklist } from '../../../hooks/useSquadChecklist';
import { PostContentReminder } from '../../post/common/PostContentReminder';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import SquadHeaderPicture from '../common/SquadHeaderPicture';
import ActionButtons from '../list/ActionButtons';
import { CardCoverList } from '../list/CardCover';
import FeedItemContainer from '../list/FeedItemContainer';
import { CardContainer, CardContent, CardTitle } from '../list/ListCard';
import { PostCardHeader } from '../list/PostCardHeader';

export const FreeformList = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onBookmarkClick,
    onShare,
    children,
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

  const content = useMemo(
    () =>
      post.contentHtml ? sanitize(post.contentHtml, { ALLOWED_TAGS: [] }) : '',
    [post.contentHtml],
  );

  const { title } = useTruncatedSummary(post, content);

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
      bookmarked={post.bookmarked}
    >
      <CardContainer>
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
            source={post.source}
            reverse={!enableSourceHeader}
          />
        </PostCardHeader>

        <CardContent>
          <div className="mr-4 flex-1">
            <CardTitle
              className={classNames(
                generateTitleClamp({
                  hasImage: !!image,
                  hasHtmlContent: !!post.contentHtml,
                }),
                'multi-truncate',
              )}
            >
              {title}
            </CardTitle>
          </div>

          {image && (
            <CardCoverList
              onShare={onShare}
              post={post}
              imageProps={{
                src: image,
                className: 'my-2 mobileXXL:self-start w-full',
                alt: 'Post Cover image',
              }}
            />
          )}
        </CardContent>
      </CardContainer>
      <Container ref={containerRef} className="pointer-events-none">
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onDownvoteClick={onDownvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          className={classNames('mt-4', !!image && 'laptop:mt-auto')}
        />
      </Container>
      {!image && <PostContentReminder post={post} className="z-1" />}
      {children}
    </FeedItemContainer>
  );
});
