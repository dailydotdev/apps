import type { Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container, generateTitleClamp } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { CollectionCardHeader } from './CollectionCardHeader';
import {
  getPostClassNames,
  FreeformCardTitle,
  CardTextContainer,
} from '../common/Card';
import { WelcomePostCardFooter } from '../common/WelcomePostCardFooter';
import ActionButtons from '../common/ActionButtons';
import { FeedCardGlassActions } from '../common/FeedCardGlassActions';
import PostMetadata from '../common/PostMetadata';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import CardOverlay from '../common/CardOverlay';
import PostTags from '../common/PostTags';
import { isPostUpdated } from '../../../graphql/posts';
import { TimeFormatType } from '../../../lib/dateFormat';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';

export const CollectionGrid = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onPostClick,
    onPostAuxClick,
    onBookmarkClick,
    onDownvoteClick,
    onShare,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const { pinnedAt, trending } = post;
  const image = usePostImage(post);
  const wasUpdated = isPostUpdated(post);
  const onPostCardClick = () => onPostClick?.(post);
  const onPostCardAuxClick = () => onPostAuxClick?.(post);
  const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
  const glassActions = useFeedCardGlassActions();
  // The floating glass bar applies to every collection. When there's a cover
  // image it floats over it full-bleed; otherwise it floats over the bottom of
  // the content (which blurs through the glass).
  const useGlass = glassActions;

  if (isHidden) {
    return (
      <FeedItemContainer
        domProps={{
          ...domProps,
          className: getPostClassNames(
            post,
            domProps.className ?? '',
            'min-h-card',
          ),
        }}
        ref={ref}
        flagProps={{ pinnedAt, trending }}
        bookmarked={post.bookmarked}
      >
        {hiddenPanel}
      </FeedItemContainer>
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className ?? '',
          useGlass ? 'min-h-cardGlass' : 'min-h-card',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked}
    >
      <CardOverlay
        post={post}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
      />
      <CardTextContainer className="mx-4 flex-1">
        <CollectionCardHeader post={post} />
        <FreeformCardTitle
          className={classNames(
            generateTitleClamp({
              hasImage: !!image,
              hasHtmlContent: !!post.contentHtml,
            }),
            'font-bold text-text-primary typo-title3',
          )}
        >
          {post.title}
        </FreeformCardTitle>

        <PostTags post={post} className="!items-end" />
      </CardTextContainer>
      <PostMetadata
        createdAt={wasUpdated ? post.updatedAt : post.createdAt}
        dateLabel={wasUpdated ? 'Updated' : undefined}
        dateType={wasUpdated ? TimeFormatType.PostUpdated : TimeFormatType.Post}
        readTime={post.readTime}
        numSources={post.numCollectionSources}
        className={classNames('mx-4', post.image ? 'my-0' : 'mb-4 mt-2')}
      />
      <Container className={useGlass && image ? 'flex-none' : undefined}>
        <WelcomePostCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
          onShare={onShare}
        />
        {useGlass ? (
          <FeedCardGlassActions
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
          />
        ) : (
          <ActionButtons
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            className="mt-auto"
            onDownvoteClick={onDownvoteClick}
          />
        )}
      </Container>
      {children}
    </FeedItemContainer>
  );
});
