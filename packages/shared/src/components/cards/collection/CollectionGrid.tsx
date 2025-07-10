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
  CardSpace,
  CardTextContainer,
} from '../common/Card';
import { WelcomePostCardFooter } from '../common/WelcomePostCardFooter';
import ActionButtons from '../ActionsButtons/ActionButtons';
import PostMetadata from '../common/PostMetadata';
import { usePostImage } from '../../../hooks/post/usePostImage';
import CardOverlay from '../common/CardOverlay';
import PostTags from '../common/PostTags';
import { useFeature } from '../../GrowthBookProvider';
import { featurePostUiImprovements } from '../../../lib/featureManagement';
import ConditionalWrapper from '../../ConditionalWrapper';

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
  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);
  const postUiExp = useFeature(featurePostUiImprovements);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(post, domProps.className, 'min-h-card'),
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
      <ConditionalWrapper
        condition={postUiExp}
        wrapper={(wrapperChildren) => (
          <CardTextContainer className="mx-4">
            {wrapperChildren}
          </CardTextContainer>
        )}
      >
        <CollectionCardHeader post={post} />
        <FreeformCardTitle
          className={classNames(
            generateTitleClamp({
              hasImage: !!image,
              hasHtmlContent: !!post.contentHtml,
            }),
            !postUiExp && 'mx-2',
            'font-bold text-text-primary typo-title3',
          )}
        >
          {post.title}
        </FreeformCardTitle>

        {!!post.image && <CardSpace />}
        <PostTags post={post} />
      </ConditionalWrapper>
      <PostMetadata
        createdAt={post.createdAt}
        readTime={post.readTime}
        className={classNames(
          postUiExp ? 'mx-4 my-2' : 'm-2',
          post.image ? 'mb-0' : 'mb-4',
        )}
      />
      <Container>
        <WelcomePostCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
          onShare={onShare}
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
