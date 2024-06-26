import React, { forwardRef, ReactElement, Ref, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { sanitize } from 'dompurify';
import { CardContainer, CardContent, CardTitle, CardImage } from './ListCard';
import ActionButtons from './ActionButtons';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import { useSquadChecklist } from '../../../hooks/useSquadChecklist';
import { Squad } from '../../../graphql/sources';
import { ActionType } from '../../../graphql/actions';
import FeedItemContainer from './FeedItemContainer';
import { PostType } from '../../../graphql/posts';
import { useFeedPreviewMode, useTruncatedSummary } from '../../../hooks';
import { PostCardHeader } from './PostCardHeader';
import { usePostImage } from '../../../hooks/post/usePostImage';
import SquadHeaderPicture from '../common/SquadHeaderPicture';
import { cloudinary } from '../../../lib/image';

export const WelcomePostList = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
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
            author={post.author}
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
            <CardImage
              alt="Post Cover image"
              src={image}
              fallbackSrc={cloudinary.post.imageCoverPlaceholder}
              className="my-2 mobileXXL:self-start"
              loading="lazy"
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
      {children}
    </FeedItemContainer>
  );
});
